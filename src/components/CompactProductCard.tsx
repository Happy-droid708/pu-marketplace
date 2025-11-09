import { motion } from "framer-motion";
import { FocusCard } from "./ui/focus-card";

interface Product {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  category?: string;
  is_available: boolean;
}

interface CompactProductCardProps {
  product: Product;
}

export const CompactProductCard = ({ product }: CompactProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className="h-full"
    >
      <FocusCard className="h-full">
        <div className="glass-card rounded-xl overflow-hidden hover-lift group h-full flex flex-col shadow-[0_6px_20px_rgba(139,92,246,0.15)] border border-primary/15">
          <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
            {product.image_url ? (
              <motion.img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                No Image
              </div>
            )}
            
            {/* Sold Badge */}
            {!product.is_available && (
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-2 right-2 bg-green-500/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg"
              >
                ✅ Sold
              </motion.div>
            )}
            
            {/* Sponsored Badge */}
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500/90 to-amber-500/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg"
            >
              ⭐ Sponsored
            </motion.div>
          </div>

          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-1">{product.title}</h3>
                {product.category && (
                  <span className="text-xs text-muted-foreground">{product.category}</span>
                )}
              </div>
              <span className="text-sm font-bold gradient-text whitespace-nowrap">
                ₹{product.price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </FocusCard>
    </motion.div>
  );
};
