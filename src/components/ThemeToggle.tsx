import { motion } from "framer-motion";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="glass-card hover-lift"
    >
      <motion.div
        key={theme}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        {theme === "dark" ? (
          <MdDarkMode className="h-5 w-5" />
        ) : (
          <MdLightMode className="h-5 w-5" />
        )}
      </motion.div>
    </Button>
  );
};
