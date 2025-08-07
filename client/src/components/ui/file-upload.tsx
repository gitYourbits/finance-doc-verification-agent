import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  label: string;
  placeholder: string;
  className?: string;
  file?: File | null;
  onRemove?: () => void;
  uploading?: boolean;
  uploadProgress?: number;
}

export function FileUpload({
  onFileSelect,
  accept = {
    "image/*": [".jpeg", ".jpg", ".png"],
    "application/pdf": [".pdf"],
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  label,
  placeholder,
  className,
  file,
  onRemove,
  uploading = false,
  uploadProgress = 0,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
      setDragActive(false);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      <h4 className="font-medium text-foreground">{label}</h4>
      
      {!file ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive || dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary"
          )}
        >
          <input {...getInputProps()} />
          <i className="fas fa-cloud-upload-alt text-4xl text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">{placeholder}</p>
          <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
          <Button type="button" className="text-sm">
            Choose File
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className="fas fa-file-image text-primary" />
              <div>
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-muted-foreground">
                {uploading ? "Uploading..." : "Ready"}
              </div>
              {onRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onRemove}
                  className="text-destructive hover:text-destructive"
                >
                  <i className="fas fa-times" />
                </Button>
              )}
            </div>
          </div>
          {uploading && (
            <div className="mt-3">
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>
      )}

      {fileRejections.length > 0 && (
        <div className="text-sm text-destructive">
          {fileRejections[0].errors[0].message}
        </div>
      )}
    </div>
  );
}
