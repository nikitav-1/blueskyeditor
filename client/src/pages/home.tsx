import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PostEditor } from "@/components/post-editor";
import { PostPreview } from "@/components/post-preview";
import { ScheduleForm } from "@/components/schedule-form";
import { useToast } from "@/hooks/use-toast";
import { loginToBluesky } from "@/lib/bluesky";
import { type BlueskyAuth, type Post } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [scheduleContent, setScheduleContent] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: auth } = useQuery<BlueskyAuth | null>({
    queryKey: ["/api/auth"],
  });

  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const handleLogin = async () => {
    if (!identifier || !password || isLoggingIn) return;

    setIsLoggingIn(true);
    try {
      await loginToBluesky({ identifier, password });
      // Invalidate the auth query to trigger a refetch
      await queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
      toast({
        title: "Success",
        description: "Logged in to Bluesky!",
      });
      setIdentifier("");
      setPassword("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid credentials";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      {!auth ? (
        <Card>
          <CardHeader>
            <CardTitle>Login to Bluesky</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Email or handle"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoggingIn}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoggingIn}
            />
            <Button 
              className="w-full"
              onClick={handleLogin}
              disabled={!identifier || !password || isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <PostEditor
            onSchedule={(content) => {
              setScheduleContent(content);
              setShowSchedule(true);
            }}
          />

          {posts.map((post) => (
            <PostPreview key={post.id} post={post} />
          ))}

          <ScheduleForm
            content={scheduleContent}
            open={showSchedule}
            onClose={() => setShowSchedule(false)}
          />
        </>
      )}
    </div>
  );
}