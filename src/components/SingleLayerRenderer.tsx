import React, { useRef, useEffect, useState } from "react";

interface SingleLayerRendererProps {
  imageUrl: string;
  colorHex?: string;
  isColorable: boolean;
  opacity?: number;
  className?: string;
  alt?: string;
}

/**
 * SingleLayerRenderer
 * Renderiza de forma aislada una capa 2D asegurando:
 * 1. Respeto absoluto del canal alpha (los píxeles transparentes se mantienen 100% transparentes).
 * 2. Si la capa es 'colorable' y tiene un 'colorHex', el tinte se aplica ÚNICAMENTE a los píxeles
 *    opacos mediante composición Canvas 2D (source-in + multiply + destination-in).
 * 3. Si no es colorable, se dibuja la imagen original sin alteración.
 * 4. Evita los fallos de CSS mask-image (donde un error de parsing/CORS inunda un rectángulo sólido).
 */
export const SingleLayerRenderer: React.FC<SingleLayerRendererProps> = ({
  imageUrl,
  colorHex,
  isColorable,
  opacity = 1,
  className = "object-contain max-h-full max-w-full m-auto",
  alt = "Capa 2D",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!imageUrl || !imageUrl.trim()) return;

    // Si no es colorable o no hay colorHex, dejamos que el elemento <img> nativo lo dibuje
    if (!isColorable || !colorHex) {
      return;
    }

    let isMounted = true;
    const img = new Image();

    // Solo habilitar crossOrigin si no es un data URI para evitar advertencias de seguridad
    if (!imageUrl.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => {
      if (!isMounted) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const w = img.naturalWidth || img.width || 400;
      const h = img.naturalHeight || img.height || 500;
      canvas.width = w;
      canvas.height = h;

      // 1. Limpiar lienzo completamente transparente (Alpha = 0 en toda la superficie)
      ctx.clearRect(0, 0, w, h);

      // 2. Dibujar la imagen base con sus relieves, luces y sombras
      ctx.drawImage(img, 0, 0, w, h);

      try {
        // 3. Crear canvas auxiliar fuera de pantalla para generar la máscara exacta de color
        const offscreen = document.createElement("canvas");
        offscreen.width = w;
        offscreen.height = h;
        const offCtx = offscreen.getContext("2d");

        if (offCtx) {
          // A. Dibujar silueta de la imagen en el canvas auxiliar
          offCtx.drawImage(img, 0, 0, w, h);

          // B. 'source-in': Rellena ÚNICAMENTE los píxeles no transparentes con el color de la cera,
          //    dejando todas las zonas transparentes en alpha = 0.
          offCtx.globalCompositeOperation = "source-in";
          offCtx.fillStyle = colorHex;
          offCtx.fillRect(0, 0, w, h);

          // C. 'multiply': Fusiona el color con las sombras y relieves de la cera original
          ctx.globalCompositeOperation = "multiply";
          ctx.drawImage(offscreen, 0, 0, w, h);

          // D. 'destination-in': Cierra matemáticamente la máscara con el PNG original para
          //    garantizar que ningún píxel exterior o borde difuminado supere el alpha original.
          ctx.globalCompositeOperation = "destination-in";
          ctx.drawImage(img, 0, 0, w, h);
        }
      } catch (err) {
        console.warn("Fallo en composición de tinte canvas, mostrando original:", err);
      }
    };

    img.onerror = () => {
      if (isMounted) setLoadError(true);
    };

    img.src = imageUrl;

    return () => {
      isMounted = false;
    };
  }, [imageUrl, colorHex, isColorable]);

  // Si no hay URL de imagen, no renderizar nada (ejecutado después de todos los hooks)
  if (!imageUrl || !imageUrl.trim()) {
    return null;
  }

  // Si la capa NO es colorable o no hay color definido, usamos <img> nativo (máximo rendimiento y nitidez)
  if (!isColorable || !colorHex || loadError) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        referrerPolicy="no-referrer"
        className={className}
        style={{
          opacity,
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
        }}
      />
    );
  }

  // Si es colorable con colorHex, el canvas garantiza tinte exacto sin inundar píxeles transparentes
  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={500}
      className={className}
      style={{
        opacity,
        display: "block",
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit: "contain",
      }}
      aria-label={alt}
    />
  );
};
