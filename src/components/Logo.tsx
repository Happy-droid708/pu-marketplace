import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { MorphingText } from "./ui/morphing-text";

const MORPHING_WORDS = [
  "Marketplace",
  "Bazaar",
  "Exchange",
  "Hub",
  "Mart",
  "Circle",
  "Spot",
  "Network"
];

export const Logo = () => {
  return (
    <Link to="/">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2 cursor-pointer group"
      >
        <motion.div
          animate={{ 
            rotate: [0, -10, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut"
          }}
        >
          <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-primary transition-all group-hover:scale-125 group-hover:drop-shadow-[0_0_20px_rgba(139,92,246,0.6)]" />
        </motion.div>
        <div className="flex items-baseline gap-1">
          <motion.span 
            className="text-xl sm:text-2xl font-bold gradient-text"
            animate={{ 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: "200% auto"
            }}
          >
            PU
          </motion.span>
          <MorphingText 
            texts={MORPHING_WORDS}
            className="text-lg sm:text-xl font-light text-muted-foreground min-w-[120px]"
          />
        </div>
      </motion.div>
    </Link>
  );
};
