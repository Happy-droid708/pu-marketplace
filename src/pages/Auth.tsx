import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithMagicLink, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (useMagicLink) {
      await signInWithMagicLink(email);
    } else if (isLogin) {
      const { error } = await signIn(email, password);
      if (!error) {
        navigate("/");
      }
    } else {
      const { error } = await signUp(email, password, fullName);
      if (!error) {
        navigate("/");
      }
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 rounded-2xl w-full max-w-md"
        >
          <h1 className="text-3xl font-bold gradient-text mb-6 text-center">
            {useMagicLink ? "Magic Link Sign In" : isLogin ? "Welcome Back" : "Create Account"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !useMagicLink && (
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="glass-card"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass-card"
              />
            </div>

            {!useMagicLink && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="glass-card"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Processing..." : useMagicLink ? "Send Magic Link" : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <button
              type="button"
              onClick={() => {
                setUseMagicLink(!useMagicLink);
                setIsLogin(true);
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors block w-full"
            >
              {useMagicLink ? "Use password instead" : "Sign in with Magic Link"}
            </button>
            
            {!useMagicLink && (
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors block w-full"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
