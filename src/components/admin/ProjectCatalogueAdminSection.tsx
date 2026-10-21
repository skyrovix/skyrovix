import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Code2, Plus, Search, Edit, Trash2, CheckCircle2,
  ExternalLink, Layers, Crown, Sparkles, Filter, Loader2
} from "lucide-react";

export function ProjectCatalogueAdminSection() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Full Stack Development");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [tier, setTier] = useState(1);
  const [minDuration, setMinDuration] = useState(3);
  const [description, setDescription] = useState("");
  const [technologiesStr, setTechnologiesStr] = useState("React, TypeScript, Node.js");
  const [resourcesStr, setResourcesStr] = useState("https://github.com/example/boilerplate");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["admin-project-challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_challenges")
        .select("*")
        .order("tier", { ascending: true })
        .order("id", { ascending: true });
      if (error) throw error;
      return (data as any[]) ?? [];
    },
  });

  const filtered = projects.filter((p) => {
    const matchesSearch =
      search.trim() === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    const matchesTier =
      tierFilter === "all" || String(p.tier) === tierFilter;
    return matchesSearch && matchesTier;
  });

  const openNewDialog = () => {
    setEditingProject(null);
    setTitle("");
    setSlug(`project-${Date.now().toString().slice(-4)}`);
    setCategory("Full Stack Development");
    setDifficulty("intermediate");
    setDurationWeeks(4);
    setTier(1);
    setMinDuration(3);
    setDescription("");
    setTechnologiesStr("React, Node.js, Tailwind CSS");
    setResourcesStr("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (p: any) => {
    setEditingProject(p);
    setTitle(p.title);
    setSlug(p.slug);
    setCategory(p.category || "Full Stack Development");
    setDifficulty(p.difficulty || "intermediate");
    setDurationWeeks(p.duration_weeks || 4);
    setTier(p.tier || 1);
    setMinDuration(p.min_duration || 3);
    setDescription(p.description || "");

    const techs = Array.isArray(p.technologies)
      ? p.technologies.join(", ")
      : typeof p.technologies === "string"
      ? p.technologies
      : "";
    setTechnologiesStr(techs);

    const res = Array.isArray(p.resources)
      ? p.resources.map((r: any) => (typeof r === "object" ? r.url : r)).join(", ")
      : typeof p.resources === "string"
      ? p.resources
      : "";
    setResourcesStr(res);

    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      return toast.error("Title and slug are required");
    }

    setSaving(true);
    try {
      const techArray = technologiesStr
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const resourcesArray = resourcesStr
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        category: category.trim(),
        difficulty,
        duration_weeks: Number(durationWeeks) || 4,
        tier: Number(tier) || 1,
        min_duration: Number(minDuration) || 3,
        description: description.trim(),
        technologies: techArray,
        resources: resourcesArray,
        is_active: true,
      };

      if (editingProject) {
        const { error } = await supabase
          .from("project_challenges")
          .update(payload)
          .eq("id", editingProject.id);
        if (error) throw error;
        toast.success("Project updated successfully");
      } else {
        const { error } = await supabase
          .from("project_challenges")
          .insert([payload]);
        if (error) throw error;
        toast.success("Project challenge created successfully");
      }

      setIsDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-project-challenges"] });
      qc.invalidateQueries({ queryKey: ["project-challenges-all"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project challenge?")) return;
    try {
      const { error } = await supabase.from("project_challenges").delete().eq("id", id);
      if (error) throw error;
      toast.success("Project deleted successfully");
      qc.invalidateQueries({ queryKey: ["admin-project-challenges"] });
      qc.invalidateQueries({ queryKey: ["project-challenges-all"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete project");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <Code2 className="size-6 text-primary" />
            Project Challenges Catalogue
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage the 50+ real-world industry project learning resources for 3-Month and 6-Month Premium plans.
          </p>
        </div>

        <Button
          onClick={openNewDialog}
          className="brand-gradient text-white font-bold text-xs h-10 px-4 rounded-xl shadow-md gap-1.5"
        >
          <Plus className="size-4" /> Add Project Resource
        </Button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl bg-muted/50 p-1 border border-border/50 text-xs">
            {["all", "1", "2"].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                  tierFilter === t
                    ? "bg-white dark:bg-slate-800 text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "all" ? "All Tiers (50+)" : t === "1" ? "Tier 1 (3M/6M)" : "Tier 2 (6M Only)"}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search title, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-white/70 dark:bg-slate-900/70 border-border/60"
          />
        </div>
      </div>

      {/* Table list */}
      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs uppercase text-muted-foreground bg-muted/20">
              <th className="px-4 py-3 text-left">Project Title</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Difficulty</th>
              <th className="px-4 py-3 text-left">Plan Tier</th>
              <th className="px-4 py-3 text-left">Duration</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-xs">
                  No project challenges found matching your filter.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/30 hover:bg-accent/20 transition-all text-xs">
                  <td className="px-4 py-3">
                    <p className="font-bold text-foreground">{p.title}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-medium">{p.category}</td>
                  <td className="px-4 py-3">
                    <Badge
                      className={`text-[10px] font-bold capitalize border-0 ${
                        p.difficulty === "advanced"
                          ? "bg-red-500/10 text-red-600"
                          : p.difficulty === "intermediate"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-emerald-500/10 text-emerald-600"
                      }`}
                    >
                      {p.difficulty}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-[10px] font-bold border-0 ${
                      p.tier === 2
                        ? "bg-purple-500/10 text-purple-600"
                        : "bg-blue-500/10 text-blue-600"
                    }`}>
                      {p.tier === 2 ? "Tier 2 (6M)" : "Tier 1 (3M/6M)"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.duration_weeks} Weeks</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(p)}
                        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg"
                      >
                        <Edit className="size-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(p.id)}
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
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingProject ? "Edit Project Challenge" : "Add Project Challenge"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define the real-world project requirements, technologies, and plan access tier.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-3 text-xs">
            <div className="space-y-1.5">
              <Label className="font-bold">Project Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Enterprise Microservices Architecture"
                className="h-10 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="font-bold">Slug *</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  placeholder="e.g. enterprise-microservices"
                  className="h-10 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold">Category *</Label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  placeholder="e.g. Full Stack, AI/ML"
                  className="h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="font-bold">Difficulty</Label>
                <select
                  value={difficulty}
                  onChange={(e: any) => setDifficulty(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border/60 bg-background text-xs font-semibold focus:outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold">Access Tier</Label>
                <select
                  value={tier}
                  onChange={(e) => setTier(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-border/60 bg-background text-xs font-semibold focus:outline-none"
                >
                  <option value={1}>Tier 1 (3M & 6M)</option>
                  <option value={2}>Tier 2 (6M Only)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold">Duration (Weeks)</Label>
                <Input
                  type="number"
                  min="1"
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(Number(e.target.value))}
                  className="h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold">Description</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="High level overview of the project challenge..."
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold">Tech Stack (comma separated)</Label>
              <Input
                value={technologiesStr}
                onChange={(e) => setTechnologiesStr(e.target.value)}
                placeholder="e.g. React, Docker, FastAPI, PostgreSQL"
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-bold">Resource URLs (comma separated)</Label>
              <Input
                value={resourcesStr}
                onChange={(e) => setResourcesStr(e.target.value)}
                placeholder="e.g. https://github.com/repo, https://docs.api.io"
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
                {saving ? <Loader2 className="size-4 animate-spin" /> : "Save Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
