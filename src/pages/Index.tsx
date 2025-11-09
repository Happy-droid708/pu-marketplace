import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdChevronLeft, MdChevronRight, MdSearch } from "react-icons/md";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { SponsoredProductsCarousel } from "@/components/SponsoredProductsCarousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRODUCT_CATEGORIES } from "@/constants/categories";
import { ParallaxGrid } from "@/components/ui/parallax-grid";
import { EnhancedCarousel } from "@/components/ui/enhanced-carousel";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  category?: string;
  seller_email?: string;
  seller_id?: string;
  created_at: string;
  is_available: boolean;
}

interface CarouselItem {
  id: string;
  image_url: string;
  title?: string;
  subtitle?: string;
  link_url?: string;
  display_order: number;
}

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [carousel, setCarousel] = useState<CarouselItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (carousel.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carousel.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [carousel.length]);

  const fetchData = async () => {
    // Fetch products (both available and sold)
    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    // Fetch profiles to get seller emails
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, email");

    // Create a map of id to email
    const emailMap = new Map(profilesData?.map(p => [p.id, p.email]) || []);

    // Map the data to include seller_email
    const mappedProducts = productsData?.map(product => ({
      ...product,
      seller_email: emailMap.get(product.seller_id) || undefined
    })) || [];

    // Fetch carousel
    const { data: carouselData } = await supabase
      .from("carousel")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    setProducts(mappedProducts);
    setFilteredProducts(mappedProducts);
    setCarousel(carouselData || []);
    setLoading(false);
  };

  useEffect(() => {
    // Filter products based on search and category
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (selectedFilter === "available") {
      filtered = filtered.filter(product => product.is_available);
    } else if (selectedFilter === "sold") {
      filtered = filtered.filter(product => !product.is_available);
    } else if (selectedFilter === "today") {
      filtered = filtered.filter(product => {
        const productDate = new Date(product.created_at);
        return productDate >= today;
      });
    } else if (selectedFilter === "this-week") {
      filtered = filtered.filter(product => {
        const productDate = new Date(product.created_at);
        return productDate >= weekAgo;
      });
    } else if (selectedFilter === "price-high-low") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (selectedFilter === "price-low-high") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, selectedFilter, products]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carousel.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carousel.length) % carousel.length);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground"
          >
            Loading marketplace...
          </motion.p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative">
        <ParallaxGrid />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 space-y-16"
        >
          {/* Hero Carousel */}
          {carousel.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative glass-card rounded-3xl overflow-hidden h-[70vh] group shadow-[0_0_60px_rgba(139,92,246,0.3)] border border-primary/30"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0"
                >
                  <img
                    src={carousel[currentSlide].image_url}
                    alt={carousel[currentSlide].title || "Carousel"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-12">
                    <motion.h2
                      initial={{ y: 30, opacity: 0, filter: "blur(10px)" }}
                      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className="text-6xl font-bold gradient-text mb-4"
                    >
                      {carousel[currentSlide].title || "Featured"}
                    </motion.h2>
                    {carousel[currentSlide].subtitle && (
                      <motion.p
                        initial={{ y: 30, opacity: 0, filter: "blur(10px)" }}
                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-xl text-foreground/90"
                      >
                        {carousel[currentSlide].subtitle}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <Button
                variant="ghost"
                size="icon"
                onClick={prevSlide}
                className="absolute left-6 top-1/2 -translate-y-1/2 glass-card opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MdChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                className="absolute right-6 top-1/2 -translate-y-1/2 glass-card opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MdChevronRight className="h-6 w-6" />
              </Button>

              {/* Dots */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                {carousel.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    whileHover={{ scale: 1.2 }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? "bg-primary w-12"
                        : "bg-foreground/30 w-2"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Marquee Banner */}
          <div className="relative overflow-hidden glass-card rounded-2xl py-6 shadow-[0_0_40px_rgba(139,92,246,0.2)] border border-primary/20">
            <div className="flex whitespace-nowrap animate-marquee">
              <div className="flex items-center gap-12 px-6">
                <span className="text-2xl font-bold gradient-text">🎉 Welcome to PU Marketplace</span>
                <span className="text-2xl font-semibold text-foreground/80">• Buy & Sell with Confidence •</span>
                <span className="text-2xl font-bold gradient-text">🛍️ Discover Amazing Deals</span>
                <span className="text-2xl font-semibold text-foreground/80">• Join Our Community Today •</span>
                <span className="text-2xl font-bold gradient-text">🎉 Welcome to PU Marketplace</span>
                <span className="text-2xl font-semibold text-foreground/80">• Buy & Sell with Confidence •</span>
                <span className="text-2xl font-bold gradient-text">🛍️ Discover Amazing Deals</span>
                <span className="text-2xl font-semibold text-foreground/80">• Join Our Community Today •</span>
              </div>
            </div>
          </div>

          {/* Sponsored Products Carousel */}
          <SponsoredProductsCarousel />

        {/* All Products Section */}
        <div className="pt-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h2 className="text-4xl font-bold gradient-text">
              All Products
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-card"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48 glass-card">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-full sm:w-48 glass-card">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="today">Today's Products</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="price-high-low">Price: High to Low</SelectItem>
                  <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center shadow-[0_0_40px_rgba(139,92,246,0.2)]">
              <p className="text-muted-foreground text-lg">
                {products.length === 0 
                  ? "No products available yet. Check back soon!" 
                  : "No products match your search criteria."}
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-3 sm:gap-6"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
        </motion.div>
      </div>
    </Layout>
  );
}
