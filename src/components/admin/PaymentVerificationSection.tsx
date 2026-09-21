import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAdminPayments,
  reviewPayment,
  type PaymentRecordItem,
} from "@/lib/fee-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IndianRupee,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  ExternalLink,
  Copy,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileImage,
  RefreshCw,
  MoreVertical,
  Loader2,
  Download,
} from "lucide-react";

interface PaymentVerificationSectionProps {
  adminId: string;
}

export function PaymentVerificationSection({ adminId }: PaymentVerificationSectionProps) {
  const qc = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal states
  const [selectedScreenshot, setSelectedScreenshot] = useState<{ url: string; title: string } | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecordItem | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "resubmission_required" | null>(null);
  const [adminNote, setAdminNote] = useState<string>("");

  const { data: payments = [], isLoading, refetch } = useQuery<PaymentRecordItem[]>({
    queryKey: ["admin-payments-list", adminId, statusFilter, typeFilter, searchQuery],
    queryFn: async () => {
      return getAdminPayments({
        data: {
          adminId,
          statusFilter,
          typeFilter,
          searchQuery,
        },
      });
    },
    enabled: Boolean(adminId),
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPayment || !actionType) return;
      return reviewPayment({
        data: {
          adminId,
          paymentId: selectedPayment.id,
          action: actionType,
          adminNote: adminNote.trim() || undefined,
        },
      });
    },
    onSuccess: () => {
      toast.success(
        actionType === "approve"
          ? "Payment approved successfully!"
          : actionType === "reject"
          ? "Payment rejected."
          : "Resubmission requested from student."
      );
      setActionType(null);
      setSelectedPayment(null);
      setAdminNote("");
      qc.invalidateQueries({ queryKey: ["admin-payments-list"] });
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update payment status");
    },
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const total = payments.length;
    const pending = payments.filter((p) => p.status === "pending" || p.status === "under_review").length;
    const approved = payments.filter((p) => p.status === "approved").length;
    const rejected = payments.filter((p) => p.status === "rejected" || p.status === "resubmission_required").length;
    const totalAmount = payments
      .filter((p) => p.status === "approved")
      .reduce((acc, curr) => acc + curr.amount, 0);

    return { total, pending, approved, rejected, totalAmount };
  }, [payments]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const getStatusBadge = (status: PaymentRecordItem["status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold gap-1 text-[11px]">
            <CheckCircle2 className="size-3" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20 font-bold gap-1 text-[11px]">
            <XCircle className="size-3" /> Rejected
          </Badge>
        );
      case "resubmission_required":
        return (
          <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20 font-bold gap-1 text-[11px]">
            <RotateCcw className="size-3" /> Resubmit Req.
          </Badge>
        );
      case "under_review":
        return (
          <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20 font-bold gap-1 text-[11px]">
            <Clock className="size-3" /> Under Review
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold gap-1 text-[11px]">
            <Clock className="size-3" /> Pending
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">Payment Verification</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Review and verify manual UPI payment submissions for Applications and Certificates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="rounded-xl h-10 gap-2 border-border/60"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Review</p>
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">{stats.pending}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Requires manual admin action</p>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Approved</p>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{stats.approved}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Verified & processed</p>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rejected / Resub</p>
          <p className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-2">{stats.rejected}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Declined or sent back</p>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Collected</p>
          <p className="text-3xl font-extrabold text-primary mt-2">₹{stats.totalAmount.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Across approved payments</p>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 p-4">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="relative w-full md:w-80">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, email, UTR, ID..."
              className="pl-9 h-10 rounded-xl text-xs bg-background/50 border-border/60"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-muted-foreground">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-xl text-xs bg-background border border-border/60 px-3 font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="resubmission_required">Resubmission Req.</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-muted-foreground">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 rounded-xl text-xs bg-background border border-border/60 px-3 font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="application">Application Fee</option>
                <option value="certificate">Certificate Fee</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      <Card className="rounded-2xl border-border/50 shadow-sm bg-card/80 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/30 text-muted-foreground font-semibold border-b border-border/30">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Payment Type</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">UTR Number</th>
                  <th className="py-3.5 px-4">Screenshot</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted At</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      <Loader2 className="size-6 animate-spin mx-auto mb-2 text-primary" />
                      Loading payment records...
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      No payment records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-foreground">{p.student_name || "Unknown Student"}</div>
                        <div className="text-[11px] text-muted-foreground">{p.student_email || "No email"}</div>
                        {p.intern_id && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 mt-1 font-mono">
                            {p.intern_id}
                          </Badge>
                        )}
                      </td>

                      {/* Payment Type */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            p.payment_type === "application"
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                          }`}
                        >
                          {p.payment_type}
                        </Badge>
                        {p.domain && (
                          <div className="text-[10px] text-muted-foreground mt-0.5 capitalize">{p.domain}</div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-sm text-foreground">₹{p.amount}</span>
                      </td>

                      {/* UTR */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                          <span>{p.utr_number}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(p.utr_number, "UTR Number")}
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Copy className="size-3" />
                          </button>
                        </div>
                      </td>

                      {/* Screenshot Thumbnail */}
                      <td className="py-3.5 px-4">
                        {p.screenshot_url ? (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedScreenshot({
                                url: p.screenshot_url!,
                                title: `${p.student_name || "Student"} - UTR ${p.utr_number}`,
                              })
                            }
                            className="group relative size-10 rounded-lg overflow-hidden border border-border/60 hover:border-primary transition-colors cursor-pointer bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                          >
                            <img
                              src={p.screenshot_url}
                              alt="Payment Proof"
                              className="size-full object-cover group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Eye className="size-3.5" />
                            </div>
                          </button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">No image</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(p.status)}
                        {p.admin_note && (
                          <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 max-w-[160px] truncate" title={p.admin_note}>
                            Note: {p.admin_note}
                          </p>
                        )}
                      </td>

                      {/* Submitted At */}
                      <td className="py-3.5 px-4 text-muted-foreground">
                        <div>
                          {new Date(p.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px]">
                          {new Date(p.created_at).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.status === "pending" || p.status === "under_review" || p.status === "resubmission_required" ? (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                className="h-8 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-sm"
                                onClick={() => {
                                  setSelectedPayment(p);
                                  setActionType("approve");
                                  setAdminNote("");
                                }}
                              >
                                <CheckCircle2 className="size-3.5" /> Approve
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost" className="size-8 p-0 rounded-xl">
                                    <MoreVertical className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 rounded-xl">
                                  <DropdownMenuLabel className="text-xs">More Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    className="text-xs text-amber-600 gap-2 cursor-pointer"
                                    onClick={() => {
                                      setSelectedPayment(p);
                                      setActionType("resubmission_required");
                                      setAdminNote("Screenshot is unclear. Please upload a clear receipt with visible UTR.");
                                    }}
                                  >
                                    <RotateCcw className="size-3.5" /> Request Resubmission
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-xs text-red-600 gap-2 cursor-pointer"
                                    onClick={() => {
                                      setSelectedPayment(p);
                                      setActionType("reject");
                                      setAdminNote("UTR number did not match bank statement.");
                                    }}
                                  >
                                    <XCircle className="size-3.5" /> Reject Payment
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs gap-1 border-border/60">
                                  Modify <MoreVertical className="size-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44 rounded-xl">
                                {p.status !== "approved" && (
                                  <DropdownMenuItem
                                    className="text-xs text-emerald-600 gap-2 cursor-pointer"
                                    onClick={() => {
                                      setSelectedPayment(p);
                                      setActionType("approve");
                                      setAdminNote("");
                                    }}
                                  >
                                    <CheckCircle2 className="size-3.5" /> Mark Approved
                                  </DropdownMenuItem>
                                )}
                                {p.status !== "rejected" && (
                                  <DropdownMenuItem
                                    className="text-xs text-red-600 gap-2 cursor-pointer"
                                    onClick={() => {
                                      setSelectedPayment(p);
                                      setActionType("reject");
                                      setAdminNote("");
                                    }}
                                  >
                                    <XCircle className="size-3.5" /> Mark Rejected
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Review Action Confirmation Dialog */}
      <Dialog
        open={Boolean(actionType && selectedPayment)}
        onOpenChange={(open) => {
          if (!open) {
            setActionType(null);
            setSelectedPayment(null);
            setAdminNote("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === "approve" && <CheckCircle2 className="size-5 text-emerald-600" />}
              {actionType === "reject" && <XCircle className="size-5 text-red-600" />}
              {actionType === "resubmission_required" && <RotateCcw className="size-5 text-purple-600" />}
              <span>
                {actionType === "approve"
                  ? "Approve Payment"
                  : actionType === "reject"
                  ? "Reject Payment"
                  : "Request Payment Resubmission"}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              {actionType === "approve" ? (
                <>
                  Approving this payment will mark it as verified and trigger the appropriate workflow
                  (unlocking internship / sending offer letter for applications, or advancing certificate
                  issuance).
                </>
              ) : actionType === "reject" ? (
                <>
                  Rejecting this payment will notify the student. Please provide a reason so the student
                  understands why it was declined.
                </>
              ) : (
                <>
                  Requesting resubmission allows the student to upload a new proof or correct their UTR
                  without having to re-apply.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4 py-2 text-xs">
              <div className="rounded-xl border border-border/50 p-3 bg-muted/20 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-bold text-foreground">{selectedPayment.student_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-extrabold text-foreground">₹{selectedPayment.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UTR Number:</span>
                  <span className="font-mono font-bold text-foreground">{selectedPayment.utr_number}</span>
                </div>
              </div>

              {(actionType === "reject" || actionType === "resubmission_required") && (
                <div className="space-y-1.5">
                  <Label htmlFor="adminNoteInput" className="text-xs font-bold text-foreground">
                    Reason / Note for Student *
                  </Label>
                  <Textarea
                    id="adminNoteInput"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Enter the reason or instructions for resubmission..."
                    className="min-h-[80px] rounded-xl text-xs"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-10"
              onClick={() => {
                setActionType(null);
                setSelectedPayment(null);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={reviewMutation.isPending}
              onClick={() => reviewMutation.mutate()}
              className={`rounded-xl h-10 px-5 font-bold text-white ${
                actionType === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : actionType === "reject"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {reviewMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Processing...
                </>
              ) : (
                "Confirm & Proceed"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full-Screen Screenshot Lightbox Modal */}
      <Dialog
        open={Boolean(selectedScreenshot)}
        onOpenChange={(open) => {
          if (!open) setSelectedScreenshot(null);
        }}
      >
        <DialogContent className="max-w-3xl rounded-2xl p-0 overflow-hidden bg-black/95 text-white border-0">
          <div className="p-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2">
              <FileImage className="size-4 text-primary" />
              <span className="text-xs font-bold truncate max-w-md">{selectedScreenshot?.title}</span>
            </div>
            {selectedScreenshot?.url && (
              <a
                href={selectedScreenshot.url}
                target="_blank"
                rel="noreferrer"
                download
                className="text-xs text-white/80 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Download className="size-3.5" /> Download
              </a>
            )}
          </div>
          <div className="p-4 max-h-[80vh] overflow-auto flex items-center justify-center bg-black/40">
            {selectedScreenshot?.url && (
              <img
                src={selectedScreenshot.url}
                alt="Payment Screenshot Full"
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
