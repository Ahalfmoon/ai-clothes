import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Sparkles, Download, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Streamdown } from "@/components/ui/streamdown";
import Image from "@/components/ui/image";
import { toast } from "sonner";
import { createHistory } from "@/api";
import {
  generateOutfitImage,
  streamStyleSuggestion,
} from "@/utils/outfit-plugins";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

interface UploadCardProps {
  label: string;
  previewUrl: string | null;
  onUpload: (url: string) => void;
  onClear: () => void;
  placeholderImg?: string;
}

const UploadCard = ({
  label,
  previewUrl,
  onUpload,
  onClear,
  placeholderImg,
}: UploadCardProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || '上传失败');
        }

        const data = await response.json();
        onUpload(data.url);
        toast.success(`${label}上传成功`);
      } catch (err) {
        console.error("图片上传失败", err);
        toast.error("图片上传失败，请重试");
      } finally {
        setIsUploading(false);
      }
    },
    [label, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  return (
    <Card
      className={`relative overflow-hidden transition-shadow hover:shadow-md ${
        previewUrl ? "" : "border-dashed"
      }`}
    >
      <div {...getRootProps()} className="cursor-pointer">
        <input {...getInputProps()} />
        {previewUrl ? (
          <div className="relative group">
            <Image
              src={previewUrl}
              alt={label}
              className="w-full aspect-[3/4] object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                点击更换图片
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="absolute top-2 right-2 size-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div
            className={`flex flex-col items-center justify-center py-12 px-6 ${
              isDragActive || isUploading ? "bg-accent" : ""
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="size-12 text-muted-foreground mb-3 animate-spin" />
                <p className="text-sm font-medium text-foreground mb-1">
                  上传中...
                </p>
              </>
            ) : (
              <>
                {placeholderImg ? (
                  <Image
                    src={placeholderImg}
                    alt=""
                    className="w-20 h-20 mb-3 opacity-40"
                    sizes="80px"
                  />
                ) : (
                  <ImageIcon className="size-12 text-muted-foreground mb-3" />
                )}
                <p className="text-sm font-medium text-foreground mb-1">
                  {label}
                </p>
                <p className="text-xs text-muted-foreground">
                  点击或拖拽上传，支持 JPG/PNG/WebP
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

const HomePage = () => {
  const [personPhoto, setPersonPhoto] = useState<string | null>(null);
  const [clothingPhoto, setClothingPhoto] = useState<string | null>(null);
  const [resultPhoto, setResultPhoto] = useState<string | null>(null);
  const [styleSuggestion, setStyleSuggestion] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!personPhoto || !clothingPhoto) {
      toast.error("请先上传两张图片");
      return;
    }
    setIsGenerating(true);
    setResultPhoto(null);
    setStyleSuggestion("");
    try {
      const [resultUrl] = await Promise.all([
        generateOutfitImage(personPhoto, clothingPhoto),
      ]);
      setResultPhoto(resultUrl);

      let suggestionText = "";
      await streamStyleSuggestion(
        "根据提供的用户形象和服装风格，生成穿搭建议",
        (text) => {
          suggestionText = text;
          setStyleSuggestion(text);
        },
        personPhoto,
        clothingPhoto,
      );

      await createHistory({
        originalPhotoUrl: personPhoto,
        clothingPhotoUrl: clothingPhoto,
        resultPhotoUrl: resultUrl,
        styleSuggestion: suggestionText,
        status: "success",
      });

      toast.success("换装生成完成");
    } catch (err) {
      console.error("换装生成失败", err);
      toast.error("生成失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!resultPhoto) return;
    try {
      const response = await fetch(resultPhoto);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `outfit-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("图片已保存");
    } catch {
      toast.error("下载失败");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">AI 一键换装</h1>
        <p className="text-muted-foreground text-sm">
          上传自拍照和穿搭照，AI 为你生成换装效果
        </p>
      </div>

      {/* Upload Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UploadCard
          label="个人自拍照"
          previewUrl={personPhoto}
          onUpload={setPersonPhoto}
          onClear={() => setPersonPhoto(null)}
        />
        <UploadCard
          label="目标穿搭照"
          previewUrl={clothingPhoto}
          onUpload={setClothingPhoto}
          onClear={() => setClothingPhoto(null)}
        />
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !personPhoto || !clothingPhoto}
          size="lg"
          className="rounded-full px-8"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              AI 生成中...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 size-4" />
              一键换装
            </>
          )}
        </Button>
      </div>

      {/* Result Area */}
      {(resultPhoto || isGenerating) && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-foreground">换装结果</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original */}
            <Card className="overflow-hidden">
              <div className="p-3 border-b border-border">
                <span className="text-sm font-medium text-foreground">
                  原图
                </span>
              </div>
              {personPhoto && (
                <button
                  onClick={() => setPreviewImage(personPhoto)}
                  className="w-full block"
                >
                  <Image
                    src={personPhoto}
                    alt="原图"
                    className="w-full aspect-[3/4] object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </button>
              )}
            </Card>

            {/* Result */}
            <Card className="overflow-hidden">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  换装效果
                </span>
                {resultPhoto && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    className="h-7 px-2"
                  >
                    <Download className="size-3.5 mr-1" />
                    下载
                  </Button>
                )}
              </div>
              {isGenerating && !resultPhoto ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="size-8 text-primary animate-spin mb-3" />
                  <p className="text-sm text-muted-foreground">
                    AI 正在生成换装效果...
                  </p>
                </div>
              ) : resultPhoto ? (
                <button
                  onClick={() => setPreviewImage(resultPhoto)}
                  className="w-full block"
                >
                  <Image
                    src={resultPhoto}
                    alt="换装效果"
                    className="w-full aspect-[3/4] object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </button>
              ) : null}
            </Card>
          </div>

          {/* Style Suggestion */}
          {styleSuggestion && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                穿搭建议
              </h3>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <Streamdown>{styleSuggestion}</Streamdown>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>图片预览</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <Image
              src={previewImage}
              alt="预览"
              className="w-full rounded-lg"
              sizes="100vw"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;
