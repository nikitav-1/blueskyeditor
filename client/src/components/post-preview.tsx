import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Post } from "@shared/schema";

interface PostPreviewProps {
  post: Post;
}

export function PostPreview({ post }: PostPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>Post Preview</span>
          {post.scheduledFor ? (
            <Badge variant="outline">
              Scheduled for {format(new Date(post.scheduledFor), "PPp")}
            </Badge>
          ) : (
            <Badge variant={post.published ? "default" : "secondary"}>
              {post.published ? "Published" : "Draft"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
    </Card>
  );
}
