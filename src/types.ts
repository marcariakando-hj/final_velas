export type WaxType = 'Soja' | 'Parafina';

export type LayerCategory = 'frasco' | 'cera' | 'figura' | 'otro';

export const getLayerCategory = (layer: Partial<Layer2D>): LayerCategory => {
  if (layer.type) return layer.type;
  if (layer.category) return layer.category;
  const n = (layer.name || '').toLowerCase();
  if (
    n.includes('frasco') ||
    n.includes('vaso') ||
    n.includes('vasija') ||
    n.includes('vidrio') ||
    n.includes('base') ||
    n.includes('tarro') ||
    n.includes('envase') ||
    n.includes('cristal')
  ) {
    return 'frasco';
  }
  if (
    n.includes('cera') ||
    n.includes('relleno') ||
    n.includes('wax') ||
    n.includes('líquid') ||
    n.includes('llenado') ||
    n.includes('superficie')
  ) {
    return 'cera';
  }
  if (
    n.includes('figura') ||
    n.includes('escultura') ||
    n.includes('relieve') ||
    n.includes('virgen') ||
    n.includes('zorro') ||
    n.includes('osito') ||
    n.includes('panda') ||
    n.includes('loto') ||
    n.includes('cuerpo') ||
    n.includes('rostro') ||
    n.includes('manto') ||
    n.includes('túnica') ||
    n.includes('manchas') ||
    n.includes('orejas')
  ) {
    return 'figura';
  }
  return 'otro';
};

export interface Layer2D {
  id: string;
  name: string; // Ej: "Frasco Vidrio", "Manchas & Orejas", "Cuerpo & Rostro"
  imageUrl: string; // PNG transparente comprimido
  colorable: boolean;
  zIndex: number;
  type?: LayerCategory; // 'frasco' | 'cera' | 'figura' | 'otro'
  category?: LayerCategory; // Alias de compatibilidad
  defaultColorHex?: string; // Color por defecto configurado en el Admin
  allowedColorHexes?: string[]; // Lista de colores de cera permitidos para esta capa
  allowedColors?: Array<{ name: string; hex: string }>; // Tonos permitidos con nombre y hex
  offsetX?: number; // Desplazamiento horizontal en % (-80 a 80)
  offsetY?: number; // Desplazamiento vertical en % (-80 a 80)
  posX?: number; // Desplazamiento X en % (-80 a 80) (compatibilidad)
  posY?: number; // Desplazamiento Y en % (-80 a 80) (compatibilidad)
  scale?: number; // Escala (0.1 a 3.0)
  opacity?: number; // Opacidad (0 a 1)
}

export interface SculptedFigure {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  image?: string;
  sculptureType?: string;
  priceAddon?: number;
  layers2D: Layer2D[];
  wickX?: number; // % X anchor for wick/flame
  wickY?: number; // % Y anchor for wick/flame
  botanicalsX?: number; // % X anchor for botanicals
  botanicalsY?: number; // % Y anchor for botanicals
  botanicalsRadius?: number; // % radius of dispersion
  waxMaskPolygon?: string;
  base2DImage?: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
}

export interface OlfactoryPyramid {
  salida: string;
  corazon: string;
  fondo: string;
}

export interface Customizer2DConfig {
  enabled: boolean;
  templateType: 'santuario' | 'vaso-vidrio' | 'ceramica-arena' | 'ceramica-negra' | 'terracota' | 'cristal-ambar' | 'minimalista' | string;
  base2DImage?: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
  custom2DImageUrl?: string;
  waxMaskPolygon?: string; // e.g. SVG path "M ... Z" or CSS "polygon(...)"
  wickX?: number; // % X coordinate for wick/flame (0-100)
  wickY?: number; // % Y coordinate for wick/flame (0-100)
  botanicalsX?: number; // % X coordinate for botanicals center (0-100)
  botanicalsY?: number; // % Y coordinate for botanicals center (0-100)
  botanicalsRadius?: number; // % radius of dispersion for botanicals (1-50)
  labelX?: number; // %
  labelY?: number; // %
  labelWidth?: number; // %
  labelHeight?: number; // %
  botanicalsZone?: 'rim' | 'scattered' | 'side' | 'center';
  defaultWick?: 'madera' | 'algodon';
  defaultWaxColorHex?: string;
  defaultWaxColorName?: string;
  allowWickChoice?: boolean;
  allowBotanicalsChoice?: boolean;
  allowLabelCustomization?: boolean;
}

