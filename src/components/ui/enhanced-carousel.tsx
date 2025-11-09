import { motion, useMotionValue, useSpring, useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface CarouselItem {
  id: string;
  image_url: string;
  title: string;
  price?: number;
  category?: string;
}

interface EnhancedCarouselProps {
  items: CarouselItem[];
  title: string;
}

export const EnhancedCarousel = ({ items, title }: EnhancedCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const baseX = useMotionValue(0);
  const scrollVelocity = useMotionValue(0);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });

  const { scrollY } = useScroll();

  useEffect(() => {
    let lastScrollY = scrollY.get();
    
    const updateVelocity = () => {
      const currentScrollY = scrollY.get();
      const velocity = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      scrollVelocity.set(velocity * -0.5);
    };

    const unsubscribe = scrollY.on("change", updateVelocity);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      baseX.set(baseX.get() - 1);
    }, 20);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Double the items for seamless loop
  const doubledItems = [...items, ...items];

  return (
    <div className="relative w-full py-12 overflow-hidden">
      <div className="container mx-auto px-4 mb-6">
        <h3 className="text-2xl font-bold gradient-text">{title}</h3>
      </div>

      <motion.div
        ref={containerRef}
        className="flex gap-6 cursor-grab active:cursor-grabbing"
        style={{ x: baseX }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        drag="x"
        dragConstraints={{ left: -items.length * 320, right: 0 }}
      >
        {/* Row 1 */}
        <div className="flex gap-6 mb-6">
          {doubledItems.map((item, index) => (
            <motion.div
              key={`${item.id}-${index}`}
              className="min-w-[300px] h-[400px] glass-card rounded-2xl overflow-hidden group relative"
              whileHover={{ scale: 1.05, y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h4 className="text-xl font-bold text-foreground mb-2">{item.title}</h4>
                {item.category && (
                  <span className="text-sm text-muted-foreground">{item.category}</span>
                )}
                {item.price && (
                  <p className="text-lg font-bold gradient-text mt-2">₹{item.price.toFixed(2)}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
    </div>
  );
};
