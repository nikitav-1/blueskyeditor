import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { type Post, type BlueskyAuth } from "@shared/schema";
import { BskyAgent } from "@atproto/api";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Statistics() {
  const [timeframe, setTimeframe] = useState("week");
  const [, setLocation] = useLocation();
  const [metrics, setMetrics] = useState<{ likes: number; views: number; followers: number } | null>(null);

  const { data: auth } = useQuery<BlueskyAuth | null>({
    queryKey: ["/api/auth"],
  });

  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  // Redirect if not authenticated
  if (!auth) {
    setLocation("/editor");
    return null;
  }

  // Initialize Bluesky agent and fetch metrics
  const { data: stats, isLoading } = useQuery({
    queryKey: ["bluesky-stats", timeframe],
    queryFn: async () => {
      const agent = new BskyAgent({ service: "https://bsky.social" });
      await agent.login({ identifier: auth.identifier, password: auth.password });

      const profile = await agent.getProfile({ actor: auth.identifier });
      const followers = profile.data.followersCount || 0;

      // Get recent posts to calculate engagement
      const feed = await agent.getAuthorFeed({ actor: auth.identifier });
      const posts = feed.data.feed || [];

      const likes = posts.reduce((sum, post) => sum + (post.post.likeCount || 0), 0);
      const views = posts.reduce((sum, post) => sum + (post.post.repostCount || 0) * 5, 0); // Estimate views

      return {
        likes,
        views,
        followers,
        posts: posts.map(post => ({
          date: post.post.indexedAt,
          likes: post.post.likeCount || 0,
          views: (post.post.repostCount || 0) * 5,
          content: post.post.record.text
        }))
      };
    },
    enabled: !!auth
  });

  if (isLoading) {
    return (
      <div className="p-6 pl-24 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 pl-24"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Statistics</h1>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.likes || 0}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.views || 0}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Followers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.followers || 0}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Engagement Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.posts || []}>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => format(new Date(date), 'PPP')}
                    />
                    <Bar dataKey="likes" fill="hsl(var(--primary))" name="Likes" />
                    <Bar dataKey="views" fill="hsl(var(--secondary))" name="Views" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Posts Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.posts.map((post, index) => (
                  <motion.div 
                    key={post.date}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="border-b pb-4 last:border-0"
                  >
                    <p className="font-medium mb-2">{post.content}</p>
                    <div className="text-sm text-muted-foreground">
                      Posted {format(new Date(post.date), 'PPp')}
                      <span className="ml-4">❤️ {post.likes} likes</span>
                      <span className="ml-4">👁️ {post.views} views</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}