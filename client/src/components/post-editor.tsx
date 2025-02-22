import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createPost } from "@/lib/bluesky";
import { useQueryClient } from "@tanstack/react-query";
import type { InsertPost } from "@shared/schema";

interface PostEditorProps {
  onSchedule: (content: string) => void;
}

export function PostEditor({ onSchedule }: PostEditorProps) {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handlePost = async () => {
    if (!content.trim()) return;
    
    setIsPosting(true);
    try {
      await createPost({ content, scheduledFor: null });
      setContent("");
      toast({
        title: "Success",
        description: "Posted to Bluesky!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post. Are you logged in?",
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
        />
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
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
          Post Now
        </Button>
      </CardFooter>
    </Card>
  );
}
