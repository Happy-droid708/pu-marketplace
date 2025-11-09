import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MdClose, MdSend } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  comment_text: string;
  created_at: string;
  seller_id: string;
  profiles?: {
    full_name: string | null;
    email: string;
  };
}

interface ProductDetailsProps {
  productId: string;
  productTitle: string;
  sellerId: string;
  onClose: () => void;
}

export const ProductDetails = ({ productId, productTitle, sellerId, onClose }: ProductDetailsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isSeller, setIsSeller] = useState(false);
  const maxComments = 10;

  useEffect(() => {
    fetchComments();
    checkSellerRole();
  }, [productId, user]);

  const checkSellerRole = async () => {
    if (!user) return;
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    
    setIsSeller(roles?.some((r) => r.role === "seller" || r.role === "admin") || false);
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("product_comments")
      .select("id, comment_text, created_at, seller_id")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } else {
      // Fetch profiles for each comment
      const commentsWithProfiles = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", comment.seller_id)
            .single();
          
          return {
            ...comment,
            profiles: profile || { full_name: null, email: "" }
          };
        })
      );

      setComments(commentsWithProfiles);
      if (user) {
        const sellerComments = commentsWithProfiles.filter(c => c.seller_id === user.id).length || 0;
        setCommentCount(sellerComments);
      }
    }
    setLoading(false);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isSeller || !commentText.trim()) return;

    if (commentCount >= maxComments) {
      toast({
        title: "Limit Reached",
        description: "You can only post 10 comments per product",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("product_comments").insert([
      {
        product_id: productId,
        seller_id: user.id,
        comment_text: commentText.trim(),
      },
    ]);

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    } else {
      setCommentText("");
      fetchComments();
      toast({ title: "Success", description: "Comment posted" });
    }

    setSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">{productTitle}</h2>
            {isSeller && (
              <p className="text-sm text-muted-foreground mt-1">
                Comments ({commentCount}/{maxComments})
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <MdClose className="h-5 w-5" />
          </Button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground">No comments yet</p>
          ) : (
            comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">
                      {comment.profiles?.full_name || comment.profiles?.email || "Seller"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <p className="text-sm">{comment.comment_text}</p>
              </motion.div>
            ))
          )}
        </div>

        {/* Comment Input (only for seller) */}
        {isSeller && (
          <div className="p-6 border-t border-border">
            {commentCount >= maxComments ? (
              <p className="text-center text-muted-foreground text-sm">
                You've reached the maximum of {maxComments} comments for this product
              </p>
            ) : (
              <form onSubmit={handleSubmitComment} className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1"
                  rows={2}
                  disabled={submitting}
                />
                <Button type="submit" size="icon" disabled={submitting || !commentText.trim()}>
                  <MdSend className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
