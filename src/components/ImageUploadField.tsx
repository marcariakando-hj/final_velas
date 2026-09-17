import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X, Check, RefreshCw, Link as LinkIcon, Sparkles } from "lucide-react";
import { isSupabaseConfigured, uploadFileToSupabaseStorage } from "../lib/supabase";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (imageUrl: string) => void;
  placeholder?: string;
  recommendedSize?: string;
  aspectRatio?: "square" | "portrait" | "landscape" | "circle";
  className?: string;
  id?: string;
  folder?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "https://ejemplo.com/imagen.jpg",
  recommendedSize = "800x800px (JPG, PNG, WebP)",
  aspectRatio = "square",
  className = "",
  id,
  folder = "products",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [inputMode, setInputMode] = useState<"upload" | "url">("upload");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToServer = async (base64Data: string) => {
    // Immediately supply Base64 data URL to parent state so it persists in form and localStorage
    onChange(base64Data);
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data, name: label, folder: folder || "products" }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          onChange(data.url);
          setIsUploading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Upload fallback to local image data URL:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to compress images via canvas before storing as Base64/DataURL
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target?.result as string;
        if (!rawDataUrl) {
          reject(new Error("No se pudo leer el archivo."));
          return;
        }

        const img = new Image();
        img.onload = () => {
          try {
            // Target max dimension of 1000px to keep quality crisp while keeping Base64 very light (<200KB)
            const maxDim = 1000;
            let width = img.width;
            let height = img.height;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
              resolve(rawDataUrl);
              return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            // If image is transparent PNG or WebP, preserve transparency with WebP/PNG, otherwise JPEG
            const isPng = file.type === "image/png";
            ctx.drawImage(img, 0, 0, width, height);

            let compressedUrl: string;
            if (isPng) {
              // Try WebP with quality 0.82 if supported for transparency + extreme compression
              compressedUrl = canvas.toDataURL("image/webp", 0.82);
              // Fallback if browser outputs standard PNG or if WebP isn't smaller
              if (!compressedUrl.startsWith("data:image/webp") || compressedUrl.length > 500000) {
                compressedUrl = canvas.toDataURL("image/jpeg", 0.85);
              }
            } else {
              compressedUrl = canvas.toDataURL("image/jpeg", 0.82);
            }

            // If still over ~600KB, perform a second reduction pass at 750px
            if (compressedUrl.length > 600000) {
              const canvas2 = document.createElement("canvas");
              const scale = 750 / Math.max(width, height);
              canvas2.width = Math.round(width * scale);
              canvas2.height = Math.round(height * scale);
              const ctx2 = canvas2.getContext("2d");
              if (ctx2) {
                ctx2.imageSmoothingEnabled = true;
                ctx2.drawImage(img, 0, 0, canvas2.width, canvas2.height);
                compressedUrl = canvas2.toDataURL("image/jpeg", 0.75);
              }
            }

            resolve(compressedUrl);
          } catch (err) {
            console.warn("Canvas compression fallback:", err);
            resolve(rawDataUrl);
          }
        };

        img.onerror = () => {
          reject(new Error("Error al procesar la imagen seleccionada."));
        };

        img.src = rawDataUrl;
      };

      reader.onerror = () => {
        reject(new Error("Error al leer el archivo de imagen."));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith("image/")) {
      setErrorMsg("El archivo seleccionado debe ser una imagen válida (JPG, PNG, WebP, GIF).");
      return;
    }

    // Max 15MB raw before client compression
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("La imagen es demasiado pesada (máx 15MB). Por favor selecciona una imagen más liviana.");
      return;
    }

    try {
      setIsUploading(true);

      // 1. If Supabase Storage is configured, upload directly to 'candle-assets' bucket
      if (isSupabaseConfigured()) {
        try {
          const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
          const targetFolder = folder ? folder.replace(/^\/+|\/+$/g, "") : "products";
          const cloudUrl = await uploadFileToSupabaseStorage(
            file,
            `${targetFolder}/${Date.now()}_${safeName}`,
            "candle-assets"
          );
          if (cloudUrl && (cloudUrl.startsWith("http://") || cloudUrl.startsWith("https://"))) {
            onChange(cloudUrl);
            setIsUploading(false);
            return;
          }
        } catch (storageErr) {
          console.warn("Supabase Storage upload fallback to local:", storageErr);
        }
      }


      // 2. Fallback to client-side compression and server upload
      const optimizedBase64 = await compressImage(file);
      
      // Safety check: ensure optimized base64 is reasonable for localStorage
      if (optimizedBase64.length > 1500000) {
        console.warn("Large image warning: >1.5MB base64");
      }

      await uploadToServer(optimizedBase64);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al procesar la imagen.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const isServerSaved = value?.startsWith("/uploads/");
  const isBase64 = value?.startsWith("data:image");

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and mode switch */}
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
          {label}
        </label>
        <div className="flex items-center gap-1 text-[10px]">
          <button
            type="button"
            onClick={() => setInputMode("upload")}
            className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
              inputMode === "upload"
                ? "bg-[#4A4541] text-white font-bold"
                : "text-[#8C7A6B] hover:text-[#423D33]"
            }`}
          >
            Subir Archivo
          </button>
          <button
            type="button"
            onClick={() => setInputMode("url")}
            className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
              inputMode === "url"
                ? "bg-[#4A4541] text-white font-bold"
                : "text-[#8C7A6B] hover:text-[#423D33]"
            }`}
          >
            Enlace URL
          </button>
        </div>
      </div>

      {/* Upload Zone / URL input */}
      {inputMode === "upload" ? (
        <div className="space-y-2">
          <input
            id={id}
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {isUploading ? (
            <div className="p-6 bg-white rounded-2xl border border-[#E5E0DA] flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 text-[#8C7A6B] animate-spin" />
              <p className="text-xs font-bold text-[#423D33]">Subiendo y guardando en el servidor...</p>
              <p className="text-[10px] text-[#8C7A6B]">Procesando archivo para almacenamiento persistente</p>
            </div>
          ) : Boolean(value && value.trim()) ? (
            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#E5E0DA] shadow-2xs">
              <div
                className={`relative overflow-hidden bg-[#FAF7F2] border border-[#E5E0DA] shrink-0 ${
                  aspectRatio === "circle"
                    ? "w-16 h-16 rounded-full"
                    : aspectRatio === "portrait"
                    ? "w-16 h-20 rounded-xl"
                    : "w-16 h-16 rounded-xl"
                }`}
              >
                <img
                  src={value}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-xs font-semibold text-[#423D33] truncate">
                  <Check className="w-3.5 h-3.5 text-[#608058] shrink-0" />
                  <span className="truncate">
                    {isServerSaved
                      ? "Guardada en servidor (/uploads)"
                      : isBase64
                      ? "Cargada desde tu equipo"
                      : "Imagen vinculada"}
                  </span>
                </div>
                <p className="text-[10px] text-[#8C7A6B] truncate font-mono">
                  {isServerSaved ? value : isBase64 ? "Se persistirá en el servidor al guardar" : value}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-full bg-[#FAF7F2] hover:bg-[#F2EDE7] border border-[#E5E0DA] text-[10px] font-semibold text-[#423D33] transition-colors cursor-pointer"
                  title="Cambiar imagen"
                >
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="p-1 rounded-full hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                  title="Quitar imagen"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-[#8C7A6B] bg-[#8C7A6B]/10 scale-[1.01]"
                  : "border-[#E5E0DA] hover:border-[#8C7A6B] bg-white hover:bg-[#FAF7F2]"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#8C7A6B] flex items-center justify-center mx-auto mb-2 border border-[#E5E0DA]">
                <Upload className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-[#423D33]">
                Haz clic para elegir una imagen o arrástrala aquí
              </p>
              <p className="text-[10px] text-[#8C7A6B] mt-0.5">
                Desde tu escritorio o fotos • {recommendedSize}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-3.5 h-3.5 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id={id}
                type="url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#E5E0DA] bg-white text-[#423D33] focus:outline-none focus:ring-1 focus:ring-[#8C7A6B]"
              />
            </div>
            {Boolean(value && value.trim()) && (
              <div
                className={`overflow-hidden bg-[#FAF7F2] border border-[#E5E0DA] shrink-0 ${
                  aspectRatio === "circle"
                    ? "w-12 h-12 rounded-full"
                    : "w-12 h-12 rounded-xl"
                }`}
              >
                <img
                  src={value}
                  alt="Previa"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>
          <p className="text-[10px] text-[#8C7A6B]">
            Introduce la URL directa de la imagen (ej. Unsplash, CDN o tu servidor).
          </p>
        </div>
      )}

      {errorMsg && (
        <p className="text-[10px] font-medium text-red-600 animate-fade-in">
          {errorMsg}
        </p>
      )}
    </div>
  );
};
