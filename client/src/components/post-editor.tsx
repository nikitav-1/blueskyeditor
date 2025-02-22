import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createPost } from "@/lib/bluesky";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { InsertPost, Post } from "@shared/schema";

interface PostEditorProps {
  onSchedule: (content: string) => void;
}

export function PostEditor({ onSchedule }: PostEditorProps) {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handlePost = async () => {
    if (!content.trim() || isPosting) return;

    setIsPosting(true);
    // Optimistically update the UI
    const optimisticPost: Post = {
      id: Date.now(),
      content,
      scheduledFor: null,
      published: true,
      isDraft: false
    };

    queryClient.setQueryData<Post[]>(["/api/posts"], (old = []) => [optimisticPost, ...old]);

    try {
      await createPost({ content, scheduledFor: null });
      setContent("");
      toast({
        title: "Success",
        description: "Posted to Bluesky!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    } catch (error) {
      // Revert optimistic update on error
      queryClient.setQueryData<Post[]>(["/api/posts"], (old = []) => 
        old.filter(post => post.id !== optimisticPost.id)
      );
      toast({
        title: "Error",
        description: "Failed to post. Are you logged in?",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!content.trim() || isPosting) return;

    setIsPosting(true);
    // Optimistic update for drafts
    const optimisticDraft: Post = {
      id: Date.now(),
      content,
      scheduledFor: null,
      published: false,
      isDraft: true
    };

    queryClient.setQueryData<Post[]>(["/api/posts/drafts"], (old = []) => [optimisticDraft, ...old]);

    try {
      const res = await fetch("/api/posts/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Failed to save draft");

      setContent("");
      toast({
        title: "Success",
        description: "Saved as draft!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/drafts"] });
    } catch (error) {
      // Revert optimistic update on error
      queryClient.setQueryData<Post[]>(["/api/posts/drafts"], (old = []) => 
        old.filter(post => post.id !== optimisticDraft.id)
      );
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <Textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px]"
          disabled={isPosting}
        />
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleSaveAsDraft}
          disabled={!content.trim() || isPosting}
        >
          {isPosting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save as Draft'
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => onSchedule(content)}
          disabled={!content.trim() || isPosting}
        >
          Schedule
        </Button>
        <Button 
          onClick={handlePost}
          disabled={!content.trim() || isPosting}
        >
          {isPosting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            'Post Now'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}