import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { type Post } from "@shared/schema";
import { motion } from "framer-motion";
import { createPost } from "@/lib/bluesky";

export default function Drafts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: drafts = [] } = useQuery<Post[]>({
    queryKey: ["/api/posts/drafts"],
  });

  const handlePublish = async (post: Post) => {
    try {
      await createPost({ content: post.content, scheduledFor: null });
      // After publishing, delete the draft
      await fetch(`/api/posts/draft/${post.id}`, { method: "DELETE" });

      toast({
        title: "Success",
        description: "Published to Bluesky!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/drafts"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish post",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 pl-24">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Drafts</h1>

        {drafts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No drafts yet. Save some posts as drafts to see them here.
            </CardContent>
          </Card>
        ) : (
          drafts.map((draft, index) => (
            <motion.div
              key={draft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Draft {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="whitespace-pre-wrap">{draft.content}</p>
                  <div className="flex items-center justify-end">
                    <Button onClick={() => handlePublish(draft)}>
                      Publish Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}