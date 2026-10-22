import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/db-client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Users, Plus, Search, Edit, Trash2, Calendar,
  Clock, Video, ExternalLink, Loader2
} from "lucide-react";

export function GuidanceAdminSection() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mentorName, setMentorName] = useState("");
  const [mentorRole, setMentorRole] = useState("");
  const [sessionType, setSessionType] = useState("Technical Office Hours");
  const [scheduleTime, setScheduleTime] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [notes, setNotes] = useState("");

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["admin-guidance-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guidance_schedules")
        .select("*")
        .order("schedule_time", { ascending: true });
      if (error) throw error;
      return (data as any[]) ?? [];
    },
  });

  const filtered = schedules.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.mentor_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.session_type?.toLowerCase().includes(search.toLowerCase())
  );

  const openNewDialog = () => {
    setEditingSchedule(null);
    setTitle("");
    setDescription("");
    setMentorName("Domain Technical Mentor");
    setMentorRole("Senior Engineer & Academic Guide");
    setSessionType("Technical Office Hours");
    const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    setScheduleTime(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    setMeetingUrl("https://meet.google.com/example");
    setNotes("Join with your task questions ready.");
    setIsDialogOpen(true);
  };

  const openEditDialog = (s: any) => {
    setEditingSchedule(s);
    setTitle(s.title);
    setDescription(s.description || "");
    setMentorName(s.mentor_name || "");
    setMentorRole(s.mentor_role || "");
    setSessionType(s.session_type || "Technical Office Hours");
    if (s.schedule_time) {
      const d = new Date(s.schedule_time);
      setScheduleTime(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    } else {
      setScheduleTime("");
    }
    setMeetingUrl(s.meeting_url || "");
    setNotes(s.notes || "");
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scheduleTime) {
      return toast.error("Title and schedule time are required");
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        mentor_name: mentorName.trim(),
        mentor_role: mentorRole.trim(),
        session_type: sessionType.trim(),
        schedule_time: new Date(scheduleTime).toISOString(),
        meeting_url: meetingUrl.trim() || null,
        notes: notes.trim() || null,
        is_active: true,
      };

      if (editingSchedule) {
        const { error } = await supabase
          .from("guidance_schedules")
          .update(payload)
          .eq("id", editingSchedule.id);
        if (error) throw error;
        toast.success("Guidance schedule updated");
      } else {
        const { error } = await supabase
          .from("guidance_schedules")
          .insert([payload]);
        if (error) throw error;
        toast.success("Guidance schedule created");
      }

      setIsDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-guidance-schedules"] });
      qc.invalidateQueries({ queryKey: ["guidance-schedules"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    try {
      const { error } = await supabase.from("guidance_schedules").delete().eq("id", id);
      if (error) throw error;
      toast.success("Schedule deleted");
      qc.invalidateQueries({ queryKey: ["admin-guidance-schedules"] });
      qc.invalidateQueries({ queryKey: ["guidance-schedules"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete schedule");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <Users className="size-6 text-primary" />
            Student Guidance & Mentorship Management
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure live guidance sessions, technical office hours, and mentorship schedules for enrolled students.
          </p>
        </div>

        <Button
          onClick={openNewDialog}
          className="brand-gradient text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md gap-1.5"
        >
          <Plus className="size-4" /> Add Guidance Schedule
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search mentor, topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-white/70 dark:bg-slate-900/70 border-border/60"
          />
        </div>
      </div>

      {/* Schedules list */}
      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs uppercase text-muted-foreground bg-muted/20">
              <th className="px-4 py-3 text-left">Session Topic</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Mentor</th>
              <th className="px-4 py-3 text-left">Schedule Time</th>
              <th className="px-4 py-3 text-left">Meeting Link</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-xs">
                  No guidance schedules found.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="border-b border-border/30 hover:bg-accent/20 transition-all text-xs">
                  <td className="px-4 py-3">
                    <p className="font-bold text-foreground">{s.title}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{s.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {s.session_type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{s.mentor_name}</p>
                    <p className="text-[10px] text-muted-foreground">{s.mentor_role}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-semibold">
                    {new Date(s.schedule_time).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="px-4 py-3">
                    {s.meeting_url ? (
                      <a
                        href={s.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                      >
                        <Video className="size-3 shrink-0" />
                        <span>Meeting Link</span>
                        <ExternalLink className="size-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(s)}
                        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg"
                      >
                        <Edit className="size-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(s.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit / Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingSchedule ? "Edit Guidance Session" : "Schedule Guidance Session"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure session timings, mentor credentials, and meeting instructions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-3 text-xs">
            <div className="space-y-1.5">
              <Label className="font-bold">Session Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Full Stack Project Architecture Office Hours"
                className="h-10 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-bold">Session Type</Label>
                <Input
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  placeholder="e.g. Office Hours, AMA, Review"
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold">Schedule Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  required
                  className="h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-bold">Mentor Name *</Label>
                <Input
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  required
                  placeholder="e.g. Hariharan S"
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold">Mentor Role</Label>
                <Input
                  value={mentorRole}
                  onChange={(e) => setMentorRole(e.target.value)}
                  placeholder="e.g. Lead Engineer"
                  className="h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold">Description</Label>
              <Textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What topics will be covered in this session..."
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold">Meeting URL</Label>
              <Input
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold">Notes / Instructions</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please join 5 mins before start time"
                className="h-10 rounded-xl"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl text-xs h-10 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="brand-gradient text-white rounded-xl text-xs font-bold h-10 px-5 shadow-sm"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : "Save Schedule"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
