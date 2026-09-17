import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Eye,
  Palette,
  Image as ImageIcon,
  Flame,
  Flower2,
  Crosshair,
  Sliders,
  RotateCcw,
  Check,
  Copy,
  Info,
  Move,
  Cloud,
  CloudUpload,
} from "lucide-react";
import { Layer2D, LayerCategory, getLayerCategory } from "../types";
import { compressImage } from "../utils/imageCompressor";
import { WAX_COLOR_PRESETS } from "./Candle2DViewer";
import { useStore } from "../context/StoreContext";
import { SingleLayerRenderer } from "./SingleLayerRenderer";
import { LayerStackRenderer } from "./LayerStackRenderer";
import { CandlePreview2D } from "./CandlePreview2D";
import { isSupabaseConfigured, uploadFileToSupabaseStorage } from "../lib/supabase";

export interface Product2DResources {
  base2DImage: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
  waxMaskPolygon?: string;
  wickX: number; // %
  wickY: number; // %
  botanicalsX: number; // %
  botanicalsY: number; // %
  botanicalsRadius: number; // %
}

interface Unified2DModelManagerProps {
  layers?: Layer2D[];
  onChangeLayers?: (layers: Layer2D[]) => void;
  onLayersChange?: (layers: Layer2D[]) => void;
  resources?: Product2DResources;
  initialResources?: Product2DResources;
  onChangeResources?: (resources: Product2DResources) => void;
  onResourcesChange?: (resources: Product2DResources) => void;
  candleName?: string;
  candleImage?: string;
  className?: string;
}

const DEFAULT_RESOURCES: Product2DResources = {
  base2DImage: "",
  backgroundImage: "",
  backgroundOpacity: 1,
  waxMaskPolygon: "M 19 60.5 Q 31 62.8 42.5 60.5 L 40.5 76 Q 30.5 78.5 21 76 Z",
  wickX: 31,
  wickY: 59,
  botanicalsX: 31,
  botanicalsY: 67,
  botanicalsRadius: 11,
};

