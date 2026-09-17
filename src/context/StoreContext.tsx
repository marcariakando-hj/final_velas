import React, { createContext, useContext, useState, useEffect } from "react";
import {
  CandleProduct,
  Collaborator,
  UserAccount,
  StoreOrder,
  BrandConfig,
  AromaItem,
  CartItem,
  CustomizerOptionsCatalog,
  SculptedFigure,
  WaxColorOption,
  CandleReview,
  Layer2D,
} from "../types";
import { CANDLE_COLLECTION, COLLABORATORS, CANDLE_REVIEWS } from "../data/candles";
import {
  SANTUARIO_VIRGEN_LAYERS,
  ZORRO_BOSQUE_LAYERS,
  OSITO_ABRAZO_LAYERS,
  PANDA_BAMBU_LAYERS,
  DEFAULT_SCULPTED_FIGURES,
} from "../data/sampleLayers2D";
import { DEFAULT_CUSTOMIZER_CATALOG } from "../data/defaultCustomizerOptions";
import defaultLogo from "../assets/images/ayllu_logo_1787870076474.jpg";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  brandName: "Ayllu",
  slogan: "Velas con Aroma • Creación Artesanal",
  logoUrl: "https://girkotyqtshrrhtbvkky.supabase.co/storage/v1/object/public/candle-assets/brand/ayllu_logo.jpg",
  aboutTagline: "Comunidad, Arte Botánico & Luz Consciente",
  aboutDescription:
    "Porque juntos somos más que un grupo: somos manos que crean, sueños que se unen y luces que inspiran. Cada vela que elaboramos lleva una parte de nuestra historia y nos recuerda que las mejores cosas nacen cuando crecemos en comunidad.",
  aboutDetailedStory:
    "Ayllu es una palabra ancestral quechua y aymara que describe el núcleo sagrado de la vida en comunidad: un tejido de artesanas, ilustradores y botánicos unidos por la reciprocidad (ayni) y el respeto a la tierra. Cada vela de cera virgen es vertida artesanalmente a mano en pequeños lotes, acompañada por la combustión limpia de mechas de algodón 100% natural y vestida con el arte vivo de jóvenes creadores locales.",
  contactEmail: "taller@aylluvelas.es",
  contactPhone: "+34 912 345 678",
  whatsappNumber: "+34 612 345 678",
  shippingFreeThreshold: 50,
  currencySymbol: "$",
  // Footer Customization Fields (Contacto & Pie de Página)
  footerSubtitle: "Velas Botánicas & Creadores con Alma",
  footerDescription:
    "Velas de cera de soja pura y mechas de madera silvestre elaboradas artesanalmente en colaboración con jóvenes creadores e ilustradores con habilidades especiales. Cada pieza ilumina un hogar e impulsa la autonomía inclusiva.",
  footerBadge: "Filosofía AYNI • Apoyo Mutuo",
  footerNavTitle: "Navegación Rápida",
  footerContactTitle: "Atención & Contacto",
  footerHoursWeekdays: "Lunes a Viernes: 09:30 - 19:30",
  footerHoursWeekends: "Sábados: 10:00 - 14:00",
  footerWhatsAppText: "Chat en Vivo con un Asesor",
  footerWhatsAppMessage: "Hola Ayllu, me gustaría consultar sobre sus velas botánicas personalizadas y proyectos con jóvenes creadores.",
  footerClubTitle: "Comunidad • Club Botánico",
  footerClubDescription: "Únete a nuestra membresía para recibir la Guía Digital de Rituales del Hogar y acceso anticipado a piezas numeradas.",
  footerClubButtonText: "Únete al Club",
  footerClubDisclaimer: "* Sin spam. Puedes cancelar tu suscripción en cualquier momento con un clic.",
  footerCopyright: "© 2026 Ayllu Artesanal. Todos los derechos reservados.",
  footerLegalPrivacy: "Políticas de Privacidad",
  footerLegalTerms: "Términos del Servicio",
  footerLegalShipping: "Envíos & Devoluciones",
};

export const DEFAULT_AROMAS: AromaItem[] = [
  {
    id: "aroma-lavanda",
    name: "Lavanda Silvestre Francesa",
    family: "Floral & Relajación",
    intensity: 4,
    notes: ["Lavandina de Provenza", "Manzanilla Romana", "Eucalipto dulce"],
    description: "Inductor natural del sueño, serenidad mental y reducción de la ansiedad.",
    accentColor: "#9B88A8",
  },
  {
    id: "aroma-citricos-canela",
    name: "Naranja Sanguina & Canela Ceilán",
    family: "Cálido & Especiado",
    intensity: 5,
    notes: ["Rodajas de naranja deshidratada", "Canela corteza pura", "Clavo de olor"],
    description: "Fragancia acogedora, hogareña y revitalizante con acordes cítricos tostados.",
    accentColor: "#D98B68",
  },
  {
    id: "aroma-sandalo-ambar",
    name: "Sándalo de Mysore & Ámbar Noble",
    family: "Madera & Místico",
    intensity: 4,
    notes: ["Sándalo pulido", "Resina de ámbar fósil", "Cedro del Atlas", "Incienso blanco"],
    description: "Profundidad meditativa terrosa para templanza, yoga y lectura consciente.",
    accentColor: "#8C7A6B",
  },
  {
    id: "aroma-vainilla-bourbon",
    name: "Vainilla Bourbon & Haba Tonka",
    family: "Gourmand & Suave",
    intensity: 3,
    notes: ["Vaina de vainilla infusionada", "Haba tonka tostada", "Azúcar moreno"],
    description: "Dulzura aterciopelada y reconfortante que envuelve el ambiente sin empalagar.",
    accentColor: "#C8A172",
  },
  {
    id: "aroma-bosque-eucalipto",
    name: "Eucalipto Andino & Menta Silvestre",
    family: "Fresco & Botánico",
    intensity: 4,
    notes: ["Hojas de eucalipto fresco", "Menta piperita", "Agujas de pino", "Brisa pura"],
    description: "Apertura de vías respiratorias, claridad mental y frescura biofílica pura.",
    accentColor: "#608058",
  },
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: "user-admin-1",
    name: "Sofia Alarcón",
    email: "admin@ayllu.es",
    password: "admin",
    role: "administrador",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    phone: "+34 600 111 222",
    city: "Madrid",
    address: "Calle de los Artesanos 14, 2ºB",
    createdAt: "2024-01-15",
    status: "activo",
  },
  {
    id: "user-client-1",
    name: "Lucía Fernández",
    email: "cliente@ayllu.es",
    password: "cliente",
    role: "cliente",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    phone: "+34 655 444 333",
    city: "Barcelona",
    address: "Carrer del Pi 8, 1º",
    createdAt: "2024-02-10",
    status: "activo",
  },
];

export const INITIAL_ORDERS: StoreOrder[] = [
  {
    id: "AYL-9042",
    userId: "user-client-1",
    customerName: "Lucía Fernández",
    customerEmail: "cliente@ayllu.es",
    customerPhone: "+1 (555) 655-4443",
    shippingAddress: "Carrer del Pi 8, 1º",
    shippingCity: "Barcelona",
    items: [
      {
        candle: CANDLE_COLLECTION[0],
        quantity: 1,
        selectedWaxType: "Soja",
        customEngraving: "Paz para el bosque • Lucía",
        giftWrap: true,
      },
      {
        candle: CANDLE_COLLECTION[1],
        quantity: 1,
        selectedWaxType: "Soja",
        giftWrap: false,
      },
    ],
    subtotal: 42,
    shippingCost: 0,
    total: 42,
    status: "Pendiente de verificación",
    createdAt: "2026-08-25T14:30:00Z",
    paymentMethod: "Transferencia Bancaria",
    paymentDetails: {
      method: "Transferencia Bancaria",
      bankName: "Banco Pichincha",
      referenceNumber: "TRANS-884920",
      receiptFileName: "comprobante_transferencia_lucia.pdf",
      verifiedByAdmin: false,
    },
    notes: "Por favor envolver para regalo con dedicatoria especial.",
    trackingCode: "AYLLU-TRK-892104",
  },
  {
    id: "AYL-9043",
    customerName: "Mateo Valenzuela",
    customerEmail: "mateo.valenzuela@gmail.com",
    customerPhone: "+1 (555) 611-2223",
    shippingAddress: "Gran Vía 42, 3º Izq",
    shippingCity: "Quito",
    items: [
      {
        candle: CANDLE_COLLECTION[3],
        quantity: 1,
        selectedWaxType: "Parafina",
        giftWrap: false,
      },
    ],
    subtotal: 19,
    shippingCost: 0,
    total: 19,
    status: "Pago verificado",
    createdAt: "2026-08-26T10:15:00Z",
    paymentMethod: "Efectivo (Pago contra entrega)",
    paymentDetails: {
      method: "Efectivo (Pago contra entrega)",
      cashChangeFor: "$20 (Cambio de $1)",
      deliveryInstructions: "Llamar al celular antes de entregar",
    },
    notes: "Llamar al timbre antes de subir.",
    trackingCode: "AYLLU-TRK-741952",
  },
];

