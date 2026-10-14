import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Github, Globe, Video, FileText, ArrowLeft, Loader2,
  AlertTriangle, UploadCloud, Info, CheckCircle2, ShieldCheck, ExternalLink
} from "lucide-react";
import { FadeUp } from "@/components/motion";

export const Route = createFileRoute("/_navbar-layout/projects/$id_/submit")({
  head: () => ({
    meta: [
      { title: "Submit Project Solution | Skyrovix" },
      { name: "description", content: "Submit your Github repository, live demo, and PDF system documentation for evaluator review." },
    ],
  }),
  component: ProjectSubmitPage,
});

function ProjectSubmitPage() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!loading && !user) {
      toast.info("Please sign in to access the project submission form.");
      navigate({ to: "/auth", search: { redirect: `/projects/${id}/submit` } });
    }
  }, [user, loading, navigate, id]);

  // 1. Fetch challenge details
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ["submit-project", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("project_challenges")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
  });

  // 2. Fetch user submission record
  const { data: submission, isLoading: isSubLoading } = useQuery({
    queryKey: ["submit-submission", project?.id, user?.id],
    enabled: !!project?.id && !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("project_submissions")
        .select("*")
        .eq("project_id", project!.id)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    }
  });

  // Autofill form if they have already submitted/applied
  useEffect(() => {
    if (submission) {
      if (submission.github_url !== "pending_submission") {
        setGithubUrl(submission.github_url || "");
      }
      setDemoUrl(submission.demo_url || "");
      setVideoUrl(submission.video_url || "");
      setNotes(submission.notes || "");
    }
  }, [submission]);

  // PDF Upload Action
  const uploadPdfFile = async (docFile: File): Promise<string> => {
    setUploadingDoc(true);
    const fileExt = docFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user!.id}/documentation/${fileName}`;

    // Upload to Supabase Storage bucket "project-submissions"
    const { data, error } = await supabase.storage
      .from("project-submissions")
      .upload(filePath, docFile, { cacheControl: "3600", upsert: true });

    if (error) {
      console.warn("Storage upload failed, fallback to local URL.", error);
      setUploadingDoc(false);
      return `/uploads/project-submissions/${filePath}`;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("project-submissions")
      .getPublicUrl(filePath);

    setUploadingDoc(false);
    return publicUrl;
  };

  // Submit Mutation
  const submitSolutionMutation = useMutation({
    mutationFn: async () => {
      if (!githubUrl.trim().toLowerCase().includes("github.com")) {
        throw new Error("Please enter a valid GitHub Repository link (must contain github.com)");
      }

      let docUrl = submission?.doc_url || "";
      if (file) {
        docUrl = await uploadPdfFile(file);
      }

      // Update or Upsert the submission details
      const { data, error } = await (supabase as any)
        .from("project_submissions")
        .upsert({
          project_id: project!.id,
          user_id: user!.id,
          github_url: githubUrl,
          demo_url: demoUrl || null,
          doc_url: docUrl || null,
          video_url: videoUrl || null,
          notes: notes || null,
          status: "pending",
          updated_at: new Date().toISOString()
        }, { onConflict: "project_id,user_id" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Solution submitted successfully for review!");
      queryClient.invalidateQueries({ queryKey: ["project-submission", project?.id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["submit-submission", project?.id, user?.id] });
      navigate({ to: `/projects/${id}` });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit project solution.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) return toast.warning("GitHub URL is required.");
    submitSolutionMutation.mutate();
  };

  if (loading || isProjectLoading || isSubLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="size-8 animate-spin text-blue-500" />
        <p className="text-sm text-muted-foreground">Loading submission dashboard...</p>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="w-full min-h-screen bg-[#fafbfc] dark:bg-[#070a13] text-foreground pb-20 pt-8 sm:pt-12">
      <div className="max-w-xl mx-auto px-4">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link to="/projects/$id" params={{ id }} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Back to Project Details
          </Link>
        </div>

        <FadeUp>
          <Card className="border border-border/50 bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur shadow-xl rounded-2xl">
            <CardHeader className="pb-4 border-b border-border/20 bg-muted/10">
              <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                Submit Solution
              </CardTitle>
              <CardDescription className="text-xs">
                Challenge ID: {project.project_id} &bull; {project.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* GitHub link input */}
                <div className="space-y-1.5">
                  <Label htmlFor="githubUrl" className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Github className="size-4" /> GitHub Repository URL <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="githubUrl"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="rounded-xl text-xs h-10 border-border/50"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">Make sure the repository is public and contains your solution code.</p>
                </div>

                {/* Demo link input */}
                <div className="space-y-1.5">
                  <Label htmlFor="demoUrl" className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Globe className="size-4 text-blue-500" /> Live Demo URL
                  </Label>
                  <Input
                    id="demoUrl"
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://your-app.vercel.app"
                    className="rounded-xl text-xs h-10 border-border/50"
                  />
                </div>

                {/* System documentation PDF upload */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                    <FileText className="size-4 text-blue-500" /> System Design & Documentation (PDF)
                  </Label>
                  
                  <div className="flex flex-col items-center justify-center border border-dashed border-border/60 rounded-xl p-6 bg-muted/10 hover:bg-muted/20 transition-colors relative cursor-pointer">
                    <UploadCloud className="size-8 text-blue-500/70 mb-2" />
                    <span className="text-xs text-muted-foreground font-semibold">
                      {file ? file.name : "Choose PDF file or drag it here"}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 mt-1">PDF file format only (Max 10MB)</span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  {submission?.doc_url && (
                    <div className="flex justify-between items-center text-[10px] bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 p-2.5 rounded-lg">
                      <span className="font-semibold truncate pr-2">Current document active</span>
                      <a href={submission.doc_url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-0.5 font-bold">
                        View <ExternalLink className="size-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Video Demo link */}
                <div className="space-y-1.5">
                  <Label htmlFor="videoUrl" className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Video className="size-4 text-rose-500" /> Video Presentation URL
                  </Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/... or Loom link"
                    className="rounded-xl text-xs h-10 border-border/50"
                  />
                </div>

                {/* Notes to evaluator */}
                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-bold text-foreground">
                    Notes for Evaluators
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add credentials, key highlights, or comments for the evaluation team..."
                    className="rounded-xl text-xs min-h-[90px] border-border/50"
                  />
                </div>

                {/* Notice info */}
                <div className="rounded-xl border border-blue-500/10 bg-blue-500/5 p-3.5 text-xs text-muted-foreground flex gap-2.5">
                  <Info className="size-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[10px]">
                    Submitting this solution initiates the evaluation lifecycle. You can re-submit modifications at any time prior to the grading phase.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    asChild
                    variant="outline"
                    className="flex-1 rounded-xl text-xs h-11 border-border/50 hover:bg-muted/80"
                  >
                    <Link to="/projects/$id" params={{ id }}>
                      Cancel
                    </Link>
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitSolutionMutation.isPending || uploadingDoc}
                    className="flex-1 rounded-xl text-xs h-11 brand-gradient text-white border-0 font-semibold shadow hover:opacity-95"
                  >
                    {submitSolutionMutation.isPending || uploadingDoc ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Submit Solution"
                    )}
                  </Button>
                </div>

              </form>

            </CardContent>
          </Card>
        </FadeUp>

      </div>
    </div>
  );
}
