import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PostEditor } from "@/components/post-editor";
import { PostPreview } from "@/components/post-preview";
import { ScheduleForm } from "@/components/schedule-form";
import { useToast } from "@/hooks/use-toast";
import { loginToBluesky } from "@/lib/bluesky";

export default function Home() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [scheduleContent, setScheduleContent] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const { toast } = useToast();

  const { data: auth } = useQuery({
    queryKey: ["/api/auth"],
  });

  const { data: posts } = useQuery({
    queryKey: ["/api/posts"],
  });

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginToBluesky({ identifier, password });
      toast({
        title: "Success",
        description: "Logged in to Bluesky!",
      });
      setIdentifier("");
      setPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
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
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button 
              className="w-full"
              onClick={handleLogin}
              disabled={!identifier || !password || isLoggingIn}
            >
              Login
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
          
          {posts?.map((post) => (
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
