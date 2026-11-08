import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  IndianRupee,
  Sparkles,
  ExternalLink,
  Crown,
  Search,
  Upload,
  RefreshCw,
  Gift,
  Check,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  getAdminStudentKitsFn,
  saveAdminStudentKitFn,
  deleteAdminStudentKitFn,
  uploadStudentKitAssetFn,
  type StudentKitItem,
  type StudentKitPurchaseItem,
} from "@/lib/student-kit-service";

export function StudentKitsAdminSection() {
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<StudentKitItem | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formEdition, setFormEdition] = useState("Edition 1.0");
  const [formPrice, setFormPrice] = useState<number>(20);
  const [formDescription, setFormDescription] = useState("");
  const [formPdfUrl, setFormPdfUrl] = useState("/SKYROVIX_Complete_Web_Development_Student_Kit.pdf");
  const [formCoverImageUrl, setFormCoverImageUrl] = useState("/student-kit-cover.jpg");
  const [formIsFreeForPremium, setFormIsFreeForPremium] = useState(true);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDomain, setFormDomain] = useState("all");

  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch Kits and Purchases
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-student-kits"],
    queryFn: () => getAdminStudentKitsFn(),
  });

  const kits = data?.kits || [];
  const purchases = data?.purchases || [];
  const stats = data?.stats || {
    totalKits: 0,
    activeKits: 0,
    totalDownloads: 0,
    totalPurchases: 0,
    totalRevenue: 0,
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingKit(null);
    setFormTitle("Web Development Student Kit");
    setFormEdition("Edition 1.0");
    setFormPrice(20);
    setFormDescription(
      "From complete beginner to job-ready full stack developer. Complete learning resources, roadmap, cheat sheets, code templates & development tools."
    );
    setFormPdfUrl("/SKYROVIX_Complete_Web_Development_Student_Kit.pdf");
    setFormCoverImageUrl("/student-kit-cover.jpg");
    setFormIsFreeForPremium(true);
    setFormIsActive(true);
    setFormDomain("all");
    setDialogOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (kit: StudentKitItem) => {
    setEditingKit(kit);
    setFormTitle(kit.title);
    setFormEdition(kit.edition || "Edition 1.0");
    setFormPrice(kit.price);
    setFormDescription(kit.description || "");
    setFormPdfUrl(kit.pdf_url);
    setFormCoverImageUrl(kit.cover_image_url || "/student-kit-cover.jpg");
    setFormIsFreeForPremium(kit.is_free_for_premium);
    setFormIsActive(kit.is_active);
    setFormDomain(kit.domain || "all");
    setDialogOpen(true);
  };

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      return saveAdminStudentKitFn({
        data: {
          id: editingKit ? editingKit.id : undefined,
          title: formTitle,
          edition: formEdition,
          price: Number(formPrice),
          description: formDescription,
          pdf_url: formPdfUrl,
          cover_image_url: formCoverImageUrl,
          is_free_for_premium: formIsFreeForPremium,
          is_active: formIsActive,
          domain: formDomain,
        },
      });
    },
    onSuccess: () => {
      toast.success(
        editingKit
          ? "Student Kit updated successfully!"
          : "New Student Kit added successfully!"
      );
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-student-kits"] });
      qc.invalidateQueries({ queryKey: ["student-kits"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save student kit.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteAdminStudentKitFn({ data: { id } });
    },
    onSuccess: () => {
      toast.success("Student Kit deleted.");
      qc.invalidateQueries({ queryKey: ["admin-student-kits"] });
      qc.invalidateQueries({ queryKey: ["student-kits"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete student kit.");
    },
  });

  // Handle PDF upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a valid PDF file.");
      return;
    }

    try {
      setUploadingPdf(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await uploadStudentKitAssetFn({
            data: {
              filename: file.name,
              base64Data,
              type: "pdf",
            },
          });
          setFormPdfUrl(res.url);
          toast.success("PDF uploaded successfully!");
        } catch (err: any) {
          toast.error(err.message || "Failed to upload PDF.");
        } finally {
          setUploadingPdf(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingPdf(false);
    }
  };

  // Handle Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await uploadStudentKitAssetFn({
            data: {
              filename: file.name,
              base64Data,
              type: "image",
            },
          });
          setFormCoverImageUrl(res.url);
          toast.success("Cover image uploaded successfully!");
        } catch (err: any) {
          toast.error(err.message || "Failed to upload image.");
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingImage(false);
    }
  };

  const filteredPurchases = purchases.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.student_name && p.student_name.toLowerCase().includes(q)) ||
      (p.student_email && p.student_email.toLowerCase().includes(q)) ||
      (p.payment_id && p.payment_id.toLowerCase().includes(q)) ||
      (p.kit_title && p.kit_title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-white via-white to-orange-50/40 dark:from-[#181619] dark:via-[#181619] dark:to-[#251f22] border border-border/70 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-2xl bg-[#f95c4b]/15 text-[#f95c4b] grid place-items-center shadow-xs">
              <Gift className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-black font-display text-[#181619] dark:text-white">
                Student Kit Management
              </h2>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                Manage downloadable PDF student kits, set standard pricing (₹20), and track student unlocks.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-xl border-border/70 text-xs font-bold gap-1.5 cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="rounded-xl brand-gradient text-white font-bold text-xs shadow-md shadow-[#f95c4b]/20 gap-1.5 cursor-pointer hover:opacity-95"
          >
            <Plus className="size-4" />
            Add Student Kit
          </Button>
        </div>
      </div>

      {/* ─── STATS CARDS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-border/70 bg-white dark:bg-[#181619] shadow-2xs">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Kits
          </p>
          <p className="text-2xl font-black text-[#181619] dark:text-white mt-1">
            {stats.totalKits}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {stats.activeKits} Active
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/70 bg-white dark:bg-[#181619] shadow-2xs">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Standard Plan Price
          </p>
          <p className="text-2xl font-black text-[#f95c4b] mt-1">
            ₹{kits[0]?.price ?? 20}
          </p>
          <p className="text-[11px] font-semibold text-muted-foreground mt-1.5">
            Default Nominal Fee
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-border/70 bg-white dark:bg-[#181619] shadow-2xs">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Premium Plan Rule
          </p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            FREE (₹0)
          </p>
          <p className="text-[11px] font-semibold text-muted-foreground mt-1.5">
            100% Free with Premium
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-border/70 bg-white dark:bg-[#181619] shadow-2xs">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Downloads / Unlocks
          </p>
          <p className="text-2xl font-black text-[#181619] dark:text-white mt-1">
            {stats.totalDownloads}
          </p>
          <p className="text-[11px] font-semibold text-muted-foreground mt-1.5">
            {stats.totalPurchases} purchases (₹{stats.totalRevenue})
          </p>
        </div>
      </div>

      {/* ─── KITS LIST (CARDS) ─── */}
      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
          Available Student Kits ({kits.length})
        </h3>

        {kits.length === 0 ? (
          <div className="p-8 text-center rounded-3xl border border-dashed border-border/80 bg-white/50 dark:bg-[#181619]/50">
            <BookOpen className="size-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="font-bold text-sm text-[#181619] dark:text-white">
              No Student Kits added yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Click &quot;Add Student Kit&quot; above to add your first PDF kit.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kits.map((kit) => (
              <div
                key={kit.id}
                className="flex flex-col sm:flex-row gap-4 p-4.5 rounded-3xl border border-border/70 bg-white dark:bg-[#181619] shadow-2xs transition-all hover:border-[#f95c4b]/30 hover:shadow-md"
              >
                {/* Kit Cover Image */}
                <div className="relative w-full sm:w-36 h-48 sm:h-auto rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-border/60">
                  <img
                    src={kit.cover_image_url || "/student-kit-cover.jpg"}
                    alt={kit.title}
                    className="size-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/student-kit-cover.jpg";
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-[#181619]/80 text-white backdrop-blur-md text-[10px] font-black border-0">
                      {kit.edition || "Edition 1.0"}
                    </Badge>
                  </div>
                </div>

                {/* Kit Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {kit.id}
                      </span>
                      {kit.is_active ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-black">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-[10px]">
                          Inactive
                        </Badge>
                      )}
                      {kit.is_free_for_premium && (
                        <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] font-black">
                          👑 Free for Premium
                        </Badge>
                      )}
                    </div>

                    <h4 className="font-display font-black text-base text-[#181619] dark:text-white mt-1 leading-snug">
                      {kit.title}
                    </h4>

                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {kit.description || "Complete learning resources and development tools for students."}
                    </p>

                    <div className="mt-2.5 flex items-center gap-3 text-xs">
                      <span className="font-black text-[#f95c4b] text-sm">
                        ₹{kit.price} <span className="text-[10px] text-muted-foreground font-medium">Standard</span>
                      </span>
                      <span className="text-muted-foreground/30">•</span>
                      <span className="text-muted-foreground font-semibold text-[11px]">
                        📥 {kit.downloads_count} downloads
                      </span>
                    </div>

                    <div className="mt-2 text-[10.5px] font-mono text-muted-foreground truncate">
                      PDF: <a href={kit.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{kit.pdf_url}</a>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                    <a
                      href={kit.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl text-xs font-bold gap-1 h-8 cursor-pointer"
                      >
                        <Eye className="size-3.5" /> View PDF
                      </Button>
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEdit(kit)}
                      className="rounded-xl text-xs font-bold gap-1 h-8 cursor-pointer"
                    >
                      <Edit2 className="size-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${kit.title}"?`)) {
                          deleteMutation.mutate(kit.id);
                        }
                      }}
                      className="rounded-xl text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 h-8 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── PURCHASES & UNLOCKS AUDIT TABLE ─── */}
      <div className="rounded-3xl border border-border/70 bg-white dark:bg-[#181619] p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-black text-base text-[#181619] dark:text-white">
              Student Kit Unlocks & Purchases History
            </h3>
            <p className="text-xs text-muted-foreground">
              Real-time audit log of students who have unlocked the kit via Premium Plan (₹0) or Standard Plan (₹20).
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student or email..."
              className="pl-9 h-9 text-xs rounded-xl border-border/70"
            />
          </div>
        </div>

        {filteredPurchases.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No unlocks recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border/50">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-[#201d22]">
                <TableRow>
                  <TableHead className="text-xs font-bold">Student Name</TableHead>
                  <TableHead className="text-xs font-bold">Email</TableHead>
                  <TableHead className="text-xs font-bold">Plan Type</TableHead>
                  <TableHead className="text-xs font-bold">Amount Paid</TableHead>
                  <TableHead className="text-xs font-bold">Payment ID</TableHead>
                  <TableHead className="text-xs font-bold">Unlocked At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-bold text-xs">
                      {p.student_name || "Student"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {p.student_email || "—"}
                    </TableCell>
                    <TableCell>
                      {p.plan_type === "premium" ? (
                        <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] font-black">
                          👑 Premium Plan
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs font-semibold">
                          Standard Plan
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-xs text-[#f95c4b]">
                      {p.amount_paid === 0 ? "₹0 (FREE)" : `₹${p.amount_paid}`}
                    </TableCell>
                    <TableCell className="text-[11px] font-mono text-muted-foreground">
                      {p.payment_id || "—"}
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground">
                      {p.unlocked_at ? new Date(p.unlocked_at).toLocaleString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ─── ADD / EDIT DIALOG ─── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border/70 p-6 bg-white dark:bg-[#181619]">
          <DialogHeader>
            <DialogTitle className="font-display font-black text-lg text-[#181619] dark:text-white">
              {editingKit ? "Edit Student Kit" : "Add New Student Kit"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure PDF file, cover image, and pricing for this kit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {/* Title & Edition */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-bold">Kit Title *</Label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Web Development Student Kit"
                  className="rounded-xl text-xs h-9 border-border/70"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Edition</Label>
                <Input
                  value={formEdition}
                  onChange={(e) => setFormEdition(e.target.value)}
                  placeholder="e.g. Edition 1.0"
                  className="rounded-xl text-xs h-9 border-border/70"
                />
              </div>
            </div>

            {/* Price & Free for Premium */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#201d22] border border-border/60">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Standard Plan Price (₹) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    type="number"
                    min="0"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="pl-7 rounded-xl text-xs h-9 border-border/70 font-bold"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Fee paid by standard plan students to download the kit (e.g. ₹20).
                </p>
              </div>

              <div className="flex flex-col justify-between pt-1">
                <Label className="text-xs font-bold mb-1">Free for Premium Plan?</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Switch
                    checked={formIsFreeForPremium}
                    onCheckedChange={setFormIsFreeForPremium}
                  />
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {formIsFreeForPremium ? "Yes (100% Free)" : "No (Charged to all)"}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Premium plan students get this kit for ₹0.
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Kit Description</Label>
              <Textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Overview of the learning kit contents, cheatsheets, and project templates..."
                className="rounded-xl text-xs border-border/70 resize-none"
              />
            </div>

            {/* PDF File Path / Upload */}
            <div className="space-y-2 p-3.5 rounded-2xl border border-border/60 bg-white dark:bg-[#181619]">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold flex items-center gap-1.5">
                  <FileText className="size-3.5 text-[#f95c4b]" />
                  PDF File Source *
                </Label>
                <label className="text-[11px] font-bold text-[#f95c4b] hover:underline cursor-pointer flex items-center gap-1">
                  <Upload className="size-3" />
                  {uploadingPdf ? "Uploading..." : "Upload New PDF"}
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                    disabled={uploadingPdf}
                  />
                </label>
              </div>
              <Input
                value={formPdfUrl}
                onChange={(e) => setFormPdfUrl(e.target.value)}
                placeholder="/SKYROVIX_Complete_Web_Development_Student_Kit.pdf"
                className="rounded-xl text-xs h-9 font-mono border-border/70"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormPdfUrl("/SKYROVIX_Complete_Web_Development_Student_Kit.pdf")}
                  className="text-[10px] h-6 px-2 rounded-lg font-mono"
                >
                  Built-in Web Dev Kit PDF
                </Button>
              </div>
            </div>

            {/* Cover Image URL / Upload */}
            <div className="space-y-2 p-3.5 rounded-2xl border border-border/60 bg-white dark:bg-[#181619]">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold flex items-center gap-1.5">
                  <Package className="size-3.5 text-blue-500" />
                  Cover Image URL
                </Label>
                <label className="text-[11px] font-bold text-blue-500 hover:underline cursor-pointer flex items-center gap-1">
                  <Upload className="size-3" />
                  {uploadingImage ? "Uploading..." : "Upload New Image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>
              <Input
                value={formCoverImageUrl}
                onChange={(e) => setFormCoverImageUrl(e.target.value)}
                placeholder="/student-kit-cover.jpg"
                className="rounded-xl text-xs h-9 font-mono border-border/70"
              />
              {/* Preview image */}
              {formCoverImageUrl && (
                <div className="flex items-center gap-3 pt-1">
                  <img
                    src={formCoverImageUrl}
                    alt="Cover preview"
                    className="h-16 w-24 object-cover rounded-xl border border-border/60 shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/student-kit-cover.jpg";
                    }}
                  />
                  <div className="text-[11px] text-muted-foreground">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Cover Preview</p>
                    <p className="text-[10px]">Robot mascot hardcover book edition</p>
                  </div>
                </div>
              )}
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#201d22] border border-border/60">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Active Status</p>
                <p className="text-[10px] text-muted-foreground">
                  When active, students can view and unlock this kit in their dashboard.
                </p>
              </div>
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="rounded-xl text-xs font-bold h-9 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !formTitle.trim() || !formPdfUrl.trim()}
              className="rounded-xl brand-gradient text-white text-xs font-bold h-9 shadow-md shadow-[#f95c4b]/20 cursor-pointer"
            >
              {saveMutation.isPending ? "Saving..." : editingKit ? "Save Changes" : "Create Student Kit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