interface StoreContextType {
  // Brand
  brandConfig: BrandConfig;
  updateBrandConfig: (newConfig: Partial<BrandConfig>) => Promise<{ success: boolean; message: string; error?: any; supabaseSynced: boolean }>;
  resetBrandConfig: () => void;

  // Products
  candles: CandleProduct[];
  addCandle: (candle: CandleProduct) => void;
  updateCandle: (id: string, updated: Partial<CandleProduct>) => void;
  deleteCandle: (id: string) => void;
  saveCandleAsync: (candle: CandleProduct, isEditing?: boolean) => Promise<{ success: boolean; candle?: CandleProduct; error?: string }>;
  refetchCandles: () => Promise<CandleProduct[]>;
  saveProductsToStorage: (items: CandleProduct[]) => void;

  // Collaborators
  collaborators: Collaborator[];
  addCollaborator: (collaborator: Collaborator) => void;
  updateCollaborator: (id: string, updated: Partial<Collaborator>) => void;
  deleteCollaborator: (id: string) => void;
  saveCollaboratorsToStorage: (items: Collaborator[]) => void;

  // Aromas
  aromas: AromaItem[];
  addAroma: (aroma: AromaItem) => void;
  updateAroma: (id: string, updated: Partial<AromaItem>) => void;
  deleteAroma: (id: string) => void;

  // Users & Auth
  users: UserAccount[];
  currentUser: UserAccount | null;
  loginUser: (email: string, password?: string) => { success: boolean; message: string };
  registerUser: (data: { name: string; email: string; password?: string; role?: "cliente" | "administrador" }) => { success: boolean; message: string };
  logoutUser: () => void;
  updateUserStatus: (userId: string, status: "activo" | "suspendido") => void;
  updateUserRole: (userId: string, role: "cliente" | "administrador") => void;
  deleteUser: (userId: string) => void;

  // Orders
  orders: StoreOrder[];
  createOrder: (orderData: Omit<StoreOrder, "id" | "createdAt">) => StoreOrder;
  updateOrderStatus: (orderId: string, status: StoreOrder["status"]) => void;
  deleteOrder: (orderId: string) => void;

  // Customizer Options Catalog CRUD (localStorage 'ayllu_customizer_options')
  customizerOptions: CustomizerOptionsCatalog;
  waxColors: WaxColorOption[];
  addWaxColor: (color: WaxColorOption) => void;
  updateWaxColor: (id: string, updated: Partial<WaxColorOption>) => void;
  deleteWaxColor: (id: string) => void;
  toggleWaxColorActive: (id: string) => void;
  updateCustomizerOptions: (updated: Partial<CustomizerOptionsCatalog>) => void;
  saveCustomizerOptionsToStorage: (opts: CustomizerOptionsCatalog) => void;
  addCustomizerOption: <K extends keyof CustomizerOptionsCatalog>(category: K, item: CustomizerOptionsCatalog[K][number]) => void;
  editCustomizerOption: <K extends keyof CustomizerOptionsCatalog>(category: K, id: string, updated: Partial<CustomizerOptionsCatalog[K][number]>) => void;
  deleteCustomizerOption: <K extends keyof CustomizerOptionsCatalog>(category: K, id: string) => void;
  resetCustomizerOptionsToDefault: () => void;

  // Sculpted Figures CRUD (localStorage 'ayllu_sculptures')
  sculptures: SculptedFigure[];
  addSculpture: (sculpture: SculptedFigure) => void;
  updateSculpture: (id: string, updated: Partial<SculptedFigure>) => void;
  deleteSculpture: (id: string) => void;
  saveSculpturesToStorage: (items: SculptedFigure[]) => void;

  // Reviews & Comments System
  reviews: CandleReview[];
  addReview: (reviewData: {
    comment: string;
    rating: number;
    author?: string;
    location?: string;
    candleName?: string;
    candleId?: string;
  }) => Promise<{ success: boolean; message: string; review?: CandleReview }>;
  updateReview: (
    id: string,
    updated: Partial<CandleReview>
  ) => Promise<{ success: boolean; message: string; review?: CandleReview }>;
  deleteReview: (id: string) => Promise<{ success: boolean; message: string }>;
  refetchReviews: () => Promise<CandleReview[]>;
  saveReviewsToStorage: (items: CandleReview[], syncToCloud?: boolean) => void;

  // Supabase Real Persistence
  isSupabaseReady: boolean;
  isSupabaseSyncing: boolean;
  lastSupabaseSync: string | null;
  syncAllToSupabase: () => Promise<{ success: boolean; message: string; count?: number }>;
  fetchFromSupabase: () => Promise<{ success: boolean; message: string }>;
  saveLayersToSupabase: (productId: string, layers: Layer2D[]) => Promise<{ success: boolean; message: string }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Brand Config State
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(() => {
    try {
      const saved = localStorage.getItem("ayllu_brand_config");
      return saved ? { ...DEFAULT_BRAND_CONFIG, ...JSON.parse(saved) } : DEFAULT_BRAND_CONFIG;
    } catch {
      return DEFAULT_BRAND_CONFIG;
    }
  });

