/**
 * Utility for compressing transparent PNG and product images in the browser
 * using HTML5 Canvas before persisting to localStorage.
 * Ensures alpha channel (transparency) is preserved for 2D candle layers.
 */

export interface CompressOptions {
  maxDimension?: number;
  quality?: number;
  preserveAlpha?: boolean;
}

export const compressImage = (
  file: File | Blob,
  options: CompressOptions = {}
): Promise<string> => {
  const { maxDimension = 900, quality = 0.85, preserveAlpha = true } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error("No se pudo leer el archivo de imagen."));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;

          // Scale down proportionally if larger than maxDimension
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });

          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Clear transparent canvas
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const isPng = file.type === "image/png" || rawDataUrl.startsWith("data:image/png");

          let outputUrl: string;

          if (isPng || preserveAlpha) {
            // First attempt WebP with transparency
            outputUrl = canvas.toDataURL("image/webp", quality);

            // If WebP is not smaller or not supported with alpha in older browsers, use PNG
            if (!outputUrl.startsWith("data:image/webp") || outputUrl.length > 350000) {
              outputUrl = canvas.toDataURL("image/png");
            }
          } else {
            outputUrl = canvas.toDataURL("image/jpeg", quality);
          }

          // If still larger than 400KB, perform a second reduction pass at 650px
          if (outputUrl.length > 400000) {
            const canvas2 = document.createElement("canvas");
            const scale = 650 / Math.max(width, height);
            canvas2.width = Math.round(width * scale);
            canvas2.height = Math.round(height * scale);
            const ctx2 = canvas2.getContext("2d");
            if (ctx2) {
              ctx2.imageSmoothingEnabled = true;
              ctx2.imageSmoothingQuality = "medium";
              ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
              ctx2.drawImage(img, 0, 0, canvas2.width, canvas2.height);
              outputUrl = canvas2.toDataURL(isPng || preserveAlpha ? "image/webp" : "image/jpeg", 0.8);
            }
          }

          resolve(outputUrl);
        } catch (err) {
          console.warn("Canvas compression fallback:", err);
          resolve(rawDataUrl);
        }
      };

      img.onerror = () => {
        reject(new Error("Error al decodificar la imagen seleccionada."));
      };

      img.src = rawDataUrl;
    };

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo desde el dispositivo."));
    };

    reader.readAsDataURL(file);
  });
};
