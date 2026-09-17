import React, { useState } from "react";
import {
  Shield,
  Package,
  Sparkles,
  Users,
  ShoppingBag,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  DollarSign,
  Palette,
  Flame,
  Search,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  LogOut,
  Sliders,
  Send,
  Phone,
  Mail,
  MapPin,
  FileText,
  UserCheck,
  UserX,
  Filter,
  UserPlus,
  Building2,
  CreditCard,
  Truck,
  Receipt,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Tag,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Printer,
  Info,
  ListOrdered,
  Layers,
  Star,
  ArrowUp,
  ArrowDown,
  MessageSquare,
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { CandleProduct, Collaborator, AromaItem, StoreOrder, UserAccount, OrderStatus, UserRole, WaxType, Layer2D, SculptedFigure, WaxColorOption, BrandConfig } from "../types";
import { ImageUploadField } from "./ImageUploadField";
import { Product2DResources } from "./Product2DResourceManager";
import { Unified2DModelManager } from "./Unified2DModelManager";
import { SANTUARIO_VIRGEN_LAYERS, ZORRO_BOSQUE_LAYERS } from "../data/sampleLayers2D";
import { AdminCustomizerManager } from "./AdminCustomizerManager";
import { compressImage } from "../utils/imageCompressor";
import { SupabaseSettingsTab } from "./SupabaseSettingsTab";
import { FooterSettingsTab } from "./FooterSettingsTab";
import { Database } from "lucide-react";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const {
    brandConfig,
    updateBrandConfig,
    resetBrandConfig,
    candles,
    addCandle,
    updateCandle,
    deleteCandle,
    saveCandleAsync,
    saveProductsToStorage,
    collaborators,
    addCollaborator,
    updateCollaborator,
    deleteCollaborator,
    saveCollaboratorsToStorage,
    aromas,
    addAroma,
    updateAroma,
    deleteAroma,
    users,
    currentUser,
    registerUser,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    orders,
    updateOrderStatus,
    deleteOrder,
    logoutUser,
    sculptures,
    addSculpture,
    updateSculpture,
    deleteSculpture,
    waxColors,
    addWaxColor,
    updateWaxColor,
    deleteWaxColor,
    toggleWaxColorActive,
    reviews,
    deleteReview,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    "resumen" | "productos" | "destacados" | "personalizador" | "aromas" | "coloresVela" | "creadores" | "pedidos" | "usuarios" | "marca" | "comentarios" | "supabase" | "piePagina"
  >("resumen");

  // Reviews moderation states
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number | "all">("all");
  const [reviewDeleteConfirmId, setReviewDeleteConfirmId] = useState<string | null>(null);

  // Product Editing & Creating states
  const [editingCandle, setEditingCandle] = useState<CandleProduct | null>(null);
  const [isAddingCandle, setIsAddingCandle] = useState(false);
  const [isSavingCandle, setIsSavingCandle] = useState(false);
  const [candleSearch, setCandleSearch] = useState("");
  const [candleImageInput, setCandleImageInput] = useState<string>("");
  const [candleWaxMaskInput, setCandleWaxMaskInput] = useState<string>("M 19 60.5 Q 31 62.8 42.5 60.5 L 40.5 76 Q 30.5 78.5 21 76 Z");
  const [candle2DResources, setCandle2DResources] = useState<Product2DResources | null>(null);
  const [candleLayers2D, setCandleLayers2D] = useState<Layer2D[]>([]);

  // Sculpted Figure CRUD states
  const [isCreatingFigure, setIsCreatingFigure] = useState(false);
  const [newFigureName, setNewFigureName] = useState("");
  const [newFigureSubtitle, setNewFigureSubtitle] = useState("");
  const [newFigureImage, setNewFigureImage] = useState("");
  const [newFigurePriceAddon, setNewFigurePriceAddon] = useState<number>(0);
  const [selectedSculptureId, setSelectedSculptureId] = useState<string>("zorro");

  // Collaborator Editing & Creating states
  const [editingCollab, setEditingCollab] = useState<Collaborator | null>(null);
  const [isAddingCollab, setIsAddingCollab] = useState(false);
  const [collabImageInput, setCollabImageInput] = useState<string>("");

  // Aroma Editing & Creating states
  const [editingAroma, setEditingAroma] = useState<AromaItem | null>(null);
  const [isAddingAroma, setIsAddingAroma] = useState(false);
  const [aromaColorInput, setAromaColorInput] = useState<string>("#8C7A6B");

  // Wax Color (Colores de Vela) Editing & Creating states
  const [editingWaxColor, setEditingWaxColor] = useState<WaxColorOption | null>(null);
  const [isAddingWaxColor, setIsAddingWaxColor] = useState(false);
  const [waxColorHex, setWaxColorHex] = useState<string>("#FAF7F2");
  const [waxColorAccent, setWaxColorAccent] = useState<string>("#8C7A6B");

  // User Management State (Search, Filters, New User Modal)
  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<"todos" | "activo" | "suspendido" | "administrador" | "cliente">("todos");
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("cliente");

  // Orders Filter, Search and Detail Modal State
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("todos");
  const [orderViewMode, setOrderViewMode] = useState<"table" | "cards">("table");
  const [selectedOrderIdForModal, setSelectedOrderIdForModal] = useState<string | null>(null);
  const [expandedOrderIds, setExpandedOrderIds] = useState<string[]>([]);
  const [receiptModalUrl, setReceiptModalUrl] = useState<string | null>(null);

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Brand Form State
  const [brandForm, setBrandForm] = useState(brandConfig);

  React.useEffect(() => {
    setBrandForm(brandConfig);
  }, [brandConfig]);

  // Success Toast state
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (!isOpen) return null;

  // STRICT ROLE GATEWAY: Admin Only
  if (!currentUser || currentUser.role !== "administrador") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-4 border border-[#E5E0DA] shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#423D33]">
            Acceso Restringido
          </h3>
          <p className="text-xs text-[#423D33]/70 leading-relaxed">
            Este panel de administración está reservado exclusivamente para cuentas autorizadas con rol de administrador.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-[#4A4541] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#35312E] transition-colors"
          >
            Volver a la Tienda
          </button>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, ord) => sum + ord.total, 0);
  const activeOrdersCount = orders.filter(
    (o) => o.status === "Pendiente" || o.status === "En Elaboración"
  ).length;
  const inStockCandlesCount = candles.filter((c) => c.inStock).length;

  // Unified Candle Edit Opener: restores image, layers, background, and anchors
  const handleStartEditingCandle = (candle: CandleProduct) => {
    setEditingCandle(candle);
    setCandleImageInput(candle.image);
    setCandleWaxMaskInput(candle.waxMaskPolygon || "M 19 60.5 Q 31 62.8 42.5 60.5 L 40.5 76 Q 30.5 78.5 21 76 Z");

    const matchedSculpture = sculptures.find(
      (s) => s.id === candle.sculptureType || s.name.toLowerCase() === candle.name.toLowerCase()
    );
    if (matchedSculpture) {
      setSelectedSculptureId(matchedSculpture.id);
    } else if (candle.sculptureType) {
      setSelectedSculptureId(candle.sculptureType);
    }

    let effectiveLayers =
      candle.layers2D && candle.layers2D.length > 0
        ? candle.layers2D
        : matchedSculpture?.layers2D && matchedSculpture.layers2D.length > 0
        ? matchedSculpture.layers2D
        : candle.sculptureType === "santuario" || candle.id.includes("santuario")
        ? SANTUARIO_VIRGEN_LAYERS
        : candle.sculptureType === "zorro" || candle.id.includes("zorro")
        ? ZORRO_BOSQUE_LAYERS
        : [];

    // Filter out Santuario de Lavanda layers if attached to Oso
    if (candle.id === "vela-custom-1789491779825" || candle.name?.toLowerCase().includes("oso")) {
      effectiveLayers = effectiveLayers.filter(
        (l) => !l.imageUrl?.includes("WhatsApp_Image_2026-09-09_at_4.46.35_PM")
      );
    }

    // Ensure Jirafa layer has valid Supabase URL and is personalizable (colorable: true)
    if (candle.id === "vela-custom-1789490882289" || candle.name?.toLowerCase().includes("jirafa")) {
      effectiveLayers = effectiveLayers.map((l) => ({
        ...l,
        imageUrl: l.imageUrl?.startsWith("/uploads")
          ? "https://girkotyqtshrrhtbvkky.supabase.co/storage/v1/object/public/candle-assets/layers/1789530253583_layer-1789490384951_Jirafa.png"
          : l.imageUrl,
        colorable: true,
        defaultColorHex: l.defaultColorHex || "#D49B55",
      }));
    }

    setCandleLayers2D(effectiveLayers);
    setCandle2DResources({
      base2DImage: "",
      backgroundImage: candle.backgroundImage !== undefined ? candle.backgroundImage : (candle.customizer2DConfig?.backgroundImage || ""),
      backgroundOpacity: candle.backgroundOpacity ?? candle.customizer2DConfig?.backgroundOpacity ?? 1,
      waxMaskPolygon: candle.waxMaskPolygon || "M 19 60.5 Q 31 62.8 42.5 60.5 L 40.5 76 Q 30.5 78.5 21 76 Z",
      wickX: candle.wickX ?? matchedSculpture?.wickX ?? candle.customizer2DConfig?.wickX ?? 31,
      wickY: candle.wickY ?? matchedSculpture?.wickY ?? candle.customizer2DConfig?.wickY ?? 59,
      botanicalsX: candle.botanicalsX ?? matchedSculpture?.botanicalsX ?? candle.customizer2DConfig?.botanicalsX ?? 31,
      botanicalsY: candle.botanicalsY ?? matchedSculpture?.botanicalsY ?? candle.customizer2DConfig?.botanicalsY ?? 67,
      botanicalsRadius: candle.botanicalsRadius ?? matchedSculpture?.botanicalsRadius ?? candle.customizer2DConfig?.botanicalsRadius ?? 11,
    });
    setIsAddingCandle(false);
    setActiveTab("productos");
  };

  // Candle Submit Handler
  const handleSaveCandle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingCandle(true);
    const formData = new FormData(e.currentTarget);

    const chosenImage = candleImageInput || (editingCandle?.image || candles[0]?.image);
    const assignedCollabId = (formData.get("collaboratorId") as string) || (collaborators[0]?.id || "");
    const assignedCollab = collaborators.find((c) => c.id === assignedCollabId);

    const rawSecondary = (formData.get("secondaryImages") as string) || "";
    const parsedSecondary = rawSecondary
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const fullImagesList = [chosenImage, ...parsedSecondary.filter((s) => s !== chosenImage)];

    const finalBase2DImage = "";
    const finalBackgroundImage =
      candle2DResources !== null && candle2DResources?.backgroundImage !== undefined
        ? candle2DResources.backgroundImage
        : typeof formData.get("backgroundImage") === "string"
        ? (formData.get("backgroundImage") as string)
        : editingCandle?.backgroundImage || "";
    const finalBackgroundOpacity = candle2DResources?.backgroundOpacity ?? editingCandle?.backgroundOpacity ?? 1;
    const finalWaxMaskPolygon =
      (formData.get("waxMaskPolygon") as string) ||
      candle2DResources?.waxMaskPolygon ||
      candleWaxMaskInput ||
      editingCandle?.waxMaskPolygon ||
      "M 19 60.5 Q 31 62.8 42.5 60.5 L 40.5 76 Q 30.5 78.5 21 76 Z";
    const finalWickX = Number(formData.get("wickX")) || (candle2DResources?.wickX ?? editingCandle?.wickX ?? 31);
    const finalWickY = Number(formData.get("wickY")) || (candle2DResources?.wickY ?? editingCandle?.wickY ?? 59);
    const finalBotanicalsX = Number(formData.get("botanicalsX")) || (candle2DResources?.botanicalsX ?? editingCandle?.botanicalsX ?? 31);
    const finalBotanicalsY = Number(formData.get("botanicalsY")) || (candle2DResources?.botanicalsY ?? editingCandle?.botanicalsY ?? 67);
    const finalBotanicalsRadius = Number(formData.get("botanicalsRadius")) || (candle2DResources?.botanicalsRadius ?? editingCandle?.botanicalsRadius ?? 11);

    const rawPrice = formData.get("price") as string;
    const parsedPrice = parseFloat(rawPrice);
    const finalPrice = !isNaN(parsedPrice) ? Number(parsedPrice.toFixed(2)) : (editingCandle?.price || 18);

    const candleData: CandleProduct = {
      id: editingCandle ? editingCandle.id : `vela-custom-${Date.now()}`,
      code: (formData.get("code") as string) || (editingCandle?.code || "Nº 01"),
      name: (formData.get("name") as string) || "Nueva Vela Artesanal",
      subtitle: (formData.get("subtitle") as string) || "",
      tagline: (formData.get("tagline") as string) || "",
      price: finalPrice,
      weightGrams: Number(formData.get("weightGrams")) || 300,
      burnHours: Number(formData.get("burnHours")) || 60,
      image: chosenImage,
      mainImage: chosenImage,
      images: fullImagesList.length > 0 ? fullImagesList : [chosenImage],
      vesselColor: (formData.get("vesselColor") as string) || "#8C7A6B",
      vesselName: (formData.get("vesselName") as string) || "Vaso de Vidrio Artesanal",
      waxType: (formData.get("waxType") as WaxType) || "Soja",
      category: (formData.get("category") as any) || "Relajación",
      sculptureType: (formData.get("sculptureType") as any) || "zorro",
      collaboratorId: assignedCollabId,
      collaboratorName: assignedCollab ? assignedCollab.name : undefined,
      olfactoryPyramid: {
        salida:
          (formData.get("aroma") as string) ||
          (formData.get("salida") as string) ||
          (editingCandle?.olfactoryPyramid?.salida || ""),
        corazon:
          (formData.get("corazon") as string) ||
          (editingCandle?.olfactoryPyramid?.corazon || ""),
        fondo:
          (formData.get("fondo") as string) ||
          (editingCandle?.olfactoryPyramid?.fondo || ""),
      },
      ingredients: (formData.get("ingredients") as string)
        ? (formData.get("ingredients") as string).split(",").map((s) => s.trim())
        : ["100% Cera de soja virgen", "Mecha de algodón puro", "Aceites botánicos"],
      botanicals: (formData.get("botanicals") as string)
        ? (formData.get("botanicals") as string).split(",").map((s) => s.trim())
        : ["Botánicos secos"],
      description: (formData.get("description") as string) || "",
      artisanNote: (formData.get("artisanNote") as string) || "",
      artistInspiration: (formData.get("artistInspiration") as string) || (editingCandle?.artistInspiration || ""),
      technique: (formData.get("technique") as string) || (editingCandle?.technique || ""),
      designMeaning: (formData.get("designMeaning") as string) || (editingCandle?.designMeaning || ""),
      quote: (formData.get("quote") as string) || (editingCandle?.quote || ""),
      rating: editingCandle ? editingCandle.rating : 5.0,
      reviewsCount: editingCandle ? editingCandle.reviewsCount : 1,
      inStock: formData.get("inStock") === "on",
      featured: formData.get("featured") === "on",
      featuredOrder: Number(formData.get("featuredOrder")) || (editingCandle?.featuredOrder || 1),
      limitedBatchText: (formData.get("limitedBatchText") as string) || (editingCandle?.limitedBatchText || "Tanda de 50 unidades"),
      base2DImage: finalBase2DImage,
      backgroundImage: finalBackgroundImage,
      backgroundOpacity: finalBackgroundOpacity,
      custom2DImageUrl: finalBase2DImage,
      waxMaskPolygon: finalWaxMaskPolygon,
      wickX: finalWickX,
      wickY: finalWickY,
      botanicalsX: finalBotanicalsX,
      botanicalsY: finalBotanicalsY,
      botanicalsRadius: finalBotanicalsRadius,
      layers2D: candleLayers2D,
      customizer2DConfig: {
        enabled: true,
        templateType: (formData.get("sculptureType") as string) || "vaso-vidrio",
        base2DImage: finalBase2DImage,
        backgroundImage: finalBackgroundImage,
        backgroundOpacity: finalBackgroundOpacity,
        custom2DImageUrl: finalBase2DImage,
        waxMaskPolygon: finalWaxMaskPolygon,
        wickX: finalWickX,
        wickY: finalWickY,
        botanicalsX: finalBotanicalsX,
        botanicalsY: finalBotanicalsY,
        botanicalsRadius: finalBotanicalsRadius,
        labelX: 50,
        labelY: 70,
        labelWidth: 60,
        labelHeight: 22,
        botanicalsZone: "scattered",
        defaultWick: "algodon",
        defaultWaxColorHex: "#FAF7F2",
        defaultWaxColorName: "Caliza Blanca",
        allowWickChoice: true,
        allowBotanicalsChoice: true,
        allowLabelCustomization: true,
      },
    };

    try {
      const result = await saveCandleAsync(candleData, Boolean(editingCandle));
      const nextCandles = editingCandle
        ? candles.map((c) => (c.id === candleData.id ? candleData : c))
        : [candleData, ...candles.filter((c) => c.id !== candleData.id)];
      saveProductsToStorage(nextCandles);

      // Two-way sync: update the assigned collaborator's associated candle reference
      if (assignedCollab) {
        updateCollaborator(assignedCollab.id, {
          associatedCandleId: candleData.id,
          associatedCandleName: candleData.name,
        });
      }

      // Automatically sync the associated sculpted figure ONLY if this candle is genuinely mapped to that sculpture template
      const targetSculptureId = (formData.get("sculptureType") as string) || selectedSculptureId || candleData.sculptureType;
      const isCustomCandle = editingCandle?.id.startsWith("vela-custom") || candleData.id?.startsWith("vela-custom");
      if (targetSculptureId && !isCustomCandle) {
        const targetClean = targetSculptureId.toLowerCase().replace("fig-", "").split("-")[0];
        const existingSc = sculptures.find(
          (s) =>
            s.id === targetSculptureId ||
            s.sculptureType === targetSculptureId ||
            (targetClean && (s.id.toLowerCase().includes(targetClean) || s.sculptureType?.toLowerCase() === targetClean))
        );
        if (existingSc && candleData.name.toLowerCase().includes(existingSc.name.toLowerCase())) {
          updateSculpture(existingSc.id, {
            layers2D: candleLayers2D,
            backgroundImage: finalBackgroundImage,
            backgroundOpacity: finalBackgroundOpacity,
            wickX: finalWickX,
            wickY: finalWickY,
            botanicalsX: finalBotanicalsX,
            botanicalsY: finalBotanicalsY,
            botanicalsRadius: finalBotanicalsRadius,
          });
        }
      }

      if (result.success) {
        notify(
          editingCandle
            ? `Vela "${candleData.name}" guardada y persistida en el servidor.`
            : `Nueva vela "${candleData.name}" añadida y guardada en el servidor.`
        );
      } else {
        notify(`Guardado completado con sincronización local.`);
      }
    } catch (err) {
      console.error(err);
      const nextCandles = editingCandle
        ? candles.map((c) => (c.id === candleData.id ? candleData : c))
        : [candleData, ...candles.filter((c) => c.id !== candleData.id)];
      saveProductsToStorage(nextCandles);
      notify(`Vela procesada y guardada localmente.`);
    } finally {
      setIsSavingCandle(false);
      setEditingCandle(null);
      setIsAddingCandle(false);
      setCandleImageInput("");
      setCandleWaxMaskInput("M 19 60.5 Q 31 62.8 42.5 60.5 L 40.5 76 Q 30.5 78.5 21 76 Z");
      setCandle2DResources(null);
    }
  };

  // Sculpted Figure Management Handlers
  const handleCreateFigure = () => {
    if (!newFigureName.trim()) {
      notify("Por favor ingresa un nombre para la nueva figura.");
      return;
    }
    const cleanId = newFigureName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now().toString().slice(-4);
    const newFig: SculptedFigure = {
      id: cleanId,
      name: newFigureName.trim(),
      subtitle: newFigureSubtitle.trim() || "Modelado artesanal botánico",
      description: "Figura esculpida en relieve para velas de colección.",
      image: newFigureImage || candleImageInput || "",
      priceAddon: Number(newFigurePriceAddon) || 0,
      layers2D: candleLayers2D.length > 0 ? [...candleLayers2D] : [],
      wickX: candle2DResources?.wickX ?? 31,
      wickY: candle2DResources?.wickY ?? 59,
      botanicalsX: candle2DResources?.botanicalsX ?? 31,
      botanicalsY: candle2DResources?.botanicalsY ?? 67,
      botanicalsRadius: candle2DResources?.botanicalsRadius ?? 11,
      waxMaskPolygon: candleWaxMaskInput || "M 19 60.5 Q 31 62.8 42.5 60.5 L 40.5 76 Q 30.5 78.5 21 76 Z",
    };
    addSculpture(newFig);
    setSelectedSculptureId(cleanId);
    setIsCreatingFigure(false);
    setNewFigureName("");
    setNewFigureSubtitle("");
    setNewFigureImage("");
    setNewFigurePriceAddon(0);
    notify(`Figura "${newFig.name}" creada y registrada en el catálogo.`);
  };

  const handleSelectSculpture = (id: string) => {
    setSelectedSculptureId(id);
    const fig = sculptures.find((s) => s.id === id);
    if (fig) {
      if (fig.layers2D && fig.layers2D.length > 0) {
        setCandleLayers2D([...fig.layers2D]);
      }
      setCandle2DResources({
        base2DImage: "",
        backgroundImage: fig.backgroundImage || "",
        backgroundOpacity: fig.backgroundOpacity ?? 1,
        waxMaskPolygon: fig.waxMaskPolygon || candleWaxMaskInput || "M 19 60.5 Q 31 62.8 42.5 60.5 L 40.5 76 Q 30.5 78.5 21 76 Z",
        wickX: fig.wickX ?? 31,
        wickY: fig.wickY ?? 59,
        botanicalsX: fig.botanicalsX ?? 31,
        botanicalsY: fig.botanicalsY ?? 67,
        botanicalsRadius: fig.botanicalsRadius ?? 11,
      });
      if (fig.waxMaskPolygon) setCandleWaxMaskInput(fig.waxMaskPolygon);
      notify(`Capas, fondo y anclajes de "${fig.name}" cargados en la vela.`);
    }
  };

  const handleDeleteSculpture = (id: string) => {
    const fig = sculptures.find((s) => s.id === id);
    if (!fig) return;
    if (confirm(`¿Eliminar la figura esculpida "${fig.name}" de la lista global?`)) {
      deleteSculpture(id);
      setSelectedSculptureId(sculptures[0]?.id || "zorro");
      notify(`Figura "${fig.name}" eliminada de la lista global.`);
    }
  };

  const handleSyncCurrentLayersToFigure = () => {
    const fig = sculptures.find((s) => s.id === selectedSculptureId);
    if (!fig) return;
    updateSculpture(selectedSculptureId, {
      layers2D: [...candleLayers2D],
      backgroundImage:
        candle2DResources !== null && candle2DResources?.backgroundImage !== undefined
          ? candle2DResources.backgroundImage
          : fig.backgroundImage || "",
      backgroundOpacity: candle2DResources?.backgroundOpacity ?? fig.backgroundOpacity ?? 1,
      waxMaskPolygon: candleWaxMaskInput,
      wickX: candle2DResources?.wickX ?? 31,
      wickY: candle2DResources?.wickY ?? 59,
      botanicalsX: candle2DResources?.botanicalsX ?? 31,
      botanicalsY: candle2DResources?.botanicalsY ?? 67,
      botanicalsRadius: candle2DResources?.botanicalsRadius ?? 11,
      image: candleImageInput || fig.image,
    });
    notify(`Capas, imagen de fondo y coordenadas sincronizadas con "${fig.name}".`);
  };

  // Collaborator Submit Handler
  const handleSaveCollaborator = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const colors = (formData.get("paletteColors") as string)
      ? (formData.get("paletteColors") as string).split(",").map((s) => s.trim())
      : (editingCollab?.paletteColors || ["#8C7A6B", "#D98B68", "#E8DFD5"]);

    const chosenCollabImage = collabImageInput || (editingCollab?.image || collaborators[0]?.image);

    const associatedCandleId = (formData.get("associatedCandleId") as string) || "";
    const associatedCandle = candles.find((c) => c.id === associatedCandleId);

    const collabData: Collaborator = {
      id: editingCollab ? editingCollab.id : `collab-${Date.now()}`,
      name: (formData.get("name") as string) || "Nuevo Creador",
      age: Number(formData.get("age")) || 20,
      location: (formData.get("location") as string) || "Madrid, España",
      discipline: (formData.get("discipline") as string) || "Ilustración Botánica",
      bio: (formData.get("bio") as string) || "",
      image: chosenCollabImage,
      paletteColors: colors,
      associatedCandleId: associatedCandle ? associatedCandle.id : (editingCollab?.associatedCandleId || undefined),
      associatedCandleName: associatedCandle ? associatedCandle.name : (editingCollab?.associatedCandleName || undefined),
      artistInspiration: (formData.get("artistInspiration") as string) || editingCollab?.artistInspiration || undefined,
      technique: (formData.get("technique") as string) || editingCollab?.technique || undefined,
      designMeaning: (formData.get("designMeaning") as string) || editingCollab?.designMeaning || undefined,
      aromaDesignRelation: (formData.get("aromaDesignRelation") as string) || editingCollab?.aromaDesignRelation || undefined,
      quote: (formData.get("quote") as string) || editingCollab?.quote || undefined,
    };

    if (editingCollab) {
      updateCollaborator(editingCollab.id, collabData);
      const nextCollabs = collaborators.map((c) => (c.id === collabData.id ? collabData : c));
      saveCollaboratorsToStorage(nextCollabs);
      notify(`Ficha de "${collabData.name}" actualizada.`);
    } else {
      addCollaborator(collabData);
      const nextCollabs = [...collaborators.filter((c) => c.id !== collabData.id), collabData];
      saveCollaboratorsToStorage(nextCollabs);
      notify(`Nuevo creador "${collabData.name}" incorporado.`);
    }

    // Two-way sync: if a candle is associated with this collaborator, link the candle to this collaborator
    if (associatedCandle) {
      const updatedCandle: CandleProduct = {
        ...associatedCandle,
        collaboratorId: collabData.id,
        collaboratorName: collabData.name,
      };
      const nextCandles = candles.map((c) => (c.id === associatedCandle.id ? updatedCandle : c));
      saveProductsToStorage(nextCandles);
      saveCandleAsync(updatedCandle, true);
    }

    setEditingCollab(null);
    setIsAddingCollab(false);
    setCollabImageInput("");
  };

  // Aroma Submit Handler
  const handleSaveAroma = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const notes = (formData.get("notes") as string)
      ? (formData.get("notes") as string).split(",").map((s) => s.trim())
      : ["Nota 1", "Nota 2"];

    const aromaData: AromaItem = {
      id: editingAroma ? editingAroma.id : `aroma-${Date.now()}`,
      name: (formData.get("name") as string) || "Nuevo Aroma",
      family: (formData.get("family") as string) || "Floral & Relajación",
      intensity: Number(formData.get("intensity")) || 4,
      notes: notes,
      description: (formData.get("description") as string) || "",
      accentColor: (formData.get("accentColor") as string) || "#8C7A6B",
    };

    if (editingAroma) {
      updateAroma(editingAroma.id, aromaData);
      notify(`Aroma "${aromaData.name}" actualizado.`);
    } else {
      addAroma(aromaData);
      notify(`Nuevo aroma "${aromaData.name}" registrado.`);
    }

    setEditingAroma(null);
    setIsAddingAroma(false);
  };

  // Wax Color (Colores de Vela) Submit Handler
  const handleSaveWaxColor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const colorData: WaxColorOption = {
      id: editingWaxColor ? editingWaxColor.id : `wax-color-${Date.now()}`,
      name: (formData.get("name") as string) || "Nuevo Tono",
      subtitle: (formData.get("subtitle") as string) || "Tono artesanal",
      hex: (formData.get("hex") as string) || waxColorHex,
      accent: (formData.get("accent") as string) || waxColorAccent,
      mood: (formData.get("mood") as string) || "Armonía & Bienestar",
      description: (formData.get("description") as string) || "",
      active: formData.get("active") === "on" || formData.get("active") === "true",
    };

    if (editingWaxColor) {
      updateWaxColor(editingWaxColor.id, colorData);
      notify(`Color de vela "${colorData.name}" actualizado.`);
    } else {
      addWaxColor(colorData);
      notify(`Nuevo color de vela "${colorData.name}" añadido.`);
    }

    setEditingWaxColor(null);
    setIsAddingWaxColor(false);
  };

  // Brand Update Submit
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedForm: BrandConfig = {
      ...brandForm,
      footerSubtitle: brandForm.slogan || brandForm.footerSubtitle,
      footerDescription: brandForm.aboutDescription || brandForm.footerDescription,
    };
    setBrandForm(updatedForm);
    const res = await updateBrandConfig(updatedForm);
    if (res && res.error) {
      console.error("Error al guardar marca en Supabase:", res.error);
      notify(`Guardado localmente. Supabase aviso: ${res.error.message || res.error}`);
    } else {
      notify("Configuración de marca e identidad actualizada y sincronizada.");
    }
  };

  // Handle Add New User
  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert("Por favor complete nombre y correo electrónico.");
      return;
    }
    const res = registerUser({
      name: newUserName,
      email: newUserEmail,
      password: newUserPassword || "123456",
      role: newUserRole,
    });
    if (res.success) {
      notify(`Usuario "${newUserName}" creado exitosamente.`);
      setIsAddingUser(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("cliente");
    } else {
      alert(res.message);
    }
  };

  // Filter Candles
  const filteredCandles = candles.filter(
    (c) =>
      c.name.toLowerCase().includes(candleSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(candleSearch.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(candleSearch.toLowerCase())
  );

  // Filter Users by Search and Status/Role Filters
  const filteredUsers = users.filter((u) => {
    const searchMatch =
      userSearch.trim() === "" ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.city && u.city.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.phone && u.phone.includes(userSearch)) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase());

    if (!searchMatch) return false;

    if (userStatusFilter === "todos") return true;
    if (userStatusFilter === "activo") return u.status === "activo";
    if (userStatusFilter === "suspendido") return u.status === "suspendido";
    if (userStatusFilter === "administrador") return u.role === "administrador";
    if (userStatusFilter === "cliente") return u.role === "cliente";

    return true;
  });

  // Filter Orders by Search and Status
  const filteredOrders = orders.filter((ord) => {
    const searchLower = orderSearch.toLowerCase().trim();
    const matchesSearch =
      searchLower === "" ||
      ord.id.toLowerCase().includes(searchLower) ||
      ord.customerName.toLowerCase().includes(searchLower) ||
      ord.customerEmail.toLowerCase().includes(searchLower) ||
      (ord.customerPhone && ord.customerPhone.includes(searchLower)) ||
      (ord.shippingCity && ord.shippingCity.toLowerCase().includes(searchLower)) ||
      ord.items.some((it) => it.candle.name.toLowerCase().includes(searchLower));

    if (!matchesSearch) return false;

    if (orderStatusFilter === "todos") return true;
    if (orderStatusFilter === "verificacion") return ord.status === "Pendiente de verificación" || ord.status === "Pendiente";
    if (orderStatusFilter === "verificado") return ord.status === "Pago verificado";
    if (orderStatusFilter === "preparacion") return ord.status === "En preparación" || ord.status === "En Elaboración";
    if (orderStatusFilter === "camino") return ord.status === "En camino" || ord.status === "Enviado";
    if (orderStatusFilter === "entregado") return ord.status === "Entregado y cobrado" || ord.status === "Entregado";
    if (orderStatusFilter === "cancelado") return ord.status === "Cancelado";

    return true;
  });

  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case "Pendiente de verificación":
      case "Pendiente":
        return "bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-200";
      case "Pago verificado":
        return "bg-blue-50 text-blue-900 border-blue-300 ring-1 ring-blue-200";
      case "En preparación":
      case "En Elaboración":
        return "bg-purple-50 text-purple-900 border-purple-300 ring-1 ring-purple-200";
      case "En camino":
      case "Enviado":
        return "bg-sky-50 text-sky-900 border-sky-300 ring-1 ring-sky-200";
      case "Entregado y cobrado":
      case "Entregado":
        return "bg-[#608058]/15 text-[#35522e] border-[#608058]/40 ring-1 ring-[#608058]/30";
      case "Cancelado":
        return "bg-red-50 text-red-800 border-red-200 ring-1 ring-red-200";
      default:
        return "bg-stone-100 text-stone-800 border-stone-300";
    }
  };

  const activeUsersCount = users.filter((u) => u.status === "activo").length;
  const suspendedUsersCount = users.filter((u) => u.status === "suspendido").length;
  const adminUsersCount = users.filter((u) => u.role === "administrador").length;
  const clientUsersCount = users.filter((u) => u.role === "cliente").length;

  return (
    <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs overflow-hidden animate-fade-in">
      <div className="bg-[#FAF7F2] w-full h-full max-w-7xl mx-auto my-auto md:my-6 md:rounded-3xl border border-[#E5E0DA] shadow-2xl flex flex-col overflow-hidden relative">
        {/* Toast */}
        {toast && (
          <div className="absolute top-4 right-4 z-50 bg-[#4A4541] text-white px-4 py-2.5 rounded-2xl shadow-lg border border-[#E5E0DA]/40 text-xs font-semibold flex items-center gap-2 animate-bounce">
            <CheckCircle className="w-4 h-4 text-[#D9C5B2]" />
            <span>{toast}</span>
          </div>
        )}

        {/* Top Bar */}
        <header className="p-4 sm:p-5 bg-[#423D33] text-white flex items-center justify-between border-b border-[#35312E] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8C7A6B] text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold">
                  Panel de Administración • {brandConfig.brandName}
                </h2>
                <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#8C7A6B]/30 text-[#D9C5B2] border border-[#D9C5B2]/30 font-bold">
                  Control Total
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                Sesión activa: <span className="text-[#D9C5B2] font-semibold">{currentUser.name}</span> ({currentUser.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-[#423D33] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Tienda</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Cerrar Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Sub Navigation Bar Tabs */}
        <div className="bg-[#F4EFEA] border-b border-[#E5E0DA] px-4 sm:px-6 py-2 overflow-x-auto shrink-0 flex items-center gap-2">
          {[
            { id: "resumen", label: "Resumen & Métricas", icon: Sliders },
            { id: "productos", label: `Productos (${candles.length})`, icon: Package },
            { id: "destacados", label: `⭐ Destacados (${candles.filter((c) => c.featured).length})`, icon: Star },
            { id: "personalizador", label: "Personalizador 2D", icon: Layers },
            { id: "aromas", label: `Aromas (${aromas.length})`, icon: Sparkles },
            { id: "coloresVela", label: `Colores de Vela (${waxColors.length})`, icon: Palette },
            { id: "creadores", label: `Jóvenes Creadores (${collaborators.length})`, icon: Palette },
            { id: "pedidos", label: `Pedidos (${orders.length})`, icon: ShoppingBag },
            { id: "comentarios", label: `Comentarios (${reviews.length})`, icon: MessageSquare },
            { id: "usuarios", label: `Usuarios (${users.length})`, icon: Users },
            { id: "marca", label: "Marca & Identidad", icon: Settings },
            { id: "piePagina", label: "Pie de Página & Contacto", icon: Mail },
            { id: "supabase", label: "Supabase DB", icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#4A4541] text-white shadow-xs"
                    : "text-[#423D33]/75 hover:bg-white hover:text-[#423D33]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dashboard Body / Tab Views */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: RESUMEN */}
          {activeTab === "resumen" && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-[#E5E0DA] shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[#8C7A6B]">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Ventas Totales</span>
                    <DollarSign className="w-4 h-4 text-[#D98B68]" />
                  </div>
                  <div className="font-serif text-3xl font-bold text-[#423D33]">
                    ${totalRevenue}
                  </div>
                  <span className="text-[11px] text-[#608058] font-medium flex items-center gap-1">
                    {orders.length} pedidos procesados
                  </span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-[#E5E0DA] shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[#8C7A6B]">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Pedidos en Curso</span>
                    <ShoppingBag className="w-4 h-4 text-[#D98B68]" />
                  </div>
                  <div className="font-serif text-3xl font-bold text-[#423D33]">
                    {activeOrdersCount}
                  </div>
                  <span className="text-[11px] text-[#8C7A6B]">Pendientes o en elaboración</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-[#E5E0DA] shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[#8C7A6B]">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Catálogo Activo</span>
                    <Package className="w-4 h-4 text-[#8C7A6B]" />
                  </div>
                  <div className="font-serif text-3xl font-bold text-[#423D33]">
                    {candles.length} Velas
                  </div>
                  <span className="text-[11px] text-[#608058]">
                    {inStockCandlesCount} disponibles en stock
                  </span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-[#E5E0DA] shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[#8C7A6B]">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Comunidad Ayllu</span>
                    <Users className="w-4 h-4 text-[#8C7A6B]" />
                  </div>
                  <div className="font-serif text-3xl font-bold text-[#423D33]">
                    {collaborators.length} Creadores
                  </div>
                  <span className="text-[11px] text-[#8C7A6B]">{users.length} usuarios registrados</span>
                </div>
              </div>

              {/* Quick Actions & Recent Orders Bento */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Recent Orders List */}
                <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#E5E0DA] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-[#423D33]">
                      Últimos Pedidos Registrados
                    </h3>
                    <button
                      onClick={() => setActiveTab("pedidos")}
                      className="text-xs text-[#8C7A6B] hover:text-[#423D33] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver Todos</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-[#E5E0DA]/70">
                    {orders.slice(0, 4).map((ord) => (
                      <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#423D33]">{ord.id}</span>
                            <span className="text-[#8C7A6B]">• {ord.customerName}</span>
                          </div>
                          <p className="text-[11px] text-[#423D33]/70">
                            {ord.items.map((i) => `${i.quantity}x ${i.candle.name}`).join(", ")}
                          </p>
                        </div>

                        <div className="text-right space-y-1">
                          <span className="font-bold text-[#423D33] block">${ord.total.toFixed(2)}</span>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeStyle(
                              ord.status
                            )}`}
                          >
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Shortcut Box */}
                <div className="lg:col-span-4 bg-[#F2EDE7] p-6 rounded-3xl border border-[#E5E0DA] space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B]">
                      Acciones Directas
                    </span>
                    <h4 className="font-serif text-lg font-bold text-[#423D33]">
                      Gestión de Ayllu
                    </h4>
                    <p className="text-xs text-[#423D33]/70">
                      Sube fotos desde tu ordenador para nuevos productos, artistas o el logotipo de {brandConfig.brandName}.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setEditingCandle(null);
                        setCandleImageInput("");
                        setIsAddingCandle(true);
                        setActiveTab("productos");
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#4A4541] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#35312E] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Subir Nueva Vela al Catálogo</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingCollab(null);
                        setCollabImageInput("");
                        setIsAddingCollab(true);
                        setActiveTab("creadores");
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-white text-[#423D33] border border-[#E5E0DA] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5 text-[#8C7A6B]" />
                      <span>Registrar Joven Creador</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GESTIÓN DE PRODUCTOS */}
          {activeTab === "productos" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar vela por nombre, aroma o categoría..."
                    value={candleSearch}
                    onChange={(e) => setCandleSearch(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#E5E0DA] bg-white text-[#423D33] focus:outline-none focus:ring-1 focus:ring-[#8C7A6B]"
                  />
                </div>

                <button
                  onClick={() => {
                    setEditingCandle(null);
                    setCandleImageInput("");
                    setCandleWaxMaskInput("polygon(14% 59%, 43% 59%, 40% 77%, 16% 77%)");
                    setCandleLayers2D([]);
                    setCandle2DResources(null);
                    setIsAddingCandle(true);
                  }}
                  className="px-4 py-2 rounded-full bg-[#4A4541] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#35312E] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir Nueva Vela</span>
                </button>
              </div>

              {/* Candles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCandles.map((candle) => (
                  <div
                    key={candle.id}
                    className="bg-white rounded-3xl border border-[#E5E0DA] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F2EDE7] border border-[#E5E0DA] p-2 flex items-center justify-center">
                        {Boolean(candle.image && candle.image.trim()) ? (
                          <img
                            src={candle.image}
                            alt={candle.name}
                            className="w-full h-auto max-h-full max-w-full object-contain object-center"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-[#8C7A6B] text-xs flex flex-col items-center">
                            <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                            <span>Sin imagen</span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              candle.inStock
                                ? "bg-[#608058] text-white"
                                : "bg-red-600 text-white"
                            }`}
                          >
                            {candle.inStock ? "En Stock" : "Agotada"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B]">
                            {candle.code || "Nº 01"} • {candle.category}
                          </span>
                          <span className="font-serif font-bold text-[#423D33] text-base">
                            ${Number(candle.price).toFixed(2)} USD
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-[#423D33] text-lg">
                          {candle.name}
                        </h4>
                        <p className="text-xs text-[#8C7A6B] font-medium truncate">
                          {candle.subtitle}
                        </p>
                      </div>

                      {/* Collaborator & Specs Tag */}
                      <div className="text-[11px] text-[#423D33]/80 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E5E0DA]/70 space-y-1">
                        <p className="flex items-center justify-between">
                          <span className="text-[#8C7A6B] font-bold">Colaborador:</span>
                          <span className="font-semibold text-[#423D33] truncate max-w-[150px]">
                            {candle.collaboratorName || "Santiago Herrera"}
                          </span>
                        </p>
                        <p className="flex items-center justify-between">
                          <span className="text-[#8C7A6B] font-bold">Cera & Escultura:</span>
                          <span className="font-semibold text-[#423D33]">
                            {candle.waxType || "Soja"} • {candle.sculptureType || "zorro"}
                          </span>
                        </p>
                        <p className="flex items-center justify-between">
                          <span className="text-[#8C7A6B] font-bold">Detalles / Galería:</span>
                          <span className="text-[#423D33]">
                            {candle.burnHours}h ({candle.images?.length || 1} fotos)
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-[#E5E0DA] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {/* Stock Quick Toggle */}
                        <button
                          onClick={() => {
                            updateCandle(candle.id, { inStock: !candle.inStock });
                            notify(`Disponibilidad de "${candle.name}" modificada.`);
                          }}
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                            candle.inStock
                              ? "bg-[#608058]/15 text-[#35522e] hover:bg-red-100 hover:text-red-700"
                              : "bg-red-100 text-red-700 hover:bg-[#608058]/20 hover:text-[#35522e]"
                          }`}
                        >
                          {candle.inStock ? "Disponible" : "Agotada"}
                        </button>

                        {/* Featured Quick Toggle */}
                        <button
                          onClick={() => {
                            const newFeatured = !candle.featured;
                            updateCandle(candle.id, {
                              featured: newFeatured,
                              featuredOrder: newFeatured ? (candle.featuredOrder || candles.filter(c => c.featured).length + 1) : undefined
                            });
                            notify(newFeatured ? `"${candle.name}" añadida a Destacados.` : `"${candle.name}" removida de Destacados.`);
                          }}
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full cursor-pointer transition-colors flex items-center gap-1 ${
                            candle.featured
                              ? "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300"
                              : "bg-stone-100 text-stone-600 hover:bg-amber-50 hover:text-amber-800"
                          }`}
                          title="Alternar estado de producto destacado"
                        >
                          <Star className={`w-3 h-3 ${candle.featured ? "fill-amber-500 text-amber-500" : ""}`} />
                          <span>{candle.featured ? "Destacado" : "Destacar"}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEditingCandle(candle)}
                          className="p-1.5 rounded-full bg-[#F4EFEA] hover:bg-[#4A4541] text-[#423D33] hover:text-white transition-colors cursor-pointer"
                          title="Editar Vela"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar la vela "${candle.name}" del catálogo?`)) {
                              deleteCandle(candle.id);
                              notify(`Vela "${candle.name}" eliminada.`);
                            }
                          }}
                          className="p-1.5 rounded-full bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors cursor-pointer"
                          title="Eliminar Vela"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal / Form for Adding / Editing Product with Image Upload */}
              {(isAddingCandle || editingCandle) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <div className="bg-white rounded-3xl max-w-6xl xl:max-w-7xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 border border-[#E5E0DA] shadow-2xl">
                    <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-4">
                      <h3 className="font-serif text-2xl font-bold text-[#423D33]">
                        {editingCandle ? "Editar Vela de Colección" : "Crear Nueva Vela"}
                      </h3>
                      <button
                        onClick={() => {
                          setEditingCandle(null);
                          setIsAddingCandle(false);
                          setCandleImageInput("");
                        }}
                        className="p-1.5 rounded-full bg-[#F4EFEA] text-[#423D33] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveCandle} className="space-y-4 text-xs">
                      {/* Mandatory Collaborator Selector */}
                      <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E5E0DA]">
                        <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                          Colaborador / Creador Artesano Asignado * (Obligatorio)
                        </label>
                        <select
                          name="collaboratorId"
                          required
                          defaultValue={editingCandle?.collaboratorId || collaborators[0]?.id || ""}
                          className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white font-medium text-[#423D33]"
                        >
                          {collaborators.map((collab) => (
                            <option key={collab.id} value={collab.id}>
                              {collab.name} — {collab.location} ({collab.discipline})
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-[#423D33]/60 mt-1">
                          Asigna al creador artesano que diseñó y esculpió la pieza para que aparezca en la ficha de producto y en su perfil.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                            Código *
                          </label>
                          <input
                            type="text"
                            name="code"
                            required
                            defaultValue={editingCandle?.code || "Nº 01"}
                            placeholder="Ej. Nº 01"
                            className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                            Tipo de Cera *
                          </label>
                          <select
                            name="waxType"
                            defaultValue={editingCandle?.waxType || "Soja"}
                            className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white"
                          >
                            <option value="Soja">Cera de Soja (100% Vegetal)</option>
                            <option value="Parafina">Cera de Parafina (Refinada)</option>
                          </select>
                        </div>
                      </div>

                      <input
                        type="hidden"
                        name="sculptureType"
                        value={editingCandle?.sculptureType || selectedSculptureId || "zorro"}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                            Nombre de la Vela *
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            defaultValue={editingCandle?.name || ""}
                            placeholder="Ej. Nº 01 • Zorro del Bosque"
                            className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                            Subtítulo Olfativo *
                          </label>
                          <input
                            type="text"
                            name="subtitle"
                            required
                            defaultValue={editingCandle?.subtitle || ""}
                            placeholder="Ej. Musgo Roble, Pino Silvestre & Bayas"
                            className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                          />
                        </div>
                      </div>

                      {/* Image Upload Component for Product Image & Design */}
                      <ImageUploadField
                        label="Fotografía Principal (Vaso de vidrio artesanal)"
                        value={candleImageInput || editingCandle?.image || ""}
                        onChange={(newUrl) => setCandleImageInput(newUrl)}
                        recommendedSize="800x800px o 1200x800px (JPG, PNG, WebP)"
                      />

                      {/* Unified 2D Model & Resources Manager */}
                      <Unified2DModelManager
                        layers={candleLayers2D}
                        onChangeLayers={(updatedLayers) => setCandleLayers2D(updatedLayers)}
                        onLayersChange={(updatedLayers) => setCandleLayers2D(updatedLayers)}
                        candleName={editingCandle?.name || "Vela de Colección"}
                        candleImage={candleImageInput || editingCandle?.image || ""}
                        resources={{
                          base2DImage: "",
                          backgroundImage:
                            candle2DResources !== null && candle2DResources?.backgroundImage !== undefined
                              ? candle2DResources.backgroundImage
                              : editingCandle?.backgroundImage || "",
                          backgroundOpacity: candle2DResources?.backgroundOpacity ?? editingCandle?.backgroundOpacity ?? 1,
                          waxMaskPolygon: candle2DResources?.waxMaskPolygon || candleWaxMaskInput || editingCandle?.waxMaskPolygon || "M 19 60.5 Q 31 62.8 42.5 60.5 L 40.5 76 Q 30.5 78.5 21 76 Z",
                          wickX: candle2DResources?.wickX ?? editingCandle?.wickX ?? editingCandle?.customizer2DConfig?.wickX ?? 31,
                          wickY: candle2DResources?.wickY ?? editingCandle?.wickY ?? editingCandle?.customizer2DConfig?.wickY ?? 59,
                          botanicalsX: candle2DResources?.botanicalsX ?? editingCandle?.botanicalsX ?? editingCandle?.customizer2DConfig?.botanicalsX ?? 31,
                          botanicalsY: candle2DResources?.botanicalsY ?? editingCandle?.botanicalsY ?? editingCandle?.customizer2DConfig?.botanicalsY ?? 67,
                          botanicalsRadius: candle2DResources?.botanicalsRadius ?? editingCandle?.botanicalsRadius ?? editingCandle?.customizer2DConfig?.botanicalsRadius ?? 11,
                        }}
                        onChangeResources={(updatedRes) => {
                          setCandleWaxMaskInput(updatedRes.waxMaskPolygon);
                          setCandle2DResources(updatedRes);
                        }}
                        onResourcesChange={(updatedRes) => {
                          setCandleWaxMaskInput(updatedRes.waxMaskPolygon);
                          setCandle2DResources(updatedRes);
                        }}
                      />

                      {/* Explicit form inputs for background persistence */}
                      <input
                        type="hidden"
                        name="backgroundImage"
                        value={
                          candle2DResources !== null && candle2DResources?.backgroundImage !== undefined
                            ? candle2DResources.backgroundImage
                            : editingCandle?.backgroundImage || ""
                        }
                      />
                      <input
                        type="hidden"
                        name="backgroundOpacity"
                        value={
                          candle2DResources?.backgroundOpacity ?? editingCandle?.backgroundOpacity ?? 1
                        }
                      />

                      {/* Secondary / Gallery Images */}
                      <div>
                        <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                          Galería de Fotos Adicionales (Ángulos, empaque y detalles - URLs separadas por coma o salto de línea)
                        </label>
                        <textarea
                          name="secondaryImages"
                          rows={2}
                          defaultValue={
                            editingCandle?.images && editingCandle.images.length > 1
                              ? editingCandle.images.slice(1).join("\n")
                              : ""
                          }
                          placeholder="https://images.unsplash.com/... o /src/assets/..."
                          className="w-full p-2.5 rounded-xl border border-[#E5E0DA] font-mono text-[11px]"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                            Precio Base ($) *
                          </label>
                          <input
                            type="number"
                            name="price"
                            required
                            step="0.01"
                            min="0"
                            placeholder="Ej. 3.60 o 18.00"
                            defaultValue={editingCandle?.price !== undefined ? editingCandle.price : 18}
                            className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                            Horas Quemado
                          </label>
                          <input
                            type="number"
                            name="burnHours"
                            defaultValue={editingCandle?.burnHours || 50}
                            className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                            Peso (Gramos)
                          </label>
                          <input
                            type="number"
                            name="weightGrams"
                            defaultValue={editingCandle?.weightGrams || 280}
                            className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                            Categoría *
                          </label>
                          <select
                            name="category"
                            defaultValue={editingCandle?.category || "Relajación"}
                            className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white"
                          >
                            <option value="Relajación">Relajación</option>
                            <option value="Cálido & Especiado">Cálido & Especiado</option>
                            <option value="Madera & Místico">Madera & Místico</option>
                            <option value="Fresco & Vital">Fresco & Vital</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                            Base / Contenedor
                          </label>
                          <input
                            type="text"
                            name="vesselName"
                            defaultValue={editingCandle?.vesselName || "Cerámica Arena Mate"}
                            className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                          />
                        </div>
                      </div>

                      {/* Olfactory / Aroma Input */}
                      <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5E0DA] space-y-3">
                        <span className="font-bold text-[#8C7A6B] uppercase tracking-wider block">
                          Perfil Olfativo
                        </span>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#423D33] mb-0.5">
                            Aroma
                          </label>
                          <input
                            type="text"
                            name="aroma"
                            defaultValue={
                              editingCandle?.olfactoryPyramid?.salida ||
                              editingCandle?.subtitle ||
                              ""
                            }
                            placeholder="Ej. Bergamota, lavanda silvestre, cedro y vainilla"
                            className="w-full p-2 rounded-lg border border-[#E5E0DA] bg-white text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                          Descripción Emocional & Filosofía
                        </label>
                        <textarea
                          name="description"
                          rows={2}
                          defaultValue={editingCandle?.description || ""}
                          placeholder="Historia y sensación de esta vela..."
                          className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                        />
                      </div>

                      {/* Narrativa Artística del Diseño del Producto */}
                      <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5E0DA] space-y-3">
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-[#D98B68]" />
                          <span className="font-bold text-[#8C7A6B] uppercase tracking-wider block">
                            Pilar Artístico y Narrativa del Creador
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8C7A6B]">
                          Información artística del diseño específico de esta pieza (inspiración y cita de autor).
                        </p>

                        <div>
                          <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                            Inspiración del Artista
                          </label>
                          <textarea
                            name="artistInspiration"
                            rows={2}
                            defaultValue={editingCandle?.artistInspiration || ""}
                            placeholder="Inspirado en los zorros nativos de los bosques australes y la calidez del cedro con vainilla en tardes de invierno..."
                            className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                            Cita del Creador
                          </label>
                          <input
                            type="text"
                            name="quote"
                            defaultValue={editingCandle?.quote || ""}
                            placeholder="La madera y la cera reviven como luz, ternura y compañía en cada espacio."
                            className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E5E0DA] space-y-3">
                        <span className="font-bold text-[#8C7A6B] uppercase tracking-wider block">
                          Configuración de Destacado & Tanda Limitada
                        </span>
                        
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="inStock"
                              defaultChecked={editingCandle ? editingCandle.inStock : true}
                              className="w-4 h-4 rounded text-[#8C7A6B] focus:ring-[#8C7A6B]"
                            />
                            <span className="font-semibold text-[#423D33]">Disponible en Stock</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="featured"
                              defaultChecked={editingCandle ? editingCandle.featured : false}
                              className="w-4 h-4 rounded text-[#8C7A6B] focus:ring-[#8C7A6B]"
                            />
                            <span className="font-semibold text-[#423D33]">Vela Destacada (Pieza de Autor)</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#423D33] mb-0.5">
                              Posición / Prioridad de Destacado (1 = Primero)
                            </label>
                            <input
                              type="number"
                              name="featuredOrder"
                              min="1"
                              max="99"
                              defaultValue={editingCandle?.featuredOrder || 1}
                              className="w-full p-2 rounded-lg border border-[#E5E0DA] bg-white text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-[#423D33] mb-0.5">
                              Micro-etiqueta de Tanda Limitada
                            </label>
                            <input
                              type="text"
                              name="limitedBatchText"
                              defaultValue={editingCandle?.limitedBatchText || "Tanda de 50 unidades"}
                              placeholder="Ej. Tanda de 50 unidades, Edición Especial"
                              className="w-full p-2 rounded-lg border border-[#E5E0DA] bg-white text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#E5E0DA] flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCandle(null);
                            setIsAddingCandle(false);
                            setCandleImageInput("");
                          }}
                          className="px-4 py-2 rounded-full border border-[#E5E0DA] text-[#423D33] hover:bg-[#F2EDE7] cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingCandle}
                          className="px-6 py-2 rounded-full bg-[#4A4541] text-white font-bold uppercase tracking-wider hover:bg-[#35312E] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isSavingCandle && <RefreshCw className="w-4 h-4 animate-spin" />}
                          <span>
                            {isSavingCandle
                              ? "Guardando en servidor..."
                              : editingCandle
                              ? "Guardar Cambios"
                              : "Publicar Vela"}
                          </span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: GESTIÓN DE DESTACADOS & PIEZAS DE AUTOR */}
          {activeTab === "destacados" && (
            <div className="space-y-6">
              {/* Header Info Banner */}
              <div className="bg-[#FAF7F2] p-5 sm:p-6 rounded-3xl border border-[#E5E0DA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[#423D33]">
                      Gestión de Productos Destacados
                    </h3>
                  </div>
                  <p className="text-xs text-[#8C7A6B] max-w-2xl leading-relaxed">
                    Los productos destacados se muestran en el escaparate interactivo de portada (Hero Section) y son priorizados automáticamente por el <strong>Asistente Virtual inteligente</strong> al recomendar regalos o aromas a los clientes.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <span className="px-3 py-1.5 rounded-full bg-white border border-[#E5E0DA] text-xs font-bold text-[#423D33] flex items-center gap-1.5 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#D98B68]" />
                    <span>{candles.filter((c) => c.featured).length} Activos en Portada</span>
                  </span>
                </div>
              </div>

              {/* Active Featured Items List with Priority Reordering */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-[#423D33] text-base flex items-center gap-2">
                  <span>Velas Destacadas Actualmente</span>
                  <span className="text-xs font-sans font-normal text-[#8C7A6B]">
                    (Ordenadas por prioridad de aparición)
                  </span>
                </h4>

                {candles.filter((c) => c.featured).length === 0 ? (
                  <div className="bg-white p-8 rounded-3xl border border-dashed border-[#E5E0DA] text-center space-y-2">
                    <p className="text-sm font-semibold text-[#423D33]">No hay velas marcadas como destacadas</p>
                    <p className="text-xs text-[#8C7A6B]">
                      Selecciona velas de la lista inferior para destacarlas en portada y el asistente.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {candles
                      .filter((c) => c.featured)
                      .sort((a, b) => (a.featuredOrder || 99) - (b.featuredOrder || 99))
                      .map((candle, index, array) => (
                        <div
                          key={candle.id}
                          className="bg-white rounded-2xl border border-[#E5E0DA] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#8C7A6B]/50 transition-colors"
                        >
                          <div className="flex items-center gap-3.5">
                            {/* Position Badge */}
                            <div className="w-9 h-9 rounded-full bg-[#4A4541] text-white flex items-center justify-center font-serif font-bold text-sm shrink-0 shadow-xs">
                              #{index + 1}
                            </div>

                            {/* Thumbnail */}
                            {Boolean(candle.image && candle.image.trim()) ? (
                              <img
                                src={candle.image}
                                alt={candle.name}
                                className="w-14 h-14 rounded-xl object-contain p-1 bg-[#F2EDE7] border border-[#E5E0DA] shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#F2EDE7] border border-[#E5E0DA] shrink-0 text-[#8C7A6B]">
                                <ImageIcon className="w-6 h-6 opacity-40" />
                              </div>
                            )}

                            {/* Details */}
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B]">
                                  {candle.code || "Nº 01"}
                                </span>
                                <h5 className="font-serif font-bold text-[#423D33] text-sm truncate max-w-xs">
                                  {candle.name}
                                </h5>
                                <span className="text-xs font-semibold text-[#8C7A6B]">
                                  ${Number(candle.price).toFixed(2)} USD
                                </span>
                              </div>
                              <p className="text-xs text-[#423D33]/70 truncate max-w-sm">
                                {candle.subtitle} • {candle.vesselName}
                              </p>
                              <div className="flex items-center gap-2 pt-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D98B68]/15 border border-[#D98B68]/30 text-[#D98B68] text-[9px] font-bold">
                                  <Tag className="w-2.5 h-2.5" />
                                  <span>{candle.limitedBatchText || "Tanda de 50 unidades"}</span>
                                </span>
                                {candle.collaboratorName && (
                                  <span className="text-[10px] text-[#8C7A6B]">
                                    Por {candle.collaboratorName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Reordering & Actions */}
                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            {/* Move Up */}
                            <button
                              disabled={index === 0}
                              onClick={() => {
                                if (index === 0) return;
                                const prevCandle = array[index - 1];
                                const currentOrder = candle.featuredOrder || (index + 1);
                                const prevOrder = prevCandle.featuredOrder || index;
                                updateCandle(candle.id, { featuredOrder: prevOrder });
                                updateCandle(prevCandle.id, { featuredOrder: currentOrder });
                                notify(`Orden de "${candle.name}" subido a #${index}.`);
                              }}
                              className={`p-2 rounded-xl border border-[#E5E0DA] transition-all ${
                                index === 0
                                  ? "opacity-30 cursor-not-allowed bg-stone-50"
                                  : "hover:bg-[#4A4541] hover:text-white cursor-pointer bg-white"
                              }`}
                              title="Subir prioridad en portada"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            {/* Move Down */}
                            <button
                              disabled={index === array.length - 1}
                              onClick={() => {
                                if (index === array.length - 1) return;
                                const nextCandle = array[index + 1];
                                const currentOrder = candle.featuredOrder || (index + 1);
                                const nextOrder = nextCandle.featuredOrder || (index + 2);
                                updateCandle(candle.id, { featuredOrder: nextOrder });
                                updateCandle(nextCandle.id, { featuredOrder: currentOrder });
                                notify(`Orden de "${candle.name}" bajado a #${index + 2}.`);
                              }}
                              className={`p-2 rounded-xl border border-[#E5E0DA] transition-all ${
                                index === array.length - 1
                                  ? "opacity-30 cursor-not-allowed bg-stone-50"
                                  : "hover:bg-[#4A4541] hover:text-white cursor-pointer bg-white"
                              }`}
                              title="Bajar prioridad en portada"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleStartEditingCandle(candle)}
                              className="px-3 py-1.5 rounded-xl border border-[#E5E0DA] hover:bg-[#F2EDE7] text-[#423D33] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>

                            {/* Remove from Featured */}
                            <button
                              onClick={() => {
                                updateCandle(candle.id, { featured: false });
                                notify(`"${candle.name}" removida de Destacados.`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-700 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Quitar de destacados"
                            >
                              <X className="w-3 h-3" />
                              <span>Quitar</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Available Non-Featured Products Section */}
              <div className="space-y-4 pt-4 border-t border-[#E5E0DA]">
                <h4 className="font-serif font-bold text-[#423D33] text-base">
                  Otras Velas del Catálogo Disponibles para Destacar
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {candles
                    .filter((c) => !c.featured)
                    .map((candle) => (
                      <div
                        key={candle.id}
                        className="bg-white rounded-2xl border border-[#E5E0DA] p-4 shadow-xs flex items-center justify-between gap-3 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {Boolean(candle.image && candle.image.trim()) ? (
                            <img
                              src={candle.image}
                              alt={candle.name}
                              className="w-12 h-12 rounded-xl object-contain p-1 bg-[#F2EDE7] border border-[#E5E0DA] shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#F2EDE7] border border-[#E5E0DA] shrink-0 text-[#8C7A6B]">
                              <ImageIcon className="w-5 h-5 opacity-40" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h5 className="font-serif font-bold text-[#423D33] text-xs truncate">
                              {candle.name}
                            </h5>
                            <p className="text-[11px] text-[#8C7A6B] truncate">{candle.subtitle}</p>
                            <span className="text-[10px] text-[#423D33]/60">${Number(candle.price).toFixed(2)} USD</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const newOrder = candles.filter((c) => c.featured).length + 1;
                            updateCandle(candle.id, { featured: true, featuredOrder: newOrder });
                            notify(`"${candle.name}" agregada como Destacado #${newOrder}.`);
                          }}
                          className="px-3 py-1.5 rounded-full bg-[#8C7A6B] hover:bg-[#4A4541] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-2xs"
                        >
                          <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                          <span>Destacar</span>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GESTIÓN DE AROMAS */}
          {activeTab === "aromas" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#423D33]">
                    Catálogo de Aromas Botánicos & Notas
                  </h3>
                  <p className="text-xs text-[#8C7A6B]">
                    Define las esencias puras utilizadas en las fórmulas y el Asesor Botánico
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingAroma(null);
                    setAromaColorInput("#8C7A6B");
                    setIsAddingAroma(true);
                  }}
                  className="px-4 py-2 rounded-full bg-[#4A4541] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#35312E] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Aroma</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aromas.map((aroma) => (
                  <div
                    key={aroma.id}
                    className="bg-white rounded-3xl border border-[#E5E0DA] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#8C7A6B]/40 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B]">
                          Intensidad: {aroma.intensity}/5
                        </span>
                        <span className="text-[10px] font-mono text-[#8C7A6B] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#E5E0DA]">
                          {aroma.accentColor || "#8C7A6B"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className="w-7 h-7 rounded-full border border-black/15 shadow-2xs shrink-0"
                          style={{ backgroundColor: aroma.accentColor || "#8C7A6B" }}
                          title={`Color representativo: ${aroma.accentColor || "#8C7A6B"}`}
                        />
                        <div>
                          <h4 className="font-serif font-bold text-[#423D33] text-lg leading-tight">
                            {aroma.name}
                          </h4>
                          <span className="text-xs text-[#D98B68] font-medium">
                            {aroma.family}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#423D33]/80 leading-relaxed">
                        {aroma.description}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {aroma.notes.map((n, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E5E0DA] text-[#423D33]"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E5E0DA] flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingAroma(aroma);
                          setAromaColorInput(aroma.accentColor || "#8C7A6B");
                          setIsAddingAroma(false);
                        }}
                        className="p-1.5 rounded-full bg-[#F4EFEA] hover:bg-[#4A4541] text-[#423D33] hover:text-white transition-colors cursor-pointer"
                        title="Editar Aroma"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar el aroma "${aroma.name}"?`)) {
                            deleteAroma(aroma.id);
                            notify(`Aroma "${aroma.name}" eliminado.`);
                          }
                        }}
                        className="p-1.5 rounded-full bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors cursor-pointer"
                        title="Eliminar Aroma"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Aroma */}
              {(isAddingAroma || editingAroma) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E5E0DA] shadow-2xl">
                    <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-3">
                      <h3 className="font-serif text-xl font-bold text-[#423D33]">
                        {editingAroma ? "Editar Aroma" : "Registrar Aroma"}
                      </h3>
                      <button
                        onClick={() => {
                          setEditingAroma(null);
                          setIsAddingAroma(false);
                        }}
                        className="p-1.5 rounded-full bg-[#F4EFEA] text-[#423D33] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveAroma} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-[#8C7A6B] mb-1">Nombre del Aroma *</label>
                        <input
                          type="text"
                          name="name"
                          required
                          defaultValue={editingAroma?.name || ""}
                          className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-[#8C7A6B] mb-1">Color Representativo *</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={aromaColorInput}
                              onChange={(e) => setAromaColorInput(e.target.value)}
                              className="w-9 h-9 rounded-xl border border-[#E5E0DA] cursor-pointer p-0.5 bg-white shrink-0"
                            />
                            <input
                              type="text"
                              name="accentColor"
                              value={aromaColorInput}
                              onChange={(e) => setAromaColorInput(e.target.value)}
                              placeholder="#8C7A6B"
                              className="w-full p-2 rounded-xl border border-[#E5E0DA] font-mono text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-[#8C7A6B] mb-1">Familia Olfativa</label>
                          <input
                            type="text"
                            name="family"
                            defaultValue={editingAroma?.family || "Floral & Relajación"}
                            className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-[#8C7A6B] mb-1">Intensidad (1-5)</label>
                        <input
                          type="number"
                          name="intensity"
                          min="1"
                          max="5"
                          defaultValue={editingAroma?.intensity || 4}
                          className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#8C7A6B] mb-1">Notas Aromáticas (separadas por comas)</label>
                        <input
                          type="text"
                          name="notes"
                          defaultValue={editingAroma?.notes?.join(", ") || ""}
                          placeholder="Lavanda, Manzanilla, Eucalipto"
                          className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#8C7A6B] mb-1">Descripción del Efecto</label>
                        <textarea
                          name="description"
                          rows={2}
                          defaultValue={editingAroma?.description || ""}
                          className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                        />
                      </div>

                      <div className="pt-3 flex justify-end gap-2 border-t border-[#E5E0DA]">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAroma(null);
                            setIsAddingAroma(false);
                          }}
                          className="px-4 py-2 rounded-full border border-[#E5E0DA] cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-full bg-[#4A4541] text-white font-bold cursor-pointer hover:bg-[#35312E]"
                        >
                          Guardar Aroma
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: COLORES DE VELA / TONOS DE CERA */}
          {activeTab === "coloresVela" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl font-bold text-[#423D33]">
                      Colores de Vela & Tonos de Cera
                    </h3>
                    <span className="text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#8C7A6B] border border-[#E5E0DA] font-bold">
                      {waxColors.length} Tonalidades
                    </span>
                  </div>
                  <p className="text-xs text-[#8C7A6B] mt-0.5">
                    Gestiona la paleta de tonos de cera para el vertido artesanal y las capas 2D personalizables.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingWaxColor(null);
                    setWaxColorHex("#FAF7F2");
                    setWaxColorAccent("#8C7A6B");
                    setIsAddingWaxColor(true);
                  }}
                  className="px-4 py-2 rounded-full bg-[#4A4541] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#35312E] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Color de Vela</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {waxColors.map((color) => {
                  const isActive = color.active !== false;
                  return (
                    <div
                      key={color.id}
                      className="bg-white rounded-3xl border border-[#E5E0DA] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#8C7A6B]/40 transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-8 h-8 rounded-full border border-black/15 shadow-xs shrink-0"
                              style={{ backgroundColor: color.hex }}
                              title={`Tono primario: ${color.hex}`}
                            />
                            {color.accent && (
                              <span
                                className="w-5 h-5 rounded-full border border-black/15 shadow-2xs -ml-4 mt-3 shrink-0"
                                style={{ backgroundColor: color.accent }}
                                title={`Tono de acento: ${color.accent}`}
                              />
                            )}
                            <div>
                              <h4 className="font-serif font-bold text-[#423D33] text-base leading-tight">
                                {color.name}
                              </h4>
                              <span className="text-[10px] font-mono text-[#8C7A6B]">
                                {color.hex} {color.accent ? `• ${color.accent}` : ""}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              toggleWaxColorActive(color.id);
                              notify(`Color "${color.name}" ahora está ${isActive ? "inactivo" : "activo"}.`);
                            }}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                              isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                            }`}
                            title="Haz clic para activar o desactivar este color para los clientes"
                          >
                            {isActive ? "Activo" : "Inactivo"}
                          </button>
                        </div>

                        {color.subtitle && (
                          <p className="text-xs text-[#8C7A6B] font-medium">
                            {color.subtitle}
                          </p>
                        )}

                        {color.mood && (
                          <div className="bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#E5E0DA]/80 text-[11px] text-[#423D33] italic">
                            ✨ {color.mood}
                          </div>
                        )}

                        {color.description && (
                          <p className="text-xs text-[#423D33]/80 leading-relaxed">
                            {color.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#E5E0DA] flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingWaxColor(color);
                            setWaxColorHex(color.hex);
                            setWaxColorAccent(color.accent || "#8C7A6B");
                            setIsAddingWaxColor(false);
                          }}
                          className="p-1.5 rounded-full bg-[#F4EFEA] hover:bg-[#4A4541] text-[#423D33] hover:text-white transition-colors cursor-pointer"
                          title="Editar color"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (waxColors.length <= 1) {
                              alert("Debe haber al menos 1 color de vela en el catálogo.");
                              return;
                            }
                            if (confirm(`¿Eliminar el color de vela "${color.name}"?`)) {
                              deleteWaxColor(color.id);
                              notify(`Color "${color.name}" eliminado.`);
                            }
                          }}
                          className="p-1.5 rounded-full bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors cursor-pointer"
                          title="Eliminar color"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Crear / Editar Color de Vela */}
              {(isAddingWaxColor || editingWaxColor) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E5E0DA] shadow-2xl">
                    <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-3">
                      <h3 className="font-serif text-xl font-bold text-[#423D33]">
                        {editingWaxColor ? "Editar Color de Vela" : "Nuevo Color de Vela"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingWaxColor(null);
                          setIsAddingWaxColor(false);
                        }}
                        className="p-1.5 rounded-full bg-[#F4EFEA] text-[#423D33] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveWaxColor} className="space-y-3.5 text-xs">
                      <div>
                        <label className="block font-bold text-[#8C7A6B] mb-1">Nombre del Color *</label>
                        <input
                          type="text"
                          name="name"
                          required
                          defaultValue={editingWaxColor?.name || ""}
                          placeholder="Ej. Marfil Botánico"
                          className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#8C7A6B] mb-1">Subtítulo Descriptivo</label>
                        <input
                          type="text"
                          name="subtitle"
                          defaultValue={editingWaxColor?.subtitle || ""}
                          placeholder="Ej. Cera virgen natural sin tintes sintéticos"
                          className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-[#8C7A6B] mb-1">Color Hex *</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={waxColorHex}
                              onChange={(e) => setWaxColorHex(e.target.value)}
                              className="w-9 h-9 rounded-xl border border-[#E5E0DA] cursor-pointer p-0.5 bg-white shrink-0"
                            />
                            <input
                              type="text"
                              name="hex"
                              value={waxColorHex}
                              onChange={(e) => setWaxColorHex(e.target.value)}
                              className="w-full p-2 rounded-xl border border-[#E5E0DA] font-mono text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-[#8C7A6B] mb-1">Color de Acento</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={waxColorAccent}
                              onChange={(e) => setWaxColorAccent(e.target.value)}
                              className="w-9 h-9 rounded-xl border border-[#E5E0DA] cursor-pointer p-0.5 bg-white shrink-0"
                            />
                            <input
                              type="text"
                              name="accent"
                              value={waxColorAccent}
                              onChange={(e) => setWaxColorAccent(e.target.value)}
                              className="w-full p-2 rounded-xl border border-[#E5E0DA] font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-[#8C7A6B] mb-1">Mood / Atmósfera Emocional</label>
                        <input
                          type="text"
                          name="mood"
                          defaultValue={editingWaxColor?.mood || ""}
                          placeholder="Ej. Paz, Serenidad & Luz Cálida"
                          className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#8C7A6B] mb-1">Descripción del Tono</label>
                        <textarea
                          name="description"
                          rows={2}
                          defaultValue={editingWaxColor?.description || ""}
                          placeholder="Describe el matiz y textura visual..."
                          className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="waxColorActiveCheckbox"
                          name="active"
                          defaultChecked={editingWaxColor?.active !== false}
                          className="w-4 h-4 rounded text-[#4A4541] focus:ring-[#8C7A6B] cursor-pointer"
                        />
                        <label htmlFor="waxColorActiveCheckbox" className="font-semibold text-[#423D33] cursor-pointer">
                          Disponible inmediatamente para los clientes en el personalizador
                        </label>
                      </div>

                      <div className="pt-3 flex justify-end gap-2 border-t border-[#E5E0DA]">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingWaxColor(null);
                            setIsAddingWaxColor(false);
                          }}
                          className="px-4 py-2 rounded-full border border-[#E5E0DA] cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-full bg-[#4A4541] text-white font-bold cursor-pointer hover:bg-[#35312E]"
                        >
                          Guardar Color
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: GESTIÓN DE CREADORES */}
          {activeTab === "creadores" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#423D33]">
                    Jóvenes Creadores & Colectivo Artístico
                  </h3>
                  <p className="text-xs text-[#8C7A6B]">
                    Administra los perfiles de artistas, fotografías, técnicas de pigmento y obras
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingCollab(null);
                    setCollabImageInput("");
                    setIsAddingCollab(true);
                  }}
                  className="px-4 py-2 rounded-full bg-[#4A4541] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#35312E] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Creador</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="bg-white rounded-3xl border border-[#E5E0DA] p-5 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#E5E0DA] bg-[#F2EDE7] shrink-0 flex items-center justify-center">
                          {Boolean(collab.image && collab.image.trim()) ? (
                            <img
                              src={collab.image}
                              alt={collab.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="font-serif font-bold text-lg text-[#423D33]">
                              {collab.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-[#423D33] text-lg">
                            {collab.name}
                          </h4>
                          <p className="text-xs text-[#8C7A6B]">
                            {collab.age} años • {collab.location}
                          </p>
                          <span className="text-[10px] text-[#D98B68] font-semibold">
                            {collab.discipline}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-[#423D33]/80 bg-[#FAF7F2] p-3 rounded-2xl border border-[#E5E0DA]/70 space-y-1.5">
                        <p className="line-clamp-2 leading-relaxed italic text-[11px] text-[#423D33]/90">
                          "{collab.bio || 'Creador artesano de la colección ayllu.'}"
                        </p>
                        {(() => {
                          const artistCandles = candles.filter((c) =>
                            (c.collaboratorId && c.collaboratorId === collab.id) ||
                            (c.collaboratorName && c.collaboratorName.trim().toLowerCase() === collab.name.trim().toLowerCase()) ||
                            (collab.associatedCandleId && c.id === collab.associatedCandleId) ||
                            (collab.associatedCandleName && c.name && c.name.trim().toLowerCase() === collab.associatedCandleName.trim().toLowerCase())
                          );
                          return artistCandles.length > 0 ? (
                            <div className="pt-1 border-t border-[#E5E0DA]/50 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider">Velas asociadas ({artistCandles.length}):</span>
                              {artistCandles.map((c) => (
                                <span key={c.id} className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-[#E5E0DA] font-medium text-[#423D33]">
                                  {c.code ? `${c.code} • ` : ""}{c.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="pt-1 border-t border-[#E5E0DA]/50 text-[10px] text-[#8C7A6B] italic">
                              Sin velas asignadas en catálogo todavía.
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E5E0DA] flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingCollab(collab);
                          setCollabImageInput(collab.image);
                          setIsAddingCollab(false);
                        }}
                        className="p-1.5 rounded-full bg-[#F4EFEA] hover:bg-[#4A4541] text-[#423D33] hover:text-white transition-colors cursor-pointer"
                        title="Editar Creador"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar al creador "${collab.name}"?`)) {
                            deleteCollaborator(collab.id);
                            notify(`Creador "${collab.name}" eliminado.`);
                          }
                        }}
                        className="p-1.5 rounded-full bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors cursor-pointer"
                        title="Eliminar Creador"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Creador with Image Upload */}
              {(isAddingCollab || editingCollab) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 border border-[#E5E0DA] shadow-2xl">
                    <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-3">
                      <h3 className="font-serif text-xl font-bold text-[#423D33]">
                        {editingCollab ? "Editar Ficha de Creador" : "Registrar Nuevo Creador"}
                      </h3>
                      <button
                        onClick={() => {
                          setEditingCollab(null);
                          setIsAddingCollab(false);
                          setCollabImageInput("");
                        }}
                        className="p-1.5 rounded-full bg-[#F4EFEA] text-[#423D33]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveCollaborator} className="space-y-3.5 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-[#8C7A6B] mb-1">Nombre Completo *</label>
                          <input
                            type="text"
                            name="name"
                            required
                            defaultValue={editingCollab?.name || ""}
                            placeholder="Ej. Valentina Morales"
                            className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#8C7A6B] mb-1">Edad</label>
                          <input
                            type="number"
                            name="age"
                            defaultValue={editingCollab?.age || 20}
                            className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-[#8C7A6B] mb-1">Ciudad / País *</label>
                          <input
                            type="text"
                            name="location"
                            required
                            defaultValue={editingCollab?.location || "Medellín, Colombia"}
                            className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-[#8C7A6B] mb-1">Disciplina Artística</label>
                          <input
                            type="text"
                            name="discipline"
                            defaultValue={editingCollab?.discipline || "Ilustración Botánica & Acuarela"}
                            className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                          />
                        </div>
                      </div>

                      {/* Image Upload for Creator Photo */}
                      <ImageUploadField
                        label="Fotografía del Creador (Subir desde el Computador o URL)"
                        value={collabImageInput || editingCollab?.image || ""}
                        onChange={(newUrl) => setCollabImageInput(newUrl)}
                        aspectRatio="portrait"
                        recommendedSize="600x800px (Retrato JPG, PNG)"
                        folder="collaborators"
                      />

                      <div>
                        <label className="block font-bold text-[#8C7A6B] mb-1">Biografía / Filosofía del Creador *</label>
                        <textarea
                          name="bio"
                          required
                          rows={3}
                          defaultValue={editingCollab?.bio || ""}
                          placeholder="Breve reseña sobre su trayectoria, pasión artística y filosofía artesanal..."
                          className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                        />
                      </div>

                      {/* Associated Candle Selector */}
                      <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5E0DA] space-y-2">
                        <label className="block font-bold text-[#423D33] text-xs uppercase tracking-wider">
                          Vela Co-Diseñada Asociada (Catálogo)
                        </label>
                        <select
                          name="associatedCandleId"
                          defaultValue={
                            editingCollab?.associatedCandleId ||
                            candles.find((c) => c.collaboratorId === editingCollab?.id)?.id ||
                            ""
                          }
                          className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white text-xs font-semibold text-[#423D33]"
                        >
                          <option value="">-- Sin vela asociada directa --</option>
                          {candles.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.code ? `${c.code} • ` : ""}{c.name} (${Number(c.price).toFixed(2)}€)
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-[#8C7A6B]">
                          Al asignar una vela, aparecerá vinculada automáticamente en la ficha del artista y en la sección pública de Artistas.
                        </p>
                      </div>

                      {/* Additional Narrative Details */}
                      <div className="space-y-3 pt-2">
                        <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider block">
                          Detalles Artísticos Opcionales (Ficha Pública)
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-medium text-xs text-[#8C7A6B] mb-1">Inspiración del Artista</label>
                            <input
                              type="text"
                              name="artistInspiration"
                              defaultValue={editingCollab?.artistInspiration || ""}
                              placeholder="Ej: La quietud de los bosques al amanecer..."
                              className="w-full p-2 rounded-xl border border-[#E5E0DA] text-xs"
                            />
                          </div>

                          <div>
                            <label className="block font-medium text-xs text-[#8C7A6B] mb-1">Técnica</label>
                            <input
                              type="text"
                              name="technique"
                              defaultValue={editingCollab?.technique || ""}
                              placeholder="Ej: Ilustración botánica con tintas orgánicas"
                              className="w-full p-2 rounded-xl border border-[#E5E0DA] text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-medium text-xs text-[#8C7A6B] mb-1">Significado del Diseño</label>
                            <input
                              type="text"
                              name="designMeaning"
                              defaultValue={editingCollab?.designMeaning || ""}
                              placeholder="Ej: Armonía y protección en el hogar..."
                              className="w-full p-2 rounded-xl border border-[#E5E0DA] text-xs"
                            />
                          </div>

                          <div>
                            <label className="block font-medium text-xs text-[#8C7A6B] mb-1">Cita del Creador</label>
                            <input
                              type="text"
                              name="quote"
                              defaultValue={editingCollab?.quote || ""}
                              placeholder="Ej: Cada vela lleva un pedazo de mi alma"
                              className="w-full p-2 rounded-xl border border-[#E5E0DA] text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 flex justify-end gap-2 border-t border-[#E5E0DA]">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCollab(null);
                            setIsAddingCollab(false);
                            setCollabImageInput("");
                          }}
                          className="px-4 py-2 rounded-full border border-[#E5E0DA]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-full bg-[#4A4541] text-white font-bold"
                        >
                          Guardar Creador
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: GESTIÓN DE PEDIDOS */}
          {activeTab === "pedidos" && (
            <div className="space-y-6">
              {/* Header & Stats Counters */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#423D33]">
                      Gestión de Pedidos & Verificación de Pagos
                    </h3>
                    <p className="text-xs text-[#8C7A6B]">
                      Lista interactiva de compras, validación de transferencias bancarias, cobros en efectivo y control de estado de preparación y entrega.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#423D33] bg-white px-3.5 py-1.5 rounded-full border border-[#E5E0DA] shadow-xs">
                      Total: {orders.length} pedidos
                    </span>
                  </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div className="bg-white p-3 rounded-2xl border border-[#E5E0DA] shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                      Total Pedidos
                    </span>
                    <span className="text-lg font-serif font-bold text-[#423D33]">
                      {orders.length}
                    </span>
                  </div>

                  <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block flex items-center justify-between">
                      <span>Por Verificar</span>
                      <Clock className="w-3 h-3 text-amber-700" />
                    </span>
                    <span className="text-lg font-serif font-bold text-amber-950">
                      {orders.filter((o) => o.status === "Pendiente de verificación" || o.status === "Pendiente").length}
                    </span>
                  </div>

                  <div className="bg-purple-50/70 p-3 rounded-2xl border border-purple-200 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 block flex items-center justify-between">
                      <span>En Preparación</span>
                      <Sparkles className="w-3 h-3 text-purple-700" />
                    </span>
                    <span className="text-lg font-serif font-bold text-purple-950">
                      {orders.filter((o) => o.status === "En preparación" || o.status === "En Elaboración").length}
                    </span>
                  </div>

                  <div className="bg-sky-50/70 p-3 rounded-2xl border border-sky-200 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-900 block flex items-center justify-between">
                      <span>En Camino</span>
                      <Truck className="w-3 h-3 text-sky-700" />
                    </span>
                    <span className="text-lg font-serif font-bold text-sky-950">
                      {orders.filter((o) => o.status === "En camino" || o.status === "Enviado").length}
                    </span>
                  </div>

                  <div className="bg-[#608058]/10 p-3 rounded-2xl border border-[#608058]/30 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#35522e] block flex items-center justify-between">
                      <span>Entregados</span>
                      <CheckCircle2 className="w-3 h-3 text-[#608058]" />
                    </span>
                    <span className="text-lg font-serif font-bold text-[#23381e]">
                      {orders.filter((o) => o.status === "Entregado y cobrado" || o.status === "Entregado").length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Search & Filter Bar with View Mode Toggle */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E0DA] shadow-xs">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar pedido por #ID, cliente, email, teléfono, ciudad o producto..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full text-xs pl-9 pr-8 py-2.5 rounded-xl border border-[#E5E0DA] bg-[#FAF7F2] text-[#423D33] focus:outline-none focus:ring-1 focus:ring-[#8C7A6B]"
                  />
                  {orderSearch && (
                    <button
                      onClick={() => setOrderSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#423D33]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F4EFEA] rounded-full border border-[#E5E0DA] overflow-x-auto">
                  <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider px-2 flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    <span>Filtro:</span>
                  </span>

                  {[
                    { id: "todos", label: "Todos" },
                    { id: "verificacion", label: "Por Verificar" },
                    { id: "verificado", label: "Verificados" },
                    { id: "preparacion", label: "En Preparación" },
                    { id: "camino", label: "En Camino" },
                    { id: "entregado", label: "Entregados" },
                    { id: "cancelado", label: "Cancelados" },
                  ].map((filterItem) => (
                    <button
                      key={filterItem.id}
                      onClick={() => setOrderStatusFilter(filterItem.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        orderStatusFilter === filterItem.id
                          ? "bg-[#4A4541] text-white shadow-xs"
                          : "text-[#423D33]/70 hover:text-[#423D33]"
                      }`}
                    >
                      {filterItem.label}
                    </button>
                  ))}
                </div>

                {/* View Switcher */}
                <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#E5E0DA] self-end md:self-auto">
                  <button
                    onClick={() => setOrderViewMode("table")}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                      orderViewMode === "table"
                        ? "bg-white text-[#423D33] shadow-2xs font-bold"
                        : "text-[#8C7A6B] hover:text-[#423D33]"
                    }`}
                    title="Vista de Tabla Resumida"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tabla</span>
                  </button>
                  <button
                    onClick={() => setOrderViewMode("cards")}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                      orderViewMode === "cards"
                        ? "bg-white text-[#423D33] shadow-2xs font-bold"
                        : "text-[#8C7A6B] hover:text-[#423D33]"
                    }`}
                    title="Vista de Tarjetas Resumidas"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tarjetas</span>
                  </button>
                </div>
              </div>

              {/* ORDERS LIST / TABLE */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#E5E0DA] p-10 text-center space-y-3">
                  <ShoppingBag className="w-10 h-10 text-[#8C7A6B] mx-auto opacity-50" />
                  <p className="text-sm font-serif text-[#423D33] font-bold">
                    No se encontraron pedidos que coincidan con la búsqueda o filtro.
                  </p>
                  <button
                    onClick={() => {
                      setOrderSearch("");
                      setOrderStatusFilter("todos");
                    }}
                    className="text-xs text-[#8C7A6B] font-bold uppercase underline cursor-pointer"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              ) : orderViewMode === "table" ? (
                /* TABLA RESUMIDA DE PEDIDOS */
                <div className="bg-white rounded-3xl border border-[#E5E0DA] overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#FAF7F2] border-b border-[#E5E0DA] text-[#8C7A6B] font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3.5 px-4">Pedido (#ID)</th>
                          <th className="py-3.5 px-4">Cliente</th>
                          <th className="py-3.5 px-4 hidden md:table-cell">Fecha</th>
                          <th className="py-3.5 px-4">Método de Pago</th>
                          <th className="py-3.5 px-4 hidden sm:table-cell">Artículos</th>
                          <th className="py-3.5 px-4">Total</th>
                          <th className="py-3.5 px-4">Estado</th>
                          <th className="py-3.5 px-4 text-right">Detalles / Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E0DA]">
                        {filteredOrders.map((ord) => {
                          const isExpanded = expandedOrderIds.includes(ord.id);
                          const isBankTransfer =
                            ord.paymentMethod === "Transferencia Bancaria" ||
                            ord.paymentDetails?.method === "Transferencia Bancaria";
                          const isPendingVerification =
                            isBankTransfer &&
                            (ord.status === "Pendiente de verificación" || ord.status === "Pendiente");

                          return (
                            <React.Fragment key={ord.id}>
                              <tr className="hover:bg-[#FAF7F2]/60 transition-colors group">
                                {/* 1. NÚMERO DE PEDIDO ÚNICO (Clickable) */}
                                <td className="py-3.5 px-4 align-middle">
                                  <button
                                    onClick={() => setSelectedOrderIdForModal(ord.id)}
                                    className="font-mono font-bold text-xs text-[#423D33] hover:text-[#8C7A6B] bg-[#FAF7F2] hover:bg-[#F2EDE7] px-2.5 py-1 rounded-lg border border-[#E5E0DA] flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs group-hover:border-[#8C7A6B]"
                                    title="Hacer clic para ver el detalle completo"
                                  >
                                    <span>#{ord.id}</span>
                                    <Eye className="w-3 h-3 text-[#8C7A6B]" />
                                  </button>
                                </td>

                                {/* 2. NOMBRE DEL CLIENTE (Clickable) */}
                                <td className="py-3.5 px-4 align-middle">
                                  <button
                                    onClick={() => setSelectedOrderIdForModal(ord.id)}
                                    className="text-left cursor-pointer group-hover:text-[#8C7A6B] transition-colors"
                                    title="Hacer clic para ver el detalle completo"
                                  >
                                    <span className="font-bold text-[#423D33] block text-xs underline decoration-transparent hover:decoration-[#423D33]">
                                      {ord.customerName}
                                    </span>
                                    <span className="text-[11px] text-[#8C7A6B] block truncate max-w-[160px]">
                                      {ord.customerEmail}
                                    </span>
                                  </button>
                                </td>

                                {/* 3. FECHA */}
                                <td className="py-3.5 px-4 align-middle text-[#8C7A6B] whitespace-nowrap hidden md:table-cell">
                                  <span className="block text-[11px] text-[#423D33] font-medium">
                                    {new Date(ord.createdAt).toLocaleDateString("es-ES", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                  <span className="block text-[10px] text-[#8C7A6B]">
                                    {new Date(ord.createdAt).toLocaleTimeString("es-ES", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </td>

                                {/* 4. MÉTODO DE PAGO */}
                                <td className="py-3.5 px-4 align-middle">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#423D33]">
                                      {isBankTransfer ? (
                                        <Building2 className="w-3.5 h-3.5 text-[#8C7A6B] shrink-0" />
                                      ) : (
                                        <Truck className="w-3.5 h-3.5 text-[#608058] shrink-0" />
                                      )}
                                      <span className="truncate max-w-[130px]">
                                        {isBankTransfer ? "Transferencia" : "Efectivo"}
                                      </span>
                                    </div>
                                    {isPendingVerification && (
                                      <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                        Por Validar
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* 5. ARTÍCULOS */}
                                <td className="py-3.5 px-4 align-middle hidden sm:table-cell">
                                  <div className="text-[11px] text-[#423D33]">
                                    <span className="font-bold">
                                      {ord.items.reduce((acc, it) => acc + it.quantity, 0)} velas
                                    </span>
                                    <span className="text-[10px] text-[#8C7A6B] block truncate max-w-[130px]">
                                      {ord.items.map((it) => it.candle.name).join(", ")}
                                    </span>
                                  </div>
                                </td>

                                {/* 6. TOTAL */}
                                <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                                  <span className="font-serif font-bold text-sm text-[#423D33]">
                                    ${ord.total.toFixed(2)} USD
                                  </span>
                                </td>

                                {/* 7. ESTADO CON SELECTOR RÁPIDO */}
                                <td className="py-3.5 px-4 align-middle">
                                  <div className="space-y-1">
                                    <select
                                      value={ord.status}
                                      onChange={(e) => {
                                        updateOrderStatus(ord.id, e.target.value as OrderStatus);
                                        notify(`Estado del pedido #${ord.id} actualizado a "${e.target.value}".`);
                                      }}
                                      className={`text-[10px] font-bold py-1 px-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-[#8C7A6B] cursor-pointer ${getStatusBadgeStyle(
                                        ord.status
                                      )}`}
                                    >
                                      <option value="Pendiente de verificación">Pendiente de verificación</option>
                                      <option value="Pago verificado">Pago verificado</option>
                                      <option value="En preparación">En preparación</option>
                                      <option value="En camino">En camino</option>
                                      <option value="Entregado y cobrado">Entregado y cobrado</option>
                                      <option value="Cancelado">Cancelado</option>
                                    </select>
                                  </div>
                                </td>

                                {/* 8. ACCIONES & EXPANDIR */}
                                <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* Botón Ver Detalle Principal */}
                                    <button
                                      onClick={() => setSelectedOrderIdForModal(ord.id)}
                                      className="px-3 py-1.5 rounded-xl bg-[#4A4541] hover:bg-[#35312E] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                                      title="Abrir panel detallado de compra"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Ver Detalle</span>
                                    </button>

                                    {/* Botón Toggle Acordeón */}
                                    <button
                                      onClick={() => toggleExpandOrder(ord.id)}
                                      className="p-1.5 rounded-xl border border-[#E5E0DA] bg-[#FAF7F2] text-[#8C7A6B] hover:text-[#423D33] hover:bg-white transition-colors cursor-pointer"
                                      title={isExpanded ? "Ocultar vista rápida" : "Desplegar vista rápida"}
                                    >
                                      {isExpanded ? (
                                        <ChevronUp className="w-4 h-4" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4" />
                                      )}
                                    </button>

                                    {/* Botón Eliminar */}
                                    <button
                                      onClick={() => {
                                        if (confirm(`¿Estás seguro de eliminar el pedido #${ord.id}?`)) {
                                          deleteOrder(ord.id);
                                          notify(`Pedido #${ord.id} eliminado correctamente.`);
                                        }
                                      }}
                                      className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                                      title="Eliminar Pedido"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>

                              {/* ACORDEÓN INLINE CUANDO SE DESPLIEGA */}
                              {isExpanded && (
                                <tr className="bg-[#FAF7F2]/40">
                                  <td colSpan={8} className="p-4 border-b border-[#E5E0DA]">
                                    <div className="bg-white rounded-2xl border border-[#E5E0DA] p-4 space-y-3 shadow-2xs">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E0DA]/70 pb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="font-serif font-bold text-xs text-[#423D33]">
                                            Desglose Rápido del Pedido #{ord.id}
                                          </span>
                                          <span className="text-[11px] text-[#8C7A6B]">
                                            • {ord.shippingAddress}, {ord.shippingCity} ({ord.customerPhone})
                                          </span>
                                        </div>
                                        <button
                                          onClick={() => setSelectedOrderIdForModal(ord.id)}
                                          className="text-[11px] font-bold text-[#8C7A6B] hover:text-[#423D33] underline flex items-center gap-1 cursor-pointer"
                                        >
                                          <span>Abrir Modal Completo</span>
                                          <ArrowUpRight className="w-3 h-3" />
                                        </button>
                                      </div>

                                      {/* Productos Resumidos con Cera y Especificaciones */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {ord.items.map((it, idx) => {
                                          const wax = it.selectedWaxType || it.candle.waxType || it.customDetails?.waxType || "Soja";
                                          return (
                                            <div
                                              key={idx}
                                              className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5E0DA] flex items-center gap-2.5 text-xs"
                                            >
                                              {Boolean(it.candle.image && it.candle.image.trim()) ? (
                                                <img
                                                  src={it.candle.image}
                                                  alt={it.candle.name}
                                                  className="w-10 h-10 rounded-lg object-contain p-0.5 bg-white shrink-0 border border-[#E5E0DA]"
                                                />
                                              ) : (
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white shrink-0 border border-[#E5E0DA] text-[#8C7A6B]">
                                                  <ImageIcon className="w-4 h-4 opacity-40" />
                                                </div>
                                              )}
                                              <div className="min-w-0 flex-1">
                                                <h6 className="font-serif font-bold text-[#423D33] truncate text-xs">
                                                  {it.candle.name}
                                                </h6>
                                                <div className="flex items-center gap-1.5 text-[10px] text-[#8C7A6B]">
                                                  <span className="font-bold text-[#35522e] bg-[#608058]/15 px-1.5 py-0.2 rounded">
                                                    Cera: {wax}
                                                  </span>
                                                  <span>• {it.quantity} un.</span>
                                                  <span className="font-semibold text-[#423D33]">
                                                    ${(it.candle.price * it.quantity).toFixed(2)}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* VISTA DE TARJETAS RESUMIDAS */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredOrders.map((ord) => {
                    const isBankTransfer =
                      ord.paymentMethod === "Transferencia Bancaria" ||
                      ord.paymentDetails?.method === "Transferencia Bancaria";

                    return (
                      <div
                        key={ord.id}
                        className="bg-white rounded-3xl border border-[#E5E0DA] p-5 shadow-xs hover:shadow-md transition-shadow space-y-4"
                      >
                        {/* Card Header: Order ID (Clickable) and Status */}
                        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E5E0DA]">
                          <div>
                            <button
                              onClick={() => setSelectedOrderIdForModal(ord.id)}
                              className="font-serif font-bold text-base text-[#423D33] hover:text-[#8C7A6B] transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                              title="Hacer clic para ver detalle completo"
                            >
                              <span>Pedido #{ord.id}</span>
                              <Eye className="w-3.5 h-3.5 text-[#8C7A6B]" />
                            </button>
                            <span className="text-[11px] text-[#8C7A6B] block">
                              {new Date(ord.createdAt).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div className="text-right space-y-1">
                            <span className="font-serif font-bold text-base text-[#423D33] block">
                              ${ord.total.toFixed(2)} USD
                            </span>
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeStyle(
                                ord.status
                              )}`}
                            >
                              {ord.status}
                            </span>
                          </div>
                        </div>

                        {/* Customer Information (Clickable) */}
                        <div
                          onClick={() => setSelectedOrderIdForModal(ord.id)}
                          className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E5E0DA] space-y-1 text-xs cursor-pointer hover:bg-[#F2EDE7] transition-colors"
                          title="Hacer clic para ver detalle completo"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-[#8C7A6B]">
                              Cliente
                            </span>
                            <span className="text-[10px] text-[#8C7A6B] flex items-center gap-1">
                              <Eye className="w-3 h-3" /> Ver detalles
                            </span>
                          </div>
                          <p className="font-bold text-[#423D33]">{ord.customerName}</p>
                          <p className="text-[#8C7A6B] text-[11px] truncate">
                            {ord.customerEmail} • {ord.customerPhone}
                          </p>
                          <p className="text-[11px] text-[#8C7A6B] truncate">
                            📍 {ord.shippingAddress}, {ord.shippingCity}
                          </p>
                        </div>

                        {/* Quick Items & Payment Method preview */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <div className="flex items-center gap-2">
                            {isBankTransfer ? (
                              <Building2 className="w-4 h-4 text-[#8C7A6B]" />
                            ) : (
                              <Truck className="w-4 h-4 text-[#608058]" />
                            )}
                            <span className="text-[11px] text-[#423D33] font-semibold">
                              {ord.paymentMethod}
                            </span>
                          </div>

                          <span className="text-[11px] text-[#8C7A6B]">
                            {ord.items.length} {ord.items.length === 1 ? "artículo" : "artículos"}
                          </span>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-[#E5E0DA]">
                          <select
                            value={ord.status}
                            onChange={(e) => {
                              updateOrderStatus(ord.id, e.target.value as OrderStatus);
                              notify(`Estado del pedido #${ord.id} actualizado a "${e.target.value}".`);
                            }}
                            className="text-[10px] font-bold py-1.5 px-2.5 rounded-xl border border-[#E5E0DA] bg-[#FAF7F2] text-[#423D33] focus:outline-none focus:ring-1 focus:ring-[#8C7A6B] cursor-pointer"
                          >
                            <option value="Pendiente de verificación">Pendiente de verificación</option>
                            <option value="Pago verificado">Pago verificado</option>
                            <option value="En preparación">En preparación</option>
                            <option value="En camino">En camino</option>
                            <option value="Entregado y cobrado">Entregado y cobrado</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedOrderIdForModal(ord.id)}
                              className="px-3.5 py-1.5 rounded-full bg-[#4A4541] hover:bg-[#35312E] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver Completo</span>
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`¿Estás seguro de eliminar el pedido #${ord.id}?`)) {
                                  deleteOrder(ord.id);
                                  notify(`Pedido #${ord.id} eliminado.`);
                                }
                              }}
                              className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Eliminar Pedido"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ======================================================== */}
              {/* MODAL DE DETALLE COMPLETO DEL PEDIDO (DESPLIEGUE AL CLIC) */}
              {/* ======================================================== */}
              {selectedOrderIdForModal && (() => {
                const activeModalOrder = orders.find((o) => o.id === selectedOrderIdForModal) || null;
                if (!activeModalOrder) return null;

                const isBankTransfer =
                  activeModalOrder.paymentMethod === "Transferencia Bancaria" ||
                  activeModalOrder.paymentDetails?.method === "Transferencia Bancaria";
                const isCashOnDelivery =
                  activeModalOrder.paymentMethod === "Efectivo (Pago contra entrega)" ||
                  activeModalOrder.paymentDetails?.method === "Efectivo (Pago contra entrega)";

                return (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E5E0DA] shadow-2xl space-y-6 p-6 sm:p-8 relative">
                      {/* Modal Header */}
                      <div className="flex items-start justify-between gap-4 border-b border-[#E5E0DA] pb-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-serif font-bold text-xl text-[#423D33]">
                              Detalle del Pedido #{activeModalOrder.id}
                            </span>
                            <span
                              className={`px-3 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeStyle(
                                activeModalOrder.status
                              )}`}
                            >
                              {activeModalOrder.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#8C7A6B] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              Registrado el{" "}
                              {new Date(activeModalOrder.createdAt).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => window.print()}
                            className="p-2 rounded-full bg-[#FAF7F2] text-[#8C7A6B] hover:text-[#423D33] border border-[#E5E0DA] transition-colors cursor-pointer"
                            title="Imprimir Resumen"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedOrderIdForModal(null)}
                            className="p-2 rounded-full bg-[#FAF7F2] text-[#423D33] hover:bg-[#E5E0DA] border border-[#E5E0DA] transition-colors cursor-pointer"
                            title="Cerrar ventana"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Control Manual de Estado del Pedido */}
                      <div className="p-4 rounded-2xl bg-[#F8F5F0] border border-[#E5E0DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] block">
                            Control Manual de Estado
                          </span>
                          <span className="text-xs font-semibold text-[#423D33]">
                            Actualiza el ciclo de vida del pedido en tiempo real:
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={activeModalOrder.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as OrderStatus;
                              updateOrderStatus(activeModalOrder.id, newStatus);
                              notify(`Estado del pedido #${activeModalOrder.id} cambiado a "${newStatus}".`);
                            }}
                            className="text-xs px-3.5 py-2 rounded-xl border border-[#E5E0DA] bg-white font-bold text-[#423D33] focus:outline-none focus:ring-1 focus:ring-[#8C7A6B] cursor-pointer shadow-2xs"
                          >
                            <option value="Pendiente de verificación">Pendiente de verificación</option>
                            <option value="Pago verificado">Pago verificado</option>
                            <option value="En preparación">En preparación</option>
                            <option value="En camino">En camino</option>
                            <option value="Entregado y cobrado">Entregado y cobrado</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>

                          {isBankTransfer &&
                            (activeModalOrder.status === "Pendiente de verificación" ||
                              activeModalOrder.status === "Pendiente") && (
                              <button
                                onClick={() => {
                                  updateOrderStatus(activeModalOrder.id, "Pago verificado");
                                  notify(`Pago del pedido #${activeModalOrder.id} marcado como VERIFICADO.`);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-[#608058] hover:bg-[#4d6647] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Marcar Verificado</span>
                              </button>
                            )}
                        </div>
                      </div>

                      {/* Grid de Información del Cliente & Pago */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Datos del Cliente y Envío */}
                        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5E0DA] space-y-2.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8C7A6B] border-b border-[#E5E0DA]/70 pb-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>Datos del Cliente & Envío</span>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-[#8C7A6B]">Nombre:</span>
                              <span className="font-bold text-[#423D33]">{activeModalOrder.customerName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#8C7A6B]">Email:</span>
                              <span className="font-medium text-[#423D33]">{activeModalOrder.customerEmail}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#8C7A6B]">Teléfono:</span>
                              <span className="font-medium text-[#423D33]">{activeModalOrder.customerPhone}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-[#E5E0DA]/50">
                              <span className="text-[#8C7A6B]">Dirección:</span>
                              <span className="font-medium text-[#423D33] text-right pl-2">
                                {activeModalOrder.shippingAddress}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#8C7A6B]">Ciudad:</span>
                              <span className="font-bold text-[#423D33]">{activeModalOrder.shippingCity}</span>
                            </div>
                            {activeModalOrder.trackingCode && (
                              <div className="flex justify-between pt-1 border-t border-[#E5E0DA]/50">
                                <span className="text-[#8C7A6B]">Seguimiento:</span>
                                <span className="font-mono font-bold text-[#423D33]">
                                  {activeModalOrder.trackingCode}
                                </span>
                              </div>
                            )}
                            {activeModalOrder.notes && (
                              <div className="pt-1.5 border-t border-[#E5E0DA]/50 text-[11px]">
                                <span className="text-[#8C7A6B] block">Nota / Dedicatoria:</span>
                                <p className="italic text-[#423D33] bg-white p-2 rounded-lg border border-[#E5E0DA] mt-0.5">
                                  "{activeModalOrder.notes}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Información Detallada del Método de Pago */}
                        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5E0DA] space-y-2.5">
                          <div className="flex items-center justify-between border-b border-[#E5E0DA]/70 pb-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#423D33]">
                              {isBankTransfer ? (
                                <Building2 className="w-3.5 h-3.5 text-[#8C7A6B]" />
                              ) : (
                                <Truck className="w-3.5 h-3.5 text-[#608058]" />
                              )}
                              <span>Método: {activeModalOrder.paymentMethod}</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#E5E0DA] text-[#423D33]">
                              Total: ${activeModalOrder.total.toFixed(2)} USD
                            </span>
                          </div>

                          {/* Transferencia Bancaria */}
                          {isBankTransfer && (
                            <div className="space-y-2 text-xs">
                              <div className="bg-white p-3 rounded-xl border border-[#E5E0DA] space-y-1.5">
                                <div className="flex justify-between">
                                  <span className="text-[#8C7A6B]">Banco Receptor/Emisor:</span>
                                  <span className="font-bold text-[#423D33]">
                                    {activeModalOrder.paymentDetails?.bankName || "Banco Pichincha / Produbanco"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#8C7A6B]">Nº Referencia:</span>
                                  <span className="font-mono font-bold text-[#423D33]">
                                    {activeModalOrder.paymentDetails?.referenceNumber ||
                                      activeModalOrder.trackingCode ||
                                      "REF-TRF-REGISTRADA"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pt-1 border-t border-[#E5E0DA]/50">
                                  <span className="text-[#8C7A6B]">Comprobante:</span>
                                  {activeModalOrder.paymentDetails?.receiptUrl ||
                                  activeModalOrder.paymentDetails?.receiptFileName ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] text-[#423D33] font-medium truncate max-w-[120px]">
                                        {activeModalOrder.paymentDetails.receiptFileName || "comprobante.pdf"}
                                      </span>
                                      {activeModalOrder.paymentDetails.receiptUrl && (
                                        <button
                                          onClick={() =>
                                            setReceiptModalUrl(activeModalOrder.paymentDetails!.receiptUrl!)
                                          }
                                          className="text-[10px] font-bold text-[#8C7A6B] hover:text-[#423D33] underline flex items-center gap-1 cursor-pointer"
                                        >
                                          <Eye className="w-3 h-3" /> Ver
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-[#8C7A6B] italic">Validación por referencia</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Efectivo contra entrega */}
                          {isCashOnDelivery && (
                            <div className="bg-white p-3 rounded-xl border border-[#E5E0DA] space-y-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md text-[10px] font-bold uppercase">
                                  Cobro en Mano
                                </span>
                                <span className="text-xs text-[#423D33]">
                                  Monto a cobrar: <strong>${activeModalOrder.total.toFixed(2)} USD</strong>
                                </span>
                              </div>
                              <div className="pt-1 space-y-1">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-[#8C7A6B]">Paga con / Cambio:</span>
                                  <span className="font-semibold text-[#423D33]">
                                    {activeModalOrder.paymentDetails?.cashChangeFor ||
                                      "Monto exacto ($" + activeModalOrder.total.toFixed(2) + ")"}
                                  </span>
                                </div>
                                <div className="text-[11px]">
                                  <span className="text-[#8C7A6B] block">Instrucciones de entrega:</span>
                                  <span className="text-[#423D33] italic">
                                    {activeModalOrder.paymentDetails?.deliveryInstructions ||
                                      "Entregar en mano / confirmar timbre"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ========================================================== */}
                      {/* DETALLE COMPLETO DEL PRODUCTO Y CARACTERÍSTICAS SOLICITADAS */}
                      {/* ========================================================== */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-2">
                          <span className="font-serif font-bold text-sm text-[#423D33] flex items-center gap-1.5">
                            <Package className="w-4 h-4 text-[#8C7A6B]" />
                            <span>
                              Detalle Completo de Productos ({activeModalOrder.items.length}{" "}
                              {activeModalOrder.items.length === 1 ? "artículo" : "artículos"})
                            </span>
                          </span>
                          <span className="text-xs text-[#8C7A6B]">
                            {activeModalOrder.items.reduce((acc, it) => acc + it.quantity, 0)} unidades en total
                          </span>
                        </div>

                        <div className="space-y-3">
                          {activeModalOrder.items.map((it, idx) => {
                            const waxType =
                              it.selectedWaxType ||
                              it.candle.waxType ||
                              it.customDetails?.waxType ||
                              "Soja";
                            const itemTotal = it.candle.price * it.quantity;

                            return (
                              <div
                                key={idx}
                                className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E5E0DA] space-y-3"
                              >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                  {/* Left: Image & Name */}
                                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                    {Boolean(it.candle.image && it.candle.image.trim()) ? (
                                      <img
                                        src={it.candle.image}
                                        alt={it.candle.name}
                                        className="w-16 h-16 rounded-2xl object-contain p-1 bg-white shrink-0 border border-[#E5E0DA]"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white shrink-0 border border-[#E5E0DA] text-[#8C7A6B]">
                                        <ImageIcon className="w-6 h-6 opacity-40" />
                                      </div>
                                    )}

                                    <div className="space-y-1 min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h5 className="font-serif font-bold text-sm text-[#423D33]">
                                          {it.candle.name}
                                        </h5>

                                        {/* TIPO DE CERA (Únicamente Parafina o Soja) */}
                                        <span
                                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                            waxType === "Soja"
                                              ? "bg-[#608058]/15 text-[#35522e] border-[#608058]/40"
                                              : "bg-amber-100/90 text-amber-900 border-amber-300"
                                          }`}
                                        >
                                          Cera: {waxType}
                                        </span>
                                      </div>

                                      {/* ESPECIFICACIONES DEL PRODUCTO (Aroma, Tamaño, Vasija, Color) */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-[#423D33] pt-0.5">
                                        <p>
                                          <strong className="text-[#8C7A6B]">Aroma:</strong>{" "}
                                          {it.candle.subtitle ||
                                            (it.candle.olfactoryPyramid
                                              ? `${it.candle.olfactoryPyramid.salida} • ${it.candle.olfactoryPyramid.corazon}`
                                              : "Esencia botánica pura")}
                                        </p>
                                        <p>
                                          <strong className="text-[#8C7A6B]">Tamaño & Quemado:</strong>{" "}
                                          {it.candle.weightGrams}g • {it.candle.burnHours}h
                                        </p>
                                        <p>
                                          <strong className="text-[#8C7A6B]">Base / Vaso:</strong>{" "}
                                          {it.customDetails?.vesselName || it.candle.vesselName}
                                        </p>
                                        <p className="flex items-center gap-1.5">
                                          <strong className="text-[#8C7A6B]">Color de Cera:</strong>
                                          <span
                                            className="w-2.5 h-2.5 rounded-full border border-black/20 inline-block"
                                            style={{
                                              backgroundColor:
                                                it.customDetails?.waxColorHex ||
                                                it.candle.waxColorHex ||
                                                "#FAF7F2",
                                            }}
                                          />
                                          <span>
                                            {it.customDetails?.waxColorName ||
                                              it.candle.waxColorName ||
                                              "Natural Botánico"}
                                          </span>
                                        </p>
                                        <p>
                                          <strong className="text-[#8C7A6B]">Tipo de Mecha:</strong>{" "}
                                          {it.customDetails?.wickName || it.candle.wickType || "Mecha de Algodón 100% Orgánico"}
                                        </p>
                                        {it.customDetails?.customLayersDetail && it.customDetails.customLayersDetail.length > 0 && (
                                          <div className="pt-1 text-[10px]">
                                            <strong className="text-[#8C7A6B] block">Zonas Esculpidas:</strong>
                                            <div className="flex flex-wrap gap-1 mt-0.5">
                                              {it.customDetails.customLayersDetail.map((cl, clIdx) => (
                                                <span
                                                  key={clIdx}
                                                  className="inline-flex items-center gap-1 bg-[#FAF7F2] border border-[#E5E0DA] px-1.5 py-0.5 rounded text-[9px]"
                                                >
                                                  <span
                                                    className="w-2 h-2 rounded-full border border-black/10 inline-block"
                                                    style={{ backgroundColor: cl.colorHex }}
                                                  />
                                                  <span>{cl.name}: <strong>{cl.colorName}</strong></span>
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {it.candle.botanicals && (
                                          <p className="truncate">
                                            <strong className="text-[#8C7A6B]">Botánicos:</strong>{" "}
                                            {it.candle.botanicals.join(", ")}
                                          </p>
                                        )}
                                      </div>

                                      {/* VARIANTES APLICABLES: Grabado, Envoltura, Frase */}
                                      {(it.customEngraving || it.giftWrap || it.customDetails?.labelTitle) && (
                                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                                          {it.customEngraving && (
                                            <span className="px-2 py-0.5 bg-[#FAF3EB] text-[#D98B68] rounded-md text-[10px] font-semibold border border-[#E5D7CC]">
                                              Grabado: "{it.customEngraving}" (+ $3.50)
                                            </span>
                                          )}
                                          {it.giftWrap && (
                                            <span className="px-2 py-0.5 bg-[#EEF4EC] text-[#608058] rounded-md text-[10px] font-semibold border border-[#D5E3D2]">
                                              + Envoltura de Regalo ($2.50)
                                            </span>
                                          )}
                                          {it.customDetails?.labelTitle && (
                                            <span className="px-2 py-0.5 bg-white text-[#423D33] rounded-md text-[10px] font-medium border border-[#E5E0DA]">
                                              Etiqueta: "{it.customDetails.labelTitle}"
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right: Cantidad, Precio Unitario y Subtotal */}
                                  <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E0DA]/80 shrink-0">
                                    <div className="text-left sm:text-right">
                                      <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">
                                        Cantidad
                                      </span>
                                      <span className="font-bold text-sm text-[#423D33]">
                                        {it.quantity} {it.quantity === 1 ? "unidad" : "unidades"}
                                      </span>
                                    </div>

                                    <div className="text-left sm:text-right">
                                      <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">
                                        Precio Unit.
                                      </span>
                                      <span className="font-semibold text-xs text-[#423D33]">
                                        ${it.candle.price.toFixed(2)} USD
                                      </span>
                                    </div>

                                    <div className="text-right pl-3 border-l border-[#E5E0DA]">
                                      <span className="text-[10px] uppercase font-bold text-[#8C7A6B] block">
                                        Total Prod.
                                      </span>
                                      <span className="font-serif font-bold text-base text-[#423D33]">
                                        ${itemTotal.toFixed(2)} USD
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Desglose Financiero & Total General */}
                      <div className="p-4 rounded-2xl bg-white border border-[#E5E0DA] space-y-2">
                        <div className="flex justify-between text-xs text-[#8C7A6B]">
                          <span>Subtotal de productos:</span>
                          <span className="font-semibold text-[#423D33]">
                            ${activeModalOrder.subtotal.toFixed(2)} USD
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-[#8C7A6B]">
                          <span>Costo de envío:</span>
                          <span className="font-semibold text-[#423D33]">
                            {activeModalOrder.shippingCost === 0
                              ? "GRATIS"
                              : `$${activeModalOrder.shippingCost.toFixed(2)} USD`}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-[#423D33] pt-2 border-t border-[#E5E0DA]">
                          <span>Total General del Pedido:</span>
                          <span className="font-serif text-lg font-bold text-[#423D33]">
                            ${activeModalOrder.total.toFixed(2)} USD
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#E5E0DA]">
                        <button
                          onClick={() => {
                            if (confirm(`¿Estás seguro de eliminar el pedido #${activeModalOrder.id}?`)) {
                              deleteOrder(activeModalOrder.id);
                              setSelectedOrderIdForModal(null);
                              notify(`Pedido #${activeModalOrder.id} eliminado.`);
                            }
                          }}
                          className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Eliminar Pedido</span>
                        </button>

                        <button
                          onClick={() => setSelectedOrderIdForModal(null)}
                          className="px-6 py-2.5 rounded-full bg-[#4A4541] hover:bg-[#35312E] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                        >
                          Cerrar Detalle
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Receipt Modal Preview */}
              {receiptModalUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                  <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#E5E0DA] shadow-2xl">
                    <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-3">
                      <h4 className="font-serif font-bold text-base text-[#423D33]">
                        Comprobante de Transferencia Bancaria
                      </h4>
                      <button
                        onClick={() => setReceiptModalUrl(null)}
                        className="p-1 rounded-full bg-[#FAF7F2] text-[#423D33] hover:bg-[#E5E0DA]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="max-h-[60vh] overflow-hidden rounded-2xl bg-[#FAF7F2] border border-[#E5E0DA] flex items-center justify-center p-2">
                      {Boolean(receiptModalUrl && receiptModalUrl.trim()) && (
                        <img
                          src={receiptModalUrl}
                          alt="Comprobante"
                          className="max-h-full max-w-full object-contain rounded-xl"
                        />
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E0DA]">
                      <a
                        href={receiptModalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-full border border-[#E5E0DA] text-xs font-semibold text-[#423D33] hover:bg-[#FAF7F2] flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir en nueva pestaña</span>
                      </a>
                      <button
                        onClick={() => setReceiptModalUrl(null)}
                        className="px-4 py-2 rounded-full bg-[#4A4541] text-white text-xs font-bold"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: GESTIÓN DE USUARIOS CON BÚSQUEDA Y FILTROS */}
          {activeTab === "usuarios" && (
            <div className="space-y-6">
              {/* Header and User Creation Trigger */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#423D33]">
                    Usuarios Registrados & Permisos
                  </h3>
                  <p className="text-xs text-[#8C7A6B]">
                    Control de cuentas de clientes, administradores del taller y estados de acceso
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingUser(true)}
                  className="px-4 py-2 rounded-full bg-[#4A4541] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#35312E] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Nuevo Usuario</span>
                </button>
              </div>

              {/* Quick Stat Chips for Users */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-white p-3 rounded-2xl border border-[#E5E0DA] text-center">
                  <span className="text-[10px] text-[#8C7A6B] uppercase font-bold block">Total</span>
                  <span className="font-serif text-xl font-bold text-[#423D33]">{users.length}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-[#E5E0DA] text-center">
                  <span className="text-[10px] text-[#608058] uppercase font-bold block">Activos</span>
                  <span className="font-serif text-xl font-bold text-[#608058]">{activeUsersCount}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-[#E5E0DA] text-center">
                  <span className="text-[10px] text-red-600 uppercase font-bold block">Inactivos/Susp.</span>
                  <span className="font-serif text-xl font-bold text-red-600">{suspendedUsersCount}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-[#E5E0DA] text-center">
                  <span className="text-[10px] text-[#8C7A6B] uppercase font-bold block">Admins</span>
                  <span className="font-serif text-xl font-bold text-[#8C7A6B]">{adminUsersCount}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-[#E5E0DA] text-center">
                  <span className="text-[10px] text-[#423D33] uppercase font-bold block">Clientes</span>
                  <span className="font-serif text-xl font-bold text-[#423D33]">{clientUsersCount}</span>
                </div>
              </div>

              {/* Search Bar and Status Filter Buttons */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E0DA] shadow-xs">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, correo, ciudad o rol..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#E5E0DA] bg-[#FAF7F2] text-[#423D33] focus:outline-none focus:ring-1 focus:ring-[#8C7A6B]"
                  />
                  {userSearch && (
                    <button
                      onClick={() => setUserSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#423D33]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Pills for Status and Role */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F4EFEA] rounded-full border border-[#E5E0DA]">
                  <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider px-2 flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    <span>Filtro:</span>
                  </span>

                  {[
                    { id: "todos", label: "Todos" },
                    { id: "activo", label: `Activos (${activeUsersCount})` },
                    { id: "suspendido", label: `Inactivos (${suspendedUsersCount})` },
                    { id: "administrador", label: `Admins (${adminUsersCount})` },
                    { id: "cliente", label: `Clientes (${clientUsersCount})` },
                  ].map((filterItem) => (
                    <button
                      key={filterItem.id}
                      onClick={() => setUserStatusFilter(filterItem.id as any)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        userStatusFilter === filterItem.id
                          ? "bg-[#4A4541] text-white shadow-xs"
                          : "text-[#423D33]/70 hover:text-[#423D33]"
                      }`}
                    >
                      {filterItem.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users List */}
              <div className="bg-white rounded-3xl border border-[#E5E0DA] overflow-hidden shadow-xs">
                {filteredUsers.length === 0 ? (
                  <div className="p-10 text-center space-y-2">
                    <p className="text-sm font-serif text-[#423D33]">
                      No se encontraron usuarios que coincidan con la búsqueda o filtro aplicado.
                    </p>
                    <button
                      onClick={() => {
                        setUserSearch("");
                        setUserStatusFilter("todos");
                      }}
                      className="text-xs text-[#8C7A6B] font-bold uppercase underline cursor-pointer"
                    >
                      Restablecer Filtros
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E5E0DA]">
                    {filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF7F2]/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#F4EFEA] border border-[#E5E0DA] flex items-center justify-center font-bold text-[#423D33] font-serif shrink-0">
                            {Boolean(u.avatar && u.avatar.trim()) ? (
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-full h-full object-cover rounded-full"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              u.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-sm text-[#423D33]">
                                {u.name}
                              </span>
                              <span
                                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  u.role === "administrador"
                                    ? "bg-[#8C7A6B] text-white"
                                    : "bg-[#F2EDE7] text-[#8C7A6B]"
                                }`}
                              >
                                {u.role}
                              </span>
                              <span
                                className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                                  u.status === "activo"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {u.status === "activo" ? "Activo" : "Inactivo / Suspendido"}
                              </span>
                            </div>
                            <p className="text-xs text-[#8C7A6B]">
                              {u.email} • {u.city || "Ciudad no registrada"} {u.phone && `• Tel: ${u.phone}`}
                            </p>
                          </div>
                        </div>

                        {/* Role & Status Action Buttons */}
                        <div className="flex items-center gap-2 text-xs">
                          {/* Role Toggle */}
                          <button
                            onClick={() => {
                              const newRole = u.role === "administrador" ? "cliente" : "administrador";
                              updateUserRole(u.id, newRole);
                              notify(`Rol de "${u.name}" actualizado a ${newRole}.`);
                            }}
                            className="px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#E5E0DA] text-[#423D33] hover:bg-[#4A4541] hover:text-white transition-colors cursor-pointer"
                            title={u.role === "administrador" ? "Convertir en Cliente" : "Otorgar Permisos de Administrador"}
                          >
                            {u.role === "administrador" ? "Hacer Cliente" : "Hacer Admin"}
                          </button>

                          {/* Status Toggle (Active / Inactive) */}
                          <button
                            onClick={() => {
                              const newStatus = u.status === "activo" ? "suspendido" : "activo";
                              updateUserStatus(u.id, newStatus);
                              notify(`Estado de "${u.name}" cambiado a ${newStatus}.`);
                            }}
                            className={`px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-colors ${
                              u.status === "activo"
                                ? "border-red-200 text-red-600 hover:bg-red-50"
                                : "border-green-200 text-green-700 hover:bg-green-50"
                            }`}
                            title={u.status === "activo" ? "Suspender acceso" : "Reactivar acceso"}
                          >
                            {u.status === "activo" ? "Suspender" : "Activar"}
                          </button>

                          {/* Delete user */}
                          {u.id !== currentUser.id && (
                            <button
                              onClick={() => {
                                if (confirm(`¿Eliminar definitivamente la cuenta de ${u.name}?`)) {
                                  deleteUser(u.id);
                                  notify("Usuario eliminado.");
                                }
                              }}
                              className="p-1.5 rounded-full text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Eliminar Usuario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal to Add New User */}
              {isAddingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E5E0DA] shadow-2xl">
                    <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-3">
                      <h3 className="font-serif text-xl font-bold text-[#423D33]">
                        Crear Nuevo Usuario
                      </h3>
                      <button
                        onClick={() => setIsAddingUser(false)}
                        className="p-1.5 rounded-full bg-[#F4EFEA] text-[#423D33] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateNewUser} className="space-y-3.5 text-xs">
                      <div>
                        <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          placeholder="Ej. Mateo Gómez"
                          className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                          Correo Electrónico *
                        </label>
                        <input
                          type="email"
                          required
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          placeholder="mateo@ejemplo.com"
                          className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                          Contraseña Inicial
                        </label>
                        <input
                          type="password"
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                          placeholder="Por defecto: 123456"
                          className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                          Rol Asignado *
                        </label>
                        <select
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                          className="w-full p-2.5 rounded-xl border border-[#E5E0DA] bg-white font-medium"
                        >
                          <option value="cliente">Cliente (Compras, Historial y Personalización)</option>
                          <option value="administrador">Administrador (Control Total del Panel)</option>
                        </select>
                      </div>

                      <div className="pt-3 flex justify-end gap-2 border-t border-[#E5E0DA]">
                        <button
                          type="button"
                          onClick={() => setIsAddingUser(false)}
                          className="px-4 py-2 rounded-full border border-[#E5E0DA] cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-full bg-[#4A4541] text-white font-bold cursor-pointer"
                        >
                          Crear Cuenta
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: CONFIGURACIÓN DE MARCA & LOGO UPLOAD */}
          {activeTab === "marca" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#423D33]">
                  Identidad & Configuración General de la Marca
                </h3>
                <p className="text-xs text-[#8C7A6B]">
                  Cambia el nombre, logotipo oficial (subido desde tu computador o por URL), historia, manifiesto y WhatsApp
                </p>
              </div>

              <form onSubmit={handleSaveBrand} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E0DA] shadow-xs space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                      Nombre de la Marca *
                    </label>
                    <input
                      type="text"
                      required
                      value={brandForm.brandName}
                      onChange={(e) => setBrandForm({ ...brandForm, brandName: e.target.value })}
                      placeholder="Ej. Ayllu"
                      className="w-full p-2.5 rounded-xl border border-[#E5E0DA] text-sm font-serif font-bold text-[#423D33]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                      Eslogan / Subtítulo *
                    </label>
                    <input
                      type="text"
                      required
                      value={brandForm.slogan}
                      onChange={(e) => setBrandForm({ ...brandForm, slogan: e.target.value })}
                      placeholder="Ej. Velas con Aroma • Creación Artesanal"
                      className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                    />
                  </div>
                </div>

                {/* Logo Upload Component */}
                <ImageUploadField
                  label="Logotipo Oficial de Ayllu (Subir desde el Computador)"
                  value={brandForm.logoUrl}
                  onChange={(newLogoUrl) => setBrandForm({ ...brandForm, logoUrl: newLogoUrl })}
                  aspectRatio="circle"
                  recommendedSize="500x500px o 800x800px (PNG, JPG, SVG)"
                  folder="brand"
                />

                {/* About & Manifesto Texts */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                      Frase Destacada de Nosotros (Manifiesto) *
                    </label>
                    <textarea
                      rows={3}
                      value={brandForm.aboutDescription}
                      onChange={(e) => setBrandForm({ ...brandForm, aboutDescription: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#E5E0DA] font-serif leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                      Historia Detallada del Origen & Filosofía
                    </label>
                    <textarea
                      rows={3}
                      value={brandForm.aboutDetailedStory}
                      onChange={(e) => setBrandForm({ ...brandForm, aboutDetailedStory: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#E5E0DA] leading-relaxed"
                    />
                  </div>
                </div>

                {/* Contact & WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                      Teléfono WhatsApp *
                    </label>
                    <input
                      type="text"
                      value={brandForm.whatsappNumber}
                      onChange={(e) => setBrandForm({ ...brandForm, whatsappNumber: e.target.value })}
                      placeholder="+34 612 345 678"
                      className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                      Teléfono Directo
                    </label>
                    <input
                      type="text"
                      value={brandForm.contactPhone || ""}
                      onChange={(e) => setBrandForm({ ...brandForm, contactPhone: e.target.value })}
                      placeholder="+34 912 345 678"
                      className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={brandForm.contactEmail}
                      onChange={(e) => setBrandForm({ ...brandForm, contactEmail: e.target.value })}
                      placeholder="taller@aylluvelas.es"
                      className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#8C7A6B] uppercase tracking-wider mb-1">
                      Envío Gratis Desde ($)
                    </label>
                    <input
                      type="number"
                      value={brandForm.shippingFreeThreshold}
                      onChange={(e) =>
                        setBrandForm({ ...brandForm, shippingFreeThreshold: Number(e.target.value) })
                      }
                      className="w-full p-2.5 rounded-xl border border-[#E5E0DA]"
                    />
                  </div>
                </div>

                {/* Banner acceso rápido al editor del Pie de Página */}
                <div className="p-4 bg-[#F4EFEA] rounded-2xl border border-[#E5E0DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-5 h-5 text-[#D98B68] shrink-0" />
                    <div>
                      <h5 className="font-bold text-[#423D33] text-xs">
                        Personalización del Pie de Página (Primera Columna y Atención & Contacto)
                      </h5>
                      <p className="text-[11px] text-[#8C7A6B]">
                        Edita lemas, logotipo, misión, horarios, teléfono y WhatsApp en tiempo real.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("piePagina")}
                    className="px-4 py-1.5 rounded-full bg-[#8C7A6B] hover:bg-[#4A4541] text-white text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    Editar Pie de Página ›
                  </button>
                </div>

                <div className="pt-4 border-t border-[#E5E0DA] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("¿Restaurar valores predeterminados de marca?")) {
                        resetBrandConfig();
                        setBrandForm(brandConfig);
                        notify("Valores restaurados.");
                      }
                    }}
                    className="px-4 py-2 rounded-full border border-[#E5E0DA] text-[#8C7A6B] hover:text-[#423D33] cursor-pointer"
                  >
                    Restaurar Original
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#4A4541] text-white font-bold hover:bg-[#35312E] shadow-xs cursor-pointer"
                  >
                    Guardar Cambios de Marca
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: PIE DE PÁGINA (FOOTER & CONTACTO) */}
          {activeTab === "piePagina" && (
            <FooterSettingsTab
              brandForm={brandForm}
              setBrandForm={setBrandForm}
              onSave={async (formData) => {
                const res = await updateBrandConfig(formData);
                return res;
              }}
              onReset={() => {
                if (confirm("¿Restaurar valores predeterminados de la Primera Columna y Atención & Contacto?")) {
                  const restored = {
                    ...brandForm,
                    footerSubtitle: "Velas Botánicas & Creadores con Alma",
                    footerDescription:
                      "Velas de cera de soja pura y mechas de madera silvestre elaboradas artesanalmente en colaboración con jóvenes creadores e ilustradores con habilidades especiales. Cada pieza ilumina un hogar e impulsa la autonomía inclusiva.",
                    footerBadge: "Filosofía AYNI • Apoyo Mutuo",
                    footerContactTitle: "Atención & Contacto",
                    footerHoursWeekdays: "Lunes a Viernes: 09:30 - 19:30",
                    footerHoursWeekends: "Sábados: 10:00 - 14:00",
                    footerWhatsAppText: "Chat en Vivo con un Asesor",
                    footerWhatsAppMessage:
                      `Hola ${brandForm.brandName || "Ayllu"}, me gustaría consultar sobre sus velas botánicas personalizadas y proyectos con jóvenes creadores.`,
                  };
                  setBrandForm(restored);
                  updateBrandConfig(restored);
                  notify("Valores predeterminados de primera columna y atención & contacto restaurados.");
                }
              }}
              notify={notify}
            />
          )}

          {/* TAB: PERSONALIZADOR 2D / CATÁLOGO DE OPCIONES */}
          {activeTab === "personalizador" && (
            <AdminCustomizerManager notify={notify} />
          )}

          {/* TAB: COMENTARIOS Y RESEÑAS */}
          {activeTab === "comentarios" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#423D33] flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#8C7A6B]" />
                    Gestión de Comentarios y Reseñas
                  </h3>
                  <p className="text-xs text-[#8C7A6B]">
                    Supervisa, filtra y modera las experiencias compartidas por clientes y visitantes. Como administrador, puedes eliminar cualquier comentario.
                  </p>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-[#E5E0DA] shadow-xs space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
                    Total Comentarios
                  </span>
                  <div className="font-serif text-3xl font-bold text-[#423D33]">
                    {reviews.length}
                  </div>
                  <span className="text-[11px] text-[#8C7A6B]">Publicaciones registradas</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-[#E5E0DA] shadow-xs space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
                    Calificación Promedio
                  </span>
                  <div className="font-serif text-3xl font-bold text-[#423D33] flex items-center gap-1.5">
                    {reviews.length
                      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
                      : "5.0"}
                    <Star className="w-5 h-5 fill-[#8C7A6B] text-[#8C7A6B]" />
                  </div>
                  <span className="text-[11px] text-[#8C7A6B]">Sobre 5 estrellas</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-[#E5E0DA] shadow-xs space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
                    5 Estrellas
                  </span>
                  <div className="font-serif text-3xl font-bold text-[#608058]">
                    {reviews.filter((r) => r.rating === 5).length}
                  </div>
                  <span className="text-[11px] text-[#608058]">Máxima puntuación</span>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-[#E5E0DA] shadow-xs space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
                    Verificadas
                  </span>
                  <div className="font-serif text-3xl font-bold text-[#423D33]">
                    {reviews.filter((r) => r.verified).length}
                  </div>
                  <span className="text-[11px] text-[#8C7A6B]">Compras y experiencias válidas</span>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="bg-white p-4 rounded-3xl border border-[#E5E0DA] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por cliente, vela o texto..."
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] rounded-xl border border-[#E5E0DA] text-xs text-[#423D33] focus:outline-none focus:border-[#8C7A6B]"
                  />
                  {reviewSearch && (
                    <button
                      onClick={() => setReviewSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7A6B] hover:text-[#423D33]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  <span className="text-xs font-semibold text-[#8C7A6B] mr-1">Filtrar:</span>
                  <button
                    onClick={() => setReviewRatingFilter("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      reviewRatingFilter === "all"
                        ? "bg-[#4A4541] text-white shadow-xs"
                        : "bg-[#FAF7F2] text-[#423D33] border border-[#E5E0DA] hover:bg-[#E5E0DA]/30"
                    }`}
                  >
                    Todos ({reviews.length})
                  </button>
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => setReviewRatingFilter(stars)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        reviewRatingFilter === stars
                          ? "bg-[#4A4541] text-white shadow-xs"
                          : "bg-[#FAF7F2] text-[#423D33] border border-[#E5E0DA] hover:bg-[#E5E0DA]/30"
                      }`}
                    >
                      <span>{stars}</span>
                      <Star className={`w-3 h-3 ${reviewRatingFilter === stars ? "fill-white" : "fill-[#8C7A6B] text-[#8C7A6B]"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Reviews List */}
              {(() => {
                const filtered = reviews.filter((r) => {
                  if (reviewRatingFilter !== "all" && r.rating !== reviewRatingFilter) return false;
                  if (reviewSearch.trim()) {
                    const q = reviewSearch.toLowerCase();
                    const authorMatch = r.author?.toLowerCase().includes(q);
                    const emailMatch = r.userEmail?.toLowerCase().includes(q);
                    const commentMatch = r.comment?.toLowerCase().includes(q);
                    const candleMatch = r.candleName?.toLowerCase().includes(q);
                    const locMatch = r.location?.toLowerCase().includes(q);
                    if (!authorMatch && !emailMatch && !commentMatch && !candleMatch && !locMatch) return false;
                  }
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="bg-white p-12 rounded-3xl border border-[#E5E0DA] text-center space-y-3">
                      <MessageSquare className="w-10 h-10 text-[#8C7A6B]/50 mx-auto" />
                      <p className="font-serif text-base text-[#423D33]">No se encontraron comentarios</p>
                      <p className="text-xs text-[#8C7A6B]">
                        Prueba con otros términos de búsqueda o cambia el filtro de estrellas.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {filtered.map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E5E0DA] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all hover:border-[#8C7A6B]/40"
                      >
                        <div className="space-y-2.5 flex-1">
                          {/* Top Row: Stars + Author info + Badges */}
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= (rev.rating || 5)
                                      ? "fill-[#8C7A6B] text-[#8C7A6B]"
                                      : "text-[#D1C7BD]"
                                  }`}
                                />
                              ))}
                            </div>

                            <span className="font-serif font-bold text-sm text-[#423D33]">
                              {rev.author}
                            </span>

                            {rev.userEmail && (
                              <span className="text-[10px] text-[#8C7A6B] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#E5E0DA]">
                                {rev.userEmail}
                              </span>
                            )}

                            <span className="text-[10px] text-[#8C7A6B]">
                              {rev.location || "España"} • {rev.date}
                            </span>

                            <span className="text-[10px] font-semibold text-[#8C7A6B] bg-[#8C7A6B]/10 px-2.5 py-0.5 rounded-full border border-[#8C7A6B]/20">
                              {rev.candleName || "Vela Ayllu"}
                            </span>

                            {rev.verified && (
                              <span className="text-[9px] font-bold text-[#608058] bg-[#608058]/10 px-2 py-0.5 rounded-full border border-[#608058]/20">
                                Verificada
                              </span>
                            )}
                          </div>

                          {/* Comment Body */}
                          <p className="text-xs text-[#423D33]/90 leading-relaxed italic bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E5E0DA]/80">
                            "{rev.comment}"
                          </p>

                          {rev.updatedAt && (
                            <p className="text-[10px] text-[#8C7A6B]">
                              Editado por el autor el {new Date(rev.updatedAt).toLocaleDateString("es-ES")}
                            </p>
                          )}
                        </div>

                        {/* Admin Action: Delete */}
                        <div className="shrink-0 pt-2 md:pt-0 self-end md:self-center">
                          <button
                            onClick={() => setReviewDeleteConfirmId(rev.id)}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Eliminar este comentario como Administrador"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Delete Confirmation Modal */}
              {reviewDeleteConfirmId && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#E5E0DA] shadow-xl space-y-4">
                    <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <div className="text-center space-y-1">
                      <h4 className="font-serif text-lg font-bold text-[#423D33]">
                        ¿Eliminar este comentario?
                      </h4>
                      <p className="text-xs text-[#8C7A6B]">
                        Como administrador, esta reseña será eliminada de forma permanente del sistema y de la tienda pública.
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => setReviewDeleteConfirmId(null)}
                        className="w-1/2 py-2 rounded-xl border border-[#D1C7BD] text-xs font-semibold text-[#6B5E54] hover:bg-[#F2EDE7] transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={async () => {
                          const res = await deleteReview(reviewDeleteConfirmId);
                          setReviewDeleteConfirmId(null);
                          if (res.success) {
                            notify("Comentario eliminado correctamente.");
                          } else {
                            notify(res.message);
                          }
                        }}
                        className="w-1/2 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
                      >
                        Sí, Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: SUPABASE SETTINGS & SYNC */}
          {activeTab === "supabase" && (
            <SupabaseSettingsTab
              candles={candles}
              onNotify={notify}
            />
          )}
        </div>
      </div>
    </div>
  );
};