  // Helper to save store-wide settings (brand, customizer options, sculptures, reviews, collaborators, aromas) to Supabase
  const saveStoreSettingToSupabase = async (key: string, value: any) => {
    // 1. Prioritize same-origin server proxy (/api/store-settings/:key)
    // This executes server-side with the service role key, bypassing CORS and iframe fetch restrictions
    try {
      const serverRes = await fetch(`/api/store-settings/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (serverRes.ok) {
        const data = await serverRes.json();
        return { success: true, data };
      }
    } catch {
      // Fall through to direct Supabase attempt if server is unreachable
    }

    // 2. Direct Supabase fallback
    if (!isSupabaseConfigured()) {
      return { success: false, error: new Error("Supabase no está configurado") };
    }
    try {
      const { data, error } = await supabase
        .from("store_settings")
        .upsert(
          { key, value, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        )
        .select();

      if (error) {
        console.warn(`Aviso al sincronizar '${key}' en Supabase store_settings:`, error.message || error);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (err: any) {
      console.warn(`Aviso al sincronizar '${key}' en Supabase (modo local activo):`, err?.message || err);
      return { success: false, error: err };
    }
  };

  // Storage Helper Functions for Immediate Serialization
  const saveProductsToStorage = (items: CandleProduct[]) => {
    try {
      const serialized = JSON.stringify(items);
      localStorage.setItem("ayllu_products", serialized);
      localStorage.setItem("ayllu_candles_v16", serialized);
    } catch (e) {
      console.warn("Storage quota warning for products:", e);
    }
  };

  const saveCollaboratorsToStorage = (items: Collaborator[], syncToCloud = true) => {
    try {
      const serialized = JSON.stringify(items);
      localStorage.setItem("ayllu_collaborators", serialized);
      localStorage.setItem("ayllu_collaborators_v2", serialized);
    } catch (e) {
      console.warn("Storage quota warning for collaborators:", e);
    }
    if (syncToCloud) {
      saveStoreSettingToSupabase("collaborators", items);
    }
  };

  const saveSculpturesToStorage = (items: SculptedFigure[], syncToCloud = true) => {
    try {
      const serialized = JSON.stringify(items);
      localStorage.setItem("ayllu_sculptures", serialized);
    } catch (e) {
      console.warn("Storage quota warning for sculptures:", e);
    }
    if (syncToCloud) {
      saveStoreSettingToSupabase("sculptures", items);
    }
  };

  const saveReviewsToStorage = (items: CandleReview[], syncToCloud = true) => {
    try {
      const serialized = JSON.stringify(items);
      localStorage.setItem("ayllu_reviews", serialized);
    } catch (e) {
      console.warn("Storage quota warning for reviews:", e);
    }
    if (syncToCloud) {
      saveStoreSettingToSupabase("reviews", items);
    }
  };

  // Sculpted Figures State - Initialized from localStorage ('ayllu_sculptures') or default mock collection
  const [sculptures, setSculptures] = useState<SculptedFigure[]>(() => {
    try {
      const saved = localStorage.getItem("ayllu_sculptures");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge newly introduced default figures (e.g. Panda) and guarantee defaultColorHex
          const merged = [...parsed];
          DEFAULT_SCULPTED_FIGURES.forEach((defFig) => {
            const exists = merged.find((m) => m.id === defFig.id);
            if (!exists) {
              merged.push(defFig);
            }
          });
          return merged.map((fig) => ({
            ...fig,
            layers2D: fig.layers2D?.map((l) => ({
              ...l,
              defaultColorHex: l.defaultColorHex || (l.colorable ? "#FAF7F2" : undefined),
            })),
          }));
        }
      }
      return DEFAULT_SCULPTED_FIGURES;
    } catch {
      return DEFAULT_SCULPTED_FIGURES;
    }
  });

  // Candles State - Initialized from localStorage ('ayllu_products' / 'ayllu_candles_v16') or default mock collection
  const [candles, setCandles] = useState<CandleProduct[]>(() => {
    try {
      const saved =
        localStorage.getItem("ayllu_products") ||
        localStorage.getItem("ayllu_candles_v16") ||
        localStorage.getItem("ayllu_candles");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: CandleProduct) => {
            let itemLayers = item.layers2D;

            // Safety filter for Oso: remove any Santuario de Lavanda layers from old cache
            if (item.id === "vela-custom-1789491779825" || item.name?.toLowerCase().includes("oso")) {
              if (itemLayers && itemLayers.length > 0) {
                itemLayers = itemLayers.filter(
                  (l) => !l.imageUrl?.includes("WhatsApp_Image_2026-09-09_at_4.46.35_PM")
                );
              }
            }

            // Safety check for Jirafa: ensure image URL is public Supabase URL and colorable is true
            if (item.id === "vela-custom-1789490882289" || item.name?.toLowerCase().includes("jirafa")) {
              if (itemLayers && itemLayers.length > 0) {
                itemLayers = itemLayers.map((l) => ({
                  ...l,
                  imageUrl: l.imageUrl?.startsWith("/uploads")
                    ? "https://girkotyqtshrrhtbvkky.supabase.co/storage/v1/object/public/candle-assets/layers/1789530253583_layer-1789490384951_Jirafa.png"
                    : l.imageUrl,
                  colorable: true,
                  defaultColorHex: l.defaultColorHex || "#D49B55",
                }));
              }
            }

            if (!itemLayers || itemLayers.length === 0) {
              if (item.sculptureType === "santuario" || item.id.includes("santuario")) {
                return { ...item, layers2D: SANTUARIO_VIRGEN_LAYERS };
              }
              if (item.sculptureType === "zorro" || item.id.includes("zorro")) {
                return { ...item, layers2D: ZORRO_BOSQUE_LAYERS };
              }
              if (item.sculptureType === "osito" || item.id.includes("osito")) {
                return { ...item, layers2D: OSITO_ABRAZO_LAYERS };
              }
              if (item.sculptureType === "panda" || item.id.includes("panda")) {
                return { ...item, layers2D: PANDA_BAMBU_LAYERS };
              }
              const colMatch = CANDLE_COLLECTION.find((c) => c.id === item.id);
              if (colMatch?.layers2D && colMatch.layers2D.length > 0) {
                return { ...item, layers2D: colMatch.layers2D };
              }
            }
            return { ...item, layers2D: itemLayers };
          });
        }
      }
      return CANDLE_COLLECTION;
    } catch {
      return CANDLE_COLLECTION;
    }
  });

  // Collaborators State - Initialized from localStorage ('ayllu_collaborators') or default mock collection
  const [collaborators, setCollaborators] = useState<Collaborator[]>(() => {
    try {
      const saved =
        localStorage.getItem("ayllu_collaborators") ||
        localStorage.getItem("ayllu_collaborators_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return COLLABORATORS;
    } catch {
      return COLLABORATORS;
    }
  });

  // Aromas State
  const [aromas, setAromas] = useState<AromaItem[]>(() => {
    try {
      const saved = localStorage.getItem("ayllu_aromas");
      return saved ? JSON.parse(saved) : DEFAULT_AROMAS;
    } catch {
      return DEFAULT_AROMAS;
    }
  });

  // Users State
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem("ayllu_users");
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Current Auth User
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem("ayllu_current_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Orders State
  const [orders, setOrders] = useState<StoreOrder[]>(() => {
    try {
      const saved = localStorage.getItem("ayllu_orders_v2");
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // Reviews State - Initialized from localStorage ('ayllu_reviews') or default reviews
  const [reviews, setReviews] = useState<CandleReview[]>(() => {
    try {
      const saved = localStorage.getItem("ayllu_reviews");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return CANDLE_REVIEWS;
    } catch {
      return CANDLE_REVIEWS;
    }
  });

  // Customizer Options Catalog State (ayllu_customizer_options)
  const [customizerOptions, setCustomizerOptions] = useState<CustomizerOptionsCatalog>(() => {
    try {
      const saved = localStorage.getItem("ayllu_customizer_options");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.waxColors)) {
          return {
            vessels: [],
            waxColors: parsed.waxColors?.length ? parsed.waxColors : DEFAULT_CUSTOMIZER_CATALOG.waxColors,
            wicks: parsed.wicks?.length ? parsed.wicks : DEFAULT_CUSTOMIZER_CATALOG.wicks,
            botanicals: parsed.botanicals?.length ? parsed.botanicals : DEFAULT_CUSTOMIZER_CATALOG.botanicals,
            labelStyles: parsed.labelStyles?.length ? parsed.labelStyles : DEFAULT_CUSTOMIZER_CATALOG.labelStyles,
          };
        }
      }
      return DEFAULT_CUSTOMIZER_CATALOG;
    } catch {
      return DEFAULT_CUSTOMIZER_CATALOG;
    }
  });

  const saveCustomizerOptionsToStorage = (opts: CustomizerOptionsCatalog, syncToCloud = true) => {
    try {
      const serialized = JSON.stringify(opts);
      localStorage.setItem("ayllu_customizer_options", serialized);
    } catch (e) {
      console.warn("Storage quota warning for customizer options:", e);
    }
    if (syncToCloud) {
      saveStoreSettingToSupabase("customizer_options", opts);
    }
  };

  // Persistence Effects (Automatic synchronization with localStorage)
  useEffect(() => {
    try {
      localStorage.setItem("ayllu_brand_config", JSON.stringify(brandConfig));
    } catch (e) {
      console.warn("Storage quota warning:", e);
    }
  }, [brandConfig]);

  useEffect(() => {
    saveProductsToStorage(candles);
  }, [candles]);

  useEffect(() => {
    saveCollaboratorsToStorage(collaborators);
  }, [collaborators]);

  useEffect(() => {
    saveCustomizerOptionsToStorage(customizerOptions);
  }, [customizerOptions]);

  useEffect(() => {
    saveSculpturesToStorage(sculptures);
  }, [sculptures]);

  // Multi-tab Synchronization (Storage Event Listener)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        if (
          e.key === "ayllu_products" ||
          e.key === "ayllu_candles_v16" ||
          e.key === "ayllu_candles"
        ) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCandles(parsed);
          }
        } else if (
          e.key === "ayllu_collaborators" ||
          e.key === "ayllu_collaborators_v2"
        ) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCollaborators(parsed);
          }
        } else if (e.key === "ayllu_sculptures") {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSculptures(parsed);
          }
        } else if (e.key === "ayllu_brand_config") {
          const parsed = JSON.parse(e.newValue);
          if (parsed) setBrandConfig(parsed);
        } else if (e.key === "ayllu_aromas") {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setAromas(parsed);
        } else if (e.key === "ayllu_orders_v2") {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setOrders(parsed);
        } else if (e.key === "ayllu_customizer_options") {
          const parsed = JSON.parse(e.newValue);
          if (parsed && Array.isArray(parsed.vessels)) {
            setCustomizerOptions(parsed);
          }
        }
      } catch (err) {
        console.warn("Storage sync event warning:", err);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Initial Sync with Backend Server Database or Supabase
  const fetchServerProducts = async (): Promise<CandleProduct[]> => {
    // 1. If Supabase is configured, prefer querying Supabase directly
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("products").select("*").order("name");
        if (!error && Array.isArray(data) && data.length > 0) {
          // Consultar también la tabla dedicada de candle_layers
          const layersByProduct: Record<string, Layer2D[]> = {};
          try {
            const { data: dbLayers } = await supabase
              .from("candle_layers")
              .select("*")
              .order("z_index");
            if (Array.isArray(dbLayers) && dbLayers.length > 0) {
              for (const l of dbLayers) {
                const pid = l.product_id || "global";
                if (!layersByProduct[pid]) layersByProduct[pid] = [];
                layersByProduct[pid].push({
                  id: l.id,
                  name: l.name,
                  imageUrl: l.image_url,
                  colorable: Boolean(l.colorable),
                  zIndex: Number(l.z_index) || 0,
                  type: l.type || "figura",
                  category: l.type || "figura",
                  defaultColorHex: l.default_color_hex || undefined,
                  allowedColorHexes: l.allowed_color_hexes || [],
                  offsetX: Number(l.offset_x) || 0,
                  offsetY: Number(l.offset_y) || 0,
                  posX: Number(l.offset_x) || 0,
                  posY: Number(l.offset_y) || 0,
                  scale: Number(l.scale) || 1.0,
                  opacity: Number(l.opacity ?? 1.0),
                });
              }
            }
          } catch (layerErr) {
            console.warn("Consulta candle_layers fallback:", layerErr);
          }

          const mapped: CandleProduct[] = data.map((row: any) => {
            let productLayers =
              layersByProduct[row.id] && layersByProduct[row.id].length > 0
                ? layersByProduct[row.id]
                : (row.layers_2d || []);

            // Safety filter for Oso: ensure no Santuario de Lavanda layers are attached
            if (row.id === "vela-custom-1789491779825" || row.name?.toLowerCase().includes("oso")) {
              productLayers = productLayers.filter(
                (l: any) => !l.imageUrl?.includes("WhatsApp_Image_2026-09-09_at_4.46.35_PM")
              );
            }

            // Safety check for Jirafa: ensure image URL is public Supabase URL and colorable is true
            if (row.id === "vela-custom-1789490882289" || row.name?.toLowerCase().includes("jirafa")) {
              productLayers = productLayers.map((l: any) => ({
                ...l,
                imageUrl: l.imageUrl?.startsWith("/uploads")
                  ? "https://girkotyqtshrrhtbvkky.supabase.co/storage/v1/object/public/candle-assets/layers/1789530253583_layer-1789490384951_Jirafa.png"
                  : l.imageUrl,
                colorable: true,
                defaultColorHex: l.defaultColorHex || "#D49B55",
              }));
            }

            return {
              id: row.id,
              name: row.name,
              subtitle: row.subtitle || row.tagline || "",
              tagline: row.tagline || "",
              description: row.description || "",
              price: Number(row.price),
              weightGrams: Number(row.weight_grams) || 280,
              burnHours: Number(row.burn_hours) || 50,
              image: row.image || "",
              images: row.images || [],
              custom2DImageUrl: row.custom_2d_image_url || undefined,
              base2DImage: row.base_2d_image || undefined,
              vesselColor: row.vessel_color || "bg-[#F7F4EE] text-[#423D33] border-[#E5E0DA]",
              vesselName: row.vessel_name || "Vaso de Vidrio Artesanal",
              category: row.category || "Relajación",
              olfactoryPyramid: row.olfactory_pyramid || {
                salida: "Lavanda silvestre y cítricos",
                corazon: "Flores blancas y vainilla",
                fondo: "Sándalo y madera suave",
              },
              ingredients: row.ingredients || ["Cera de soja virgen", "Aceites esenciales botánicos"],
              botanicals: row.botanicals || [],
              artisanNote: row.artisan_note || "",
              layers2D: productLayers,
              waxMaskPolygon: row.wax_mask_polygon || undefined,
              sculptureType: row.sculpture_type || "vaso-vidrio",
              waxType: row.wax_type || "Soja",
              rating: Number(row.rating) || 5,
              reviewsCount: Number(row.reviews_count) || 0,
              inStock: row.in_stock !== undefined ? Boolean(row.in_stock) : true,
              featured: Boolean(row.featured),
              customizer2DConfig: row.customizer_2d_config || {},
            };
          });
          setCandles(mapped);
          saveProductsToStorage(mapped);
          return mapped;
        }
      } catch (e) {
        console.warn("Error fetching products from Supabase, falling back to local/server:", e);
      }
    }

    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const serverProducts = await res.json();
        if (Array.isArray(serverProducts) && serverProducts.length > 0) {
          setCandles(serverProducts);
          saveProductsToStorage(serverProducts);
          return serverProducts;
        } else if (candles && candles.length > 0) {
          // Seed server with existing collection if server file was empty
          await fetch("/api/products/sync-all", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ products: candles }),
          });
        }
      }
    } catch (err) {
      console.warn("Server products sync unavailable:", err);
    }
    return candles;
  };


  const fetchServerCollaborators = async (): Promise<Collaborator[]> => {
    // 1. Supabase store_settings como fuente de verdad en la nube si está configurado
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("store_settings")
          .select("value")
          .eq("key", "collaborators")
          .single();

        if (!error && data?.value && Array.isArray(data.value) && data.value.length > 0) {
          setCollaborators(data.value);
          try {
            const serialized = JSON.stringify(data.value);
            localStorage.setItem("ayllu_collaborators", serialized);
            localStorage.setItem("ayllu_collaborators_v2", serialized);
          } catch (e) {
            console.warn("Storage quota warning for collaborators:", e);
          }
          return data.value;
        }
      } catch (sbErr) {
        console.warn("Consulta de colaboradores en Supabase:", sbErr);
      }
    }

    // 2. Servidor local fallback
    try {
      const res = await fetch("/api/collaborators");
      if (res.ok) {
        const serverCollabs = await res.json();
        if (Array.isArray(serverCollabs) && serverCollabs.length > 0) {
          setCollaborators(serverCollabs);
          saveCollaboratorsToStorage(serverCollabs, false);
          return serverCollabs;
        } else if (collaborators && collaborators.length > 0) {
          await fetch("/api/collaborators/sync-all", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ collaborators }),
          });
        }
      }
    } catch (err) {
      console.warn("Server collaborators sync unavailable:", err);
    }
    return collaborators;
  };

  const fetchServerReviews = async (): Promise<CandleReview[]> => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const serverReviews = await res.json();
        if (Array.isArray(serverReviews) && serverReviews.length > 0) {
          setReviews(serverReviews);
          saveReviewsToStorage(serverReviews, false);
          return serverReviews;
        } else if (reviews && reviews.length > 0) {
          await fetch("/api/reviews/sync-all", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reviews }),
          });
        }
      }
    } catch (err) {
      console.warn("Server reviews sync unavailable:", err);
    }
    return reviews;
  };

  const fetchServerBrandConfig = async (): Promise<BrandConfig> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("store_settings")
          .select("key, value")
          .in("key", ["brand_config", "footer_settings"]);
        if (!error && data && data.length > 0) {
          const brandRow = data.find((d) => d.key === "brand_config") || data[0];
          if (brandRow?.value && typeof brandRow.value === "object") {
            const merged = { ...DEFAULT_BRAND_CONFIG, ...brandRow.value };
            setBrandConfig(merged);
            try {
              localStorage.setItem("ayllu_brand_config", JSON.stringify(merged));
            } catch {}
            return merged;
          }
        }
      } catch (sbErr) {
        console.warn("Consulta de configuración de marca en Supabase:", sbErr);
      }

      // Consulta de respaldo por si existe tabla relacional footer_settings
      try {
        const { data: footData } = await supabase.from("footer_settings").select("*").limit(1).maybeSingle();
        if (footData) {
          const mapped: Partial<BrandConfig> = {
            brandName: footData.brand_name || undefined,
            logoUrl: footData.logo_url || undefined,
            footerSubtitle: footData.footer_subtitle || undefined,
            footerDescription: footData.footer_description || undefined,
            footerBadge: footData.footer_badge || undefined,
            contactEmail: footData.contact_email || undefined,
            contactPhone: footData.contact_phone || undefined,
            whatsappNumber: footData.whatsapp_number || undefined,
            footerHoursWeekdays: footData.footer_hours_weekdays || undefined,
            footerHoursWeekends: footData.footer_hours_weekends || undefined,
            footerWhatsAppText: footData.footer_whatsapp_text || undefined,
            footerWhatsAppMessage: footData.footer_whatsapp_message || undefined,
          };
          setBrandConfig((prev) => {
            const merged = { ...prev, ...mapped };
            try {
              localStorage.setItem("ayllu_brand_config", JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      } catch {}
    }

    try {
      const res = await fetch("/api/brand-config");
      if (res.ok) {
        const serverBrand = await res.json();
        if (serverBrand && typeof serverBrand === "object" && serverBrand.brandName) {
          const merged = { ...DEFAULT_BRAND_CONFIG, ...serverBrand };
          setBrandConfig(merged);
          try {
            localStorage.setItem("ayllu_brand_config", JSON.stringify(merged));
          } catch {}
          return merged;
        }
      }
    } catch (err) {
      console.warn("Server brand config sync unavailable:", err);
    }
    return brandConfig;
  };

  useEffect(() => {
    fetchServerProducts();
    fetchServerCollaborators();
    fetchServerReviews();
    fetchServerBrandConfig();
  }, []);

  const refetchCandles = async (): Promise<CandleProduct[]> => {
    return await fetchServerProducts();
  };

  const refetchReviews = async (): Promise<CandleReview[]> => {
    return await fetchServerReviews();
  };

  // Supabase Real Persistence State
  const [isSupabaseReady] = useState<boolean>(() => isSupabaseConfigured());
  const [isSupabaseSyncing, setIsSupabaseSyncing] = useState<boolean>(false);
  const [lastSupabaseSync, setLastSupabaseSync] = useState<string | null>(() => {
    try {
      return localStorage.getItem("ayllu_last_supabase_sync");
    } catch {
      return null;
    }
  });

  // Helper to map CandleProduct to Supabase products table row
  const mapCandleToSupabaseRow = (candle: CandleProduct) => ({
    id: candle.id,
    name: candle.name,
    subtitle: candle.subtitle || null,
    tagline: candle.tagline || null,
    description: candle.description || null,
    price: candle.price,
    weight_grams: candle.weightGrams || 280,
    burn_hours: candle.burnHours || 50,
    image: candle.image || null,
    images: candle.images || [],
    custom_2d_image_url: candle.custom2DImageUrl || null,
    base_2d_image: candle.base2DImage || null,
    vessel_color: candle.vesselColor || null,
    vessel_name: candle.vesselName || null,
    category: candle.category || null,
    olfactory_pyramid: candle.olfactoryPyramid || {},
    ingredients: candle.ingredients || [],
    botanicals: candle.botanicals || [],
    artisan_note: candle.artisanNote || null,
    layers_2d: candle.layers2D || [],
    wax_mask_polygon: candle.waxMaskPolygon || null,
    sculpture_type: candle.sculptureType || "vaso-vidrio",
    wax_type: candle.waxType || "soja",
    rating: candle.rating || 5,
    reviews_count: candle.reviewsCount || 0,
    in_stock: Boolean(candle.inStock),
    featured: Boolean(candle.featured),
    customizer_2d_config: candle.customizer2DConfig || {},
    updated_at: new Date().toISOString(),
  });

  // Fetch all products and store settings from Supabase
  const fetchFromSupabase = async (): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, message: "Supabase no está configurado aún con las credenciales en Vercel." };
    }
    setIsSupabaseSyncing(true);
    try {
      // 1. Fetch Products
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (error) throw error;
      if (data && data.length > 0) {
        const mapped: CandleProduct[] = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          subtitle: row.subtitle || row.tagline || "",
          tagline: row.tagline || "",
          description: row.description || "",
          price: Number(row.price),
          weightGrams: Number(row.weight_grams) || 280,
          burnHours: Number(row.burn_hours) || 50,
          image: row.image || "",
          images: row.images || [],
          custom2DImageUrl: row.custom_2d_image_url || undefined,
          base2DImage: row.base_2d_image || undefined,
          vesselColor: row.vessel_color || "bg-[#F7F4EE] text-[#423D33] border-[#E5E0DA]",
          vesselName: row.vessel_name || "Vaso de Vidrio Artesanal",
          category: row.category || "Relajación",
          olfactoryPyramid: row.olfactory_pyramid || {
            salida: "Lavanda silvestre y cítricos",
            corazon: "Flores blancas y vainilla",
            fondo: "Sándalo y madera suave",
          },
          ingredients: row.ingredients || ["Cera de soja virgen", "Aceites esenciales botánicos"],
          botanicals: row.botanicals || [],
          artisanNote: row.artisan_note || "",
          layers2D: row.layers_2d || [],
          waxMaskPolygon: row.wax_mask_polygon || undefined,
          sculptureType: row.sculpture_type || "vaso-vidrio",
          waxType: row.wax_type || "Soja",
          rating: Number(row.rating) || 5,
          reviewsCount: Number(row.reviews_count) || 0,
          inStock: row.in_stock !== undefined ? Boolean(row.in_stock) : true,
          featured: Boolean(row.featured),
          customizer2DConfig: row.customizer_2d_config || {},
        }));
        setCandles(mapped);
        saveProductsToStorage(mapped);
      }

      // 2. Fetch Store Settings (brand config, customizer catalog, sculptures, reviews, collaborators, aromas)
      try {
        let settingsData: any[] | null = null;
        try {
          const res = await fetch("/api/store-settings");
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              settingsData = data;
            }
          }
        } catch {}

        if (!settingsData) {
          const { data, error: settingsError } = await supabase
            .from("store_settings")
            .select("*");
          if (!settingsError && data && Array.isArray(data)) {
            settingsData = data;
          }
        }

        if (settingsData && Array.isArray(settingsData)) {
          for (const item of settingsData) {
            if (item.key === "brand_config" && item.value) {
              const merged = { ...DEFAULT_BRAND_CONFIG, ...item.value };
              setBrandConfig(merged);
              try {
                localStorage.setItem("ayllu_brand_config", JSON.stringify(merged));
              } catch {}
            } else if (item.key === "customizer_options" && item.value) {
              setCustomizerOptions(item.value);
              saveCustomizerOptionsToStorage(item.value, false);
            } else if (item.key === "sculptures" && Array.isArray(item.value)) {
              setSculptures(item.value);
              saveSculpturesToStorage(item.value, false);
            } else if (item.key === "reviews" && Array.isArray(item.value)) {
              setReviews(item.value);
              saveReviewsToStorage(item.value, false);
            } else if (item.key === "collaborators" && Array.isArray(item.value)) {
              setCollaborators(item.value);
              saveCollaboratorsToStorage(item.value, false);
            } else if (item.key === "aromas" && Array.isArray(item.value)) {
              setAromas(item.value);
              try {
                localStorage.setItem("ayllu_aromas", JSON.stringify(item.value));
              } catch {}
            } else if (item.key === "orders" && Array.isArray(item.value)) {
              setOrders(item.value);
              try {
                localStorage.setItem("ayllu_orders_v2", JSON.stringify(item.value));
              } catch {}
            }
          }
        }
      } catch (settingsErr) {
        console.warn("Aviso opcional al leer store_settings de Supabase:", settingsErr);
      }

      const syncTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSupabaseSync(syncTimestamp);
      try {
        localStorage.setItem("ayllu_last_supabase_sync", syncTimestamp);
      } catch {}
      return { success: true, message: "Sincronizado con éxito desde Supabase." };
    } catch (err: any) {
      console.warn("Error al recuperar datos de Supabase:", err);
      return { success: false, message: err.message || "Error al leer de Supabase." };
    } finally {
      setIsSupabaseSyncing(false);
    }
  };

  // One-click sync all local data (products, brand config, customizer, sculptures, reviews, collaborators, aromas) to Supabase
  const syncAllToSupabase = async (): Promise<{ success: boolean; message: string; count?: number }> => {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: "Configura las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para activar Supabase.",
      };
    }
    setIsSupabaseSyncing(true);
    try {
      let count = 0;
      // 1. Sync all candles to products table
      for (const candle of candles) {
        const { error } = await supabase.from("products").upsert(
          mapCandleToSupabaseRow(candle),
          { onConflict: "id" }
        );
        if (!error) count++;
      }

      // 2. Sync brand configuration to store_settings table
      await supabase.from("store_settings").upsert(
        { key: "brand_config", value: brandConfig, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      count++;

      // 3. Sync customizer options catalog to store_settings table
      await supabase.from("store_settings").upsert(
        { key: "customizer_options", value: customizerOptions, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      count++;

      // 4. Sync sculptures catalog to store_settings table
      await supabase.from("store_settings").upsert(
        { key: "sculptures", value: sculptures, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      count++;

      // 5. Sync reviews to store_settings table
      await supabase.from("store_settings").upsert(
        { key: "reviews", value: reviews, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      count++;

      // 6. Sync collaborators to store_settings table
      await supabase.from("store_settings").upsert(
        { key: "collaborators", value: collaborators, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      count++;

      // 7. Sync aromas to store_settings table
      await supabase.from("store_settings").upsert(
        { key: "aromas", value: aromas, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      count++;

      // 8. Sync orders to store_settings table
      await supabase.from("store_settings").upsert(
        { key: "orders", value: orders, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      count++;

      const syncTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSupabaseSync(syncTimestamp);
      try {
        localStorage.setItem("ayllu_last_supabase_sync", syncTimestamp);
      } catch {}
      return {
        success: true,
        message: `¡Todo respaldado en Supabase con éxito! Se guardaron productos, diseño de marca, opciones del personalizador, figuras, colaboradores, aromas, pedidos y reseñas (${count} registros).`,
        count,
      };
    } catch (err: any) {
      console.error("Error al sincronizar con Supabase:", err);
      return { success: false, message: err.message || "Fallo en la sincronización con Supabase." };
    } finally {
      setIsSupabaseSyncing(false);
    }
  };

  const saveLayersToSupabase = async (
    productId: string,
    layers: Layer2D[]
  ): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, message: "Supabase no está configurado." };
    }
    try {
      const { error } = await supabase
        .from("products")
        .update({ layers_2d: layers, updated_at: new Date().toISOString() })
        .eq("id", productId);
      if (error) throw error;

      // Keep dedicated candle_layers table strictly in sync
      try {
        await supabase.from("candle_layers").delete().eq("product_id", productId);
        if (layers && layers.length > 0) {
          const dbRows = layers.map((l, idx) => ({
            id: l.id || `layer-${Date.now()}-${idx}`,
            product_id: productId,
            name: l.name || `Capa ${idx + 1}`,
            image_url: l.imageUrl || "",
            colorable: Boolean(l.colorable),
            z_index: Number(l.zIndex ?? idx),
            type: l.type || l.category || "figura",
            default_color_hex: l.defaultColorHex || undefined,
            allowed_color_hexes: l.allowedColorHexes || [],
            offset_x: Number(l.offsetX ?? l.posX ?? 0),
            offset_y: Number(l.offsetY ?? l.posY ?? 0),
            scale: Number(l.scale ?? 1.0),
            opacity: Number(l.opacity ?? 1.0),
          }));
          await supabase.from("candle_layers").insert(dbRows);
        }
      } catch (layerSyncErr) {
        console.warn("Fallo secundario al sincronizar tabla candle_layers:", layerSyncErr);
      }

      return { success: true, message: "Capas guardadas en Supabase correctamente." };
    } catch (err: any) {
      console.error("Error al guardar capas en Supabase:", err);
      return { success: false, message: err?.message || "Error al actualizar capas en Supabase." };
    }
  };

  // Initial load from Supabase if configured
  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchFromSupabase();
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ayllu_aromas", JSON.stringify(aromas));
    } catch (e) {
      console.warn("Aromas storage quota warning:", e);
    }
    saveStoreSettingToSupabase("aromas", aromas);
  }, [aromas]);

  useEffect(() => {
    try {
      localStorage.setItem("ayllu_users", JSON.stringify(users));
    } catch (e) {
      console.warn("Users storage quota warning:", e);
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem("ayllu_current_user", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("ayllu_current_user");
      }
    } catch (e) {
      console.warn("User auth storage quota warning:", e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem("ayllu_orders_v2", JSON.stringify(orders));
    } catch (e) {
      console.warn("Orders storage quota warning:", e);
    }
    saveStoreSettingToSupabase("orders", orders);
  }, [orders]);

  // Brand actions
  const updateBrandConfig = async (
    newConfig: Partial<BrandConfig>
  ): Promise<{ success: boolean; message: string; error?: any; supabaseSynced: boolean }> => {
    // 1. Inmediata actualización de estado React para vista previa reactiva en tiempo real
    const next: BrandConfig = { ...brandConfig, ...newConfig };
    setBrandConfig(next);

    // 2. Persistencia en localStorage
    try {
      localStorage.setItem("ayllu_brand_config", JSON.stringify(next));
    } catch (e) {
      console.warn("Error saving brand config to localStorage:", e);
    }

    // 3. Respaldo en servidor local /api/brand-config
    fetch("/api/brand-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    }).catch((err) => console.warn("Servidor /api/brand-config aviso:", err));

    // 4. Persistencia en Supabase
    let supabaseSynced = false;
    let supabaseError: any = null;

    // Intentar respaldo prioritario mediante API de servidor (sin problemas de CORS ni iframe)
    try {
      const serverRes = await fetch("/api/store-settings/brand_config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: next }),
      });
      if (serverRes.ok) {
        supabaseSynced = true;
      }
    } catch {
      // Continuar con intento directo si el endpoint no responde
    }

    if (!supabaseSynced && isSupabaseConfigured()) {
      try {
        // Principal: Upsert en store_settings con key 'brand_config'
        const { data: dataBrand, error: errBrand } = await supabase
          .from("store_settings")
          .upsert(
            { key: "brand_config", value: next, updated_at: new Date().toISOString() },
            { onConflict: "key" }
          )
          .select();

        if (errBrand) {
          console.warn("Aviso de Supabase al guardar en store_settings (brand_config):", errBrand.message || errBrand);
          supabaseError = errBrand;
        } else {
          supabaseSynced = true;
        }

        // Secundario: También respaldamos con key 'footer_settings' en store_settings
        await supabase
          .from("store_settings")
          .upsert(
            { key: "footer_settings", value: next, updated_at: new Date().toISOString() },
            { onConflict: "key" }
          );

        // Opcional: Si existe la tabla relacional footer_settings, actualizamos sus columnas
        try {
          const footerPayload = {
            id: "main",
            brand_name: next.brandName,
            logo_url: next.logoUrl,
            footer_subtitle: next.footerSubtitle || next.slogan,
            footer_description: next.footerDescription || next.aboutDescription,
            footer_badge: next.footerBadge,
            contact_email: next.contactEmail,
            contact_phone: next.contactPhone,
            whatsapp_number: next.whatsappNumber,
            footer_hours_weekdays: next.footerHoursWeekdays,
            footer_hours_weekends: next.footerHoursWeekends,
            footer_whatsapp_text: next.footerWhatsAppText,
            footer_whatsapp_message: next.footerWhatsAppMessage,
            updated_at: new Date().toISOString(),
          };
          await supabase.from("footer_settings").upsert(footerPayload, { onConflict: "id" });
        } catch {
          // Ignorar si la tabla footer_settings relacional no existe en el proyecto
        }
      } catch (sbEx: any) {
        console.warn("Aviso al conectar con Supabase desde navegador:", sbEx?.message || sbEx);
        supabaseError = sbEx;
      }
    } else if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Guardado en local y servidor.");
    }

    if (supabaseError) {
      return {
        success: false,
        message: `Guardado en local, pero Supabase reportó un error: ${supabaseError.message || supabaseError}`,
        error: supabaseError,
        supabaseSynced: false,
      };
    }

    return {
      success: true,
      message: supabaseSynced
        ? "✓ Pie de página guardado y sincronizado exitosamente con Supabase y la tienda."
        : "✓ Guardado en almacenamiento local y servidor.",
      supabaseSynced,
    };
  };

  const resetBrandConfig = () => {
    setBrandConfig(DEFAULT_BRAND_CONFIG);
    saveStoreSettingToSupabase("brand_config", DEFAULT_BRAND_CONFIG);
    try {
      localStorage.setItem("ayllu_brand_config", JSON.stringify(DEFAULT_BRAND_CONFIG));
    } catch {}
    fetch("/api/brand-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(DEFAULT_BRAND_CONFIG),
    }).catch(() => {});
  };

  // Candle actions with server commit and immediate localStorage serialization
  const saveCandleAsync = async (
    candle: CandleProduct,
    isEditing = false
  ): Promise<{ success: boolean; candle?: CandleProduct; error?: string }> => {
    try {
      const endpoint = isEditing ? `/api/products/${candle.id}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candle),
      });

