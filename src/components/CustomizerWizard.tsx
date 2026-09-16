import React, { useState, useEffect, useMemo } from "react";
import {
  VesselOption,
  WaxColorOption,
  WickOption,
  BotanicalOption,
  LabelStyleOption,
  WaxType,
  CartItem,
  CandleProduct,
  SculptedFigure,
  Layer2D,
  LayerCategory,
  getLayerCategory,
  AromaItem,
} from "../types";
import { useStore } from "../context/StoreContext";
import { VisorSidebar, VisorCustomization } from "./VisorSidebar";
import { LayerColorCustomizer } from "./LayerColorCustomizer";
import { SingleLayerRenderer } from "./SingleLayerRenderer";
import { woodSoundEngine } from "../utils/audioSynth";
import {
  Sparkles,
  Layers,
  Flame,
  Volume2,
  VolumeX,
  Tag,
  PenTool,
  Type,
  Gift,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  RotateCcw,
  Check,
  Info,
  CheckCircle2,
  Sliders,
  Palette,
  FastForward,
  MessageSquareOff,
} from "lucide-react";

// Standard 100% Organic Cotton Wick (strictly cotton wick only)
const COTTON_WICK: WickOption = {
  id: "algodon",
  name: "Mecha de Algodón 100% Orgánico",
  subtitle: "Combustión pura, limpia y libre de humos",
  type: "algodon",
  priceAddon: 0.0,
  description: "Hilos de algodón botánico trenzados a mano. Combustión ecológica, silenciosa y constante.",
  soundEffect: "Silenciosa y armónica",
  burnRate: "Combustión lenta y uniforme (50-60h)",
  hasAudio: false,
};

interface CustomizerWizardProps {
  onAddToCart: (customCandle: CartItem) => void;
  initialProduct?: CandleProduct | null;
  onClose?: () => void;
}

