import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdAdd, MdDelete, MdPerson, MdEmail, MdCategory, MdAttachMoney } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CarouselItem {
  id: string;
  image_url: string;
  title?: string;
  subtitle?: string;
  link_url?: string;
  display_order: number;
  is_active: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  category?: string;
  is_available: boolean;
  is_sponsored?: boolean;
}


export default function AdminDashboard() {
  const { user, hasRole, loading: authLoading } = useAuth();
  const [carousel, setCarousel] = useState<CarouselItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Carousel form state
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [carouselDisplayOrder, setCarouselDisplayOrder] = useState("0");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (!authLoading && user && !hasRole("admin")) {
      toast({
        title: "Access Denied",
        description: "Admin access required.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    if (user) {
      fetchCarousel();
      fetchUsers();
      fetchProducts();
    }
  }, [user, hasRole, authLoading, navigate]);

  const fetchCarousel = async () => {
    const { data, error } = await supabase
      .from("carousel")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load carousel",
        variant: "destructive",
      });
    } else {
      setCarousel(data || []);
    }
  };

  const fetchUsers = async () => {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    if (profilesError) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
      return;
    }

    setUsers(profiles || []);

    // Fetch roles for each user
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("*");

    if (!rolesError && roles) {
      const rolesByUser: Record<string, string[]> = {};
      roles.forEach((role: UserRole) => {
        if (!rolesByUser[role.user_id]) {
          rolesByUser[role.user_id] = [];
        }
        rolesByUser[role.user_id].push(role.role);
      });
      setUserRoles(rolesByUser);
    }
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, title, price, image_url, category, is_available, is_sponsored")
      .order("created_at", { ascending: false});

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } else {
      setProducts(data || []);
    }
  };

  const toggleSponsoredStatus = async (productId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("products")
      .update({ is_sponsored: !currentStatus })
      .eq("id", productId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update sponsored status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: currentStatus ? "Removed from sponsored" : "Added to sponsored",
      });
      fetchProducts();
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    // Check file size (2MB = 2097152 bytes)
    if (file.size > 2097152) {
      toast({
        title: "File too large",
        description: "Image must be less than 2MB",
        variant: "destructive",
      });
      return null;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("carousel_images")
      .upload(fileName, file);

    if (uploadError) {
      toast({
        title: "Upload failed",
        description: uploadError.message,
        variant: "destructive",
      });
      return null;
    }

    const { data } = supabase.storage.from("carousel_images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleCarouselSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast({
        title: "Error",
        description: "Please select an image",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    const imageUrl = await uploadImage(imageFile);
    if (!imageUrl) {
      setUploading(false);
      return;
    }

    const { error } = await supabase.from("carousel").insert([
      {
        image_url: imageUrl,
        title: title || null,
        subtitle: subtitle || null,
        link_url: linkUrl || null,
        display_order: parseInt(carouselDisplayOrder),
        is_active: true,
      },
    ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create carousel item",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Carousel item added" });
      fetchCarousel();
      resetForm();
    }

    setUploading(false);
  };

  const handleDeleteCarousel = async (id: string) => {
    const { error } = await supabase.from("carousel").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete carousel item",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Carousel item deleted" });
      fetchCarousel();
    }
  };

  const handleUpdateUserRole = async (userId: string, role: "public" | "seller" | "admin", action: "add" | "remove") => {
    if (action === "add") {
      const { error } = await supabase.from("user_roles").insert([
        { user_id: userId, role },
      ]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add role",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Role added" });
        fetchUsers();
      }
    } else {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove role",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Role removed" });
        fetchUsers();
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setLinkUrl("");
    setCarouselDisplayOrder("0");
    setImageFile(null);
    setDialogOpen(false);
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h1 className="text-4xl font-bold gradient-text">Admin Dashboard</h1>

        <Tabs defaultValue="carousel" className="w-full">
          <TabsList className="glass-card">
            <TabsTrigger value="carousel">Hero Carousel</TabsTrigger>
            <TabsTrigger value="sponsored">Manage Sponsored</TabsTrigger>
            <TabsTrigger value="users">Users & Roles</TabsTrigger>
          </TabsList>

          <TabsContent value="carousel" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <MdAdd className="h-5 w-5" />
                    Add Carousel Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Carousel Item</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCarouselSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title (optional)</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="glass-card"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subtitle">Subtitle (optional)</Label>
                      <Input
                        id="subtitle"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        className="glass-card"
                      />
                    </div>

                    <div>
                      <Label htmlFor="linkUrl">Link URL (optional)</Label>
                      <Input
                        id="linkUrl"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="glass-card"
                      />
                    </div>

                    <div>
                      <Label htmlFor="displayOrder">Display Order</Label>
                      <Input
                        id="displayOrder"
                        type="number"
                        value={carouselDisplayOrder}
                        onChange={(e) => setCarouselDisplayOrder(e.target.value)}
                        className="glass-card"
                      />
                    </div>

                    <div>
                      <Label htmlFor="image">Image (max 2MB)</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        required
                        className="glass-card"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={uploading}>
                      {uploading ? "Uploading..." : "Create"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {carousel.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card rounded-2xl overflow-hidden"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20">
                    <img
                      src={item.image_url}
                      alt={item.title || "Carousel"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold">{item.title || "Untitled"}</p>
                    <p className="text-sm text-muted-foreground">
                      Order: {item.display_order}
                    </p>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteCarousel(item.id)}
                      className="mt-2 w-full"
                    >
                      <MdDelete className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sponsored" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Manage Sponsored Products</h2>
              <p className="text-muted-foreground">
                Toggle sponsored status for any product
              </p>
            </div>

            <div className="space-y-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="w-24 h-24 object-cover rounded-md"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">
                            {product.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MdCategory className="h-4 w-4" />
                              {product.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <MdAttachMoney className="h-4 w-4" />
                              ₹{product.price}
                            </span>
                            <Badge variant={product.is_available ? "default" : "destructive"}>
                              {product.is_available ? "Available" : "Sold"}
                            </Badge>
                            {product.is_sponsored && (
                              <Badge className="bg-primary/90 animate-pulse">
                                Sponsored
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={product.is_sponsored ? "destructive" : "default"}
                        onClick={() => toggleSponsoredStatus(product.id, product.is_sponsored || false)}
                      >
                        {product.is_sponsored ? "Remove Sponsored" : "Add Sponsored"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {products.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No products available.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="space-y-4">
              {users.map((profile) => (
                <div key={profile.id} className="glass-card p-4 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MdPerson className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-semibold">
                          {profile.full_name || "Anonymous"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {profile.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {userRoles[profile.id]?.map((role) => (
                          <span
                            key={role}
                            className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary"
                          >
                            {role}
                          </span>
                        ))}
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUser(profile.id)}
                          >
                            Manage Roles
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card max-w-sm">
                          <DialogHeader>
                            <DialogTitle>Manage User Roles</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3">
                            {(["public", "seller", "admin"] as const).map((role) => (
                              <div
                                key={role}
                                className="flex items-center justify-between"
                              >
                                <span className="capitalize">{role}</span>
                                {userRoles[profile.id]?.includes(role) ? (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleUpdateUserRole(profile.id, role, "remove")
                                    }
                                  >
                                    Remove
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateUserRole(profile.id, role, "add")
                                    }
                                  >
                                    Add
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
}