      let saved = candle;
      if (res.ok) {
        const data = await res.json();
        saved = data.candle || candle;
      }

      setCandles((prev) => {
        const exists = prev.some((c) => c.id === saved.id);
        const nextList = exists
          ? prev.map((c) => (c.id === saved.id ? saved : c))
          : [saved, ...prev];
        saveProductsToStorage(nextList);
        return nextList;
      });

      // Synchronize matching sculpture ONLY if it is a genuine default figure template, never a custom candle
      if (saved.sculptureType && !saved.id.startsWith("vela-custom")) {
        setSculptures((prevSc) => {
          const nextSc = prevSc.map((sc) => {
            if (sc.id === saved.sculptureType && sc.name.toLowerCase() === saved.name.toLowerCase()) {
              return {
                ...sc,
                layers2D: saved.layers2D,
                backgroundImage: saved.backgroundImage ?? sc.backgroundImage,
                backgroundOpacity: saved.backgroundOpacity ?? sc.backgroundOpacity,
                wickX: saved.wickX ?? sc.wickX,
                wickY: saved.wickY ?? sc.wickY,
                botanicalsX: saved.botanicalsX ?? sc.botanicalsX,
                botanicalsY: saved.botanicalsY ?? sc.botanicalsY,
              };
            }
            return sc;
          });
          try {
            localStorage.setItem("ayllu_sculptures", JSON.stringify(nextSc));
          } catch {}
          return nextSc;
        });
      }

