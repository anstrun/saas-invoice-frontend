import { useState, useRef, useCallback } from "react";
import { useUploadCertificate } from "../hooks/useCertificates";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Progress } from "@/shared/components/ui/progress";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { CloudUpload, File, X, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ds } from "@/assets/designSystem";

interface CertificateUploadDialogProps {
  open: boolean;
  onUploadSuccess: () => void;
}

type FileStatus = "idle" | "selected" | "uploading" | "completed" | "error";

const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function CertificateUploadDialog({
  open,
  onUploadSuccess,
}: CertificateUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [fileStatus, setFileStatus] = useState<FileStatus>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadCertificate();

  const handleFileSelect = useCallback((selectedFile: File | null) => {
    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (extension !== "p12" && extension !== "pfx") {
      toast.error("Formato inválido", {
        description: "Solo se aceptan archivos .p12 o .pfx",
      });
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      toast.error("Archivo muy grande", {
        description: `El archivo no puede exceder ${MAX_FILE_SIZE_MB} MB`,
      });
      return;
    }

    setFile(selectedFile);
    setFileStatus("selected");
    setUploadProgress(0);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    handleFileSelect(selectedFile || null);
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setFileStatus("idle");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file || !password) {
      toast.error("Completa todos los campos");
      return;
    }

    setFileStatus("uploading");
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await uploadMutation.mutateAsync({ file, password });
      clearInterval(progressInterval);
      setUploadProgress(100);
      setFileStatus("completed");
      toast.success("Certificado subido exitosamente");
      onUploadSuccess();
      handleRemoveFile();
      setPassword("");
    } catch (error: unknown) {
      clearInterval(progressInterval);
      setFileStatus("error");
      setUploadProgress(0);
      const errorMessage = error instanceof Error ? error.message : "Error al subir el certificado";
      toast.error("Error al subir certificado", {
        description: errorMessage,
      });
    }
  }, [file, password, uploadMutation, onUploadSuccess, handleRemoveFile]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md overflow-hidden"  
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-0 pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <CloudUpload className={`${ds.sizing.icon.xl} text-blue-500`} />
          </div>
          <DialogTitle className={ds.typography.sectionHeading}>
            Certificado Digital
          </DialogTitle>
          <DialogDescription className={ds.typography.body}>
            Selecciona tu archivo .p12 para firmar facturas electronicas
          </DialogDescription>
        </DialogHeader>

        <div className={`${ds.spacing.section.stack}`}>
          <div
            className={`
              relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors w-full overflow-hidden
              ${isDragging ? "border-blue-500 bg-blue-50" : "border-border"}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <CloudUpload className={`${ds.sizing.icon.xl} text-muted-foreground mb-3`} />
            <p className={`${ds.typography.body} text-center mb-1`}>
              Arrastra tu certificado .p12 aqui
            </p>
            <p className={`${ds.typography.caption} text-muted-foreground text-center mb-3`}>
              Formato .p12, maximo {MAX_FILE_SIZE_MB} MB
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className={ds.radius.buttonSm}
            >
              Buscar Archivo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".p12,.pfx"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {file && (
            <div className={`${ds.radius.interactive} border bg-card p-3 overflow-hidden`}>
              <div className="flex items-center justify-between min-w-0 gap-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {fileStatus === "uploading" ? (
                    <Loader2 className={`${ds.sizing.icon.md} animate-spin text-blue-500 flex-shrink-0`} />
                  ) : fileStatus === "completed" ? (
                    <CheckCircle className={`${ds.sizing.icon.md} text-green-500 flex-shrink-0`} />
                  ) : (
                    <File className={`${ds.sizing.icon.md} text-muted-foreground flex-shrink-0`} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`${ds.typography.body} truncate max-w-full`}>{file.name}</p>
                    <p className={`${ds.typography.caption} text-muted-foreground`}>
                      {formatFileSize(file.size)}
                      {fileStatus === "uploading" && " - Subiendo..."}
                      {fileStatus === "completed" && " - Completado"}
                    </p>
                  </div>
                </div>
                {fileStatus !== "uploading" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className={ds.radius.buttonSm}
                  >
                    <X className={ds.sizing.icon.sm} />
                  </Button>
                )}
              </div>
              {fileStatus === "uploading" && (
                <Progress value={uploadProgress} className="mt-3" />
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className={ds.typography.formLabel}>
              Contrasena del certificado
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Ingresa la contrasena del certificado"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={fileStatus === "uploading" || fileStatus === "completed"}
              className={ds.radius.input}
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || !password || fileStatus === "uploading" || fileStatus === "completed"}
            className={`w-full ${ds.radius.button}`}
          >
            {fileStatus === "uploading" ? (
              <>
                <Loader2 className={`mr-2 ${ds.sizing.icon.md} animate-spin`} />
                Subiendo...
              </>
            ) : (
              <>
                <CloudUpload className={`mr-2 ${ds.sizing.icon.md}`} />
                Subir Certificado
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