export interface CandleProduct {
  id: string;
  code?: string; // e.g. "Nº 01"
  name: string;
  subtitle: string;
  tagline: string;
  price: number;
  weightGrams: number;
  burnHours: number;
  image: string;
  mainImage?: string; // Explicit alias for primary product photo
  images?: string[]; // Multiple gallery images
  base2DImage?: string; // PNG transparent cutout or isolated 2D render
  custom2DImageUrl?: string; // Custom uploaded 2D model/cutout URL (/uploads/...)
  vesselColor: string;
  vesselName: string;
  waxType?: WaxType;
  category: 'Relajación' | 'Cálido & Especiado' | 'Madera & Místico' | 'Fresco & Vital' | string;
  olfactoryPyramid: OlfactoryPyramid;
  ingredients: string[];
  botanicals: string[];
  description: string;
  artisanNote: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  featured?: boolean;
  featuredOrder?: number;
  limitedBatchText?: string;
  waxColorName?: string;
  waxColorHex?: string;
  wickType?: string;
  customLabelTitle?: string;
  customLabelSubtitle?: string;
  collaboratorId?: string;
  collaboratorName?: string;
  sculptureType?: 'zorro' | 'osito' | 'lavanda' | 'santuario' | 'panda' | string;
  templateType?: string;
  waxMaskPolygon?: string; // CSS clip-path polygon or SVG coordinates for the wax vessel area
  wickX?: number; // % X anchor for wick
  wickY?: number; // % Y anchor for wick
  botanicalsX?: number; // % X anchor for botanicals center
  botanicalsY?: number; // % Y anchor for botanicals center
  botanicalsRadius?: number; // % dispersion radius
  layers2D?: Layer2D[];
  backgroundImage?: string;
  backgroundOpacity?: number;
  customizer2DConfig?: Customizer2DConfig;
  artistInspiration?: string;
  technique?: string;
  designMeaning?: string;
  quote?: string;
}

export interface CartItem {
  candle: CandleProduct;
  quantity: number;
  selectedWaxType?: WaxType;
  customEngraving?: string;
  giftWrap?: boolean;
  woodenMatchesSample?: boolean;
  selectedWaxColor?: {
    name: string;
    hex: string;
  };
  customLayerColors?: Record<string, string>; // Asignación de color por capa del cliente
  customDetails?: {
    waxType?: WaxType;
    vesselName?: string;
    waxColorName?: string;
    waxColorHex?: string;
    customLayerColors?: Record<string, string>;
    customLayersDetail?: Array<{ id: string; name: string; colorHex: string; colorName?: string }>;
    aromaName?: string;
    aromaId?: string;
    aromaColor?: string;
    aromaFamily?: string;
    aromaAccentColor?: string;
    aromaNotes?: string[];
    wickName?: string;
    wickPriceAddon?: number;
    botanicalsList?: string[];
    botanicalsPriceAddon?: number;
    labelTitle?: string;
    labelSubtitle?: string;
    labelStyle?: string;
    giftWrap?: boolean;
    olfactoryPyramid?: OlfactoryPyramid;
    totalPrice?: number;
  };
}

export type OrderItem = CartItem;

export interface BespokeFormula {
  candleName: string;
  olfactoryPyramid: OlfactoryPyramid;
  description: string;
  vesselRecommendation: string;
  burningRitual: string;
  moodAlignment: string;
  soundAmbience: string;
  customNotes?: string[];
  chosenVesselColor?: string;
  chosenSize?: string;
}

