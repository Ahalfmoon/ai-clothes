import { useState, useEffect } from "react";
import {
  Download,
  Trash2,
  Clock,
  Loader2,
  ImageOff,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Streamdown } from "@/components/ui/streamdown";
import Image from "@/components/ui/image";
import { getHistoryList, deleteHistory } from "@/api";
import { logger } from "@lark-apaas/client-toolkit/logger";
import { toast } from "sonner";
import type { HistoryRecord } from "@shared/api.interface";

const HistoryPage = () => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<HistoryRecord | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await getHistoryList(1, 20);
      setRecords(data.items);
      setTotal(data.total);
    } catch (err) {
      logger.error("获取历史记录失败", err);
      toast.error("获取历史记录失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteHistory(deleteTarget.id);
      toast.success("已删除记录");
      setDeleteTarget(null);
      fetchRecords();
    } catch (err) {
      logger.error("删除记录失败", err);
      toast.error("删除失败");
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `outfit-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      toast.success("图片已保存");
    } catch {
      toast.error("下载失败");
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "刚刚";
    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    if (diffDays < 7) return `${diffDays} 天前`;
    return date.toLocaleDateString("zh-CN");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="size-8 text-primary animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">加载历史记录中...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <ImageOff className="size-16 text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium text-foreground mb-1">
          暂无换装记录
        </h2>
        <p className="text-sm text-muted-foreground">
          去首页尝试一次 AI 换装吧
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">历史换装记录</h1>
          <p className="text-sm text-muted-foreground mt-1">
            共 {total} 条记录
          </p>
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {records.map((record) => (
          <Card
            key={record.id}
            className="overflow-hidden cursor-pointer group transition-shadow hover:shadow-md"
            onClick={() => setSelectedRecord(record)}
          >
            <div className="relative aspect-[3/4]">
              {record.resultPhotoUrl ? (
                <Image
                  src={record.resultPhotoUrl}
                  alt="换装效果"
                  className="w-full h-full object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <ImageOff className="size-8 text-muted-foreground" />
                </div>
              )}
              {/* Status Badge */}
              <div className="absolute top-2 left-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    record.status === "success"
                      ? "bg-success/90 text-white"
                      : record.status === "failed"
                        ? "bg-destructive/90 text-white"
                        : "bg-muted-foreground/80 text-white"
                  }`}
                >
                  {record.status === "success"
                    ? "成功"
                    : record.status === "failed"
                      ? "失败"
                      : "生成中"}
                </span>
              </div>
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Eye className="size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                <Clock className="size-3" />
                <span>{formatTime(record.createdAt)}</span>
              </div>
              {record.styleSuggestion && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {record.styleSuggestion.slice(0, 50)}...
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedRecord}
        onOpenChange={() => setSelectedRecord(null)}
      >
        {selectedRecord && (
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>换装详情</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {/* Result Image */}
              {selectedRecord.resultPhotoUrl && (
                <div className="relative rounded-lg overflow-hidden">
                  <Image
                    src={selectedRecord.resultPhotoUrl}
                    alt="换装效果"
                    className="w-full"
                    sizes="100vw"
                  />
                </div>
              )}

              {/* Style Suggestion */}
              {selectedRecord.styleSuggestion && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    穿搭建议
                  </h3>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <Streamdown>{selectedRecord.styleSuggestion}</Streamdown>
                  </div>
                </div>
              )}

              {/* Time */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3" />
                <span>
                  生成时间：{new Date(selectedRecord.createdAt).toLocaleString("zh-CN")}
                </span>
              </div>
            </div>
            <DialogFooter className="gap-2">
              {selectedRecord.resultPhotoUrl && (
                <Button
                  variant="outline"
                  onClick={() =>
                    handleDownload(selectedRecord.resultPhotoUrl as string)
                  }
                >
                  <Download className="size-4 mr-1.5" />
                  下载效果图
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => setDeleteTarget(selectedRecord)}
              >
                <Trash2 className="size-4 mr-1.5" />
                删除记录
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              删除后无法恢复该换装记录，确定要删除吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HistoryPage;
