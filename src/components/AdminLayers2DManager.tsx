import React, { useState, useRef } from "react";
import {
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Sparkles,
  Eye,
  Check,
  RotateCcw,
  Palette,
  Image as ImageIcon,
  HelpCircle,
  Flame,
} from "lucide-react";
import { Layer2D } from "../types";
import { compressImage } from "../utils/imageCompressor";
import { SANTUARIO_VIRGEN_LAYERS, ZORRO_BOSQUE_LAYERS } from "../data/sampleLayers2D";
import { Candle2DViewer, WAX_COLOR_PRESETS, WaxColorPreset } from "./Candle2DViewer";

interface AdminLayers2DManagerProps {
  layers: Layer2D[];
  onChange: (layers: Layer2D[]) => void;
  candleName?: string;
  className?: string;
}

export const AdminLayers2DManager: React.FC<AdminLayers2DManagerProps> = ({
  layers,
  onChange,
  candleName = "Vela de Colección",
  className = "",
}) => {
  const [activeTestPreset, setActiveTestPreset] = useState<WaxColorPreset>(WAX_COLOR_PRESETS[3]); // Terracota by default for testing
  const [isUploadingIndex, setIsUploadingIndex] = useState<number | null>(null);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetUploadIndex, setTargetUploadIndex] = useState<number | null>(null);

  // Add new empty layer
  const handleAddLayer = () => {
    const nextZIndex = layers.length > 0 ? Math.max(...layers.map((l) => l.zIndex)) + 1 : 0;
    const newLayer: Layer2D = {
      id: `layer-${Date.now()}`,
      name: `Capa ${layers.length + 1}`,
      imageUrl: "",
      colorable: false,
      zIndex: nextZIndex,
    };
    const updated = [...layers, newLayer];
    onChange(updated);
    setEditingLayerId(newLayer.id);
  };

  // Update specific layer
  const handleUpdateLayer = (id: string, partial: Partial<Layer2D>) => {
    const updated = layers.map((l) => (l.id === id ? { ...l, ...partial } : l));
    onChange(updated);
  };

  // Delete layer
  const handleDeleteLayer = (id: string) => {
    const updated = layers.filter((l) => l.id !== id);
    onChange(updated);
    if (editingLayerId === id) setEditingLayerId(null);
  };

  // Move layer Up (increase zIndex)
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    const tempZ = sorted[index].zIndex;
    sorted[index].zIndex = sorted[index - 1].zIndex;
    sorted[index - 1].zIndex = tempZ;
    onChange(sorted);
  };

  // Move layer Down (decrease zIndex)
  const handleMoveDown = (index: number) => {
    const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    if (index === sorted.length - 1) return;
    const tempZ = sorted[index].zIndex;
    sorted[index].zIndex = sorted[index + 1].zIndex;
    sorted[index + 1].zIndex = tempZ;
    onChange(sorted);
  };

  // File Upload for layer PNG
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || targetUploadIndex === null) return;

    try {
      setIsUploadingIndex(targetUploadIndex);
      // Compress transparent PNG while strictly preserving alpha transparency
      const compressedBase64 = await compressImage(file, {
        maxDimension: 850,
        quality: 0.85,
        preserveAlpha: true,
      });

      const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex);
      const targetLayer = sorted[targetUploadIndex];
      if (targetLayer) {
        handleUpdateLayer(targetLayer.id, { imageUrl: compressedBase64 });
      }
    } catch (err) {
      console.error("Error al procesar capa PNG:", err);
      alert("No se pudo cargar la imagen de la capa. Asegúrate de que sea un archivo PNG o WebP válido.");
    } finally {
      setIsUploadingIndex(null);
      setTargetUploadIndex(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerUpload = (index: number) => {
    setTargetUploadIndex(index);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Sort layers for display
  const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className={`p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5E0DA] space-y-4 ${className}`}>
      {/* Hidden File Input for uploading layer PNGs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/webp,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header with Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0DA]/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#8C7A6B]" />
            <h4 className="font-bold text-[#423D33] text-sm uppercase tracking-wider">
              Capas 2D & Máscaras del Modelo
            </h4>
          </div>
          <p className="text-[11px] text-[#8C7A6B] mt-0.5">
            Superpón imágenes PNG transparentes individuales y define cuáles reaccionan al color de la cera en tiempo real.
          </p>
        </div>

        {/* Quick Presets Menu */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onChange(SANTUARIO_VIRGEN_LAYERS)}
            className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E0DA] hover:border-[#8C7A6B] text-[10px] font-semibold text-[#423D33] hover:text-[#8C7A6B] transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
            title="Cargar 4 capas: Vaso, Cera, Túnica y Aureola en Pan de Oro"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Preset Santuario (Virgen)</span>
          </button>

          <button
            type="button"
            onClick={() => onChange(ZORRO_BOSQUE_LAYERS)}
            className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E0DA] hover:border-[#8C7A6B] text-[10px] font-semibold text-[#423D33] hover:text-[#8C7A6B] transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
            title="Cargar 3 capas: Vaso, Zorro y Relieves"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Preset Zorro</span>
          </button>

          <button
            type="button"
            onClick={handleAddLayer}
            className="px-3 py-1 rounded-lg bg-[#4A4541] hover:bg-[#35312E] text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Añadir Capa</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Layer List vs Real-time Test Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: Layer Cards List (7 Cols) */}
        <div className="lg:col-span-7 space-y-2.5">
          {sortedLayers.length === 0 ? (
            <div className="p-6 bg-white rounded-xl border border-dashed border-[#D9C5B2] text-center space-y-2">
              <Layers className="w-8 h-8 text-[#8C7A6B]/50 mx-auto" />
              <p className="text-xs font-semibold text-[#423D33]">
                No hay capas 2D configuradas para este modelo.
              </p>
              <p className="text-[10px] text-[#8C7A6B] max-w-sm mx-auto">
                Puedes añadir capas PNG transparentes o cargar uno de nuestros presets de escultura para ver el efecto en vivo.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onChange(SANTUARIO_VIRGEN_LAYERS)}
                  className="px-3 py-1.5 rounded-lg bg-[#8C7A6B] text-white text-xs font-bold hover:bg-[#4A4541] cursor-pointer"
                >
                  Cargar Capas de la Virgen
                </button>
                <button
                  type="button"
                  onClick={handleAddLayer}
                  className="px-3 py-1.5 rounded-lg border border-[#D9C5B2] bg-white text-xs font-bold text-[#423D33] hover:bg-stone-50 cursor-pointer"
                >
                  Crear Capa Personalizada
                </button>
              </div>
            </div>
          ) : (
            sortedLayers.map((layer, index) => {
              const isUploading = isUploadingIndex === index;
              return (
                <div
                  key={layer.id}
                  className="bg-white p-3 rounded-xl border border-[#E5E0DA] shadow-2xs space-y-2 transition-all hover:border-[#8C7A6B]/70"
                >
                  {/* Top Row: Thumbnail, Name, Z-Index, and Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {/* Thumbnail Preview */}
                      <div
                        onClick={() => triggerUpload(index)}
                        className="relative w-12 h-12 rounded-lg bg-[#F4EFEA] border border-[#D9C5B2] flex items-center justify-center overflow-hidden cursor-pointer group shrink-0"
                        title="Haz clic para subir o cambiar la imagen PNG transparente"
                      >
                        {Boolean(layer.imageUrl && layer.imageUrl.trim()) ? (
                          <img
                            src={layer.imageUrl}
                            alt={layer.name}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-stone-400 group-hover:text-stone-700" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Upload className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>

                      {/* Name input & zIndex indicator */}
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={layer.name}
                          onChange={(e) => handleUpdateLayer(layer.id, { name: e.target.value })}
                          placeholder="Nombre de la capa (Ej. Manto, Túnica, Base)"
                          className="w-full font-semibold text-xs text-[#423D33] p-1 rounded-md border border-transparent hover:border-[#E5E0DA] focus:border-[#8C7A6B] focus:bg-[#FAF7F2]"
                        />
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#8C7A6B]">
                          <span className="font-mono bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E5E0DA]">
                            z-index: {layer.zIndex}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {layer.imageUrl ? "PNG Cargado" : "Sin imagen PNG"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reorder and Delete Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 rounded-md bg-[#FAF7F2] hover:bg-stone-200 text-[#423D33] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Mover hacia abajo en el orden de apilamiento"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === sortedLayers.length - 1}
                        className="p-1 rounded-md bg-[#FAF7F2] hover:bg-stone-200 text-[#423D33] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Mover hacia arriba en el orden de apilamiento"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLayer(layer.id)}
                        className="p-1 rounded-md bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors cursor-pointer"
                        title="Eliminar esta capa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Row: Colorable Switch & Upload Trigger */}
                  <div className="pt-2 border-t border-[#E5E0DA]/60 flex items-center justify-between gap-2 text-[11px]">
                    {/* Checkbox: Colorable */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={layer.colorable}
                        onChange={(e) =>
                          handleUpdateLayer(layer.id, { colorable: e.target.checked })
                        }
                        className="w-3.5 h-3.5 rounded text-[#8C7A6B] focus:ring-[#8C7A6B] accent-[#8C7A6B]"
                      />
                      <span className="font-semibold text-[#423D33] flex items-center gap-1">
                        <Palette className="w-3 h-3 text-[#D98B68]" />
                        <span>Capa Colorable (Reacciona al color de cera)</span>
                      </span>
                    </label>

                    {/* Upload button */}
                    <button
                      type="button"
                      onClick={() => triggerUpload(index)}
                      className="px-2 py-0.5 rounded bg-[#FAF7F2] hover:bg-[#E5E0DA] text-[#423D33] text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-[#E5E0DA]"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{layer.imageUrl ? "Reemplazar PNG" : "Subir PNG"}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: Real-Time Admin Test Preview (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-3.5 rounded-2xl border border-[#E5E0DA] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] flex items-center gap-1">
              <Eye className="w-3 h-3 text-[#8C7A6B]" />
              <span>Simulador en Tiempo Real</span>
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#608058]/15 text-[#35522e] font-bold">
              En Vivo
            </span>
          </div>

          {/* Embedded 2D Layers Live Stage */}
          <div className="w-full flex justify-center">
            <Candle2DViewer
              layers2D={sortedLayers}
              selectedWaxColorHex={activeTestPreset.hex}
              selectedWaxColorName={activeTestPreset.name}
              showControls={true}
              showColorSwatches={false}
              showHotspots={false}
              className="max-w-[240px]"
            />
          </div>

          {/* Test Wax Colors Switcher */}
          <div className="pt-2 border-t border-[#E5E0DA] space-y-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
              Probar Cambio de Tono de Cera:
            </span>
            <div className="grid grid-cols-5 gap-1">
              {WAX_COLOR_PRESETS.map((preset) => {
                const isSelected = activeTestPreset.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setActiveTestPreset(preset)}
                    className={`p-1 rounded-lg border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#FAF7F2] border-[#8C7A6B] ring-1 ring-[#8C7A6B]"
                        : "bg-white border-[#E5E0DA] hover:bg-stone-50"
                    }`}
                    title={preset.name}
                  >
                    <span
                      className="w-4 h-4 rounded-full mx-auto block border shadow-2xs"
                      style={{ backgroundColor: preset.hex, borderColor: preset.borderHex }}
                    />
                    <span className="text-[7px] font-semibold text-[#423D33] block mt-0.5 truncate">
                      {preset.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
