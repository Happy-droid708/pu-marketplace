import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string | null;
  category: string;
  is_available: boolean;
}

interface SponsoredCardProps {
  product: Product;
  index: number;
}

const SponsoredCard = ({ product, index }: SponsoredCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="h-full"
    >
      <Card
        className="glass-card overflow-hidden group cursor-pointer h-full transition-all duration-300 hover:shadow-xl"
        onClick={() => navigate(`/?product=${product.id}`)}
      >
        <div className="relative h-48 overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className="bg-primary/90 text-primary-foreground animate-pulse"
            >
              Sponsored
            </Badge>
          </div>
          {!product.is_available && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="destructive">Sold</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
            <span className="text-lg font-bold text-primary">
              ₹{product.price}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const SponsoredProductsCarousel = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchSponsoredProducts();
  }, []);

  const fetchSponsoredProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_sponsored", true)
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .limit(6);

    if (error) {
      console.error("Error fetching sponsored products:", error);
      return;
    }

    setProducts(data || []);
  };

  if (products.length === 0) return null;

  return (
    <div className="w-full py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-8 text-center gradient-text"
        >
          🎯 Admin Sponsored Products
        </motion.h2>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {products.map((product, index) => (
              <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <SponsoredCard 
                  product={product} 
                  index={index}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </Carousel>
      </div>
    </div>
  );
};