      if (isSupabaseConfigured()) {
        supabase
          .from("products")
          .upsert(mapCandleToSupabaseRow(saved), { onConflict: "id" })
          .then(({ error }) => {
            if (error) console.warn("Fallo secundario al persistir vela en Supabase:", error);
          });

        if (saved.layers2D && Array.isArray(saved.layers2D)) {
          (async () => {
            try {
              await supabase.from("candle_layers").delete().eq("product_id", saved.id);
              if (saved.layers2D && saved.layers2D.length > 0) {
                const dbRows = saved.layers2D.map((l, idx) => ({
                  id: l.id || `layer-${Date.now()}-${idx}`,
                  product_id: saved.id,
                  name: l.name || `Capa ${idx + 1}`,
                  image_url: l.imageUrl || "",
                  colorable: Boolean(l.colorable),
                  z_index: Number(l.zIndex ?? idx),
                  type: l.type || l.category || "figura",
                  default_color_hex: l.defaultColorHex || undefined,
                  allowed_color_hexes: l.allowedColorHexes || [],
                  offset_x: Number(l.offsetX ?? l.posX ?? 0),
                  offset_y: Number(l.offsetY ?? l.posY ?? 0),
                  scale: Number(l.scale ?? 1.0),
                  opacity: Number(l.opacity ?? 1.0),
                }));
                await supabase.from("candle_layers").insert(dbRows);
              }
            } catch (layerErr) {
              console.warn("Fallo secundario al sincronizar candle_layers:", layerErr);
            }
          })();
        }
      }

