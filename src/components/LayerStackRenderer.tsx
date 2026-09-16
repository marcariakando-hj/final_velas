import React, { useMemo } from "react";
import { Layer2D, getLayerCategory } from "../types";
import { SingleLayerRenderer } from "./SingleLayerRenderer";
import { Move } from "lucide-react";

export interface LayerStackRendererProps {
  layers: Layer2D[];
  backgroundImage?: string;
  backgroundOpacity?: number;
  customLayerColors?: Record<string, string>;
  selectedWaxColorHex?: string;
  activeLayerId?: string | null;
  draggingLayerId?: string | null;
  onLayerPointerDown?: (e: React.PointerEvent, layerId: string) => void;
  interactiveClickMode?: string;
  showGuides?: boolean;
  className?: string;
  stageClassName?: string;
  stageRef?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
}

/**
 * LayerStackRenderer
 * Componente unificado y canónico para el renderizado del stack de capas 2D.
 * Garantiza 100% de paridad visual entre la vista del Administrador y la del Cliente:
 * 1. Marco de coordenadas normalizado idéntico (relación de aspecto 4:5).
 * 2. Mismo ordenamiento por zIndex ascendente con desempate estable por id.
 * 3. Mismo cálculo y formato de transform: translate(X%, Y%) scale(S) con transformOrigin: 50% 50%.
 * 4. Misma opacidad y z-index normalizado: (layer.zIndex ?? 0) + 1.
 * 5. Mismo respeto estricto del canal alpha y tinte de color.
 * 6. Fondo y overlays (mecha, llama, botánicos) contenidos en el mismo marco relativo.
 */
export const LayerStackRenderer: React.FC<LayerStackRendererProps> = ({
  layers,
  backgroundImage,
  backgroundOpacity,
  customLayerColors = {},
  selectedWaxColorHex,
  activeLayerId = null,
  draggingLayerId = null,
  onLayerPointerDown,
  interactiveClickMode = "none",
  showGuides = false,
  className = "relative w-full h-full flex items-center justify-center pointer-events-none",
  stageClassName = "",
  stageRef,
  children,
}) => {
  // Ordenamiento estable idéntico en admin y cliente
  const sortedLayers = useMemo(() => {
    return [...layers].sort((a, b) => {
      const za = a.zIndex ?? 0;
      const zb = b.zIndex ?? 0;
      if (za !== zb) return za - zb;
      return (a.id || "").localeCompare(b.id || "");
    });
  }, [layers]);

  if (sortedLayers.length === 0 && !backgroundImage && !children) {
    return null;
  }

  return (
    <div className={className} style={{ zIndex: 1 }}>
      {/* Marco de coordenadas normalizado 4:5 (Idéntico entre Administrador y Cliente) */}
      <div
        ref={stageRef}
        data-testid="canonical-layer-stage"
        className={`relative w-full h-full aspect-[4/5] flex items-center justify-center mx-auto select-none ${stageClassName}`}
      >
        {/* 0. Imagen de Fondo de la Vista Previa */}
        {Boolean(backgroundImage && backgroundImage.trim()) && (
          <div
            className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center transition-opacity duration-300"
            style={{ zIndex: 0 }}
          >
            <img
              src={backgroundImage}
              alt="Imagen de Fondo"
              referrerPolicy="no-referrer"
              className="object-contain max-h-full max-w-full m-auto transition-opacity duration-300 pointer-events-none"
              style={{ opacity: backgroundOpacity ?? 1 }}
            />
          </div>
        )}

        {/* 1. Capas 2D ordenadas estrictamente por zIndex ascendente (menor a mayor) */}
        {sortedLayers.map((layer) => {
          const isColorable =
            Boolean(layer.colorable) ||
            Boolean(customLayerColors[layer.id]) ||
            (layer.type || getLayerCategory(layer)) === "frasco";
          const activeColor =
            customLayerColors[layer.id] ||
            layer.defaultColorHex ||
            selectedWaxColorHex ||
            "#FAF7F2";

          const isSelected = activeLayerId === layer.id;
          const isDragging = draggingLayerId === layer.id;
          const offsetX = layer.offsetX ?? layer.posX ?? 0;
          const offsetY = layer.offsetY ?? layer.posY ?? 0;
          const scale = layer.scale ?? 1;
          const opacity = layer.opacity ?? 1;
          const zIndex = (layer.zIndex ?? 0) + 1;

          const isInteractive = Boolean(onLayerPointerDown);

          return (
            <div
              key={layer.id}
              onPointerDown={(e) => {
                if (onLayerPointerDown && interactiveClickMode === "none") {
                  onLayerPointerDown(e, layer.id);
                }
              }}
              className={`absolute inset-0 w-full h-full flex items-center justify-center select-none ${
                isInteractive
                  ? isDragging
                    ? "cursor-grabbing pointer-events-auto"
                    : "cursor-pointer pointer-events-auto"
                  : "pointer-events-none"
              } ${
                isInteractive && showGuides && isSelected
                  ? "ring-2 ring-[#D98B68] rounded-2xl"
                  : isInteractive && showGuides
                  ? "hover:ring-1 hover:ring-[#8C7A6B]/40 rounded-2xl"
                  : ""
              }`}
              style={{
                transform: `translate(${offsetX}%, ${offsetY}%) scale(${scale})`,
                transformOrigin: "50% 50%",
                opacity,
                zIndex,
                touchAction: isInteractive ? "none" : undefined,
              }}
              title={`${layer.name} (z-index: ${layer.zIndex ?? 0}, X: ${offsetX}%, Y: ${offsetY}%, Escala: ${scale}x)`}
            >
              <SingleLayerRenderer
                imageUrl={layer.imageUrl}
                colorHex={isColorable ? activeColor : undefined}
                isColorable={isColorable}
                className="object-contain max-h-full max-w-full m-auto pointer-events-none"
                alt={layer.name}
              />

              {/* Admin Active Layer Visual Badge - visible únicamente si showGuides está activo */}
              {isInteractive && showGuides && isSelected && (
                <div className="absolute top-2 left-2 bg-[#423D33]/90 text-white text-[9.5px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-xs pointer-events-none shadow-sm border border-white/20">
                  <Move className="w-3 h-3 text-[#D98B68]" />
                  <span>{layer.name}</span>
                  <span className="text-[#D98B68] font-mono">
                    X: {offsetX}%, Y: {offsetY}%
                  </span>
                  <span className="text-white/60 font-mono">
                    {scale.toFixed(2)}x
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* 2. Overlays hijos (Mecha, Llama, Botánicos) dentro del mismo marco 4:5 */}
        {children}
      </div>
    </div>
  );
};