export const CustomizerWizard: React.FC<CustomizerWizardProps> = ({
  onAddToCart,
  initialProduct,
  onClose,
}) => {
  const { customizerOptions, candles, sculptures, aromas } = useStore();
  const { vessels, waxColors, botanicals: availableBotanicals, labelStyles } = customizerOptions;

  // Wizard Active Step
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Active selected sculpted figure (Step 1)
  const [selectedFigure, setSelectedFigure] = useState<SculptedFigure>(() => {
    if (initialProduct?.sculptureType) {
      const scType = initialProduct.sculptureType.toLowerCase();
      const match = sculptures.find(
        (s) =>
          s.id === initialProduct.sculptureType ||
          s.sculptureType === initialProduct.sculptureType ||
          s.id.toLowerCase().includes(scType) ||
          (s.sculptureType && scType.includes(s.sculptureType.toLowerCase())) ||
          s.name.toLowerCase().includes(initialProduct.name.toLowerCase()) ||
          initialProduct.name.toLowerCase().includes(s.name.toLowerCase())
      );
      if (match) return match;
    }
    return sculptures[0] || {} as SculptedFigure;
  });

  // Active selected catalog model
  const [selectedCandle, setSelectedCandle] = useState<CandleProduct>(() => {
    if (initialProduct) {
      const match = candles.find((c) => c.id === initialProduct.id);
      if (match) return match;
    }
    return candles[0] || {} as CandleProduct;
  });

  // Keep selectedCandle synchronized if updated in admin
  useEffect(() => {
    if (selectedCandle?.id && candles.length > 0) {
      const fresh = candles.find((c) => c.id === selectedCandle.id);
      if (fresh) {
        if (
          JSON.stringify(fresh.layers2D) !== JSON.stringify(selectedCandle.layers2D) ||
          fresh.backgroundImage !== selectedCandle.backgroundImage ||
          fresh.backgroundOpacity !== selectedCandle.backgroundOpacity ||
          fresh.wickX !== selectedCandle.wickX ||
          fresh.wickY !== selectedCandle.wickY ||
          fresh.botanicalsX !== selectedCandle.botanicalsX ||
          fresh.botanicalsY !== selectedCandle.botanicalsY
        ) {
          setSelectedCandle(fresh);
        }
      }
    }
  }, [candles]);

  // Keep selectedFigure synchronized if updated in admin
  useEffect(() => {
    if (selectedFigure?.id && sculptures.length > 0) {
      const fresh = sculptures.find((s) => s.id === selectedFigure.id);
      if (fresh) {
        if (
          JSON.stringify(fresh.layers2D) !== JSON.stringify(selectedFigure.layers2D) ||
          fresh.backgroundImage !== selectedFigure.backgroundImage ||
          fresh.backgroundOpacity !== selectedFigure.backgroundOpacity ||
          fresh.wickX !== selectedFigure.wickX ||
          fresh.wickY !== selectedFigure.wickY ||
          fresh.botanicalsX !== selectedFigure.botanicalsX ||
          fresh.botanicalsY !== selectedFigure.botanicalsY
        ) {
          setSelectedFigure(fresh);
        }
      }
    }
  }, [sculptures]);

  // Active selections
  const [selectedVessel, setSelectedVessel] = useState<VesselOption>(() => {
    if (initialProduct) {
      const match = vessels.find((v) => v.id === initialProduct.templateType || v.id === initialProduct.id);
      if (match) return match;
    }
    return vessels[0] || {} as VesselOption;
  });

  // Active selected vessel color (for colorable vessels)
  const [selectedVesselColorHex, setSelectedVesselColorHex] = useState<string>(() => {
    if (initialProduct?.vesselColor) return initialProduct.vesselColor;
    const initialVessel = initialProduct
      ? vessels.find((v) => v.id === initialProduct.templateType || v.id === initialProduct.id) || vessels[0]
      : vessels[0];
    return initialVessel?.defaultColorHex || initialVessel?.color || "#FAF7F2";
  });

  const handleSelectVessel = (vessel: VesselOption) => {
    setSelectedVessel(vessel);
    setSelectedVesselColorHex(vessel.defaultColorHex || vessel.color || "#FAF7F2");
  };

  const [selectedWaxColor, setSelectedWaxColor] = useState<WaxColorOption>(() => {
    if (initialProduct?.waxColorHex) {
      const match = waxColors.find((w) => w.hex.toLowerCase() === initialProduct.waxColorHex?.toLowerCase());
      if (match) return match;
    }
    return waxColors[0] || {} as WaxColorOption;
  });

  const [selectedWaxType, setSelectedWaxType] = useState<WaxType>(
    initialProduct?.waxType || "Soja"
  );

  // Colors strictly configured by administrator in "Colores de Vela" / "Tonos de Cera"
  const adminWaxColors = useMemo(() => {
    return (waxColors || []).filter((w) => w.active !== false);
  }, [waxColors]);

  // Active selected aroma
  const [selectedAroma, setSelectedAroma] = useState<AromaItem>(() => {
    if (initialProduct?.customDetails?.aromaName) {
      const match = aromas.find(
        (a) =>
          a.name.toLowerCase() === initialProduct.customDetails?.aromaName?.toLowerCase() ||
          a.id === initialProduct.customDetails?.aromaId
      );
      if (match) return match;
    }
    return aromas[0] || ({} as AromaItem);
  });

  const [selectedBotanicals, setSelectedBotanicals] = useState<BotanicalOption[]>(() => {
    if (initialProduct?.botanicals && initialProduct.botanicals.length > 0) {
      const matches = availableBotanicals.filter((b) =>
        initialProduct.botanicals.some((name) => name.toLowerCase().includes(b.name.toLowerCase()) || b.name.toLowerCase().includes(name.toLowerCase()))
      );
      if (matches.length >= 2) return matches.slice(0, 5);
    }
    return availableBotanicals.slice(0, 3);
  });

  const [labelTitle, setLabelTitle] = useState<string>(
    initialProduct?.customLabelTitle || initialProduct?.name || "Vela Silvestre de Luna"
  );

  const [labelSubtitle, setLabelSubtitle] = useState<string>(
    initialProduct?.customLabelSubtitle || "Para iluminar tus momentos de calma y reconexión"
  );

  const [selectedPaperStyle, setSelectedPaperStyle] = useState<LabelStyleOption>(
    labelStyles[0] || {} as LabelStyleOption
  );

  const [noDedication, setNoDedication] = useState<boolean>(false);

  const [includeGiftWrap, setIncludeGiftWrap] = useState<boolean>(false);

  // Active layers computation: priority to selectedCandle (configured by admin in dashboard), then selectedFigure, then selectedVessel
  const activeLayers: Layer2D[] = useMemo(() => {
    const raw =
      selectedCandle?.layers2D && selectedCandle.layers2D.length > 0
        ? selectedCandle.layers2D
        : selectedFigure?.layers2D && selectedFigure.layers2D.length > 0
        ? selectedFigure.layers2D
        : selectedVessel?.layers2D && selectedVessel.layers2D.length > 0
        ? selectedVessel.layers2D
        : [];

    return [...raw].sort((a, b) => {
      const za = a.zIndex ?? 0;
      const zb = b.zIndex ?? 0;
      if (za !== zb) return za - zb;
      return (a.id || "").localeCompare(b.id || "");
    });
  }, [selectedCandle?.layers2D, selectedFigure?.layers2D, selectedVessel?.layers2D]);

  const activeBackgroundImage =
    selectedCandle?.backgroundImage !== undefined && selectedCandle?.backgroundImage !== ""
      ? selectedCandle.backgroundImage
      : selectedFigure?.backgroundImage !== undefined && selectedFigure?.backgroundImage !== ""
      ? selectedFigure.backgroundImage
      : selectedCandle?.customizer2DConfig?.backgroundImage || "";

  const activeBackgroundOpacity =
    selectedCandle?.backgroundOpacity ??
    selectedFigure?.backgroundOpacity ??
    selectedCandle?.customizer2DConfig?.backgroundOpacity ??
    1;

  const activeWickX =
    selectedCandle?.wickX ??
    selectedFigure?.wickX ??
    selectedCandle?.customizer2DConfig?.wickX ??
    31;

  const activeWickY =
    selectedCandle?.wickY ??
    selectedFigure?.wickY ??
    selectedCandle?.customizer2DConfig?.wickY ??
    59;

  const activeBotanicalsX =
    selectedCandle?.botanicalsX ??
    selectedFigure?.botanicalsX ??
    selectedCandle?.customizer2DConfig?.botanicalsX ??
    31;

  const activeBotanicalsY =
    selectedCandle?.botanicalsY ??
    selectedFigure?.botanicalsY ??
    selectedCandle?.customizer2DConfig?.botanicalsY ??
    67;

  const activeBotanicalsRadius =
    selectedCandle?.botanicalsRadius ??
    selectedFigure?.botanicalsRadius ??
    selectedCandle?.customizer2DConfig?.botanicalsRadius ??
    11;

  // Independent per-layer customization colors (isolated from admin templates)
  const [customLayerColors, setCustomLayerColors] = useState<Record<string, string>>(() => {
    const initialLayers = initialProduct?.layers2D || (sculptures[0]?.layers2D) || [];
    const defaults: Record<string, string> = {};
    initialLayers.forEach((l) => {
      if (l.colorable && l.defaultColorHex) {
        defaults[l.id] = l.defaultColorHex;
      }
    });
    return defaults;
  });

  const handleLayerColorChange = (layerId: string, colorHex: string) => {
    // Isolated client-side state: does NOT call saveProductsToStorage
    setCustomLayerColors((prev) => ({
      ...prev,
      [layerId]: colorHex,
    }));
  };

  const handleResetLayerColor = (layerId: string) => {
    setCustomLayerColors((prev) => {
      const next = { ...prev };
      delete next[layerId];
      return next;
    });
  };

  // Keep customLayerColors populated whenever activeLayers changes
  useEffect(() => {
    if (activeLayers.length > 0) {
      setCustomLayerColors((prev) => {
        let changed = false;
        const next = { ...prev };
        activeLayers.forEach((l) => {
          const isFrasco = (l.type || getLayerCategory(l)) === "frasco";
          if ((l.colorable || isFrasco) && !next[l.id]) {
            next[l.id] = l.defaultColorHex || selectedVesselColorHex || selectedWaxColor.hex || "#FAF7F2";
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [activeLayers, selectedWaxColor.hex, selectedVesselColorHex]);

  // 2D Visualizer state
  const [isLit, setIsLit] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"top" | "front">("front");

  // Botanical category tab filter for Step 5
  const [botanicalCategoryFilter, setBotanicalCategoryFilter] = useState<
    "todos" | "Salida" | "Corazón" | "Fondo"
  >("todos");

  // Added to cart feedback modal
  const [showAddedSuccess, setShowAddedSuccess] = useState<boolean>(false);

  // Handle selecting a figure in Step 1
  const handleSelectFigure = (figure: SculptedFigure) => {
    setSelectedFigure(figure);

    // Fuzzy matching to find corresponding candle product
    const figureType = (figure.sculptureType || figure.id.replace("fig-", "").split("-")[0]).toLowerCase();
    const fNameNorm = figure.name.toLowerCase();
    const matchedCandle = candles.find((c) => {
      if (c.sculptureType === figure.id || c.sculptureType === figure.sculptureType) return true;
      if (figureType && (c.sculptureType?.toLowerCase() === figureType || c.id.toLowerCase().includes(figureType))) return true;
      const cNameNorm = c.name.toLowerCase();
      if (cNameNorm.includes(fNameNorm) || fNameNorm.includes(cNameNorm)) return true;
      const keywords = ["santuario", "zorro", "panda", "osito", "loto", "virgen"];
      for (const kw of keywords) {
        if (fNameNorm.includes(kw) && (cNameNorm.includes(kw) || c.id.toLowerCase().includes(kw))) {
          return true;
        }
      }
      return false;
    });

    if (matchedCandle) {
      setSelectedCandle(matchedCandle);
      if (matchedCandle.waxColorHex) {
        const matchColor = waxColors.find(
          (w) => w.hex.toLowerCase() === matchedCandle.waxColorHex?.toLowerCase()
        );
        if (matchColor) setSelectedWaxColor(matchColor);
      }
      if (matchedCandle.customLabelTitle || matchedCandle.name) {
        setLabelTitle(matchedCandle.customLabelTitle || matchedCandle.name);
      }
    } else {
      setSelectedCandle((prev) => ({
        ...prev,
        sculptureType: figure.id,
        layers2D: figure.layers2D,
        name: `Vela Esculpida • ${figure.name}`,
      }));
    }

    // Initialize customer layer colors with effective layers
    const effectiveFigLayers =
      (matchedCandle?.layers2D && matchedCandle.layers2D.length > 0)
        ? matchedCandle.layers2D
        : (figure.layers2D && figure.layers2D.length > 0)
        ? figure.layers2D
        : [];

    if (effectiveFigLayers.length > 0) {
      const defaults: Record<string, string> = {};
      effectiveFigLayers.forEach((l) => {
        if (l.colorable && l.defaultColorHex) {
          defaults[l.id] = l.defaultColorHex;
        }
      });
      setCustomLayerColors(defaults);
    }
  };

  // Handle selecting a catalog model
  const handleSelectCandle = (candle: CandleProduct) => {
    setSelectedCandle(candle);
    
    // Find matching vessel or create representation
    const matchedVessel = vessels.find(
      (v) => v.id === candle.templateType || v.id === candle.id || v.name.toLowerCase() === candle.name.toLowerCase()
    );
    if (matchedVessel) {
      setSelectedVessel(matchedVessel);
    }

    // Sync wax color if defined on product
    if (candle.waxColorHex) {
      const matchColor = waxColors.find(
        (w) => w.hex.toLowerCase() === candle.waxColorHex?.toLowerCase()
      );
      if (matchColor) setSelectedWaxColor(matchColor);
    }
    if (candle.waxType) {
      setSelectedWaxType(candle.waxType);
    }
    if (candle.customLabelTitle || candle.name) {
      setLabelTitle(candle.customLabelTitle || candle.name);
    }

    // Also sync selectedFigure so references and fallbacks match the candle
    const matchedFig = sculptures.find(
      (s) => s.id === candle.sculptureType || s.sculptureType === candle.sculptureType || s.id === candle.id
    );
    if (matchedFig) {
      setSelectedFigure(matchedFig);
    } else {
      setSelectedFigure({
        id: candle.id,
        name: candle.name,
        subtitle: candle.subtitle,
        description: candle.description,
        sculptureType: candle.sculptureType || "custom",
        priceAddon: 0,
        image: candle.image,
        layers2D: candle.layers2D,
        wickX: candle.wickX,
        wickY: candle.wickY,
        botanicalsX: candle.botanicalsX,
        botanicalsY: candle.botanicalsY,
        botanicalsRadius: candle.botanicalsRadius,
        waxMaskPolygon: candle.waxMaskPolygon,
      });
    }

    // Reset custom layer colors to this candle's layer defaults
    const effLayers = candle.layers2D || matchedFig?.layers2D || [];
    if (effLayers.length > 0) {
      const defaults: Record<string, string> = {};
      effLayers.forEach((l) => {
        if (l.colorable && l.defaultColorHex) {
          defaults[l.id] = l.defaultColorHex;
        }
      });
      setCustomLayerColors(defaults);
    }
  };

  // Keep defaults updated if catalog changes or Firestore loads
  useEffect(() => {
    if (candles.length > 0) {
      setSelectedCandle((prev) => {
        if (!prev?.id) return candles[0];
        const fresh = candles.find((c) => c.id === prev.id);
        return fresh || candles[0];
      });
    }
  }, [candles]);

  useEffect(() => {
    if (sculptures.length > 0) {
      setSelectedFigure((prev) => {
        if (!prev?.id) return sculptures[0];
        const fresh = sculptures.find((s) => s.id === prev.id);
        return fresh || sculptures[0];
      });
    }
  }, [sculptures]);

  useEffect(() => {
    if (vessels.length > 0 && !vessels.some((v) => v.id === selectedVessel.id)) {
      setSelectedVessel(vessels[0]);
    }
    if (waxColors.length > 0 && !waxColors.some((w) => w.id === selectedWaxColor.id)) {
      setSelectedWaxColor(waxColors[0]);
    }
    if (labelStyles.length > 0 && !labelStyles.some((l) => l.id === selectedPaperStyle.id)) {
      setSelectedPaperStyle(labelStyles[0]);
    }
  }, [vessels, waxColors, labelStyles]);

  // Flame & Audio toggles
  const handleToggleLit = () => {
    const next = !isLit;
    setIsLit(next);
    if (next) {
      woodSoundEngine.start();
      woodSoundEngine.setVolume(0.25);
      setIsPlayingAudio(true);
    } else {
      woodSoundEngine.stop();
      setIsPlayingAudio(false);
    }
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      woodSoundEngine.stop();
      setIsPlayingAudio(false);
    } else {
      woodSoundEngine.start();
      woodSoundEngine.setVolume(0.35);
      setIsPlayingAudio(true);
    }
  };

  // Botanical Selection Toggle (Limit: 2 to 5)
  const toggleBotanical = (botanical: BotanicalOption) => {
    const exists = selectedBotanicals.some((b) => b.id === botanical.id);
    if (exists) {
      if (selectedBotanicals.length <= 2) {
        alert("Se recomienda un mínimo de 2 botánicos para equilibrar la pirámide olfativa.");
        return;
      }
      setSelectedBotanicals((prev) => prev.filter((b) => b.id !== botanical.id));
    } else {
      if (selectedBotanicals.length >= 5) {
        alert("Máximo 5 botánicos permitidos para evitar saturación de aromas.");
        return;
      }
      setSelectedBotanicals((prev) => [...prev, botanical]);
    }
  };

  // Price Calculation
  const figurePrice = selectedFigure?.priceAddon || 0.0;
  const basePrice = (selectedCandle?.price || 22.0) + figurePrice;
  const botanicalsPrice = selectedBotanicals.reduce((sum, b) => sum + (b.priceAddon || 0), 0);
  const giftWrapPrice = includeGiftWrap ? 4.0 : 0.0;
  const totalPrice = basePrice + botanicalsPrice + giftWrapPrice;

  // Reset to Defaults
  const handleResetRecipe = () => {
    if (sculptures.length > 0) setSelectedFigure(sculptures[0]);
    if (candles.length > 0) setSelectedCandle(candles[0]);
    if (waxColors.length > 0) setSelectedWaxColor(waxColors[0]);
    setSelectedWaxType("Soja");
    if (aromas.length > 0) setSelectedAroma(aromas[0]);
    setSelectedBotanicals(availableBotanicals.slice(0, 3));
    setLabelTitle("Vela Silvestre de Luna");
    setLabelSubtitle("Para iluminar tus momentos de calma y reconexión");
    setNoDedication(false);
    if (labelStyles.length > 0) setSelectedPaperStyle(labelStyles[0]);
    setIncludeGiftWrap(false);
    setCurrentStep(1);
    setIsLit(false);
    setIsPlayingAudio(false);
  };

  // Finish & Add to Cart
  const handleAddToCart = () => {
    const olfactoryPyramid = {
      salida: selectedBotanicals.filter((b) => b.category === "Salida").map((b) => b.name).join(", ") || "Cítricos y Frescor",
      corazon: selectedBotanicals.filter((b) => b.category === "Corazón").map((b) => b.name).join(", ") || "Flores Silvestres",
      fondo: selectedBotanicals.filter((b) => b.category === "Fondo").map((b) => b.name).join(", ") || "Madera y Resinas",
    };

    const activeFrascoName = frascoLayers.length > 0
      ? frascoLayers[0].name
      : (selectedFigure?.name ? `Base ${selectedFigure.name}` : "Base Integrada");

    const effectiveTitle = noDedication
      ? "Ayllu"
      : (labelTitle.trim() || selectedFigure?.name || selectedCandle?.name || "Vela Personalizada Ayllu");
    const effectiveSubtitle = noDedication ? "" : labelSubtitle.trim();

    const candleProduct: CandleProduct = {
      id: `custom-candle-${Date.now()}`,
      name: effectiveTitle,
      subtitle: `${selectedFigure?.name || selectedCandle?.name || "Vela"} • ${activeFrascoName} • ${selectedWaxColor.name}`,
      tagline: `Fórmula exclusiva personalizada con ${selectedBotanicals.length} botánicos`,
      price: totalPrice,
      weightGrams: selectedCandle?.weightGrams || 280,
      burnHours: 60,
      image: selectedFigure?.image || selectedCandle?.image || frascoLayers[0]?.imageUrl || "",
      mainImage: selectedFigure?.image || selectedCandle?.mainImage || frascoLayers[0]?.imageUrl || "",
      vesselColor: selectedWaxColor.hex,
      vesselName: activeFrascoName,
      waxType: selectedWaxType,
      category: "Personalizada",
      olfactoryPyramid,
      ingredients: ["Cera de Soja 100% Pura", "Aceites Esenciales Botánicos", "Extractos Naturales"],
      botanicals: selectedBotanicals.map((b) => b.name),
      description: `Creación botánica personalizada con motivo esculpido ${selectedFigure?.name || 'artesanal'}, vertida con cera de ${selectedWaxType.toLowerCase()} y mecha de algodón 100% orgánico.`,
      artisanNote: noDedication
        ? "Grabado oficial estándar Ayllu (sin dedicatoria personalizada)."
        : `Fórmula exclusiva: "${effectiveTitle}" - Dedicatoria: "${effectiveSubtitle}".`,
      rating: 5.0,
      reviewsCount: 1,
      inStock: true,
      waxColorName: selectedWaxColor.name,
      waxColorHex: selectedWaxColor.hex,
      wickType: "Algodón 100% Orgánico",
      customLabelTitle: effectiveTitle,
      customLabelSubtitle: effectiveSubtitle,
      sculptureType: selectedFigure?.id,
      layers2D: selectedFigure?.layers2D?.length ? selectedFigure.layers2D : selectedCandle?.layers2D,
    };

    const activeLayers = selectedFigure?.layers2D?.length
      ? selectedFigure.layers2D
      : (selectedCandle?.layers2D || []);

    const customLayersDetail = activeLayers
      .filter((l) => l.colorable)
      .map((l) => {
        const hex = customLayerColors[l.id] || l.defaultColorHex || selectedWaxColor.hex;
        const matchedWax = waxColors.find((w) => w.hex.toLowerCase() === hex.toLowerCase());
        return {
          id: l.id,
          name: l.name,
          colorHex: hex,
          colorName: matchedWax?.name || hex,
        };
      });

    const customItem: CartItem = {
      candle: candleProduct,
      quantity: 1,
      selectedWaxType: selectedWaxType,
      giftWrap: includeGiftWrap,
      selectedWaxColor: {
        name: selectedWaxColor.name,
        hex: selectedWaxColor.hex,
      },
      customLayerColors: { ...customLayerColors },
      customDetails: {
        waxType: selectedWaxType,
        vesselName: activeFrascoName,
        waxColorName: selectedWaxColor.name,
        waxColorHex: selectedWaxColor.hex,
        customLayerColors: { ...customLayerColors },
        customLayersDetail,
        wickName: COTTON_WICK.name,
        wickPriceAddon: 0,
        aromaName: selectedAroma?.name,
        aromaId: selectedAroma?.id,
        aromaColor: selectedAroma?.accentColor,
        aromaFamily: selectedAroma?.family,
        botanicalsList: selectedBotanicals.map((b) => b.name),
        labelTitle: effectiveTitle,
        labelSubtitle: effectiveSubtitle,
        labelStyle: selectedPaperStyle.name,
        giftWrap: includeGiftWrap,
        totalPrice: totalPrice,
        olfactoryPyramid,
      },
    };

    onAddToCart(customItem);
    setShowAddedSuccess(true);
    setTimeout(() => {
      setShowAddedSuccess(false);
      if (onClose) onClose();
    }, 2000);
  };

  // Layers of type "frasco" for the active design
  const frascoLayers: Layer2D[] = useMemo(() => {
    return activeLayers.filter((l) => (l.type || getLayerCategory(l)) === "frasco");
  }, [activeLayers]);

  // Colorable layers for the candle (cera, figura, etc. - excluding frasco layers customized in Step 2)
  const candleColorableLayers: Layer2D[] = useMemo(() => {
    return activeLayers.filter((l) => l.colorable && (l.type || getLayerCategory(l)) !== "frasco");
  }, [activeLayers]);

  // All colorable layers available for customization in Step 3
  const layersForColorStep: Layer2D[] = useMemo(() => {
    if (candleColorableLayers.length > 0) return candleColorableLayers;
    return activeLayers.filter((l) => l.colorable);
  }, [candleColorableLayers, activeLayers]);

  // Dynamic Steps Definition: Consistent 5-step wizard
  interface WizardStep {
    id: string;
    number: number;
    type: "figure" | "frasco" | "color" | "wax_color" | "layer_color" | "aroma" | "label";
    label: string;
    subtitle: string;
    icon: any;
  }

  // Allowed tones strictly limited to administrator configuration for the frasco layer or "Colores de Vela"
  const getFrascoAllowedTones = (frasco?: Layer2D) => {
    if (!frasco) return adminWaxColors;

    // 1. Explicit allowedColors configured on the layer
    if (frasco.allowedColors && frasco.allowedColors.length > 0) {
      return frasco.allowedColors.map((c, idx) => ({
        id: `frasco-tone-${idx}`,
        name: c.name,
        hex: c.hex,
      }));
    }

    // 2. Explicit allowedColorHexes configured on the layer
    if (frasco.allowedColorHexes && frasco.allowedColorHexes.length > 0) {
      const matched = adminWaxColors.filter((w) =>
        frasco.allowedColorHexes?.some((h) => h.toLowerCase() === w.hex.toLowerCase())
      );
      if (matched.length > 0) return matched;
      return frasco.allowedColorHexes.map((hex, idx) => {
        const match = adminWaxColors.find((w) => w.hex.toLowerCase() === hex.toLowerCase());
        return {
          id: `hex-tone-${idx}`,
          name: match?.name || `Tono ${idx + 1}`,
          hex,
        };
      });
    }

    // 3. Fallback: colors configured by admin in "Colores de Vela"
    return adminWaxColors;
  };

  const steps: WizardStep[] = useMemo(() => {
    return [
      {
        id: "step-figura",
        number: 1,
        type: "figure",
        label: "Figura Esculpida",
        subtitle: "Diseño & Modelo 2D",
        icon: Sparkles,
      },
      {
        id: "step-color",
        number: 2,
        type: "color",
        label: "Color de Cera & Capas",
        subtitle: layersForColorStep.length > 1
          ? `${layersForColorStep.length} Capas Personalizables`
          : "Tono Mineral de la Cera",
        icon: Sliders,
      },
      {
        id: "step-vaso",
        number: 3,
        type: "frasco",
        label: "Color del Envase",
        subtitle: frascoLayers.length > 0 ? "Tono del Frasco" : "Tono de la Base",
        icon: Palette,
      },
      {
        id: "step-aroma",
        number: 4,
        type: "aroma",
        label: "Aroma & Botánicos",
        subtitle: "Esencia & Flores",
        icon: Sparkles,
      },
      {
        id: "step-etiqueta",
        number: 5,
        type: "label",
        label: "Etiqueta & Regalo",
        subtitle: "Dedicatoria",
        icon: Tag,
      },
    ];
  }, [layersForColorStep.length, frascoLayers.length]);

  // Keep currentStep bounded
  useEffect(() => {
    if (currentStep > steps.length) {
      setCurrentStep(steps.length);
    }
  }, [steps.length, currentStep]);

  const activeStepObj = steps[currentStep - 1] || steps[0];

  // Effective layers with frasco layers ensured colorable for real-time live preview
  const effectiveLayersWithFrascoColorable = useMemo(() => {
    return activeLayers.map((l) =>
      (l.type || getLayerCategory(l)) === "frasco" ? { ...l, colorable: true } : l
    );
  }, [activeLayers]);

  // Customization payload for VisorSidebar
  const effectiveFigure: SculptedFigure = {
    ...(selectedFigure || sculptures[0] || ({} as SculptedFigure)),
    layers2D: effectiveLayersWithFrascoColorable,
    backgroundImage: activeBackgroundImage,
    backgroundOpacity: activeBackgroundOpacity,
    wickX: activeWickX,
    wickY: activeWickY,
    botanicalsX: activeBotanicalsX,
    botanicalsY: activeBotanicalsY,
    botanicalsRadius: activeBotanicalsRadius,
  };

  const effectiveCandle: CandleProduct = {
    ...(selectedCandle || candles[0] || ({} as CandleProduct)),
    layers2D: effectiveLayersWithFrascoColorable,
    backgroundImage: activeBackgroundImage,
    backgroundOpacity: activeBackgroundOpacity,
    wickX: activeWickX,
    wickY: activeWickY,
    botanicalsX: activeBotanicalsX,
    botanicalsY: activeBotanicalsY,
    botanicalsRadius: activeBotanicalsRadius,
  };

  const customizationPayload: VisorCustomization = {
    vessel: {
      ...selectedVessel,
      layers2D: effectiveLayersWithFrascoColorable,
      backgroundImage: activeBackgroundImage,
      backgroundOpacity: activeBackgroundOpacity,
      image: selectedVessel.image,
      base2DImage: selectedVessel.base2DImage || selectedVessel.image,
    },
    vesselColorHex: selectedVesselColorHex,
    waxColor: selectedWaxColor,
    waxType: selectedWaxType,
    wick: COTTON_WICK,
    botanicals: selectedBotanicals,
    title: labelTitle,
    dedication: labelSubtitle,
    paperStyle: selectedPaperStyle,
    includeGiftWrap: includeGiftWrap,
    noDedication: noDedication,
    isLit: isLit,
    isPlayingAudio: isPlayingAudio,
    viewMode: viewMode,
    selectedProduct: effectiveCandle,
    figure: effectiveFigure,
    customLayerColors,
  };

  // Filter botanicals for step 4
  const filteredBotanicals =
    botanicalCategoryFilter === "todos"
      ? availableBotanicals
      : availableBotanicals.filter((b) => b.category === botanicalCategoryFilter);

  return (
    <section className="py-8 sm:py-12 bg-[#FAF7F2] text-[#423D33] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Added Feedback Toast */}
        {showAddedSuccess && (
          <div className="fixed top-8 right-8 z-50 bg-[#423D33] text-white px-6 py-4 rounded-3xl shadow-2xl border border-[#D9C5B2]/30 flex items-center gap-3 animate-bounce">
            <CheckCircle2 className="w-6 h-6 text-[#D9C5B2]" />
            <div>
              <p className="font-serif font-bold text-sm">¡Vela Agregada a la Cesta!</p>
              <p className="text-[11px] text-[#D9C5B2]">
                {labelTitle} • ${totalPrice.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#8C7A6B] bg-white/80 px-3 py-1 rounded-full border border-[#E5E0DA]">
            Atelier Interactivo • Paso a Paso
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#423D33] tracking-tight">
            Personaliza tu Vela Botánica 2D
          </h2>
          <p className="text-xs sm:text-sm text-[#8C7A6B] leading-relaxed">
            Sigue los {steps.length} pasos guiados para diseñar tu figura esculpida, el color de cada capa de cera, el tono del envase, la esencia aromática y tu dedicatoria impresa.
          </p>
        </div>

        {/* =========================================================================
            WIZARD STEP PROGRESS TABS BAR
            ========================================================================= */}
        <div className="bg-white rounded-3xl p-2.5 sm:p-3 shadow-xs border border-[#E5E0DA] mb-8 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[640px] gap-2">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isPast = currentStep > step.number;

              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setCurrentStep(step.number)}
                  className={`flex-1 py-2.5 px-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#423D33] text-white shadow-xs"
                      : isPast
                      ? "bg-[#FAF7F2] text-[#423D33] hover:bg-[#F2EDE7]"
                      : "text-[#8C7A6B] hover:bg-[#FAF7F2]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? "bg-[#8C7A6B] text-white"
                        : isPast
                        ? "bg-[#8C7A6B]/20 text-[#8C7A6B]"
                        : "bg-[#E5E0DA] text-[#8C7A6B]"
                    }`}
                  >
                    {isPast ? <Check className="w-3 h-3" /> : step.number}
                  </div>
                  <span className="truncate">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            MAIN 2-COLUMN LAYOUT: WIZARD OPTIONS (LEFT) & VISOR 2D/LABEL (RIGHT)
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =====================================================================
              LEFT COLUMN: OPTIONS OF THE CURRENT ACTIVE STEP
              ===================================================================== */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E0DA] shadow-xs space-y-6 min-h-[480px] flex flex-col justify-between">
              {/* STEP 1: FIGURA ESCULPIDA 2D */}
              {activeStepObj.type === "figure" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-[#E5E0DA]/80 pb-4">
                    <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                      Paso {activeStepObj.number} de {steps.length}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#423D33]">
                      Elección de Modelo & Figura Esculpida 2D
                    </h3>
                    <p className="text-xs text-[#8C7A6B] mt-1">
                      Selecciona la figura tallada en relieve botánico (Virgen, Zorro, Osito, o esculturas del taller). El visor 2D cargará inmediatamente su relieve, capas y anclajes.
                    </p>
                  </div>

                  {/* Collection Candles Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider">
                      <span>Modelos de la Colección ({candles.length}):</span>
                      <span className="text-[10px] font-normal normal-case italic">
                        Haz clic para previsualizar relieve 2D
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
                      {candles.map((candle) => {
                        const isSelected = selectedCandle?.id === candle.id;
                        const hasLayers = candle.layers2D && candle.layers2D.length > 0;
                        return (
                          <div
                            key={candle.id}
                            id={`wizard-candle-${candle.id}`}
                            onClick={() => handleSelectCandle(candle)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between relative group ${
                              isSelected
                                ? "bg-[#FAF7F2] border-[#8C7A6B] ring-2 ring-[#8C7A6B]/20 shadow-xs"
                                : "bg-white border-[#E5E0DA] hover:border-[#8C7A6B]/40 hover:bg-[#FAF7F2]/50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-16 h-16 rounded-xl bg-[#F4EFEA] border border-[#E5E0DA] overflow-hidden shrink-0 flex items-center justify-center p-1">
                                {Boolean(candle.image && candle.image.trim()) ? (
                                  <img
                                    src={candle.image}
                                    alt={candle.name}
                                    referrerPolicy="no-referrer"
                                    className="object-contain max-h-full max-w-full m-auto group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <span className="text-[10px] font-bold text-[#8C7A6B]">
                                    {candle.name.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="flex items-center justify-between gap-1">
                                  <h4 className="font-serif text-xs sm:text-sm font-bold text-[#423D33] truncate">
                                    {candle.name}
                                  </h4>
                                  <span className="font-serif text-xs font-bold text-[#423D33] bg-[#E5E0DA]/50 px-2 py-0.5 rounded-lg shrink-0">
                                    ${candle.price.toFixed(2)}
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#8C7A6B] truncate">
                                  {candle.subtitle || candle.category || "Vela botánica esculpida"}
                                </p>
                                <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                                  {hasLayers ? (
                                    <span className="text-[9px] font-bold text-[#8C7A6B] bg-[#8C7A6B]/10 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                      <Layers className="w-2.5 h-2.5" />
                                      <span>{candle.layers2D!.length} Capas 2D</span>
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-[#8C7A6B] bg-stone-100 px-1.5 py-0.5 rounded-md">
                                      Modelo Base
                                    </span>
                                  )}
                                  {candle.sculptureType && (
                                    <span className="text-[9px] text-[#8C7A6B]">
                                      • Escultura {candle.sculptureType}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-[#E5E0DA]/60 flex items-center justify-between text-[10px] text-[#8C7A6B]">
                              <span className="truncate max-w-[180px] italic">
                                {candle.tagline || candle.description?.slice(0, 45) || "Relieve artesanal para vertido"}
                              </span>
                              {isSelected ? (
                                <span className="font-bold text-[#8C7A6B] flex items-center gap-1 shrink-0">
                                  <Check className="w-3 h-3" /> Seleccionada
                                </span>
                              ) : (
                                <span className="text-[#8C7A6B]/70 group-hover:text-[#423D33]">
                                  Elegir modelo →
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* INFORMATIONAL BADGE IN STEP 1 */}
                  {activeLayers.some((l) => l.colorable) && (
                    <div className="p-3.5 rounded-2xl bg-[#F7F5F0] border border-[#D9C5B2]/60 shadow-xs flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-[#8C7A6B]" />
                        <span className="text-xs font-medium text-[#423D33]">
                          Este diseño cuenta con <strong>{activeLayers.filter((l) => l.colorable).length} {activeLayers.filter((l) => l.colorable).length === 1 ? 'capa con color personalizable' : 'capas con colores personalizables'}</strong>.
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-[#8C7A6B] bg-white border border-[#E5E0DA] px-2.5 py-1 rounded-full shrink-0">
                        Se configuran en el Paso 2
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: COLOR DE CERA & CAPAS ESCULPIDAS (Nuevo Paso 2) */}
              {(activeStepObj.type === "color" || activeStepObj.type === "layer_color" || activeStepObj.type === "wax_color") && (
                <div className="space-y-6 animate-fade-in" id="customizer-step-2-color">
                  <div className="border-b border-[#E5E0DA]/80 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                        Paso {activeStepObj.number} de {steps.length}
                      </span>
                      {layersForColorStep.length > 0 && (
                        <span className="text-[11px] font-bold bg-[#FAF7F2] text-[#8C7A6B] px-3 py-1 rounded-full border border-[#E5E0DA]">
                          {layersForColorStep.length} {layersForColorStep.length === 1 ? "Capa Colorable" : "Capas Colorables"}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#423D33] mt-1">
                      {layersForColorStep.length > 1
                        ? "Colores de Cera & Capas del Diseño"
                        : "Color de Cera & Capas"}
                    </h3>
                    <p className="text-xs text-[#8C7A6B] mt-1">
                      {layersForColorStep.length > 1
                        ? "Personaliza el tono de cada capa o relieve del diseño por separado. Cada capa dispone de su propio selector con la paleta de colores de vela del administrador."
                        : "Personaliza la tonalidad de cera para este modelo con la paleta de colores del administrador."}
                    </p>
                  </div>

                  {/* Multiple Layers: Independent Color Selector for EACH colorable layer */}
                  {layersForColorStep.length > 0 ? (
                    <div className="space-y-5">
                      {layersForColorStep.map((layer, layerIdx) => {
                        const cat = layer.type || getLayerCategory(layer);
                        const currentColor = customLayerColors[layer.id] || layer.defaultColorHex || "#FAF7F2";
                        const matchedTone = adminWaxColors.find(
                          (w) => w.hex.toLowerCase() === currentColor.toLowerCase()
                        );
                        const isDefault =
                          !customLayerColors[layer.id] ||
                          (layer.defaultColorHex &&
                            customLayerColors[layer.id]?.toLowerCase() === layer.defaultColorHex.toLowerCase());

                        let catBadge = "Capa Esculpida";
                        if (cat === "cera") catBadge = "Capa de Cera";
                        else if (cat === "figura") catBadge = "Capa de Figura";
                        else if (cat === "frasco") catBadge = "Capa de Base";

                        return (
                          <div
                            key={layer.id}
                            className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E5E0DA] shadow-xs space-y-4"
                            id={`layer-color-selector-${layer.id}`}
                          >
                            {/* Layer Header */}
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-9 h-9 rounded-2xl border-2 border-white shadow-xs shrink-0 transition-colors"
                                  style={{ backgroundColor: currentColor }}
                                />
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-serif text-sm sm:text-base font-bold text-[#423D33]">
                                      {layer.name}
                                    </h4>
                                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#8C7A6B] border border-[#E5E0DA]">
                                      {catBadge} #{layerIdx + 1}
                                    </span>
                                  </div>
                                  <span className="text-xs text-[#8C7A6B]">
                                    Color activo:{" "}
                                    <strong className="text-[#423D33]">
                                      {matchedTone?.name || currentColor}
                                    </strong>
                                  </span>
                                </div>
                              </div>

                              {!isDefault && (
                                <button
                                  type="button"
                                  onClick={() => handleResetLayerColor(layer.id)}
                                  className="px-3 py-1.5 rounded-xl border border-[#E5E0DA] text-xs font-semibold text-[#8C7A6B] hover:text-[#423D33] hover:bg-[#FAF7F2] transition-all flex items-center gap-1.5 cursor-pointer bg-white shrink-0"
                                  title="Restablecer al tono por defecto"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Restablecer</span>
                                </button>
                              )}
                            </div>

                            {/* Only Admin-Defined Colors in Swatches Grid */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider">
                                <span>Tonos de Cera Disponibles ({adminWaxColors.length}):</span>
                                <span className="text-[10px] font-normal normal-case italic">
                                  Elige el color para {layer.name}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[260px] overflow-y-auto pr-1">
                                {adminWaxColors.map((tone) => {
                                  const isSelected = currentColor.toLowerCase() === tone.hex.toLowerCase();
                                  return (
                                    <button
                                      key={`${layer.id}-${tone.id || tone.hex}`}
                                      type="button"
                                      onClick={() => handleLayerColorChange(layer.id, tone.hex)}
                                      className={`p-2.5 rounded-2xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                                        isSelected
                                          ? "bg-[#FAF7F2] border-[#8C7A6B] ring-2 ring-[#8C7A6B]/20 font-bold shadow-xs"
                                          : "bg-white border-[#E5E0DA] hover:border-[#8C7A6B]/40 hover:bg-[#FAF7F2]/50"
                                      }`}
                                    >
                                      <span
                                        className="w-5 h-5 rounded-full border border-black/10 shrink-0 shadow-2xs flex items-center justify-center"
                                        style={{ backgroundColor: tone.hex }}
                                      >
                                        {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <span className="text-xs text-[#423D33] truncate block font-medium">
                                          {tone.name}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {/* Fallback Wax Color if no layers are colorable */}
                  {layersForColorStep.length === 0 && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                        Tonalidades de Cera Disponibles ({adminWaxColors.length}):
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {adminWaxColors.map((color) => {
                          const isSelected = selectedWaxColor.id === color.id || selectedWaxColor.hex.toLowerCase() === color.hex.toLowerCase();
                          return (
                            <div
                              key={color.id || color.hex}
                              onClick={() => setSelectedWaxColor(color)}
                              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                                isSelected
                                  ? "bg-[#FAF7F2] border-[#8C7A6B] ring-2 ring-[#8C7A6B]/20 shadow-xs"
                                  : "bg-white border-[#E5E0DA] hover:bg-[#FAF7F2]/50"
                              }`}
                            >
                              <div
                                className="w-8 h-8 rounded-full border border-black/10 shrink-0 shadow-2xs mt-0.5"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div className="flex-1 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-serif text-xs font-bold text-[#423D33]">
                                    {color.name}
                                  </h4>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-[#8C7A6B]" />}
                                </div>
                                <p className="text-[10px] text-[#8C7A6B]">{color.subtitle}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Wax Type Selection */}
                  <div className="space-y-2 pt-2 border-t border-[#E5E0DA]/60">
                    <label className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                      Composición de la Cera:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          id: "Soja",
                          label: "Cera de Soja 100% Virgen",
                          desc: "100% vegetal, ecológica, libre de toxinas y combustión limpia.",
                        },
                        {
                          id: "Parafina",
                          label: "Parafina Refinada Pura",
                          desc: "Máxima proyección de perfume y firmeza geométrica impecable.",
                        },
                      ].map((item) => {
                        const isSelected = selectedWaxType === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedWaxType(item.id as WaxType)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-[#FAF7F2] border-[#8C7A6B] ring-2 ring-[#8C7A6B]/20 shadow-xs"
                                : "bg-white border-[#E5E0DA] hover:bg-[#FAF7F2]/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-serif text-xs font-bold text-[#423D33]">
                                {item.label}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#8C7A6B]" />}
                            </div>
                            <p className="text-[10px] text-[#8C7A6B] mt-1 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: COLOR DEL ENVASE (FRASCO) (Nuevo Paso 3) */}
              {activeStepObj.type === "frasco" && (
                <div className="space-y-6 animate-fade-in" id="customizer-step-3-envase">
                  <div className="border-b border-[#E5E0DA]/80 pb-4">
                    <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                      Paso {activeStepObj.number} de {steps.length}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#423D33] mt-1">
                      Color del Envase
                    </h3>
                    <p className="text-xs text-[#8C7A6B] mt-1">
                      Elige el tono mineral para el envase artesanal (capa de frasco) de tu vela. Los colores disponibles están estrictamente limitados a los configurados por el taller.
                    </p>
                  </div>

                  {frascoLayers.length > 0 ? (
                    <div className="space-y-5">
                      {frascoLayers.map((frasco) => {
                        const allowedTones = getFrascoAllowedTones(frasco);
                        const activeColor =
                          customLayerColors[frasco.id] ||
                          frasco.defaultColorHex ||
                          selectedVesselColorHex ||
                          allowedTones[0]?.hex ||
                          "#FAF7F2";
                        const activeToneObj =
                          allowedTones.find((t) => t.hex.toLowerCase() === activeColor.toLowerCase()) ||
                          adminWaxColors.find((w) => w.hex.toLowerCase() === activeColor.toLowerCase());

                        return (
                          <div
                            key={frasco.id}
                            className="p-4 sm:p-6 rounded-3xl bg-white border border-[#E5E0DA] shadow-xs space-y-5"
                            id={`frasco-layer-card-${frasco.id}`}
                          >
                            {/* Layer header & preview thumbnail */}
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#F7F5F0] border border-[#E5E0DA] overflow-hidden shrink-0 flex items-center justify-center p-2 relative shadow-2xs">
                                {frasco.imageUrl ? (
                                  <SingleLayerRenderer
                                    imageUrl={frasco.imageUrl}
                                    colorHex={activeColor}
                                    isColorable={true}
                                    className="object-contain max-h-full max-w-full m-auto transition-all duration-300"
                                    alt={frasco.name}
                                  />
                                ) : (
                                  <Palette className="w-8 h-8 text-[#8C7A6B]" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#423D33]">
                                    {frasco.name}
                                  </h4>
                                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                    Capa de Envase
                                  </span>
                                </div>
                                <p className="text-xs text-[#8C7A6B]">
                                  Tono del envase o recipiente artesanal para el vertido botánico.
                                </p>
                                <div className="pt-1 flex items-center gap-2 flex-wrap text-[11px]">
                                  <span className="text-[#8C7A6B] font-medium">Tono activo:</span>
                                  <span className="inline-flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E5E0DA] px-2.5 py-0.5 rounded-full font-medium text-[#423D33]">
                                    <span
                                      className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                                      style={{ backgroundColor: activeColor }}
                                    />
                                    {activeToneObj?.name || activeColor}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Exclusive allowed colors selector - strictly limited to admin colors, no free hex inputs */}
                            <div className="pt-4 border-t border-[#E5E0DA]/80 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#423D33] uppercase tracking-wider flex items-center gap-1.5">
                                  <Palette className="w-3.5 h-3.5 text-[#8C7A6B]" />
                                  Colores Permitidos ({allowedTones.length}):
                                </span>
                                <span className="text-[10px] text-[#8C7A6B] bg-[#FAF7F2] border border-[#E5E0DA] px-2 py-0.5 rounded-md">
                                  Paleta Oficial del Taller
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                {allowedTones.map((tone) => {
                                  const isToneActive = activeColor.toLowerCase() === tone.hex.toLowerCase();
                                  return (
                                    <button
                                      key={tone.id || tone.hex}
                                      type="button"
                                      id={`btn-tone-${frasco.id}-${tone.hex.replace("#", "")}`}
                                      onClick={() => {
                                        handleLayerColorChange(frasco.id, tone.hex);
                                        setSelectedVesselColorHex(tone.hex);
                                      }}
                                      className={`p-2.5 sm:p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                                        isToneActive
                                          ? "bg-[#FAF7F2] border-[#423D33] ring-2 ring-[#423D33]/20 shadow-xs font-bold"
                                          : "bg-white border-[#E5E0DA] hover:border-[#8C7A6B]/50 hover:bg-[#FAF7F2]/60"
                                      }`}
                                    >
                                      <span
                                        className="w-6 h-6 rounded-full border border-black/15 shrink-0 flex items-center justify-center shadow-2xs"
                                        style={{ backgroundColor: tone.hex }}
                                      >
                                        {isToneActive && <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />}
                                      </span>
                                      <span className="text-xs font-medium text-[#423D33] truncate">
                                        {tone.name}
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
                  ) : (
                    /* Fallback when candle has no layer labeled frasco */
                    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E5E0DA] shadow-xs space-y-5">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-14 h-14 rounded-2xl border border-black/10 flex items-center justify-center shadow-xs shrink-0"
                          style={{ backgroundColor: selectedVesselColorHex }}
                        >
                          <Palette className="w-7 h-7 text-[#423D33] drop-shadow-xs" />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <h4 className="font-serif text-base font-bold text-[#423D33]">
                            Envase / Recipiente Base
                          </h4>
                          <p className="text-xs text-[#8C7A6B]">
                            Selecciona el tono artesanal para el envase de tu vela.
                          </p>
                          <div className="pt-1 flex items-center gap-2 flex-wrap text-[11px]">
                            <span className="text-[#8C7A6B] font-medium">Tono activo:</span>
                            <span className="inline-flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E5E0DA] px-2.5 py-0.5 rounded-full font-medium text-[#423D33]">
                              <span
                                className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: selectedVesselColorHex }}
                              />
                              {adminWaxColors.find((w) => w.hex.toLowerCase() === selectedVesselColorHex.toLowerCase())?.name || selectedVesselColorHex}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#E5E0DA]/80 space-y-3">
                        <span className="text-xs font-bold text-[#423D33] uppercase tracking-wider flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-[#8C7A6B]" />
                          Colores Disponibles ({adminWaxColors.length}):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                          {adminWaxColors.map((tone) => {
                            const isToneActive = selectedVesselColorHex.toLowerCase() === tone.hex.toLowerCase();
                            return (
                              <button
                                key={tone.id || tone.hex}
                                type="button"
                                id={`btn-vessel-color-${tone.hex.replace("#", "")}`}
                                onClick={() => setSelectedVesselColorHex(tone.hex)}
                                className={`p-2.5 sm:p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                                  isToneActive
                                    ? "bg-[#FAF7F2] border-[#423D33] ring-2 ring-[#423D33]/20 shadow-xs font-bold"
                                    : "bg-white border-[#E5E0DA] hover:border-[#8C7A6B]/50 hover:bg-[#FAF7F2]/60"
                                }`}
                              >
                                <span
                                  className="w-6 h-6 rounded-full border border-black/15 shrink-0 flex items-center justify-center shadow-2xs"
                                  style={{ backgroundColor: tone.hex }}
                                >
                                  {isToneActive && <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />}
                                </span>
                                <span className="text-xs font-medium text-[#423D33] truncate">
                                  {tone.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AROMA & BOTÁNICOS STEP */}
              {activeStepObj.type === "aroma" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-[#E5E0DA]/80 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                        Paso {activeStepObj.number} de {steps.length}
                      </span>
                      <span className="text-[11px] font-bold bg-[#FAF7F2] text-[#8C7A6B] px-3 py-1 rounded-full border border-[#E5E0DA]">
                        {selectedBotanicals.length}/5 Botánicos Seleccionados
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#423D33] mt-1">
                      Aroma & Botánicos de la Vela
                    </h3>
                    <p className="text-xs text-[#8C7A6B] mt-1">
                      Elige la esencia aromática principal para tu vela (con su tono aromático característico) y selecciona los botánicos secos para coronar la superficie.
                    </p>
                  </div>

                  {/* Esencias Aromáticas Grid with Color Indicator */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider">
                      <span>Esencia Aromática Principal ({aromas.length}):</span>
                      {selectedAroma && (
                        <span className="text-[10px] font-normal normal-case italic flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: selectedAroma.accentColor || "#8C7A6B" }}
                          />
                          {selectedAroma.name} ({selectedAroma.family})
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1">
                      {aromas.map((aroma) => {
                        const isSelected = selectedAroma?.id === aroma.id;
                        return (
                          <div
                            key={aroma.id}
                            onClick={() => setSelectedAroma(aroma)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected
                                ? "bg-[#FAF7F2] border-[#8C7A6B] ring-2 ring-[#8C7A6B]/20 shadow-xs"
                                : "bg-white border-[#E5E0DA] hover:bg-[#FAF7F2]/50"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-2xs"
                                    style={{ backgroundColor: aroma.accentColor || "#8C7A6B" }}
                                    title={`Tono aromático: ${aroma.name}`}
                                  />
                                  <h4 className="font-serif text-xs sm:text-sm font-bold text-[#423D33]">
                                    {aroma.name}
                                  </h4>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#8C7A6B] shrink-0" />}
                              </div>
                              <p className="text-[10px] text-[#8C7A6B] mt-0.5">{aroma.family}</p>
                              <p className="text-[11px] text-[#423D33]/80 mt-1 leading-relaxed line-clamp-2">
                                {aroma.description}
                              </p>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-[#E5E0DA]/50 flex items-center justify-between text-[9px] text-[#8C7A6B]">
                              <div className="flex flex-wrap gap-1">
                                {aroma.notes.slice(0, 3).map((n, i) => (
                                  <span key={i} className="bg-stone-100 px-1.5 py-0.5 rounded text-[9px]">
                                    {n}
                                  </span>
                                ))}
                              </div>
                              <span className="font-semibold text-[#423D33]">
                                Intensidad {aroma.intensity}/5
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Corona de Botánicos Secos */}
                  <div className="space-y-2 pt-2 border-t border-[#E5E0DA]/80">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider">
                      <span>Corona de Botánicos Secos ({selectedBotanicals.length}/5 seleccionados):</span>
                      <span className="text-[10px] font-normal normal-case italic">
                        Elige de 2 a 5 flores e ingredientes
                      </span>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {(["todos", "Salida", "Corazón", "Fondo"] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setBotanicalCategoryFilter(cat)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                            botanicalCategoryFilter === cat
                              ? "bg-[#423D33] text-white shadow-2xs"
                              : "bg-[#FAF7F2] text-[#8C7A6B] hover:bg-[#F2EDE7]"
                          }`}
                        >
                          {cat === "todos" ? "Todos" : `Notas de ${cat}`}
                        </button>
                      ))}
                    </div>

                    {/* Botanical Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[240px] overflow-y-auto pr-1">
                      {filteredBotanicals.map((botanical) => {
                        const isSelected = selectedBotanicals.some((b) => b.id === botanical.id);
                        return (
                          <div
                            key={botanical.id}
                            onClick={() => toggleBotanical(botanical)}
                            className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected
                                ? "bg-[#FAF7F2] border-[#8C7A6B] ring-2 ring-[#8C7A6B]/20 shadow-xs"
                                : "bg-white border-[#E5E0DA] hover:bg-[#FAF7F2]/50"
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                                    style={{ backgroundColor: botanical.color }}
                                  />
                                  <h4 className="font-serif text-xs font-bold text-[#423D33] truncate">
                                    {botanical.name}
                                  </h4>
                                </div>
                                {isSelected ? (
                                  <div className="w-4 h-4 rounded-full bg-[#8C7A6B] text-white flex items-center justify-center shrink-0">
                                    <Check className="w-2.5 h-2.5" />
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-[#8C7A6B]">
                                    {botanical.priceAddon > 0 ? `+$${botanical.priceAddon}` : "Gratis"}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[#8C7A6B] mt-1 line-clamp-2">
                                {botanical.description}
                              </p>
                            </div>

                            <div className="mt-2 pt-1 border-t border-[#E5E0DA]/50 flex items-center justify-between text-[9px] text-[#8C7A6B]">
                              <span className="uppercase tracking-wider">{botanical.category}</span>
                              <span className="italic">{botanical.scentFamily}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP: ETIQUETA & REGALO */}
              {activeStepObj.type === "label" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-[#E5E0DA]/80 pb-4">
                    <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                      Paso {activeStepObj.number} de {steps.length}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#423D33]">
                      Personalización de Etiqueta & Dedicatoria
                    </h3>
                    <p className="text-xs text-[#8C7A6B] mt-1">
                      Escribe el nombre de tu creación y la dedicatoria para imprimir en papel artesanal.
                    </p>
                  </div>

                  {/* Paper Style Selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                      Textura de Papel Botánico:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {labelStyles.map((style) => {
                        const isSelected = selectedPaperStyle.id === style.id;
                        return (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => setSelectedPaperStyle(style)}
                            className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                              isSelected
                                ? "bg-[#FAF7F2] border-[#8C7A6B] ring-2 ring-[#8C7A6B]/20 font-bold shadow-2xs text-[#423D33]"
                                : "bg-white border-[#E5E0DA] text-[#423D33]/70 hover:bg-[#FAF7F2]"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-md border ${
                                style.id === "kraft"
                                  ? "bg-[#D8C4B0] border-[#B59E87]"
                                  : style.id === "lino"
                                  ? "bg-[#F3EFE9] border-[#D6CECE]"
                                  : style.id === "negro"
                                  ? "bg-[#23201D] border-[#4A433D]"
                                  : "bg-[#C4A482] border-[#9E7B5A]"
                              }`}
                            />
                            <span className="text-[11px] leading-tight truncate w-full">
                              {style.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Option to Skip Dedication / Message */}
                  <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E5E0DA] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={noDedication}
                          onChange={(e) => setNoDedication(e.target.checked)}
                          className="w-4 h-4 rounded text-[#8C7A6B] focus:ring-[#8C7A6B] cursor-pointer"
                        />
                        <div className="flex items-center gap-1.5">
                          <MessageSquareOff className="w-4 h-4 text-[#8C7A6B]" />
                          <span className="text-xs font-bold text-[#423D33]">
                            No quiero dedicatoria
                          </span>
                        </div>
                      </label>

                      <button
                        type="button"
                        onClick={() => setNoDedication((prev) => !prev)}
                        className="text-[11px] font-semibold text-[#8C7A6B] hover:text-[#423D33] hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto"
                      >
                        <FastForward className="w-3 h-3" />
                        <span>{noDedication ? "Quiero personalizar dedicatoria" : "Saltar este paso"}</span>
                      </button>
                    </div>

                    {/* Notice when skipping dedication */}
                    {noDedication && (
                      <div className="p-3 bg-[#F4EFEA] border border-[#8C7A6B]/30 rounded-xl flex items-start gap-2.5 text-[#5C5346] text-xs leading-relaxed animate-fade-in">
                        <Info className="w-4 h-4 text-[#8C7A6B] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#423D33]">
                            Tu pedido se enviará únicamente con el grabado estándar de la palabra Ayllu.
                          </p>
                          <p className="text-[11px] text-[#8C7A6B] mt-0.5">
                            La etiqueta conservará la estética artesanal limpia de la marca y puedes continuar directamente a agregar tu vela a la cesta sin llenar ningún campo.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Fields (only when customer wants dedication/custom title) */}
                  {!noDedication && (
                    <div className="space-y-3">
                      {/* Title */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <Type className="w-3.5 h-3.5" />
                            <span>Título / Nombre de la Vela</span>
                          </span>
                          <span className={labelTitle.length >= 32 ? "text-red-500 font-bold" : ""}>
                            {labelTitle.length}/32
                          </span>
                        </div>
                        <input
                          type="text"
                          maxLength={32}
                          value={labelTitle}
                          onChange={(e) => setLabelTitle(e.target.value)}
                          placeholder="Ej. Vela Silvestre de Luna"
                          className="w-full p-3 rounded-2xl border border-[#E5E0DA] bg-[#FAF7F2] text-sm font-serif text-[#423D33] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8C7A6B]/20"
                        />
                      </div>

                      {/* Dedication */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <PenTool className="w-3.5 h-3.5" />
                            <span>Dedicatoria o Mensaje Especial</span>
                          </span>
                          <span className={labelSubtitle.length >= 48 ? "text-red-500 font-bold" : ""}>
                            {labelSubtitle.length}/48
                          </span>
                        </div>
                        <input
                          type="text"
                          maxLength={48}
                          value={labelSubtitle}
                          onChange={(e) => setLabelSubtitle(e.target.value)}
                          placeholder="Ej. Para iluminar tus momentos de calma y reconexión"
                          className="w-full p-3 rounded-2xl border border-[#E5E0DA] bg-[#FAF7F2] text-sm text-[#423D33] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8C7A6B]/20"
                        />
                      </div>
                    </div>
                  )}

                  {/* Gift Wrap Checkbox */}
                  <label className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5E0DA] flex items-center justify-between cursor-pointer hover:bg-[#F2EDE7] transition-all">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={includeGiftWrap}
                        onChange={(e) => setIncludeGiftWrap(e.target.checked)}
                        className="w-4 h-4 rounded text-[#8C7A6B] focus:ring-[#8C7A6B] cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#423D33] flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-[#8C7A6B]" />
                          <span>Añadir Presentación de Regalo Especial</span>
                        </span>
                        <p className="text-[10px] text-[#8C7A6B]">
                          Caja kraft sellada con lacre botánico, ramitas de lavanda y cinta de lino.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-serif text-[#423D33] bg-white px-2 py-0.5 rounded-lg border border-[#E5E0DA]">
                      +$4.00
                    </span>
                  </label>
                </div>
              )}

              {/* =====================================================================
                  BOTTOM NAVIGATION CONTROLS (ANTERIOR, SIGUIENTE, AGREGAR A LA CESTA)
                  ===================================================================== */}
              <div className="pt-6 border-t border-[#E5E0DA] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
                      className="px-4 py-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2EDE7] text-[#423D33] text-xs font-semibold flex items-center gap-1.5 border border-[#E5E0DA] transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Anterior</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResetRecipe}
                      className="px-3 py-2 rounded-2xl text-[11px] text-[#8C7A6B] hover:text-[#423D33] hover:bg-[#FAF7F2] transition-colors flex items-center gap-1 cursor-pointer"
                      title="Restablecer valores por defecto"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span className="hidden sm:inline">Restablecer</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Dynamic Total Price Pill */}
                  <div className="text-right">
                    <span className="text-[10px] text-[#8C7A6B] block uppercase tracking-wider">
                      Total Personalizado:
                    </span>
                    <span className="font-serif text-lg font-bold text-[#423D33]">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>

                  {currentStep < steps.length ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => Math.min(prev + 1, steps.length))}
                      className="px-6 py-2.5 rounded-2xl bg-[#423D33] hover:bg-[#2A2620] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <span>Siguiente</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="px-6 py-2.5 rounded-2xl bg-[#8C7A6B] hover:bg-[#786657] text-white text-xs font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Agregar a la Cesta</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================================
              RIGHT COLUMN: VISOR 2D / ETIQUETA EN TIEMPO REAL
              ===================================================================== */}
          <div className="lg:col-span-5">
            <VisorSidebar
              currentStep={currentStep}
              totalSteps={steps.length}
              customization={customizationPayload}
              onToggleLit={handleToggleLit}
              onToggleAudio={handleToggleAudio}
              onViewModeChange={(mode) => setViewMode(mode)}
              onStepChange={(step) => setCurrentStep(step)}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
