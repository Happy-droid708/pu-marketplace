import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { MdHome, MdStorefront, MdAdminPanelSettings, MdLogin, MdLogout } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";

export const Sidebar = () => {
  const { user, signOut, hasRole } = useAuth();

  const publicLinks = [
    { to: "/", icon: MdHome, label: "Home" },
  ];

  const authenticatedLinks = [
    ...(hasRole("seller") || hasRole("admin")
      ? [{ to: "/seller-dashboard", icon: MdStorefront, label: "Seller Dashboard" }]
      : []),
    ...(hasRole("admin")
      ? [{ to: "/admin-dashboard", icon: MdAdminPanelSettings, label: "Admin Dashboard" }]
      : []),
  ];

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="glass-card fixed left-0 top-0 h-screen w-20 lg:w-64 p-4 flex flex-col gap-4 z-50"
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="hidden lg:block text-xl font-bold gradient-text">
          PU-Market
        </h1>
        <ThemeToggle />
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {publicLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary/50"
              }`
            }
          >
            <link.icon className="h-5 w-5" />
            <span className="hidden lg:block">{link.label}</span>
          </NavLink>
        ))}

        {user && authenticatedLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary/50"
              }`
            }
          >
            <link.icon className="h-5 w-5" />
            <span className="hidden lg:block">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-2">
        {!user ? (
          <NavLink
            to="/auth"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            <MdLogin className="h-5 w-5" />
            <span className="hidden lg:block">Login</span>
          </NavLink>
        ) : (
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all"
          >
            <MdLogout className="h-5 w-5" />
            <span className="hidden lg:block">Logout</span>
          </button>
        )}
      </div>
    </motion.aside>
  );
};
