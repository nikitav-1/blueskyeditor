import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createPost } from "@/lib/bluesky";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ScheduleFormProps {
  content: string;
  open: boolean;
  onClose: () => void;
}

export function ScheduleForm({ content, open, onClose }: ScheduleFormProps) {
  const [date, setDate] = useState<Date>();
  const [isScheduling, setIsScheduling] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSchedule = async () => {
    if (!date || !content) return;

    setIsScheduling(true);
    try {
      await createPost({ content, scheduledFor: date });
      toast({
        title: "Success",
        description: "Post scheduled!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule post",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Post</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!date || isScheduling}
          >
            Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}