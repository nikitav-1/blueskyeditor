import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";

export default function Statistics() {
  const [timeframe, setTimeframe] = useState("week");
  
  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  // Placeholder data - will be replaced with real API data
  const metrics = {
    likes: 150,
    views: 1200,
    followers: 45
  };

  // Placeholder chart data
  const chartData = [
    { date: '2024-02-15', likes: 20, views: 150 },
    { date: '2024-02-16', likes: 25, views: 180 },
    { date: '2024-02-17', likes: 30, views: 200 },
    { date: '2024-02-18', likes: 22, views: 160 },
    { date: '2024-02-19', likes: 28, views: 190 },
    { date: '2024-02-20', likes: 35, views: 220 },
    { date: '2024-02-21', likes: 32, views: 210 },
  ];

  return (
    <div className="p-6 pl-24">
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.likes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.views}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.followers}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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

        <Card>
          <CardHeader>
            <CardTitle>Recent Posts Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="border-b pb-4 last:border-0">
                  <p className="font-medium mb-2">{post.content}</p>
                  <div className="text-sm text-muted-foreground">
                    Posted {format(new Date(post.scheduledFor || Date.now()), 'PPp')}
                    {/* Placeholder metrics */}
                    <span className="ml-4">❤️ 24 likes</span>
                    <span className="ml-4">👁️ 156 views</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