      return { success: true, candle: saved };
    } catch (err: any) {
      console.error("Error al persistir vela en servidor:", err);
      // Fallback local update with immediate serialization
      setCandles((prev) => {
        const exists = prev.some((c) => c.id === candle.id);
        const nextList = isEditing || exists
          ? prev.map((c) => (c.id === candle.id ? candle : c))
          : [candle, ...prev];
        saveProductsToStorage(nextList);
        return nextList;
      });

      return { success: false, error: err.message, candle };
    }
  };

  const addCandle = (candle: CandleProduct) => {
    setCandles((prev) => {
      const nextList = [candle, ...prev.filter((c) => c.id !== candle.id)];
      saveProductsToStorage(nextList);
      return nextList;
    });
    if (isSupabaseConfigured()) {
      supabase
        .from("products")
        .upsert(mapCandleToSupabaseRow(candle), { onConflict: "id" })
        .then(({ error }) => {
          if (error) console.warn("Fallo al insertar vela en Supabase:", error);
        });
    }
    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(candle),
    }).catch((err) => console.warn("Failed background create to server:", err));
  };

  const updateCandle = (id: string, updated: Partial<CandleProduct>) => {
    setCandles((prev) => {
      const target = prev.find((c) => c.id === id);
      const merged = target ? { ...target, ...updated } : undefined;
      const nextList = prev.map((c) => (c.id === id ? { ...c, ...updated } : c));
      saveProductsToStorage(nextList);
      if (merged) {
        if (isSupabaseConfigured()) {
          supabase
            .from("products")
            .upsert(mapCandleToSupabaseRow(merged), { onConflict: "id" })
            .then(({ error }) => {
              if (error) console.warn("Fallo al actualizar vela en Supabase:", error);
            });
        }
        fetch(`/api/products/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(merged),
        }).catch((err) => console.warn("Failed background update to server:", err));
      }
      return nextList;
    });
  };

  const deleteCandle = (id: string) => {
    setCandles((prev) => {
      const nextList = prev.filter((c) => c.id !== id);
      saveProductsToStorage(nextList);
      return nextList;
    });
    if (isSupabaseConfigured()) {
      supabase.from("products").delete().eq("id", id).then(({ error }) => {
        if (error) console.warn("Fallo al eliminar vela de Supabase:", error);
      });
    }
    fetch(`/api/products/${id}`, { method: "DELETE" }).catch((err) =>

      console.warn("Failed background delete to server:", err)
    );
  };

  // Collaborator actions with immediate localStorage serialization and server sync
  const addCollaborator = (collab: Collaborator) => {
    setCollaborators((prev) => {
      const nextList = [...prev.filter((c) => c.id !== collab.id), collab];
      saveCollaboratorsToStorage(nextList);
      return nextList;
    });
    fetch("/api/collaborators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collab),
    }).catch((err) => console.warn("Failed background collaborator create to server:", err));
  };

  const updateCollaborator = (id: string, updated: Partial<Collaborator>) => {
    setCollaborators((prev) => {
      const target = prev.find((c) => c.id === id);
      const merged = target ? { ...target, ...updated } : undefined;
      const nextList = prev.map((collab) => (collab.id === id ? { ...collab, ...updated } : collab));
      saveCollaboratorsToStorage(nextList);
      if (merged) {
        fetch(`/api/collaborators/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(merged),
        }).catch((err) => console.warn("Failed background collaborator update to server:", err));
      }
      return nextList;
    });
  };

  const deleteCollaborator = (id: string) => {
    setCollaborators((prev) => {
      const nextList = prev.filter((c) => c.id !== id);
      saveCollaboratorsToStorage(nextList);
      return nextList;
    });
    fetch(`/api/collaborators/${id}`, { method: "DELETE" }).catch((err) =>
      console.warn("Failed background collaborator delete to server:", err)
    );
  };

  // Aroma actions
  const addAroma = (aroma: AromaItem) => {
    setAromas((prev) => [...prev, aroma]);
  };

  const updateAroma = (id: string, updated: Partial<AromaItem>) => {
    setAromas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
  };

  const deleteAroma = (id: string) => {
    setAromas((prev) => prev.filter((a) => a.id !== id));
  };

  // User actions
  const loginUser = (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (!found) {
      return { success: false, message: "No se encontró ningún usuario con este correo electrónico." };
    }

    if (found.status === "suspendido") {
      return { success: false, message: "Esta cuenta está temporalmente suspendida por administración." };
    }

    if (password && found.password && found.password !== password) {
      return { success: false, message: "Contraseña incorrecta. Por favor verifique sus datos." };
    }

    setCurrentUser(found);
    return { success: true, message: `¡Bienvenido/a de nuevo, ${found.name}!` };
  };

  const registerUser = (data: {
    name: string;
    email: string;
    password?: string;
    role?: "cliente" | "administrador";
  }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: "Ya existe una cuenta registrada con este correo electrónico." };
    }

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      password: data.password || "123456",
      role: data.role || "cliente",
      createdAt: new Date().toISOString().split("T")[0],
      status: "activo",
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, message: `Cuenta creada exitosamente. ¡Bienvenido/a, ${newUser.name}!` };
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const updateUserStatus = (userId: string, status: "activo" | "suspendido") => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u))
    );
    if (currentUser?.id === userId && status === "suspendido") {
      setCurrentUser(null);
    }
  };

  const updateUserRole = (userId: string, role: "cliente" | "administrador") => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role } : null));
    }
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
  };

  // Order actions
  const createOrder = (orderData: Omit<StoreOrder, "id" | "createdAt">): StoreOrder => {
    const newOrder: StoreOrder = {
      ...orderData,
      id: `AYL-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      trackingCode: `AYLLU-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: StoreOrder["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Reviews Actions
  const addReview = async (reviewData: {
    comment: string;
    rating: number;
    author?: string;
    location?: string;
    candleName?: string;
    candleId?: string;
  }): Promise<{ success: boolean; message: string; review?: CandleReview }> => {
    if (!currentUser) {
      return { success: false, message: "Debes iniciar sesión para publicar un comentario o reseña." };
    }

    const trimmedComment = reviewData.comment.trim();
    if (!trimmedComment) {
      return { success: false, message: "El texto del comentario no puede estar vacío." };
    }

    const now = new Date();
    const dateFormatted = new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(now);

    const newRev: CandleReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      author: reviewData.author?.trim() || currentUser.name,
      userId: currentUser.id,
      userEmail: currentUser.email,
      rating: Math.max(1, Math.min(5, reviewData.rating || 5)),
      date: dateFormatted,
      createdAt: now.toISOString(),
      comment: trimmedComment,
      location: reviewData.location?.trim() || currentUser.city || "Comunidad Ayllu",
      candleName: reviewData.candleName?.trim() || "Vela Artesanal Ayllu",
      candleId: reviewData.candleId,
      verified: true,
    };

    setReviews((prev) => {
      const next = [newRev, ...prev];
      saveReviewsToStorage(next);
      return next;
    });

    // Background server persist
    fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRev),
    }).catch((err) => console.warn("Background review creation to server failed:", err));

    return { success: true, message: "¡Gracias por compartir tu experiencia en Ayllu!", review: newRev };
  };

  const updateReview = async (
    id: string,
    updated: Partial<CandleReview>
  ): Promise<{ success: boolean; message: string; review?: CandleReview }> => {
    if (!currentUser) {
      return { success: false, message: "Debes iniciar sesión para editar un comentario." };
    }

    const existing = reviews.find((r) => r.id === id);
    if (!existing) {
      return { success: false, message: "Comentario no encontrado." };
    }

    const isOwner =
      (existing.userId && existing.userId === currentUser.id) ||
      (existing.userEmail && existing.userEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      (!existing.userId && existing.author.toLowerCase() === currentUser.name.toLowerCase());
    const isAdmin = currentUser.role === "administrador";

    if (!isOwner && !isAdmin) {
      return { success: false, message: "Solo puedes editar tus propios comentarios." };
    }

    const updatedReview: CandleReview = {
      ...existing,
      ...updated,
      updatedAt: new Date().toISOString(),
    };

    setReviews((prev) => {
      const next = prev.map((r) => (r.id === id ? updatedReview : r));
      saveReviewsToStorage(next);
      return next;
    });

    fetch(`/api/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedReview),
    }).catch((err) => console.warn("Background review update to server failed:", err));

    return { success: true, message: "Comentario actualizado con éxito.", review: updatedReview };
  };

  const deleteReview = async (id: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: "Debes iniciar sesión para eliminar un comentario." };
    }

    const existing = reviews.find((r) => r.id === id);
    if (!existing) {
      return { success: false, message: "Comentario no encontrado." };
    }

    const isOwner =
      (existing.userId && existing.userId === currentUser.id) ||
      (existing.userEmail && existing.userEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      (!existing.userId && existing.author.toLowerCase() === currentUser.name.toLowerCase());
    const isAdmin = currentUser.role === "administrador";

    if (!isOwner && !isAdmin) {
      return { success: false, message: "Solo puedes eliminar tus propios comentarios o requieres permisos de Administrador." };
    }

    setReviews((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveReviewsToStorage(next);
      return next;
    });

    fetch(`/api/reviews/${id}`, {
      method: "DELETE",
    }).catch((err) => console.warn("Background review delete to server failed:", err));

    return { success: true, message: "Comentario eliminado correctamente." };
  };

  // Customizer CRUD functions
  const updateCustomizerOptions = (updated: Partial<CustomizerOptionsCatalog>) => {
    setCustomizerOptions((prev) => {
      const next = { ...prev, ...updated };
      saveCustomizerOptionsToStorage(next);
      return next;
    });
  };

  const addCustomizerOption = <K extends keyof CustomizerOptionsCatalog>(
    category: K,
    item: CustomizerOptionsCatalog[K][number]
  ) => {
    setCustomizerOptions((prev) => {
      const currentList = prev[category] as any[];
      const nextList = [...currentList, item];
      const next = { ...prev, [category]: nextList };
      saveCustomizerOptionsToStorage(next);
      return next;
    });
  };

  const editCustomizerOption = <K extends keyof CustomizerOptionsCatalog>(
    category: K,
    id: string,
    updated: Partial<CustomizerOptionsCatalog[K][number]>
  ) => {
    setCustomizerOptions((prev) => {
      const currentList = prev[category] as any[];
      const nextList = currentList.map((item) =>
        item.id === id ? { ...item, ...updated } : item
      );
      const next = { ...prev, [category]: nextList };
      saveCustomizerOptionsToStorage(next);
      return next;
    });
  };

  const deleteCustomizerOption = <K extends keyof CustomizerOptionsCatalog>(
    category: K,
    id: string
  ) => {
    setCustomizerOptions((prev) => {
      const currentList = prev[category] as any[];
      const nextList = currentList.filter((item) => item.id !== id);
      const next = { ...prev, [category]: nextList };
      saveCustomizerOptionsToStorage(next);
      return next;
    });
  };

  const resetCustomizerOptionsToDefault = () => {
    setCustomizerOptions(DEFAULT_CUSTOMIZER_CATALOG);
    saveCustomizerOptionsToStorage(DEFAULT_CUSTOMIZER_CATALOG);
  };

  // Dedicated Wax Colors actions (mirroring Aromas management)
  const waxColors = customizerOptions.waxColors;

  const addWaxColor = (color: WaxColorOption) => {
    addCustomizerOption("waxColors", { ...color, active: color.active !== undefined ? color.active : true });
  };

  const updateWaxColor = (id: string, updated: Partial<WaxColorOption>) => {
    editCustomizerOption("waxColors", id, updated);
  };

  const deleteWaxColor = (id: string) => {
    deleteCustomizerOption("waxColors", id);
  };

  const toggleWaxColorActive = (id: string) => {
    const current = customizerOptions.waxColors.find((c) => c.id === id);
    if (current) {
      editCustomizerOption("waxColors", id, { active: current.active === false ? true : false });
    }
  };

  // Sculpted Figures CRUD
  const addSculpture = (newSculpture: SculptedFigure) => {
    setSculptures((prev) => {
      const next = [newSculpture, ...prev];
      saveSculpturesToStorage(next);
      return next;
    });
  };

  const updateSculpture = (id: string, updated: Partial<SculptedFigure>) => {
    setSculptures((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...updated } : s));
      saveSculpturesToStorage(next);
      return next;
    });
  };

  const deleteSculpture = (id: string) => {
    setSculptures((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveSculpturesToStorage(next);
      return next;
    });
  };

  return (
    <StoreContext.Provider
      value={{
        brandConfig,
        updateBrandConfig,
        resetBrandConfig,
        candles,
        addCandle,
        updateCandle,
        deleteCandle,
        saveCandleAsync,
        refetchCandles,
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
        loginUser,
        registerUser,
        logoutUser,
        updateUserStatus,
        updateUserRole,
        deleteUser,
        orders,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        customizerOptions,
        waxColors,
        addWaxColor,
        updateWaxColor,
        deleteWaxColor,
        toggleWaxColorActive,
        updateCustomizerOptions,
        saveCustomizerOptionsToStorage,
        addCustomizerOption,
        editCustomizerOption,
        deleteCustomizerOption,
        resetCustomizerOptionsToDefault,
        sculptures,
        addSculpture,
        updateSculpture,
        deleteSculpture,
        saveSculpturesToStorage,
        reviews,
        addReview,
        updateReview,
        deleteReview,
        refetchReviews,
        saveReviewsToStorage,
        isSupabaseReady,
        isSupabaseSyncing,
        lastSupabaseSync,
        syncAllToSupabase,
        fetchFromSupabase,
        saveLayersToSupabase,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
