import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { MdHome, MdStorefront, MdAdminPanelSettings, MdLogin, MdLogout, MdMenu } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { LampHeader } from "./ui/lamp-header";

export const Navbar = () => {
  const { user, signOut, hasRole } = useAuth();
  const [open, setOpen] = useState(false);

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

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "hover:bg-secondary/50"
    }`;

  const NavLinks = () => (
    <>
      {publicLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={getNavLinkClass}
          onClick={() => setOpen(false)}
        >
          <link.icon className="h-5 w-5" />
          <span>{link.label}</span>
        </NavLink>
      ))}

      {user && authenticatedLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={getNavLinkClass}
          onClick={() => setOpen(false)}
        >
          <link.icon className="h-5 w-5" />
          <span>{link.label}</span>
        </NavLink>
      ))}

      {!user ? (
        <NavLink
          to="/auth"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          onClick={() => setOpen(false)}
        >
          <MdLogin className="h-5 w-5" />
          <span>Login</span>
        </NavLink>
      ) : (
        <button
          onClick={() => {
            signOut();
            setOpen(false);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all w-full"
        >
          <MdLogout className="h-5 w-5" />
          <span>Logout</span>
        </button>
      )}
    </>
  );

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 glass-card shadow-md rounded-b-2xl border border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.15)]"
    >
      <LampHeader />
      <div className="container mx-auto px-4 py-3 relative z-10">
        <div className="flex items-center justify-between">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <NavLinks />
            <ThemeToggle />
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MdMenu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
