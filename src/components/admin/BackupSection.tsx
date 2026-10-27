import { useState, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  Database, HardDrive, Calendar, Clock, Shield, Download, Trash2, RefreshCw,
  Upload, AlertTriangle, CheckCircle2, XCircle, FileArchive, Search, RotateCcw,
  Settings2, Activity, Save, FolderArchive, Zap, Loader2, ArrowUpDown,
  ListRestart, History, ChevronLeft, ChevronRight, FileSpreadsheet,
} from "lucide-react";
import {
  createBackup,
  getBackups,
  deleteBackup,
  restoreBackup,
  downloadBackupFile,
  getBackupStorageInfo,
  getAutoBackupConfig,
  updateAutoBackupConfig,
  createSafetyBackup,
  getAuditLogs,
  validateBackupFile,
  restoreFromUpload,
  type BackupRecord,
  type BackupType,
} from "@/lib/backup-service";

const BACKUP_TYPES: BackupType[] = ["database", "csv", "files", "full"];

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
  } catch { return iso; }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

const typeConfig: Record<BackupType, { label: string; icon: any; color: string; desc: string }> = {
  database: { label: "Database", icon: Database, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30", desc: "Export complete database as SQL" },
  csv: { label: "All Data (CSV)", icon: FileSpreadsheet, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/30", desc: "Export all 53 tables as individual CSV files (ZIP)" },
  files: { label: "Uploaded Files", icon: FolderArchive, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30", desc: "Compress and download uploaded assets" },
  full: { label: "Full Backup", icon: FileArchive, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30", desc: "Complete system backup with everything" },
};

export function BackupSection() {
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const [backingUp, setBackingUp] = useState<BackupType | null>(null);
  const [progress, setProgress] = useState<string>("");
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortField, setSortField] = useState<"created_at" | "name" | "size">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data: backupsData, isLoading: backupsLoading, refetch: refetchBackups } = useQuery({
    queryKey: ["admin-backups"],
    refetchInterval: 30_000,
    queryFn: () => getBackups(),
  });

  const { data: storageInfo, refetch: refetchStorage } = useQuery({
    queryKey: ["admin-backup-storage"],
    queryFn: () => getBackupStorageInfo(),
  });

  const { data: autoConfig, refetch: refetchAutoConfig } = useQuery({
    queryKey: ["admin-auto-backup"],
    queryFn: () => getAutoBackupConfig(),
  });

  const { data: auditLogs } = useQuery({
    queryKey: ["admin-backup-audit"],
    queryFn: () => getAuditLogs(),
  });

  const backups = useMemo(() => backupsData || [], [backupsData]);

  const filteredBackups = useMemo(() => {
    let list = [...backups];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((b) =>
        b.name.toLowerCase().includes(q) ||
        b.created_by_name.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q)
      );
    }
    if (filterType !== "all") {
      list = list.filter((b) => b.type === filterType);
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "created_at") cmp = a.created_at.localeCompare(b.created_at);
      else if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "size") cmp = a.size - b.size;
      return sortDir === "desc" ? -cmp : cmp;
    });
    return list;
  }, [backups, searchQuery, filterType, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredBackups.length / perPage));
  const pagedBackups = filteredBackups.slice((page - 1) * perPage, page * perPage);

  useEffect(() => { setPage(1); }, [searchQuery, filterType]);

  const userName = user?.email?.split("@")[0] || "Admin";
  const userEmail = user?.email || "admin@skyrovix.online";

  const handleBackup = useCallback(async (type: BackupType) => {
    setBackingUp(type);
    setProgress(`Starting ${typeConfig[type].label.toLowerCase()} backup...`);
    try {
      const result = await createBackup({ data: { type, userEmail, userName } });
      if (result.status === "failed") {
        toast.error(`Backup failed: ${result.error}`);
      } else {
        toast.success(`${typeConfig[type].label} backup completed`, {
          description: `${result.name} (${formatBytes(result.size)})`,
        });
      }
      await Promise.all([refetchBackups(), refetchStorage()]);
    } catch (e: any) {
      toast.error(`Backup error: ${e.message}`);
    } finally {
      setBackingUp(null);
      setProgress("");
    }
  }, [userEmail, userName, refetchBackups, refetchStorage]);

  const handleDelete = useCallback(async (backupId: string) => {
    setDeleting(backupId);
    try {
      const result = await deleteBackup({ data: { backupId, userEmail, userName } });
      if (result.success) {
        toast.success("Backup deleted");
        await Promise.all([refetchBackups(), refetchStorage()]);
      } else {
        toast.error(`Delete failed: ${result.error}`);
      }
    } catch (e: any) {
      toast.error(`Delete error: ${e.message}`);
    } finally {
      setDeleting(null);
    }
  }, [userEmail, userName, refetchBackups, refetchStorage]);

  const handleDownload = useCallback(async (backupId: string) => {
    setDownloading(backupId);
    try {
      const result = await downloadBackupFile({ data: { backupId } });
      if (result.content && result.name) {
        const byteChars = atob(result.content);
        const byteNums = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
        const byteArray = new Uint8Array(byteNums);
        const blob = new Blob([byteArray]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Downloaded: ${result.name}`);
      } else {
        toast.error(`Download failed: ${result.error}`);
      }
    } catch (e: any) {
      toast.error(`Download error: ${e.message}`);
    } finally {
      setDownloading(null);
    }
  }, []);

  const handleRestore = useCallback(async (backupId: string) => {
    setConfirmRestore(null);
    setRestoring(true);
    try {
      toast.info("Creating safety backup before restore...");
      const safety = await createSafetyBackup({ data: { userEmail, userName } });
      if (safety.error) {
        toast.error(`Safety backup failed: ${safety.error}. Restore cancelled.`);
        setRestoring(false);
        return;
      }
      toast.success("Safety backup created. Proceeding with restore...");
      const result = await restoreBackup({ data: { backupId, userEmail, userName, safetyBackupId: safety.backupId || "" } });
      if (result.success) {
        toast.success("Restore completed", { description: result.details });
        await Promise.all([refetchBackups(), refetchStorage()]);
      } else {
        toast.error(`Restore failed: ${result.error}`);
      }
    } catch (e: any) {
      toast.error(`Restore error: ${e.message}`);
    } finally {
      setRestoring(false);
    }
  }, [userEmail, userName, refetchBackups, refetchStorage]);

  const toggleSort = (field: "created_at" | "name" | "size") => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const statusBadge = (status: string) => {
    if (status === "completed") return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-medium px-2 py-0.5"><CheckCircle2 className="size-3 mr-1" />Completed</Badge>;
    if (status === "running") return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-medium px-2 py-0.5"><Loader2 className="size-3 mr-1 animate-spin" />Running</Badge>;
    return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] font-medium px-2 py-0.5"><XCircle className="size-3 mr-1" />Failed</Badge>;
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <HardDrive className="size-6 text-blue-600" />
            Backup & Restore
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage system backups, restore data, and configure automatic backups</p>
        </div>
        <Button
          onClick={() => handleBackup("full")}
          disabled={backingUp !== null}
          className="brand-gradient text-white border-0 rounded-xl h-10 px-5 gap-2 text-sm"
        >
          {backingUp === "full" ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
          {backingUp === "full" ? "Creating..." : "Create Backup Now"}
        </Button>
      </div>

      {/* Progress overlay */}
      {backingUp && (
        <div className="rounded-2xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 p-5 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Loader2 className="size-8 animate-spin text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Creating {typeConfig[backingUp].label} Backup...
              </p>
              <p className="text-xs text-blue-500 mt-0.5">{progress}</p>
              <div className="mt-2 h-1.5 w-full max-w-md rounded-full bg-blue-200 dark:bg-blue-800 overflow-hidden">
                <div className="h-full w-full rounded-full bg-blue-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          icon={FileArchive}
          label="Total Backups"
          value={backups.filter((b) => b.status === "completed").length.toString()}
          sub={backups.length > 0 ? `Last: ${timeAgo(backups[0].created_at)}` : "No backups yet"}
          color="text-blue-600 bg-blue-50 dark:bg-blue-950/30"
        />
        <DashboardCard
          icon={Calendar}
          label="Latest Backup"
          value={backups.length > 0 ? formatDate(backups[0].created_at) : "—"}
          sub={backups.length > 0 ? timeAgo(backups[0].created_at) : "Not available"}
          color="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
        />
        <DashboardCard
          icon={HardDrive}
          label="Storage Used"
          value={formatBytes(storageInfo?.totalSize || 0)}
          sub={`${storageInfo?.fileCount || 0} backup files`}
          color="text-purple-600 bg-purple-50 dark:bg-purple-950/30"
        />
        <DashboardCard
          icon={Activity}
          label="Auto Backup"
          value={autoConfig?.enabled ? "Active" : "Inactive"}
          sub={autoConfig?.enabled ? `${autoConfig.frequency} at ${autoConfig.backupTime}` : "Not configured"}
          color="text-amber-600 bg-amber-50 dark:bg-amber-950/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backup Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Backup Options */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Download className="size-4 text-blue-600" />
                Backup Options
              </CardTitle>
              <CardDescription>Choose the type of backup to create</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(BACKUP_TYPES as BackupType[]).map((type) => {
                  const cfg = typeConfig[type];
                  const Icon = cfg.icon;
                  const isActive = backingUp === type;
                  return (
                    <button
                      key={type}
                      onClick={() => handleBackup(type)}
                      disabled={backingUp !== null}
                      className={`relative group rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                        isActive
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-500"
                          : "border-border/50 hover:border-blue-200 dark:hover:border-blue-800 bg-white/50 dark:bg-[#1E293B]/50 hover:shadow-md"
                      } ${backingUp !== null && !isActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className={`inline-flex p-2.5 rounded-xl ${cfg.color} mb-3`}>
                        {isActive ? <Loader2 className="size-5 animate-spin" /> : <Icon className="size-5" />}
                      </div>
                      <h4 className="text-sm font-semibold mb-1">{cfg.label}</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{cfg.desc}</p>
                      {isActive && (
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 rounded-b-2xl animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Backup History */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <History className="size-4 text-blue-600" />
                  Backup History
                </CardTitle>
                <CardDescription>{filteredBackups.length} backup(s) found</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search backups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 w-36 lg:w-48 rounded-lg pl-8 text-xs border-border/60"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="h-8 w-28 rounded-lg text-xs border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">All Types</SelectItem>
                    {BACKUP_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="text-xs">{typeConfig[t].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="size-8 rounded-lg" onClick={() => refetchBackups()}>
                  <RefreshCw className="size-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {backupsLoading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
                  ))}
                </div>
              ) : pagedBackups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <HardDrive className="size-10 text-slate-300 mb-3" />
                  <p className="text-sm font-medium text-slate-500">No backups yet</p>
                  <p className="text-xs text-slate-400 mt-1">Create your first backup using the options above</p>
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div className="hidden md:grid grid-cols-[1fr_100px_100px_140px_120px_120px_80px] gap-3 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-border/40">
                    <button onClick={() => toggleSort("name")} className="flex items-center gap-1 text-left">
                      Backup Name <ArrowUpDown className="size-3" />
                    </button>
                    <span>Type</span>
                    <button onClick={() => toggleSort("size")} className="flex items-center gap-1">
                      Size <ArrowUpDown className="size-3" />
                    </button>
                    <button onClick={() => toggleSort("created_at")} className="flex items-center gap-1">
                      Date & Time <ArrowUpDown className="size-3" />
                    </button>
                    <span>Created By</span>
                    <span>Status</span>
                    <span className="text-right">Actions</span>
                  </div>

                  {/* Table rows */}
                  <div className="divide-y divide-border/30">
                    {pagedBackups.map((backup) => {
                      const cfg = typeConfig[backup.type as BackupType] || typeConfig.full;
                      const Icon = cfg.icon;
                      return (
                        <div key={backup.id} className="grid grid-cols-1 md:grid-cols-[1fr_100px_100px_140px_120px_120px_80px] gap-2 md:gap-3 px-4 py-3 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition text-sm">
                          {/* Mobile card layout */}
                          <div className="md:hidden space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`p-1.5 rounded-lg ${cfg.color}`}>
                                  <Icon className="size-3.5" />
                                </div>
                                <span className="text-xs font-medium truncate">{backup.name}</span>
                              </div>
                              {statusBadge(backup.status)}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500">
                              <span className="capitalize">{backup.type}</span>
                              <span>{formatBytes(backup.size)}</span>
                              <span>{formatDate(backup.created_at)}</span>
                              <span>{backup.created_by_name}</span>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              {backup.status === "completed" && (
                                <>
                                  <Button variant="ghost" size="icon" className="size-7 rounded-lg" onClick={() => handleDownload(backup.id)} disabled={downloading === backup.id} title="Download">
                                    {downloading === backup.id ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                                  </Button>
                                  <Button variant="ghost" size="icon" className="size-7 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => setConfirmRestore(backup.id)} title="Restore">
                                    <RotateCcw className="size-3.5" />
                                  </Button>
                                </>
                              )}
                              <Button variant="ghost" size="icon" className="size-7 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => handleDelete(backup.id)} disabled={deleting === backup.id} title="Delete">
                                {deleting === backup.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                              </Button>
                            </div>
                          </div>

                          {/* Desktop row */}
                          <div className="hidden md:flex items-center gap-2 min-w-0">
                            <div className={`p-1 rounded-md ${cfg.color}`}>
                              <Icon className="size-3.5" />
                            </div>
                            <span className="text-xs font-medium truncate">{backup.name}</span>
                          </div>
                          <div className="hidden md:block">
                            <Badge variant="outline" className="text-[10px] font-medium capitalize border-border/50">
                              {backup.type}
                            </Badge>
                          </div>
                          <div className="hidden md:block text-xs text-slate-500">{formatBytes(backup.size)}</div>
                          <div className="hidden md:block text-xs text-slate-500">{formatDate(backup.created_at)}</div>
                          <div className="hidden md:block text-xs text-slate-500 truncate">{backup.created_by_name}</div>
                          <div className="hidden md:block">{statusBadge(backup.status)}</div>
                          <div className="hidden md:flex items-center justify-end gap-1">
                            {backup.status === "completed" && (
                              <>
                                <Button variant="ghost" size="icon" className="size-7 rounded-lg" onClick={() => handleDownload(backup.id)} disabled={downloading === backup.id} title="Download">
                                  {downloading === backup.id ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="size-7 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => setConfirmRestore(backup.id)} title="Restore">
                                  <RotateCcw className="size-3.5" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="icon" className="size-7 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => handleDelete(backup.id)} disabled={deleting === backup.id} title="Delete">
                              {deleting === backup.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
                      <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="size-8 rounded-lg" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                          <ChevronLeft className="size-3.5" />
                        </Button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let p = i + 1;
                          if (totalPages > 5) {
                            if (page > 3) p = page - 3 + i;
                            if (p > totalPages - 4) p = totalPages - 4 + i;
                            if (p < 1) p = 1;
                          }
                          return (
                            <Button
                              key={p}
                              variant={page === p ? "default" : "outline"}
                              size="icon"
                              className={`size-8 rounded-lg text-xs ${page === p ? "brand-gradient text-white border-0" : ""}`}
                              onClick={() => setPage(p)}
                            >
                              {p}
                            </Button>
                          );
                        }).filter((v, i, a) => a.findIndex((x) => x.key === v.key) === i)}
                        <Button variant="outline" size="icon" className="size-8 rounded-lg" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                          <ChevronRight className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Storage */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <HardDrive className="size-4 text-purple-600" />
                Storage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StorageRow label="Total Storage Used" value={formatBytes(storageInfo?.totalSize || 0)} icon={HardDrive} color="text-purple-600" />
              <StorageRow label="Backup Files" value={String(storageInfo?.fileCount || 0)} icon={FileArchive} color="text-blue-600" />
              <StorageRow
                label="Largest Backup"
                value={storageInfo?.largestBackup ? formatBytes(storageInfo.largestBackup.size) : "—"}
                icon={ArrowUpDown}
                color="text-amber-600"
              />
              <StorageRow
                label="Oldest Backup"
                value={storageInfo?.oldestBackup ? formatDate(storageInfo.oldestBackup.created_at) : "—"}
                icon={Calendar}
                color="text-slate-600"
              />
            </CardContent>
          </Card>

          {/* Restore from Upload */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Upload className="size-4 text-amber-600" />
                Restore from Upload
              </CardTitle>
              <CardDescription>Upload a backup ZIP or SQL file to restore</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RestoreUploadSection
                userEmail={userEmail}
                userName={userName}
                onDone={() => { refetchBackups(); refetchStorage(); }}
              />
            </CardContent>
          </Card>

          {/* Auto Backup */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Settings2 className="size-4 text-amber-600" />
                Automatic Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AutoBackupConfig
                config={autoConfig}
                userEmail={userEmail}
                userName={userName}
                onUpdated={() => { refetchAutoConfig(); refetchBackups(); }}
              />
            </CardContent>
          </Card>

          {/* Audit Log */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="size-4 text-slate-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto space-y-2">
              {!auditLogs || auditLogs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No backup activity yet</p>
              ) : (
                auditLogs.slice(0, 20).map((entry, i) => (
                  <div key={i} className="flex items-start gap-2.5 pb-2 border-b border-border/20 last:border-0">
                    <div className={`p-1 rounded-full mt-0.5 ${
                      entry.action.includes("failed") ? "bg-rose-50 text-rose-500" :
                      entry.action.includes("deleted") ? "bg-orange-50 text-orange-500" :
                      entry.action.includes("restore") ? "bg-amber-50 text-amber-500" :
                      "bg-emerald-50 text-emerald-500"
                    }`}>
                      <Activity className="size-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">{entry.details}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {entry.user} · {timeAgo(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Restore Confirmation Dialog */}
      {confirmRestore && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setConfirmRestore(null)}>
          <div className="w-full max-w-md rounded-2xl border border-border/50 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:bg-[#1E293B]/95 dark:border-white/10 animate-in zoom-in-95 my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30">
                <AlertTriangle className="size-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold">Restore Backup</h3>
                <p className="text-xs text-slate-500">This action will overwrite current data</p>
              </div>
            </div>
            <div className="space-y-3 mb-6 text-sm text-slate-600 dark:text-slate-300">
              <p>Are you sure you want to restore this backup?</p>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  A safety backup of the current system will be created automatically
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="size-3.5 text-amber-500 mt-0.5 shrink-0" />
                  Current database tables and uploaded files will be overwritten
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="size-3.5 text-blue-500 mt-0.5 shrink-0" />
                  System settings will be restored to the backup state
                </li>
              </ul>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" className="text-xs rounded-xl h-9" onClick={() => setConfirmRestore(null)}>Cancel</Button>
              <Button
                onClick={() => handleRestore(confirmRestore)}
                disabled={restoring}
                className="bg-amber-600 hover:bg-amber-700 text-white border-0 text-xs rounded-xl h-9 px-4 gap-2"
              >
                {restoring ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
                {restoring ? "Restoring..." : "Restore Now"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Restore progress overlay */}
      {restoring && !confirmRestore && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border/50 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:bg-[#1E293B]/95 dark:border-white/10 text-center my-auto">
            <Loader2 className="size-10 animate-spin text-amber-600 mx-auto mb-4" />
            <h3 className="text-base font-bold">Restoring Backup</h3>
            <p className="text-sm text-slate-500 mt-2">Creating safety backup and restoring data. Please wait...</p>
            <div className="mt-4 h-1.5 w-full rounded-full bg-amber-200 dark:bg-amber-800 overflow-hidden">
              <div className="h-full w-full rounded-full bg-amber-500 animate-pulse" />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function RestoreUploadSection({ userEmail, userName, onDone }: { userEmail: string; userName: string; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [validInfo, setValidInfo] = useState<{ type: string; hasDb: boolean; hasFiles: boolean; fileCount: number; size: number } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) { setFile(null); setValidInfo(null); return; }

    if (!f.name.endsWith(".zip") && !f.name.endsWith(".sql")) {
      toast.error("Only .zip and .sql files are supported");
      e.target.value = "";
      return;
    }

    if (f.size > 500 * 1024 * 1024) {
      toast.error("File exceeds 500MB maximum size");
      e.target.value = "";
      return;
    }

    setFile(f);
    setValidating(true);
    setValidInfo(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string)?.split(",")[1];
        if (!base64) { toast.error("Failed to read file"); setValidating(false); return; }

        const result = await validateBackupFile({ data: { fileName: f.name, fileBase64: base64 } });
        setValidating(false);
        if (result.valid && result.info) {
          setValidInfo(result.info);
          const typeLabel = result.info.type === "database" ? "SQL Database" : result.info.type === "csv" ? "CSV All Data" : result.info.type === "files" ? "Uploaded Files" : "Full Backup";
          toast.success(`Valid backup file: ${typeLabel} (${formatBytes(result.info.size)})`);
        } else {
          setValidInfo(null);
          toast.error(`Invalid backup file: ${result.error}`);
        }
      };
      reader.readAsDataURL(f);
    } catch (err: any) {
      setValidating(false);
      toast.error(`Validation error: ${err.message}`);
    }
  };

  const handleRestore = async () => {
    if (!file) return;
    setConfirmOpen(false);
    setRestoring(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string)?.split(",")[1];
        if (!base64) { toast.error("Failed to read file"); setRestoring(false); return; }

        toast.info("Creating safety backup before restore...");
        try {
          const safety = await createSafetyBackup({ data: { userEmail, userName } });
          if (safety.error) {
            toast.warning(`Safety backup skipped: ${safety.error}`);
          } else {
            toast.success("Safety backup created. Proceeding with restore...");
          }
        } catch (safetyErr: any) {
          toast.warning(`Safety backup skipped: ${safetyErr.message}`);
        }

        const result = await restoreFromUpload({ data: { fileBase64: base64, fileName: file.name, userEmail, userName } });
        setRestoring(false);
        if (result.success) {
          toast.success("Restore completed", { description: result.details });
          setFile(null);
          setValidInfo(null);
          onDone();
        } else {
          toast.error(`Restore failed: ${result.error}`);
        }
      };
      reader.onerror = () => {
        setRestoring(false);
        toast.error("Failed to read backup file");
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setRestoring(false);
      toast.error(`Restore error: ${err.message}`);
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="relative">
          <Input
            type="file"
            accept=".zip,.sql"
            onChange={handleFileChange}
            className="h-10 text-xs rounded-xl border-border/60 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:brand-gradient file:text-white hover:file:opacity-90"
          />
        </div>

        {validating && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="size-3.5 animate-spin" />
            Validating backup file...
          </div>
        )}

        {validInfo && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="size-3.5" />
              Valid backup
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 capitalize">
              Type: {validInfo.type} {validInfo.hasDb ? "• DB" : ""} {validInfo.hasFiles ? "• Files" : ""}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
              Size: {formatBytes(validInfo.size)} • {validInfo.fileCount} file(s)
            </p>
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={restoring}
              className="w-full mt-1 bg-emerald-600 hover:bg-emerald-700 text-white border-0 rounded-xl h-8 text-xs gap-1.5"
            >
              {restoring ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
              {restoring ? "Restoring..." : "Restore This Backup"}
            </Button>
          </div>
        )}
      </div>

      {confirmOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setConfirmOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-border/50 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:bg-[#1E293B]/95 dark:border-white/10 animate-in zoom-in-95 my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30">
                <AlertTriangle className="size-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold">Restore from Upload</h3>
                <p className="text-xs text-slate-500">{file?.name}</p>
              </div>
            </div>
            <div className="space-y-3 mb-6 text-sm text-slate-600 dark:text-slate-300">
              <p>This will overwrite current data with the uploaded backup.</p>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  A safety backup will be created automatically
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="size-3.5 text-amber-500 mt-0.5 shrink-0" />
                  Existing database tables will be overwritten
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="size-3.5 text-blue-500 mt-0.5 shrink-0" />
                  Uploaded files will be restored from backup
                </li>
              </ul>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" className="text-xs rounded-xl h-9" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button onClick={handleRestore} disabled={restoring} className="bg-amber-600 hover:bg-amber-700 text-white border-0 text-xs rounded-xl h-9 px-4 gap-2">
                {restoring ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
                {restoring ? "Restoring..." : "Restore Now"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function DashboardCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub: string; color: string }) {
  return (
    <Card className="border-border/50 shadow-sm bg-white/60 dark:bg-[#1E293B]/60 backdrop-blur">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-lg sm:text-xl font-bold mt-1 text-slate-800 dark:text-white">{value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
          </div>
          <div className={`p-2.5 rounded-xl ${color}`}>
            <Icon className="size-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StorageRow({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Icon className={`size-4 ${color}`} />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{value}</span>
    </div>
  );
}

function AutoBackupConfig({ config, userEmail, userName, onUpdated }: {
  config: any; userEmail: string; userName: string; onUpdated: () => void;
}) {
  const [enabled, setEnabled] = useState(config?.enabled ?? false);
  const [frequency, setFrequency] = useState(config?.frequency ?? "daily");
  const [backupTime, setBackupTime] = useState(config?.backupTime ?? "02:00");
  const [retentionCount, setRetentionCount] = useState(config?.retentionCount ?? 30);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setEnabled(config.enabled ?? false);
      setFrequency(config.frequency ?? "daily");
      setBackupTime(config.backupTime ?? "02:00");
      setRetentionCount(config.retentionCount ?? 30);
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateAutoBackupConfig({
        data: { enabled, frequency, backupTime, retentionCount },
      });
      if (result.success) {
        toast.success("Auto backup config saved");
        onUpdated();
      } else {
        toast.error(`Save failed: ${result.error}`);
      }
    } catch (e: any) {
      toast.error(`Save error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Enable Auto Backup</Label>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      {enabled && (
        <>
          <div>
            <Label className="text-xs font-medium">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="h-9 text-xs rounded-xl mt-1 border-border/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily" className="text-xs">Daily</SelectItem>
                <SelectItem value="weekly" className="text-xs">Weekly</SelectItem>
                <SelectItem value="monthly" className="text-xs">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-medium">Backup Time</Label>
            <Input
              type="time"
              value={backupTime}
              onChange={(e) => setBackupTime(e.target.value)}
              className="h-9 text-xs rounded-xl mt-1 border-border/60"
            />
          </div>

          <div>
            <Label className="text-xs font-medium">Retention (number of backups)</Label>
            <Input
              type="number"
              min={1}
              max={365}
              value={retentionCount}
              onChange={(e) => setRetentionCount(Number(e.target.value))}
              className="h-9 text-xs rounded-xl mt-1 border-border/60"
            />
            <p className="text-[10px] text-slate-400 mt-1">Oldest backups beyond this count are auto-deleted</p>
          </div>
        </>
      )}

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full brand-gradient text-white border-0 rounded-xl h-9 text-xs gap-2"
      >
        {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
        {saving ? "Saving..." : "Save Configuration"}
      </Button>
    </div>
  );
}