export const Unified2DModelManager: React.FC<Unified2DModelManagerProps> = ({
  layers = [],
  onChangeLayers,
  onLayersChange,
  resources: inputResources,
  initialResources,
  onChangeResources,
  onResourcesChange,
  candleName = "Vela de Colección",
  candleImage = "",
  className = "",
}) => {
  const { sculptures, waxColors } = useStore();

  const notifyLayers = (updated: Layer2D[]) => {
    if (onChangeLayers) onChangeLayers(updated);
    if (onLayersChange) onLayersChange(updated);
  };

  const notifyResources = (updated: Product2DResources) => {
    if (onChangeResources) onChangeResources(updated);
    if (onResourcesChange) onResourcesChange(updated);
  };

  // Internal persistent state for resources (background image, opacity, anchors)
  const [localResources, setLocalResources] = useState<Product2DResources>(() => {
    const raw = inputResources || initialResources || DEFAULT_RESOURCES;
    return {
      base2DImage: "",
      backgroundImage: raw.backgroundImage || "",
      backgroundOpacity: raw.backgroundOpacity ?? 1,
      waxMaskPolygon: raw.waxMaskPolygon ?? DEFAULT_RESOURCES.waxMaskPolygon,
      wickX: raw.wickX ?? DEFAULT_RESOURCES.wickX,
      wickY: raw.wickY ?? DEFAULT_RESOURCES.wickY,
      botanicalsX: raw.botanicalsX ?? DEFAULT_RESOURCES.botanicalsX,
      botanicalsY: raw.botanicalsY ?? DEFAULT_RESOURCES.botanicalsY,
      botanicalsRadius: raw.botanicalsRadius ?? DEFAULT_RESOURCES.botanicalsRadius,
    };
  });

  // Sync with incoming props if changed externally
  useEffect(() => {
    const raw = inputResources || initialResources;
    if (raw) {
      setLocalResources((prev) => ({
        ...prev,
        ...raw,
        backgroundImage: raw.backgroundImage !== undefined ? raw.backgroundImage : prev.backgroundImage,
        backgroundOpacity: raw.backgroundOpacity !== undefined ? raw.backgroundOpacity : prev.backgroundOpacity,
      }));
    }
  }, [inputResources, initialResources]);

  const updateResources = (updated: Product2DResources) => {
    setLocalResources(updated);
    notifyResources(updated);
  };

  const resources = localResources;

  // Active sub-tab inside the unified editor
  const [activeTab, setActiveTab] = useState<"layers" | "anchors">("layers");

  // Real-time test state for simulator flame
  const [testIsLit, setTestIsLit] = useState<boolean>(true);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(
    layers[0]?.id || null
  );

  // Interactive Click Mode on Canvas ("none" | "wick" | "botanicals" | "active-layer")
  const [interactiveClickMode, setInteractiveClickMode] = useState<
    "none" | "wick" | "botanicals" | "layer"
  >("none");

  // Toggle for calibration guides (handles, dotted circle) in preview canvas
  const [showAdminGuides, setShowAdminGuides] = useState<boolean>(false);

  // Test wax color in preview
  const [testWaxColorHex, setTestWaxColorHex] = useState<string>("#FAF7F2");

  // Botanical items preview when in clean view
  const previewBotanicals = useMemo(() => {
    return [
      { id: "bot-1", name: "Lavanda Silvestre", color: "#9B88A8" },
      { id: "bot-2", name: "Flores de Azahar", color: "#E8DFD5" },
      { id: "bot-3", name: "Vainilla Bourbon", color: "#D49B55" },
    ];
  }, []);

  // File Upload Reference & Resilient Layer ID Pointer
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetUploadLayerIdRef = useRef<string | null>(null);
  const [targetUploadLayerId, setTargetUploadLayerId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [dragOverLayerId, setDragOverLayerId] = useState<string | null>(null);
  const [isCanvasDragOver, setIsCanvasDragOver] = useState<boolean>(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const stageViewportRef = useRef<HTMLDivElement>(null);

  // Sort layers strictly and stably by zIndex ascending with id tie-breaking
  const sortedLayers = useMemo(() => {
    return [...layers].sort((a, b) => {
      const za = a.zIndex ?? 0;
      const zb = b.zIndex ?? 0;
      if (za !== zb) return za - zb;
      return (a.id || "").localeCompare(b.id || "");
    });
  }, [layers]);

  // Add new empty layer
  const handleAddLayer = () => {
    const nextZIndex =
      layers.length > 0 ? Math.max(...layers.map((l) => l.zIndex ?? 0)) + 1 : 0;
    const newLayer: Layer2D = {
      id: `layer-${Date.now()}`,
      name: `Capa ${layers.length + 1}`,
      imageUrl: "",
      colorable: false,
      zIndex: nextZIndex,
      type: "cera",
      category: "cera",
      defaultColorHex: "#FAF7F2",
      allowedColorHexes: [],
      offsetX: 0,
      offsetY: 0,
      posX: 0,
      posY: 0,
      scale: 1,
      opacity: 1,
    };
    const updated = [...layers, newLayer];
    notifyLayers(updated);
    setSelectedLayerId(newLayer.id);
    setActiveTab("layers");
  };

  // Update specific layer
  const handleUpdateLayer = (id: string, partial: Partial<Layer2D>) => {
    const updated = layers.map((l) => (l.id === id ? { ...l, ...partial } : l));
    notifyLayers(updated);
  };

  // Dragging state for independent layer movement on the interactive canvas
  const [draggingLayerId, setDraggingLayerId] = useState<string | null>(null);
  const isActuallyDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{
    layerId: string;
    startX: number;
    startY: number;
    initOffsetX: number;
    initOffsetY: number;
    canvasWidth: number;
    canvasHeight: number;
  } | null>(null);

  // Global window pointer listener while dragging a layer to guarantee 60fps tracking & no stuck drags
  useEffect(() => {
    if (!draggingLayerId && !dragStartRef.current) return;

    const onPointerMove = (e: PointerEvent) => {
      if (!dragStartRef.current) return;
      const { layerId, startX, startY, initOffsetX, initOffsetY, canvasWidth, canvasHeight } =
        dragStartRef.current;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // Minimum 4px distance to count as deliberate drag (prevents accidental offset jumps on mere selection/click)
      if (!isActuallyDraggingRef.current) {
        if (Math.hypot(deltaX, deltaY) < 4) {
          return;
        }
        isActuallyDraggingRef.current = true;
        setDraggingLayerId(layerId);
      }

      const deltaXPercent = (deltaX / (canvasWidth || 400)) * 100;
      const deltaYPercent = (deltaY / (canvasHeight || 480)) * 100;

      const newOffsetX = Math.round(Math.max(-80, Math.min(80, initOffsetX + deltaXPercent)));
      const newOffsetY = Math.round(Math.max(-80, Math.min(80, initOffsetY + deltaYPercent)));

      handleUpdateLayer(layerId, {
        offsetX: newOffsetX,
        offsetY: newOffsetY,
        posX: newOffsetX,
        posY: newOffsetY,
      });
    };

    const onPointerUp = () => {
      isActuallyDraggingRef.current = false;
      dragStartRef.current = null;
      setDraggingLayerId(null);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [draggingLayerId, layers]);

  const handleLayerPointerDown = (e: React.PointerEvent, layerId: string) => {
    if (interactiveClickMode === "wick" || interactiveClickMode === "botanicals") {
      return;
    }
    e.preventDefault();
    e.stopPropagation();

    // Selecting a layer must NEVER alter its position or zIndex
    setSelectedLayerId(layerId);
    const targetLayer = layers.find((l) => l.id === layerId);
    if (!targetLayer) return;

    const rect = stageViewportRef.current?.getBoundingClientRect() || canvasRef.current?.getBoundingClientRect();
    const w = rect?.width || 360;
    const h = rect?.height || 450;

    const currentX = targetLayer.offsetX ?? targetLayer.posX ?? 0;
    const currentY = targetLayer.offsetY ?? targetLayer.posY ?? 0;

    isActuallyDraggingRef.current = false;
    dragStartRef.current = {
      layerId,
      startX: e.clientX,
      startY: e.clientY,
      initOffsetX: currentX,
      initOffsetY: currentY,
      canvasWidth: w,
      canvasHeight: h,
    };
  };

  // Delete layer
  const handleDeleteLayer = (id: string) => {
    const updated = layers.filter((l) => l.id !== id);
    notifyLayers(updated);
    if (selectedLayerId === id) {
      setSelectedLayerId(updated[0]?.id || null);
    }
  };

  // Duplicate layer
  const handleDuplicateLayer = (layer: Layer2D) => {
    const nextZIndex = Math.max(...layers.map((l) => l.zIndex ?? 0)) + 1;
    const dup: Layer2D = {
      ...layer,
      id: `layer-${Date.now()}`,
      name: `${layer.name} (Copia)`,
      zIndex: nextZIndex,
      offsetX: layer.offsetX ?? layer.posX ?? 0,
      offsetY: layer.offsetY ?? layer.posY ?? 0,
      posX: layer.offsetX ?? layer.posX ?? 0,
      posY: layer.offsetY ?? layer.posY ?? 0,
      scale: layer.scale || 1,
      opacity: layer.opacity ?? 1,
    };
    notifyLayers([...layers, dup]);
    setSelectedLayerId(dup.id);
  };

  // Move layer Up (increase zIndex / higher layer)
  const handleMoveUp = (index: number) => {
    if (index >= sortedLayers.length - 1) return;
    const reordered = [...sortedLayers];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;

    // Strictly normalize zIndex: 0, 1, 2, ...
    const normalized = reordered.map((l, idx) => ({
      ...l,
      zIndex: idx,
    }));
    notifyLayers(normalized);
  };

  // Move layer Down (decrease zIndex / lower layer)
  const handleMoveDown = (index: number) => {
    if (index <= 0) return;
    const reordered = [...sortedLayers];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;

    // Strictly normalize zIndex: 0, 1, 2, ...
    const normalized = reordered.map((l, idx) => ({
      ...l,
      zIndex: idx,
    }));
    notifyLayers(normalized);
  };

  // Robust File Processing for 2D Layer with Immediate Preview & Multi-Storage Fallback
  const processFileForLayer = async (file: File, layerId: string) => {
    if (!file) return;

    // Validate that it is an image file
    const isImageFile =
      file.type.startsWith("image/") ||
      Boolean(file.name.match(/\.(png|webp|svg|jpg|jpeg)$/i));

    if (!isImageFile) {
      setUploadStatus({
        type: "error",
        message: "El archivo seleccionado debe ser una imagen válida (PNG transparente recomendado).",
      });
      return;
    }

    const targetLayer =
      layers.find((l) => l.id === layerId) ||
      sortedLayers.find((l) => l.id === layerId);

    if (!targetLayer) {
      setUploadStatus({
        type: "error",
        message: "No se encontró la capa objetivo para asignar la imagen.",
      });
      return;
    }

    setIsUploading(true);
    setTargetUploadLayerId(layerId);
    setUploadStatus({
      type: "info",
      message: `Procesando PNG para "${targetLayer.name}"...`,
    });

    try {
      // 1. INMEDIATA LECTURA & VISTA PREVIA LOCAL (Garantiza 0ms de espera en la Vista Previa)
      const readDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) resolve(e.target.result as string);
          else reject(new Error("No se pudo leer el archivo local."));
        };
        reader.onerror = () => reject(new Error("Error al leer el archivo de imagen."));
        reader.readAsDataURL(file);
      });

      // Optimizar preservando transparencia (alpha channel)
      let optimizedDataUrl: string = readDataUrl;
      try {
        optimizedDataUrl = await compressImage(file, {
          maxDimension: 1200,
          quality: 0.9,
          preserveAlpha: true,
        });
      } catch (compErr) {
        console.warn("Compresión canvas fallback a DataURL nativa:", compErr);
        optimizedDataUrl = readDataUrl;
      }

      // ASIGNACIÓN INMEDIATA A LA CAPA: La Vista Previa se actualiza al instante!
      handleUpdateLayer(targetLayer.id, { imageUrl: optimizedDataUrl });
      setSelectedLayerId(targetLayer.id);
      setUploadStatus({
        type: "success",
        message: `✓ Imagen asignada a "${targetLayer.name}" (Vista previa activa al instante).`,
      });

      // 1. PRIORIDAD: SUPABASE STORAGE (si está configurado)
      if (isSupabaseConfigured()) {
        try {
          const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
          const cloudUrl = await uploadFileToSupabaseStorage(
            file,
            `layers/${Date.now()}_${targetLayer.id}_${safeName}`,
            "candle-assets"
          );
          if (cloudUrl && (cloudUrl.startsWith("http://") || cloudUrl.startsWith("https://"))) {
            handleUpdateLayer(targetLayer.id, { imageUrl: cloudUrl });
            setUploadStatus({
              type: "success",
              message: `✓ Capa "${targetLayer.name}" guardada y respaldada en Supabase Storage.`,
            });
            return;
          }
        } catch (cloudErr: any) {
          console.warn("Supabase Storage fallback para capa:", cloudErr);
        }
      }

      // 2. FALLBACK: PERSISTENCIA EN EL SERVIDOR LOCAL (/api/upload)
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: optimizedDataUrl,
            name: `layer_${targetLayer.name.replace(/[^a-zA-Z0-9]/g, "_")}`,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            handleUpdateLayer(targetLayer.id, { imageUrl: data.url });
            setUploadStatus({
              type: "success",
              message: `✓ Capa "${targetLayer.name}" guardada y sincronizada correctamente en servidor local.`,
            });
            return;
          }
        }
      } catch (srvErr) {
        console.warn("Servidor local no disponible para /api/upload:", srvErr);
      }

      setUploadStatus({
        type: "info",
        message: `✓ Imagen de "${targetLayer.name}" activa con transparencia (almacenamiento local optimizado).`,
      });

    } catch (err: any) {
      console.error("Error al procesar capa PNG:", err);
      setUploadStatus({
        type: "error",
        message: `Error al procesar la imagen: ${err?.message || "Asegúrate de que sea un PNG válido."}`,
      });
    } finally {
      setIsUploading(false);
      targetUploadLayerIdRef.current = null;
      setTargetUploadLayerId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Trigger file dialog using layer ID directly (immune to React stale state)
  const triggerUpload = (layerId: string) => {
    targetUploadLayerIdRef.current = layerId;
    setTargetUploadLayerId(layerId);
    setSelectedLayerId(layerId);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const layerId =
      targetUploadLayerIdRef.current ||
      targetUploadLayerId ||
      selectedLayerId ||
      sortedLayers[0]?.id;

    if (!file || !layerId) return;
    await processFileForLayer(file, layerId);
  };

  // Drag & Drop handlers for individual layers and canvas
  const handleLayerDragOver = (e: React.DragEvent, layerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverLayerId(layerId);
  };

  const handleLayerDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverLayerId(null);
  };

  const handleLayerDrop = async (e: React.DragEvent, layerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverLayerId(null);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await processFileForLayer(files[0], layerId);
    }
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCanvasDragOver(true);
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCanvasDragOver(false);
  };

  const handleCanvasDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCanvasDragOver(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const targetId = activeLayer?.id || selectedLayerId || sortedLayers[0]?.id;
      if (targetId) {
        await processFileForLayer(files[0], targetId);
      }
    }
  };

  // Interactive Click on Canvas Stage
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactiveClickMode === "none") return;
    const rect = stageViewportRef.current?.getBoundingClientRect() || canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const pctX = Math.round(Math.max(0, Math.min(100, (clickX / rect.width) * 100)));
    const pctY = Math.round(Math.max(0, Math.min(100, (clickY / rect.height) * 100)));

    if (interactiveClickMode === "wick") {
      notifyResources({
        ...resources,
        wickX: pctX,
        wickY: pctY,
      });
    } else if (interactiveClickMode === "botanicals") {
      notifyResources({
        ...resources,
        botanicalsX: pctX,
        botanicalsY: pctY,
      });
    } else if (interactiveClickMode === "layer" && selectedLayerId) {
      // Calculate offset from center (50%)
      const offsetX = pctX - 50;
      const offsetY = pctY - 50;
      handleUpdateLayer(selectedLayerId, {
        offsetX,
        offsetY,
        posX: offsetX,
        posY: offsetY,
      });
    }
  };

  const activeLayer = sortedLayers.find((l) => l.id === selectedLayerId) || sortedLayers[0] || null;

  const allWaxColorPresets = useMemo(() => {
    if (waxColors && waxColors.length > 0) {
      return waxColors.map((c) => ({
        id: c.id,
        name: c.name,
        hex: c.hex,
        accent: c.accent || "#8C7A6B",
      }));
    }
    return WAX_COLOR_PRESETS;
  }, [waxColors]);

  const activeLayerAllowedPresets = useMemo(() => {
    if (!activeLayer) return [];
    if (activeLayer.allowedColors && activeLayer.allowedColors.length > 0) {
      return activeLayer.allowedColors.map((c) => ({
        id: c.name.toLowerCase().replace(/\s+/g, "-"),
        name: c.name,
        hex: c.hex,
        accent: c.hex,
      }));
    }
    if (activeLayer.allowedColorHexes && activeLayer.allowedColorHexes.length > 0) {
      return allWaxColorPresets.filter((p) =>
        activeLayer.allowedColorHexes?.some((h) => h.toLowerCase() === p.hex.toLowerCase())
      );
    }
    return allWaxColorPresets;
  }, [activeLayer, allWaxColorPresets]);

  return (
    <div
      className={`p-5 bg-[#FAF7F2] rounded-3xl border border-[#E5E0DA] space-y-5 shadow-xs ${className}`}
      id="unified-2d-model-manager"
    >
      {/* Hidden File Input for uploading layer PNGs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/webp,image/svg+xml,image/jpeg,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />



      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0DA]/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-[#4A4541] text-white">
            <Layers className="w-4 h-4" />
          </span>
          <div>
            <h4 className="font-serif font-bold text-[#423D33] text-base tracking-wide">
              Sistema Unificado 2D: Capas & Anclajes
            </h4>
            <p className="text-xs text-[#8C7A6B] mt-0.5">
              Configura la imagen de fondo, las capas PNG transparentes, anclajes de mecha y dispersión de botánicos.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Status Banner */}
      {uploadStatus && (
        <div
          className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between gap-2 border transition-all ${
            uploadStatus.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : uploadStatus.type === "error"
              ? "bg-rose-50 border-rose-300 text-rose-800"
              : "bg-blue-50 border-blue-300 text-blue-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {uploadStatus.type === "success" && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
            {uploadStatus.type === "error" && <Info className="w-4 h-4 text-rose-600 shrink-0" />}
            {uploadStatus.type === "info" && <Upload className="w-4 h-4 text-blue-600 shrink-0 animate-pulse" />}
            <span>{uploadStatus.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadStatus(null)}
            className="text-stone-400 hover:text-stone-700 cursor-pointer font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}



      {/* BARRA DE NAVEGACIÓN Y BOTÓN + CAPA */}
      <div className="flex items-center justify-between gap-3 border-b border-[#E5E0DA] pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("layers")}
            className={`pb-2 px-3 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 -mb-2 ${
              activeTab === "layers"
                ? "border-[#8C7A6B] text-[#423D33]"
                : "border-transparent text-[#8C7A6B] hover:text-[#423D33]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Capas 2D ({sortedLayers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("anchors")}
            className={`pb-2 px-3 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border-b-2 -mb-2 ${
              activeTab === "anchors"
                ? "border-[#8C7A6B] text-[#423D33]"
                : "border-transparent text-[#8C7A6B] hover:text-[#423D33]"
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>2. Anclajes (Mecha & Botánicos)</span>
          </button>
        </div>

        {/* BOTÓN + CAPA */}
        <button
          type="button"
          onClick={handleAddLayer}
          className="px-3.5 py-1.5 rounded-xl bg-[#4A4541] hover:bg-[#35312E] text-white text-xs font-bold tracking-wide transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Capa</span>
        </button>
      </div>

      {/* Main Grid: Controls (Left 7 Cols) & Real-time Interactive Canvas (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Controls by activeTab */}
        <div className="lg:col-span-7 space-y-4">
          {/* TAB 1: CAPAS 2D */}
          {activeTab === "layers" && (
            <div className="space-y-3">
              {sortedLayers.length === 0 ? (
                <div className="p-6 bg-white rounded-2xl border border-dashed border-[#D9C5B2] text-center space-y-3">
                  <Layers className="w-10 h-10 text-[#8C7A6B]/50 mx-auto" />
                  <h5 className="text-sm font-bold text-[#423D33]">
                    No hay capas 2D configuradas
                  </h5>
                  <p className="text-xs text-[#8C7A6B] max-w-sm mx-auto">
                    Añade capas PNG transparentes para cada componente independiente de la figura o vela (vaso, cera, relieves esculpidos).
                  </p>
                  <div className="pt-2 flex justify-center">
                    <button
                      type="button"
                      onClick={handleAddLayer}
                      className="px-4 py-2 rounded-xl bg-[#4A4541] hover:bg-[#35312E] text-white text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Crear Primera Capa</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedLayers.map((layer, index) => {
                    const isSelected = selectedLayerId === layer.id;
                    return (
                      <div
                        key={layer.id}
                        onClick={() => setSelectedLayerId(layer.id)}
                        onDragOver={(e) => handleLayerDragOver(e, layer.id)}
                        onDragLeave={handleLayerDragLeave}
                        onDrop={(e) => handleLayerDrop(e, layer.id)}
                        className={`bg-white p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                          isSelected
                            ? "border-[#8C7A6B] ring-1 ring-[#8C7A6B]/50 shadow-xs"
                            : "border-[#E5E0DA] hover:border-[#8C7A6B]/60"
                        } ${dragOverLayerId === layer.id ? "ring-2 ring-[#423D33] bg-[#FAF7F2]" : ""}`}
                      >
                        {/* Top: Thumbnail, Name, Z-Index & Actions */}
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            {/* PNG Thumbnail & Upload Trigger */}
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerUpload(layer.id);
                              }}
                              className="relative w-12 h-12 rounded-xl bg-[#F4EFEA] border border-[#D9C5B2] flex items-center justify-center overflow-hidden cursor-pointer group shrink-0"
                              title="Haz clic para subir o cambiar el archivo PNG transparente"
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

                            {/* Name & Z-Index Badge */}
                            <div className="flex-1 min-w-0">
                              <input
                                type="text"
                                value={layer.name}
                                onChange={(e) =>
                                  handleUpdateLayer(layer.id, { name: e.target.value })
                                }
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Nombre de la capa..."
                                className="w-full font-semibold text-xs text-[#423D33] p-1 rounded-md border border-transparent hover:border-[#E5E0DA] focus:border-[#8C7A6B] focus:bg-[#FAF7F2]"
                              />
                              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-[#8C7A6B] flex-wrap">
                                <span className="font-mono bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E5E0DA]">
                                  z-index: {layer.zIndex}
                                </span>
                                <select
                                  value={layer.type || getLayerCategory(layer)}
                                  onChange={(e) =>
                                    handleUpdateLayer(layer.id, {
                                      type: e.target.value as LayerCategory,
                                      category: e.target.value as LayerCategory,
                                    })
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[10px] font-semibold rounded border border-[#E5E0DA] bg-white px-1.5 py-0.5 text-[#423D33] focus:border-[#8C7A6B] cursor-pointer"
                                  title="Tipo / Categoría de la capa 2D"
                                >
                                  <option value="frasco">🏺 Frasco (Base/Vaso)</option>
                                  <option value="cera">🕯️ Cera (Relleno)</option>
                                  <option value="figura">✨ Figura (Escultura)</option>
                                  <option value="otro">🎨 Otro (Detalles)</option>
                                </select>
                                {layer.colorable && (
                                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-200 flex items-center gap-1">
                                    <Palette className="w-2.5 h-2.5" />
                                    Colorable
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Reorder and Delete Controls */}
                          <div
                            className="flex items-center gap-1 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === 0}
                              className="p-1 rounded-lg bg-[#FAF7F2] hover:bg-stone-200 text-[#423D33] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Bajar zIndex (Detrás)"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === sortedLayers.length - 1}
                              className="p-1 rounded-lg bg-[#FAF7F2] hover:bg-stone-200 text-[#423D33] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title="Subir zIndex (Al frente)"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateLayer(layer)}
                              className="p-1 rounded-lg bg-[#FAF7F2] hover:bg-[#E5E0DA] text-[#423D33] cursor-pointer"
                              title="Duplicar capa"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLayer(layer.id)}
                              className="p-1 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors cursor-pointer"
                              title="Eliminar capa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Middle: Colorable switch & Upload quick button */}
                        <div
                          className="pt-2 border-t border-[#E5E0DA]/60 flex items-center justify-between gap-2 text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={layer.colorable}
                              onChange={(e) =>
                                handleUpdateLayer(layer.id, { colorable: e.target.checked })
                              }
                              className="w-3.5 h-3.5 rounded text-[#8C7A6B] focus:ring-[#8C7A6B] accent-[#8C7A6B]"
                            />
                            <span className="font-semibold text-[#423D33] flex items-center gap-1 text-[11px]">
                              <Palette className="w-3 h-3 text-[#D98B68]" />
                              <span>Capa Colorable (Reacciona al color de la cera)</span>
                            </span>
                          </label>

                          <button
                            type="button"
                            onClick={() => triggerUpload(layer.id)}
                            disabled={isUploading && targetUploadLayerId === layer.id}
                            className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#E5E0DA] text-[#423D33] text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-[#E5E0DA] disabled:opacity-50"
                          >
                            <Upload className="w-3 h-3" />
                            <span>
                              {isUploading && targetUploadLayerId === layer.id
                                ? "Subiendo..."
                                : layer.imageUrl
                                ? "Reemplazar PNG"
                                : "Subir PNG"}
                            </span>
                          </button>
                        </div>

                        {/* Layer Category / Role selector */}
                        <div
                          className="pt-2 border-t border-[#E5E0DA]/60 flex items-center justify-between gap-3 text-xs bg-[#FAF7F2] p-2.5 rounded-xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div>
                            <span className="font-semibold text-[#423D33] block text-[11px]">
                              Tipo de Capa (Paso del Personalizador)
                            </span>
                            <span className="text-[10px] text-[#8C7A6B]">
                              Define en qué paso del asistente del cliente aparecerá esta capa
                            </span>
                          </div>

                          <select
                            value={layer.type || getLayerCategory(layer)}
                            onChange={(e) =>
                              handleUpdateLayer(layer.id, {
                                type: e.target.value as LayerCategory,
                                category: e.target.value as LayerCategory,
                              })
                            }
                            className="text-xs font-semibold rounded-lg border border-[#E5E0DA] bg-white px-2.5 py-1.5 text-[#423D33] focus:border-[#8C7A6B] cursor-pointer shrink-0"
                          >
                            <option value="cera">🕯️ Cera (Paso 2: Color de Cera & Capas)</option>
                            <option value="frasco">🏺 Frasco (Paso 3: Color del Envase)</option>
                            <option value="figura">✨ Figura (Paso de Escultura)</option>
                            <option value="otro">🎨 Otro (Detalles / Extras)</option>
                          </select>
                        </div>

                        {/* Dedicated Dropzone if layer has no image yet */}
                        {!Boolean(layer.imageUrl && layer.imageUrl.trim()) && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerUpload(layer.id);
                            }}
                            onDragOver={(e) => handleLayerDragOver(e, layer.id)}
                            onDragLeave={handleLayerDragLeave}
                            onDrop={(e) => handleLayerDrop(e, layer.id)}
                            className={`p-3 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                              dragOverLayerId === layer.id
                                ? "border-[#423D33] bg-[#E5E0DA]"
                                : "border-[#D9C5B2] hover:border-[#8C7A6B] bg-[#FAF7F2] hover:bg-[#F4EFEA]"
                            }`}
                          >
                            <Upload
                              className={`w-4 h-4 text-[#8C7A6B] ${
                                isUploading && targetUploadLayerId === layer.id ? "animate-bounce" : ""
                              }`}
                            />
                            <span className="text-xs font-semibold text-[#423D33]">
                              {isUploading && targetUploadLayerId === layer.id
                                ? "Cargando imagen..."
                                : "Subir imagen PNG transparente"}
                            </span>
                            <span className="text-[10px] text-[#8C7A6B]">
                              Haz clic para seleccionar o arrastra el archivo aquí
                            </span>
                          </div>
                        )}

                        {/* Admin Configuration for Colorable Layer: Allowed Palettes & Layer Color */}
                        {layer.colorable && (
                          <div
                            className="pt-2 border-t border-[#E5E0DA]/60 space-y-2.5 bg-[#FAF7F2]/50 p-2.5 rounded-xl text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* 1. ALLOWED COLORS FOR CLIENT */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  Tonos Permitidos para el Cliente:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateLayer(layer.id, {
                                      allowedColorHexes: [],
                                      allowedColors: allWaxColorPresets.map((p) => ({
                                        name: p.name,
                                        hex: p.hex,
                                      })),
                                    });
                                  }}
                                  className="text-[9px] text-[#8C7A6B] hover:text-[#423D33] underline cursor-pointer"
                                >
                                  {(!layer.allowedColorHexes || layer.allowedColorHexes.length === 0)
                                    ? "Todos autorizados ✓"
                                    : "Restablecer a todos"}
                                </button>
                              </div>
                              <p className="text-[10px] text-[#8C7A6B]">
                                Define qué colores de cera puede elegir el cliente para esta capa específica.
                              </p>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {allWaxColorPresets.map((preset) => {
                                  const isAllowed =
                                    !layer.allowedColorHexes ||
                                    layer.allowedColorHexes.length === 0 ||
                                    layer.allowedColorHexes.some(
                                      (h) => h.toLowerCase() === preset.hex.toLowerCase()
                                    );
                                  return (
                                    <button
                                      key={preset.id}
                                      type="button"
                                      onClick={() => {
                                        const current = layer.allowedColorHexes || [];
                                        let nextAllowed: string[];
                                        if (current.length === 0) {
                                          nextAllowed = allWaxColorPresets
                                            .filter(
                                              (p) =>
                                                p.hex.toLowerCase() !==
                                                preset.hex.toLowerCase()
                                            )
                                            .map((p) => p.hex);
                                        } else if (
                                          current.some(
                                            (h) =>
                                              h.toLowerCase() === preset.hex.toLowerCase()
                                          )
                                        ) {
                                          nextAllowed = current.filter(
                                            (h) =>
                                              h.toLowerCase() !== preset.hex.toLowerCase()
                                          );
                                        } else {
                                          nextAllowed = [...current, preset.hex];
                                        }

                                        // Auto-adjust defaultColorHex if it is no longer in the allowed list
                                        let nextColor = layer.defaultColorHex || "#FAF7F2";
                                        if (
                                          nextAllowed.length > 0 &&
                                          !nextAllowed.some(
                                            (h) => h.toLowerCase() === nextColor.toLowerCase()
                                          )
                                        ) {
                                          nextColor = nextAllowed[0];
                                        }

                                        const nextAllowedColors = allWaxColorPresets
                                          .filter((p) =>
                                            nextAllowed.some(
                                              (h) => h.toLowerCase() === p.hex.toLowerCase()
                                            )
                                          )
                                          .map((p) => ({ name: p.name, hex: p.hex }));

                                        handleUpdateLayer(layer.id, {
                                          allowedColorHexes: nextAllowed,
                                          allowedColors: nextAllowedColors,
                                          defaultColorHex: nextColor,
                                        });
                                      }}
                                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] transition-all cursor-pointer ${
                                        isAllowed
                                          ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-medium"
                                          : "bg-stone-50 border-stone-200 text-stone-400 opacity-50 hover:opacity-100"
                                      }`}
                                      title={
                                        isAllowed
                                          ? "Permitido para el cliente (Clic para restringir)"
                                          : "Restringido (Clic para permitir)"
                                      }
                                    >
                                      <span
                                        className="w-2 h-2 rounded-full border border-black/10 shrink-0 inline-block"
                                        style={{ backgroundColor: preset.hex }}
                                      />
                                      <span>{preset.name}</span>
                                      {isAllowed && (
                                        <Check className="w-2 h-2 text-emerald-600 ml-0.5" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* 2. LAYER COLOR SELECTOR (Strictly restricted to allowed tones) */}
                            <div className="space-y-1.5 pt-2 border-t border-[#E5E0DA]/50">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#423D33] uppercase tracking-wider flex items-center gap-1">
                                  <Palette className="w-3 h-3 text-[#D98B68]" />
                                  Color de esta Capa:
                                </span>
                                <span className="font-mono text-[10px] text-[#423D33] bg-white px-2 py-0.5 rounded-md border border-[#E5E0DA] flex items-center gap-1.5">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-black/15 inline-block"
                                    style={{ backgroundColor: layer.defaultColorHex || "#FAF7F2" }}
                                  />
                                  <span>{layer.defaultColorHex || "#FAF7F2"}</span>
                                </span>
                              </div>
                              <p className="text-[10px] text-[#8C7A6B]">
                                Solo se pueden elegir los tonos autorizados en la lista superior para esta capa.
                              </p>

                              {/* Allowed Colors Only */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {(() => {
                                  const allowedPresets =
                                    !layer.allowedColorHexes || layer.allowedColorHexes.length === 0
                                      ? allWaxColorPresets
                                      : allWaxColorPresets.filter((p) =>
                                          layer.allowedColorHexes?.some(
                                            (h) => h.toLowerCase() === p.hex.toLowerCase()
                                          )
                                        );

                                  if (allowedPresets.length === 0) {
                                    return (
                                      <div className="text-[10px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                                        Todos los tonos están restringidos. Habilita al menos un tono en la lista superior.
                                      </div>
                                    );
                                  }

                                  return allowedPresets.map((preset) => {
                                    const isCurrent =
                                      (layer.defaultColorHex || "#FAF7F2").toLowerCase() ===
                                      preset.hex.toLowerCase();
                                    return (
                                      <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() =>
                                          handleUpdateLayer(layer.id, {
                                            defaultColorHex: preset.hex,
                                          })
                                        }
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] transition-all cursor-pointer ${
                                          isCurrent
                                            ? "bg-white border-[#423D33] font-bold text-[#423D33] ring-1 ring-[#423D33] shadow-2xs"
                                            : "bg-white/80 border-[#E5E0DA] text-[#8C7A6B] hover:text-[#423D33] hover:border-stone-400"
                                        }`}
                                        title={`Elegir ${preset.name}`}
                                      >
                                        <span
                                          className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0 inline-block"
                                          style={{ backgroundColor: preset.hex }}
                                        />
                                        <span>{preset.name}</span>
                                        {isCurrent && (
                                          <Check className="w-2.5 h-2.5 text-emerald-600 ml-0.5" />
                                        )}
                                      </button>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Bottom: Layer Position, Scale & Opacity Adjusters (Expandable for selected layer) */}
                        {isSelected && (
                          <div
                            className="pt-2.5 border-t border-[#E5E0DA]/60 bg-[#FAF7F2]/60 -mx-3.5 -mb-3.5 p-3 rounded-b-2xl space-y-2.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B]">
                              <span className="flex items-center gap-1 text-[#423D33]">
                                <Move className="w-3 h-3 text-[#D98B68]" />
                                Posición & Escala Independiente:
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setInteractiveClickMode((prev) =>
                                      prev === "layer" ? "none" : "layer"
                                    )
                                  }
                                  className={`px-2 py-0.5 rounded text-[9px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                                    interactiveClickMode === "layer"
                                      ? "bg-[#8C7A6B] text-white"
                                      : "bg-white border border-[#E5E0DA] text-[#423D33]"
                                  }`}
                                >
                                  <Crosshair className="w-2.5 h-2.5" />
                                  <span>
                                    {interactiveClickMode === "layer"
                                      ? "Clic activo en lienzo"
                                      : "Clic en Lienzo"}
                                  </span>
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div>
                                <div className="flex items-center justify-between">
                                  <label className="block text-[9px] text-[#8C7A6B] font-semibold">
                                    Offset X ({layer.offsetX ?? layer.posX ?? 0}%)
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateLayer(layer.id, { offsetX: 0, posX: 0 })
                                    }
                                    className="text-[9px] text-[#8C7A6B] hover:text-[#423D33] cursor-pointer"
                                    title="Restablecer X a 0%"
                                  >
                                    0%
                                  </button>
                                </div>
                                <input
                                  type="range"
                                  min="-80"
                                  max="80"
                                  value={layer.offsetX ?? layer.posX ?? 0}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    handleUpdateLayer(layer.id, {
                                      offsetX: val,
                                      posX: val,
                                    });
                                  }}
                                  className="w-full accent-[#8C7A6B]"
                                />
                              </div>
                              <div>
                                <div className="flex items-center justify-between">
                                  <label className="block text-[9px] text-[#8C7A6B] font-semibold">
                                    Offset Y ({layer.offsetY ?? layer.posY ?? 0}%)
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateLayer(layer.id, { offsetY: 0, posY: 0 })
                                    }
                                    className="text-[9px] text-[#8C7A6B] hover:text-[#423D33] cursor-pointer"
                                    title="Restablecer Y a 0%"
                                  >
                                    0%
                                  </button>
                                </div>
                                <input
                                  type="range"
                                  min="-80"
                                  max="80"
                                  value={layer.offsetY ?? layer.posY ?? 0}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    handleUpdateLayer(layer.id, {
                                      offsetY: val,
                                      posY: val,
                                    });
                                  }}
                                  className="w-full accent-[#8C7A6B]"
                                />
                              </div>
                              <div>
                                <div className="flex items-center justify-between">
                                  <label className="block text-[9px] text-[#8C7A6B] font-semibold">
                                    Escala ({(layer.scale ?? 1).toFixed(2)}x)
                                  </label>
                                  <div className="flex items-center gap-0.5">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateLayer(layer.id, { scale: 1 })}
                                      className="text-[9px] px-1 bg-white rounded border border-[#E5E0DA] text-[#8C7A6B] hover:text-[#423D33] cursor-pointer"
                                      title="Escala 1x"
                                    >
                                      1x
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateLayer(layer.id, { scale: 2 })}
                                      className="text-[9px] px-1 bg-white rounded border border-[#E5E0DA] text-[#8C7A6B] hover:text-[#423D33] cursor-pointer"
                                      title="Escala 2x"
                                    >
                                      2x
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateLayer(layer.id, { scale: 3 })}
                                      className="text-[9px] px-1 bg-white rounded border border-[#E5E0DA] text-[#8C7A6B] hover:text-[#423D33] cursor-pointer"
                                      title="Escala 3x"
                                    >
                                      3x
                                    </button>
                                  </div>
                                </div>
                                <input
                                  type="range"
                                  min="0.1"
                                  max="3.0"
                                  step="0.05"
                                  value={layer.scale ?? 1}
                                  onChange={(e) =>
                                    handleUpdateLayer(layer.id, {
                                      scale: Number(e.target.value),
                                    })
                                  }
                                  className="w-full accent-[#8C7A6B]"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-[#8C7A6B] font-semibold">
                                  Opacidad ({Math.round((layer.opacity ?? 1) * 100)}%)
                                </label>
                                <input
                                  type="range"
                                  min="0.1"
                                  max="1"
                                  step="0.05"
                                  value={layer.opacity ?? 1}
                                  onChange={(e) =>
                                    handleUpdateLayer(layer.id, {
                                      opacity: Number(e.target.value),
                                    })
                                  }
                                  className="w-full accent-[#8C7A6B]"
                                />
                              </div>
                            </div>
                            <p className="text-[9.5px] text-[#8C7A6B] italic">
                              💡 También puedes hacer clic y arrastrar esta capa directamente en la Vista Previa Interactiva 2D.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ANCLAJES (MECHA & BOTÁNICOS) */}
          {activeTab === "anchors" && (
            <div className="bg-white p-4 rounded-2xl border border-[#E5E0DA] space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-2">
                <div>
                  <h5 className="font-bold text-xs text-[#423D33] uppercase tracking-wider">
                    Posicionamiento de Mecha & Botánicos
                  </h5>
                  <p className="text-[11px] text-[#8C7A6B]">
                    Ajusta las coordenadas porcentuales o haz clic directamente sobre la vista previa para posicionar los elementos.
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setInteractiveClickMode((prev) =>
                        prev === "wick" ? "none" : "wick"
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                      interactiveClickMode === "wick"
                        ? "bg-[#D98B68] text-white"
                        : "bg-[#FAF7F2] text-[#423D33] border border-[#E5E0DA] hover:bg-stone-200"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Colocar Mecha</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setInteractiveClickMode((prev) =>
                        prev === "botanicals" ? "none" : "botanicals"
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                      interactiveClickMode === "botanicals"
                        ? "bg-[#8C7A6B] text-white"
                        : "bg-[#FAF7F2] text-[#423D33] border border-[#E5E0DA] hover:bg-stone-200"
                    }`}
                  >
                    <Flower2 className="w-3.5 h-3.5" />
                    <span>Colocar Botánicos</span>
                  </button>
                </div>
              </div>

              {/* Wick Anchor Sliders */}
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5E0DA] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#423D33] flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#D98B68]" />
                    <span>Punto de Inserción de la Mecha & Llama</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#8C7A6B]">
                    X: {resources.wickX}% | Y: {resources.wickY}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#8C7A6B] font-semibold mb-1">
                      Posición X (% Horizontal)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={resources.wickX}
                      onChange={(e) =>
                        notifyResources({
                          ...resources,
                          wickX: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#D98B68]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8C7A6B] font-semibold mb-1">
                      Posición Y (% Vertical)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={resources.wickY}
                      onChange={(e) =>
                        notifyResources({
                          ...resources,
                          wickY: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#D98B68]"
                    />
                  </div>
                </div>
              </div>

              {/* Botanicals Anchor Sliders */}
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E5E0DA] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#423D33] flex items-center gap-1">
                    <Flower2 className="w-3.5 h-3.5 text-[#8C7A6B]" />
                    <span>Área & Radio de Dispersión de Botánicos</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#8C7A6B]">
                    Centro: {resources.botanicalsX}%, {resources.botanicalsY}% | Radio: {resources.botanicalsRadius}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#8C7A6B] font-semibold mb-1">
                      Centro X (%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={resources.botanicalsX}
                      onChange={(e) =>
                        notifyResources({
                          ...resources,
                          botanicalsX: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#8C7A6B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8C7A6B] font-semibold mb-1">
                      Centro Y (%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={resources.botanicalsY}
                      onChange={(e) =>
                        notifyResources({
                          ...resources,
                          botanicalsY: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#8C7A6B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8C7A6B] font-semibold mb-1">
                      Radio del Halo (%)
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      value={resources.botanicalsRadius}
                      onChange={(e) =>
                        notifyResources({
                          ...resources,
                          botanicalsRadius: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#8C7A6B]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Real-time Preview Canvas (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center space-y-3 sticky top-4">
          <div className="w-full max-w-[380px] flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#8C7A6B]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#423D33]">
                Vista Previa 2D
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Guides toggle button */}
              <button
                type="button"
                onClick={() => setShowAdminGuides((prev) => !prev)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all border ${
                  showAdminGuides
                    ? "bg-[#D98B68] text-white border-[#D98B68] shadow-xs"
                    : "bg-white text-[#423D33] hover:bg-stone-50 border-[#E5E0DA]"
                }`}
                title={showAdminGuides ? "Ocultar guías de edición (Ver como cliente)" : "Mostrar guías de posición y calibración"}
              >
                <Crosshair className="w-3 h-3" />
                <span>{showAdminGuides ? "Guías: Activas" : "Vista Limpia"}</span>
              </button>

              <button
                type="button"
                onClick={() => setTestIsLit((prev) => !prev)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors border ${
                  testIsLit
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : "bg-white text-stone-600 border-[#E5E0DA] hover:bg-stone-50"
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>{testIsLit ? "Encendida" : "Apagada"}</span>
              </button>
            </div>
          </div>

          {/* Interactive Stage with Direct Layer Dragging & Dropzone (Unified Canonical CandlePreview2D) */}
          <CandlePreview2D
            layers={layers}
            backgroundImage={resources.backgroundImage}
            backgroundOpacity={resources.backgroundOpacity}
            selectedWaxColorHex={testWaxColorHex}
            wickX={resources.wickX}
            wickY={resources.wickY}
            wickType="cotton"
            isLit={testIsLit}
            botanicalsX={resources.botanicalsX}
            botanicalsY={resources.botanicalsY}
            botanicalsRadius={resources.botanicalsRadius}
            botanicals={previewBotanicals}
            showBotanicalsArea={showAdminGuides}
            showGuides={showAdminGuides}
            stageRef={stageViewportRef}
            canvasRef={canvasRef}
            activeLayerId={showAdminGuides ? activeLayer?.id : null}
            draggingLayerId={draggingLayerId}
            onLayerPointerDown={handleLayerPointerDown}
            interactiveClickMode={interactiveClickMode}
            onInteractiveClickModeClose={() => setInteractiveClickMode("none")}
            onCanvasClick={handleCanvasClick}
            onCanvasDragOver={handleCanvasDragOver}
            onCanvasDragLeave={handleCanvasDragLeave}
            onCanvasDrop={handleCanvasDrop}
            isCanvasDragOver={isCanvasDragOver}
            activeLayerName={activeLayer?.name}
            canvasTitle={
              showAdminGuides && activeLayer
                ? `Arrastra para ajustar posición de "${activeLayer.name}" o suelta un PNG para reemplazar su imagen`
                : undefined
            }
          />

          {/* CONTROLES DE LA VISTA PREVIA (Ancho exacto del lienzo 380px) */}
          <div className="w-full max-w-[380px] space-y-3">
            {/* 1. SELECCIONADOR RÁPIDO DE CAPA ACTIVA (Para mover o colorear de forma independiente) */}
            {sortedLayers.length > 0 && (
              <div className="p-3 bg-white rounded-2xl border border-[#E5E0DA] space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#423D33] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#D98B68]" />
                    <span>Capa Activa a Posicionar:</span>
                  </span>
                  <span className="text-[10px] text-[#8C7A6B]">
                    {sortedLayers.length} {sortedLayers.length === 1 ? "capa" : "capas"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {sortedLayers.map((layer, idx) => {
                    const isSelected = activeLayer?.id === layer.id;
                    return (
                      <button
                        key={layer.id}
                        type="button"
                        onClick={() => setSelectedLayerId(layer.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                          isSelected
                            ? "bg-[#4A4541] text-white border-[#4A4541] shadow-xs"
                            : "bg-[#FAF7F2] text-[#423D33] border-[#E5E0DA] hover:bg-stone-200"
                        }`}
                        title={`Seleccionar ${layer.name} para mover y ajustar`}
                      >
                        {layer.colorable && (
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/50 shrink-0"
                            style={{ backgroundColor: layer.defaultColorHex || "#FAF7F2" }}
                          />
                        )}
                        <span>{idx + 1}. {layer.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#D98B68] ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. PROBADOR RÁPIDO DE TONOS DE CERA EN VISTA PREVIA */}
            <div className="p-3 bg-white rounded-2xl border border-[#E5E0DA] space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#423D33] flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#D98B68]" />
                  <span>Simular Tono de Cera:</span>
                </span>
                <span className="text-[10px] text-[#8C7A6B]">
                  {WAX_COLOR_PRESETS.find((p) => p.hex.toLowerCase() === testWaxColorHex.toLowerCase())?.name || "Natural"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {WAX_COLOR_PRESETS.map((preset) => {
                  const isSelected = testWaxColorHex.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setTestWaxColorHex(preset.hex)}
                      className={`px-2 py-1 rounded-xl text-[10px] font-semibold flex items-center gap-1.5 border transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? "bg-[#FAF7F2] border-[#8C7A6B] ring-1 ring-[#8C7A6B] text-[#423D33]"
                          : "bg-white border-[#E5E0DA] text-[#8C7A6B] hover:bg-stone-50"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span>{preset.name.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          {/* 2. PANEL DE CONTROL EN TIEMPO REAL PARA LA CAPA ACTIVA */}
          {activeLayer && (
            <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E5E0DA] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#423D33] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#D98B68]" />
                  <span>Ajustes de "{activeLayer.name}"</span>
                </span>
                <span className="text-[10px] text-[#8C7A6B]">
                  Mueve con sliders o arrastra en el lienzo
                </span>
              </div>

              {/* PNG Image Management for Active Layer */}
              <div
                onDragOver={(e) => handleLayerDragOver(e, activeLayer.id)}
                onDragLeave={handleLayerDragLeave}
                onDrop={(e) => handleLayerDrop(e, activeLayer.id)}
                className={`p-2.5 bg-white rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  dragOverLayerId === activeLayer.id
                    ? "border-[#423D33] ring-2 ring-[#423D33]/30 bg-[#FAF7F2]"
                    : "border-[#E5E0DA]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    onClick={() => triggerUpload(activeLayer.id)}
                    className="relative w-12 h-12 rounded-lg bg-[#FAF7F2] border border-[#D9C5B2] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#8C7A6B] transition-colors shrink-0 group"
                    title="Clic para subir o cambiar el archivo PNG transparente de esta capa"
                  >
                    {Boolean(activeLayer.imageUrl && activeLayer.imageUrl.trim()) ? (
                      <img
                        src={activeLayer.imageUrl}
                        alt={activeLayer.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-[#8C7A6B] group-hover:text-[#423D33]" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Upload className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#423D33] truncate">
                      {activeLayer.imageUrl ? "Imagen PNG Asignada" : "Sin Imagen PNG"}
                    </div>
                    <div className="text-[10px] text-[#8C7A6B] truncate">
                      {activeLayer.imageUrl
                        ? "Transparencia activa en lienzo"
                        : "Arrastra un PNG aquí o pulsa Subir"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => triggerUpload(activeLayer.id)}
                  disabled={isUploading && targetUploadLayerId === activeLayer.id}
                  className="px-3 py-1.5 rounded-lg bg-[#4A4541] hover:bg-[#34302C] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {isUploading && targetUploadLayerId === activeLayer.id
                      ? "Procesando..."
                      : activeLayer.imageUrl
                      ? "Reemplazar PNG"
                      : "Subir PNG"}
                  </span>
                </button>
              </div>

              {/* Offset X and Offset Y Sliders */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-2.5 rounded-xl border border-[#E5E0DA] space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-[#8C7A6B] font-semibold">
                      Offset X: <span className="font-mono font-bold text-[#423D33]">{activeLayer.offsetX ?? activeLayer.posX ?? 0}%</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleUpdateLayer(activeLayer.id, { offsetX: 0, posX: 0 })}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#E5E0DA] text-[#8C7A6B] hover:text-[#423D33] cursor-pointer"
                      title="Restablecer X a 0%"
                    >
                      0%
                    </button>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    value={activeLayer.offsetX ?? activeLayer.posX ?? 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      handleUpdateLayer(activeLayer.id, { offsetX: val, posX: val });
                    }}
                    className="w-full accent-[#D98B68]"
                  />
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-[#E5E0DA] space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-[#8C7A6B] font-semibold">
                      Offset Y: <span className="font-mono font-bold text-[#423D33]">{activeLayer.offsetY ?? activeLayer.posY ?? 0}%</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleUpdateLayer(activeLayer.id, { offsetY: 0, posY: 0 })}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#E5E0DA] text-[#8C7A6B] hover:text-[#423D33] cursor-pointer"
                      title="Restablecer Y a 0%"
                    >
                      0%
                    </button>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="80"
                    value={activeLayer.offsetY ?? activeLayer.posY ?? 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      handleUpdateLayer(activeLayer.id, { offsetY: val, posY: val });
                    }}
                    className="w-full accent-[#D98B68]"
                  />
                </div>
              </div>

              {/* Escala hasta x3 (300%) */}
              <div className="bg-white p-2.5 rounded-xl border border-[#E5E0DA] space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-[#8C7A6B] font-semibold">
                    Escala: <span className="font-mono font-bold text-[#423D33]">{(activeLayer.scale ?? 1).toFixed(2)}x ({Math.round((activeLayer.scale ?? 1) * 100)}%)</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleUpdateLayer(activeLayer.id, { scale: s })}
                        className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                          (activeLayer.scale ?? 1) === s
                            ? "bg-[#4A4541] text-white border-[#4A4541] font-bold"
                            : "bg-[#FAF7F2] border-[#E5E0DA] text-[#8C7A6B] hover:text-[#423D33]"
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.05"
                  value={activeLayer.scale ?? 1}
                  onChange={(e) => handleUpdateLayer(activeLayer.id, { scale: Number(e.target.value) })}
                  className="w-full accent-[#8C7A6B]"
                />
              </div>

              {/* Control de Color Independiente (Exclusivamente tonos permitidos de esta capa) */}
              {activeLayer.colorable && (
                <div className="bg-white p-2.5 rounded-xl border border-[#E5E0DA] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#423D33] flex items-center gap-1">
                      <Palette className="w-3 h-3 text-[#D98B68]" />
                      <span>Color de "{activeLayer.name}":</span>
                    </span>
                    <span className="text-[9px] text-[#8C7A6B]">
                      Solo tonos permitidos de esta capa
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeLayerAllowedPresets.length === 0 ? (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                        No hay tonos permitidos configurados para esta capa.
                      </span>
                    ) : (
                      activeLayerAllowedPresets.map((preset) => {
                        const isCurrent =
                          (activeLayer.defaultColorHex || "#FAF7F2").toLowerCase() ===
                          preset.hex.toLowerCase();
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() =>
                              handleUpdateLayer(activeLayer.id, { defaultColorHex: preset.hex })
                            }
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] transition-all cursor-pointer ${
                              isCurrent
                                ? "bg-white border-[#423D33] font-bold text-[#423D33] ring-1 ring-[#423D33] shadow-2xs"
                                : "bg-[#FAF7F2] border-[#E5E0DA] text-[#8C7A6B] hover:text-[#423D33]"
                            }`}
                            title={`Asignar ${preset.name} únicamente a la capa ${activeLayer.name}`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0 inline-block"
                              style={{ backgroundColor: preset.hex }}
                            />
                            <span>{preset.name}</span>
                            {isCurrent && <Check className="w-2.5 h-2.5 text-emerald-600 ml-0.5" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};
