import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdEdit, MdDelete, MdEmail, MdFavorite, MdFavoriteBorder, MdComment } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductDetails } from "./ProductDetails";
import { useToast } from "@/hooks/use-toast";
import { FocusCard } from "./ui/focus-card";
import { randomConfetti } from "./ui/confetti";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  category?: string;
  seller_email?: string;
  seller_id?: string;
  is_available: boolean;
}

interface ProductCardProps {
  product: Product;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleSold?: () => void;
  canEdit?: boolean;
}

export const ProductCard = ({ product, onEdit, onDelete, onToggleSold, canEdit }: ProductCardProps) => {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [adminLiked, setAdminLiked] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchLikes();
  }, [product.id]);

  const fetchLikes = async () => {
    // Get all likes
    const { data: likes } = await supabase
      .from("product_likes")
      .select("user_id")
      .eq("product_id", product.id);

    setLikeCount(likes?.length || 0);

    // Check if current user liked
    if (user) {
      const userLiked = likes?.some((like) => like.user_id === user.id);
      setLiked(!!userLiked);
    }

    // Check if any admin liked
    if (likes && likes.length > 0) {
      const { data: adminLikes } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin")
        .in("user_id", likes.map((l) => l.user_id));

      setAdminLiked(!!adminLikes && adminLikes.length > 0);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like products",
        variant: "destructive",
      });
      return;
    }

    if (liked) {
      // Unlike
      const { error } = await supabase
        .from("product_likes")
        .delete()
        .eq("product_id", product.id)
        .eq("user_id", user.id);

      if (!error) {
        setLiked(false);
        fetchLikes();
      }
    } else {
      // Like
      const { error } = await supabase
        .from("product_likes")
        .insert([{ product_id: product.id, user_id: user.id }]);

      if (!error) {
        setLiked(true);
        fetchLikes();
      }
    }
  };

  const handleCardClick = () => {
    // Trigger confetti for sold products
    if (!product.is_available) {
      randomConfetti();
    }
  };

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className="h-full"
      onClick={handleCardClick}
    >
      <FocusCard className="h-full">
        <div className="glass-card rounded-2xl overflow-hidden hover-lift group h-full flex flex-col shadow-[0_8px_30px_rgba(139,92,246,0.2)] border border-primary/20">
          <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
            {product.image_url ? (
              <motion.img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.15 }}
                transition={{ duration: 0.4 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
            
            {/* Sold Badge with pulse */}
            {!product.is_available && (
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1 right-1 sm:top-3 sm:right-3 bg-green-500/90 backdrop-blur-sm text-white px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-semibold flex items-center gap-0.5 sm:gap-1 shadow-lg"
              >
                ✅ <span className="hidden sm:inline">Sold</span>
              </motion.div>
            )}
          </div>

          <div className="p-2 sm:p-4">
        <div className="flex items-start justify-between mb-1 sm:mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-xs sm:text-lg line-clamp-1">{product.title}</h3>
            {product.category && (
              <span className="text-[10px] sm:text-xs text-muted-foreground">{product.category}</span>
            )}
          </div>
          <span className="text-xs sm:text-lg font-bold gradient-text ml-1 sm:ml-2">
            ₹{product.price.toFixed(2)}
          </span>
        </div>

        <p className="text-[10px] sm:text-sm text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
          {product.description}
        </p>

        {/* Like Section */}
        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className="gap-0.5 sm:gap-1 h-6 sm:h-8 px-1 sm:px-2"
            disabled={!product.is_available}
          >
            {liked ? (
              <MdFavorite className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
            ) : (
              <MdFavoriteBorder className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            <span className="text-[10px] sm:text-xs">{likeCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(true)}
            className="gap-0.5 sm:gap-1 h-6 sm:h-8 px-1 sm:px-2"
            disabled={!product.is_available}
          >
            <MdComment className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs hidden sm:inline">Comments</span>
          </Button>
        </div>

        {adminLiked && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Badge variant="secondary" className="mb-2 sm:mb-3 text-[10px] sm:text-xs bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/50">
              ⭐ <span className="hidden sm:inline">Liked by Admin</span><span className="sm:hidden">Admin</span>
            </Badge>
          </motion.div>
        )}

        <div className="flex flex-col gap-1 sm:gap-2">
          {!canEdit && product.seller_email && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                window.location.href = `mailto:${product.seller_email}?subject=Product Inquiry: ${product.title}&body=Hi, I'm interested in your product "${product.title}" listed on PU-Marketplace.`;
              }}
              className="w-full h-7 sm:h-9 text-[10px] sm:text-sm px-2"
              disabled={!product.is_available}
            >
              <MdEmail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Contact Seller</span>
              <span className="sm:hidden">Contact</span>
            </Button>
          )}

          {canEdit && (
            <div className="flex flex-col gap-1 sm:gap-2">
              <Button
                size="sm"
                variant={product.is_available ? "default" : "secondary"}
                onClick={onToggleSold}
                className="w-full h-7 sm:h-9 text-[10px] sm:text-sm"
              >
                {product.is_available ? "Mark as Sold" : "Mark as Available"}
              </Button>
              <div className="flex gap-1 sm:gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onEdit}
                  className="flex-1 h-7 sm:h-9 text-[10px] sm:text-sm px-1 sm:px-2"
                >
                  <MdEdit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onDelete}
                  className="h-7 sm:h-9 px-2 sm:px-3"
                >
                  <MdDelete className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
        </div>
        </div>
      </FocusCard>
    </motion.div>

      <AnimatePresence>
        {showDetails && (
          <ProductDetails
            productId={product.id}
            productTitle={product.title}
            sellerId={product.seller_id || ""}
            onClose={() => setShowDetails(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
