import React from "react";
import { Layer2D } from "../types";
import { Palette, Check, RotateCcw, Sparkles } from "lucide-react";
import { WAX_COLOR_PRESETS } from "./Candle2DViewer";
import { useStore } from "../context/StoreContext";

export interface LayerColorCustomizerProps {
  layers: Layer2D[];
  customLayerColors: Record<string, string>;
  onColorChange: (layerId: string, colorHex: string) => void;
  onResetLayer?: (layerId: string) => void;
  className?: string;
}

export const LayerColorCustomizer: React.FC<LayerColorCustomizerProps> = ({
  layers,
  customLayerColors,
  onColorChange,
  onResetLayer,
  className = "",
}) => {
  const { customizerOptions } = useStore();
  const storeWaxColors = customizerOptions?.waxColors || [];

  // Helper to find a descriptive name for a given hex color
  const getColorName = (hex: string): string => {
    const normHex = hex.trim().toLowerCase();
    const storeMatch = storeWaxColors.find((c) => c.hex.toLowerCase() === normHex);
    if (storeMatch) return storeMatch.name;
    const presetMatch = WAX_COLOR_PRESETS.find((p) => p.hex.toLowerCase() === normHex);
    if (presetMatch) return presetMatch.name;
    if (normHex === "#faf7f2" || normHex === "#ffffff") return "Caliza / Blanco";
    if (normHex === "#e8dfd5") return "Arena Suave";
    if (normHex === "#383533" || normHex === "#000000") return "Carbón";
    if (normHex === "#c87a64") return "Terracota";
    if (normHex === "#d49b55") return "Ámbar Miel";
    if (normHex === "#5c4033" || normHex === "#3c2415") return "Cacao";
    if (normHex === "#8c7a6b") return "Arcilla";
    return hex;
  };

  // Only colorable layers can have independent color selection
  const colorableLayers = layers.filter((l) => l.colorable);

  if (colorableLayers.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`} id="layer-color-customizer">
      <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#8C7A6B]/10 flex items-center justify-center text-[#8C7A6B]">
            <Palette className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-[#423D33] flex items-center gap-1.5">
              Personalización de Color por Capa
              <span className="text-[10px] font-sans font-semibold bg-[#FAF7F2] border border-[#D9C5B2] text-[#8C7A6B] px-2 py-0.2 rounded-full">
                {colorableLayers.length} {colorableLayers.length === 1 ? "capa" : "capas"}
              </span>
            </h4>
            <p className="text-[11px] text-[#8C7A6B]">
              Selecciona el tono individual para cada capa o relieve configurado en tu vela.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        {colorableLayers.map((layer) => {
          const activeColor =
            customLayerColors[layer.id] ||
            layer.defaultColorHex ||
            "#FAF7F2";

          const isDefault =
            !customLayerColors[layer.id] ||
            (layer.defaultColorHex &&
              customLayerColors[layer.id]?.toLowerCase() ===
                layer.defaultColorHex.toLowerCase());

          // Strictly limited to colors defined by the administrator in "Colores de Vela" / "Tonos de Cera"
          const adminWaxColors = storeWaxColors.filter((w) => w.active !== false);
          const candidateHexes = adminWaxColors.map((w) => w.hex);

          return (
            <div
              key={layer.id}
              className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5E0DA] hover:border-[#8C7A6B]/40 transition-all shadow-xs space-y-3"
              id={`layer-zone-${layer.id}`}
            >
              {/* Header of zone */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-5 h-5 rounded-full border border-black/15 shadow-2xs shrink-0 transition-transform hover:scale-110"
                    style={{ backgroundColor: activeColor }}
                    title={`Color activo: ${activeColor}`}
                  />
                  <div className="min-w-0">
                    <span className="font-serif text-xs font-bold text-[#423D33] truncate block">
                      {layer.name}
                    </span>
                    <span className="text-[10px] text-[#8C7A6B] block">
                      Tono actual:{" "}
                      <strong className="text-[#423D33]">
                        {getColorName(activeColor)}
                      </strong>
                      {isDefault && (
                        <span className="ml-1 text-[9px] text-[#8C7A6B]/80 italic">
                          (Por defecto)
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {!isDefault && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onResetLayer) {
                        onResetLayer(layer.id);
                      } else {
                        onColorChange(layer.id, layer.defaultColorHex || "#FAF7F2");
                      }
                    }}
                    className="px-2 py-1 rounded-lg text-[10px] font-semibold text-[#8C7A6B] hover:text-[#423D33] hover:bg-[#FAF7F2] border border-[#E5E0DA] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    title="Restablecer al tono original del diseño"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Restablecer</span>
                  </button>
                )}
              </div>

              {/* Allowed Color Swatches */}
              <div className="pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {candidateHexes.map((hex, idx) => {
                    const isSelected =
                      activeColor.toLowerCase() === hex.toLowerCase();
                    const isLight =
                      hex.toLowerCase() === "#faf7f2" ||
                      hex.toLowerCase() === "#ffffff" ||
                      hex.toLowerCase() === "#e8dfd5";
                    const colorName = getColorName(hex);

                    return (
                      <button
                        key={`${hex}-${idx}`}
                        type="button"
                        onClick={() => onColorChange(layer.id, hex)}
                        className={`group relative flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[#FAF7F2] border-[#8C7A6B] ring-2 ring-[#8C7A6B]/20 shadow-xs"
                            : "bg-white border-[#E5E0DA] hover:border-[#8C7A6B]/50 hover:bg-[#FAF7F2]/50"
                        }`}
                        title={`${colorName} (${hex})`}
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-black/15 shrink-0 flex items-center justify-center shadow-2xs"
                          style={{ backgroundColor: hex }}
                        >
                          {isSelected && (
                            <Check
                              className={`w-2.5 h-2.5 ${
                                isLight ? "text-[#423D33]" : "text-white"
                              }`}
                            />
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-[#423D33] max-w-[120px] truncate">
                          {colorName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