export interface CandleReview {
  id: string;
  author: string;
  userId?: string;
  userEmail?: string;
  rating: number;
  date: string;
  createdAt?: string;
  updatedAt?: string;
  comment: string;
  location: string;
  candleName: string;
  candleId?: string;
  verified: boolean;
}

export interface Collaborator {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  artistInspiration?: string;
  technique?: string;
  designMeaning?: string;
  aromaDesignRelation?: string;
  quote?: string;
  image: string;
  associatedCandleId?: string;
  associatedCandleName?: string;
  discipline: string;
  paletteColors: string[];
}

export type UserRole = 'cliente' | 'administrador';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  city?: string;
  createdAt: string;
  status: 'activo' | 'suspendido';
}

export type OrderStatus =
  | 'Pendiente de verificación'
  | 'Pago verificado'
  | 'En preparación'
  | 'En camino'
  | 'Entregado y cobrado'
  | 'Cancelado'
  | 'Pendiente'
  | 'En Elaboración'
  | 'Enviado'
  | 'Entregado';

export interface PaymentDetails {
  method: 'Transferencia Bancaria' | 'Efectivo (Pago contra entrega)';
  bankName?: string;
  referenceNumber?: string;
  receiptFileName?: string;
  receiptUrl?: string;
  verifiedByAdmin?: boolean;
  cashChangeFor?: string;
  deliveryInstructions?: string;
}

export interface StoreOrder {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  paymentMethod: string;
  paymentDetails?: PaymentDetails;
  notes?: string;
  trackingCode?: string;
}

export interface BrandConfig {
  brandName: string;
  slogan: string;
  logoUrl: string;
  aboutTagline: string;
  aboutDescription: string;
  aboutDetailedStory: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  shippingFreeThreshold: number;
  currencySymbol: string;
}

export interface AromaItem {
  id: string;
  name: string;
  family: string;
  intensity: number; // 1-5
  notes: string[];
  description: string;
  accentColor: string;
}

// Customizer Wizard & 2D Options Catalog Types
export interface VesselOption {
  id: string;
  name: string;
  subtitle: string;
  basePrice: number;
  color: string;
  borderColor?: string;
  rimColor?: string;
  waxColor?: string;
  image: string;
  material: string;
  description: string;
  templateType: string;
  base2DImage?: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
  waxMaskPolygon?: string;
  wickX?: number;
  wickY?: number;
  botanicalsX?: number;
  botanicalsY?: number;
  botanicalsRadius?: number;
  layers2D?: Layer2D[];
  // 2D Vessel Customization Attributes
  colorable?: boolean;
  defaultColorHex?: string;
  allowedColorHexes?: string[];
  offsetX?: number;
  offsetY?: number;
  scale?: number;
  zIndex?: number;
}

export interface WaxColorOption {
  id: string;
  name: string;
  subtitle: string;
  hex: string;
  accent?: string;
  description: string;
  mood?: string;
  active?: boolean;
}

export interface WickOption {
  id: string;
  name: string;
  subtitle: string;
  type: "algodon" | string;
  priceAddon: number;
  description: string;
  soundEffect: string;
  burnRate: string;
  hasAudio: boolean;
}

export interface BotanicalOption {
  id: string;
  name: string;
  category: "Salida" | "Corazón" | "Fondo";
  scentFamily: string;
  color: string;
  priceAddon: number;
  description: string;
  visualType: string;
  imageLayerUrl?: string;
}

export interface LabelStyleOption {
  id: "kraft" | "lino" | "negro" | "laser" | string;
  name: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  paperBg?: string;
  paperText?: string;
  paperBorder?: string;
}

export interface CustomizerOptionsCatalog {
  vessels: VesselOption[];
  waxColors: WaxColorOption[];
  wicks: WickOption[];
  botanicals: BotanicalOption[];
  labelStyles: LabelStyleOption[];
}

