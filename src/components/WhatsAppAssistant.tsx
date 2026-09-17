import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ExternalLink,
  Info,
  PhoneCall,
  CheckCheck,
  Star,
  ShoppingBag,
  Eye,
  Gift,
  Flame,
  Leaf
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { CandleProduct } from "../types";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  options?: string[];
  recommendHuman?: boolean;
  recommendedCandle?: CandleProduct;
  recommendedCandles?: CandleProduct[];
}

interface WhatsAppAssistantProps {
  onSelectCandle?: (candle: CandleProduct) => void;
  onAddToCart?: (candle: CandleProduct) => void;
}

// Typo & normalization helper for friendly natural language understanding
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[¿?¡!.,:;()_#\-"']/g, " ") // remove punctuation
    .replace(/\s+/g, " ")
    .trim();
}

export const WhatsAppAssistant: React.FC<WhatsAppAssistantProps> = ({
  onSelectCandle,
  onAddToCart,
}) => {
  const { brandConfig, candles, aromas, collaborators } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-welcome",
      sender: "bot",
      text: `¡Hola! 🕯️✨ Bienvenido a ${brandConfig.brandName}. Soy tu asistente virtual y recomendador oficial. Con mucho gusto te oriento sobre nuestras exclusivas Piezas de Autor destacadas, aromas según tu estado de ánimo o necesidad de regalo, precios y personalizaciones. ¿En qué te puedo asesorar hoy? 🌸🎁`,
      timestamp: "Ahora",
      options: [
        "¿Qué vela me recomiendas hoy?",
        "Busco un regalo especial",
        "Aromas para relajación y dormir",
        "¿Cuáles son los precios y piezas destacadas?",
        "¿Cómo personalizar con grabado láser?",
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  // Knowledge Engine with Dynamic Inventory, Typo Tolerance and Featured Prioritization
  const processQuery = (
    rawQuery: string
  ): {
    text: string;
    recommendHuman?: boolean;
    recommendedCandle?: CandleProduct;
    recommendedCandles?: CandleProduct[];
  } => {
    const raw = rawQuery.trim();
    const q = normalizeText(raw);

    // Phonetic & typo substitutions
    const cleaned = q
      .replace(/\bke\b/g, "que")
      .replace(/\bbela\b/g, "vela")
      .replace(/\bbelas\b/g, "velas")
      .replace(/\bpresio\b/g, "precio")
      .replace(/\bpresios\b/g, "precios")
      .replace(/\bdeseno\b/g, "diseno")
      .replace(/\bdesenos\b/g, "disenos")
      .replace(/\bdesenar\b/g, "disenar")
      .replace(/\bpersonalisar\b/g, "personalizar")
      .replace(/\bpersonalisacion\b/g, "personalizacion")
      .replace(/\bgrabar\b/g, "grabado")
      .replace(/\bespesias\b/g, "especias")
      .replace(/\bcolavorador\b/g, "colaborador")
      .replace(/\baromai\b/g, "aroma")
      .replace(/\brecomiendame\b/g, "recomendar")
      .replace(/\brecomiendas\b/g, "recomendar")
      .replace(/\brecomendacion\b/g, "recomendar")
      .replace(/\brecomendaciones\b/g, "recomendar")
      .replace(/\bsugerencia\b/g, "recomendar")
      .replace(/\bsugerencias\b/g, "recomendar");

    // Dynamic Featured candles sorted by priority
    const featuredList = candles
      .filter((c) => c.featured)
      .sort((a, b) => (a.featuredOrder || 99) - (b.featuredOrder || 99));

    const candidates = featuredList.length > 0 ? featuredList : candles;
    const topFeatured = candidates[0];

    // 1. INTENT: Recommendations / Featured / Gifts / Need-based Scent Advice
    const isRecommendationQuery =
      cleaned.includes("recomendar") ||
      cleaned.includes("destacado") ||
      cleaned.includes("destacados") ||
      cleaned.includes("destacadas") ||
      cleaned.includes("mas vendida") ||
      cleaned.includes("mas vendidas") ||
      cleaned.includes("mejor") ||
      cleaned.includes("mejores") ||
      cleaned.includes("popular") ||
      cleaned.includes("pieza de autor") ||
      cleaned.includes("cual elijo") ||
      cleaned.includes("que compro") ||
      cleaned.includes("ayudame a elegir");

    const isGiftQuery =
      cleaned.includes("regalo") ||
      cleaned.includes("regalar") ||
      cleaned.includes("obsequio") ||
      cleaned.includes("detalle") ||
      cleaned.includes("cumpleanos") ||
      cleaned.includes("aniversario") ||
      cleaned.includes("novia") ||
      cleaned.includes("novio") ||
      cleaned.includes("mama") ||
      cleaned.includes("amiga") ||
      cleaned.includes("pareja") ||
      cleaned.includes("especial");

    const isRelaxQuery =
      cleaned.includes("relax") ||
      cleaned.includes("relajacion") ||
      cleaned.includes("relajar") ||
      cleaned.includes("calma") ||
      cleaned.includes("dormir") ||
      cleaned.includes("insomnio") ||
      cleaned.includes("estres") ||
      cleaned.includes("ansiedad") ||
      cleaned.includes("paz") ||
      cleaned.includes("meditacion") ||
      cleaned.includes("descanso");

    const isWarmHomeQuery =
      cleaned.includes("hogar") ||
      cleaned.includes("casa") ||
      cleaned.includes("acogedor") ||
      cleaned.includes("calido") ||
      cleaned.includes("dulce") ||
      cleaned.includes("canela") ||
      cleaned.includes("vainilla") ||
      cleaned.includes("otono") ||
      cleaned.includes("invierno") ||
      cleaned.includes("abrazo");

    const isFreshZenQuery =
      cleaned.includes("fresco") ||
      cleaned.includes("frescura") ||
      cleaned.includes("vitalidad") ||
      cleaned.includes("energia") ||
      cleaned.includes("concentracion") ||
      cleaned.includes("estudiar") ||
      cleaned.includes("trabajo") ||
      cleaned.includes("oficina") ||
      cleaned.includes("zen") ||
      cleaned.includes("te verde") ||
      cleaned.includes("bambu") ||
      cleaned.includes("limon");

    // Case 1A: Specific Need - Relaxation & Calm
    if (isRelaxQuery) {
      // Find matching featured candle (e.g. Santuario de Lavanda or Zorro del Bosque)
      const relaxCandle =
        candidates.find(
          (c) =>
            c.category === "Relajación" ||
            normalizeText(c.name).includes("lavanda") ||
            normalizeText(c.subtitle).includes("lavanda") ||
            c.botanicals?.some((b) => normalizeText(b).includes("lavanda"))
        ) || topFeatured;

      return {
        text: `🌿 [RECOMENDACIÓN DESTACADA PARA RELAJACIÓN & CALMA]\n` +
          `Para desconectar del estrés diario e inducir un descanso reparador, te recomiendo especialmente nuestra Pieza de Autor:\n\n` +
          `⭐ **${relaxCandle.name}**\n` +
          `• Aroma Principal: ${relaxCandle.subtitle}\n` +
          `• Precio: $${Number(relaxCandle.price).toFixed(2)} USD\n` +
          `• Justificación: Sus acordes botánicos y su suave combustión crean una atmósfera de quietud ideal para meditar, leer o antes de dormir. ✨\n\n` +
          `¡Puedes hacer clic abajo para ver la ficha completa o añadirla directamente a tu cesta!`,
        recommendedCandle: relaxCandle,
        recommendedCandles: candidates.filter((c) => c.id !== relaxCandle.id).slice(0, 2),
      };
    }

    // Case 1B: Specific Need - Gifts & Special Occasions
    if (isGiftQuery) {
      // Find best gift candle (e.g. Zorro del Bosque or Abrazo de Osito)
      const giftCandle =
        candidates.find(
          (c) =>
            normalizeText(c.name).includes("zorro") ||
            normalizeText(c.name).includes("osito")
        ) || topFeatured;

      return {
        text: `🎁 [RECOMENDACIÓN DESTACADA PARA REGALO ESPECIAL]\n` +
          `Para sorprender con un detalle único y emotivo, te recomiendo nuestra Pieza de Autor más aclamada:\n\n` +
          `⭐ **${giftCandle.name}**\n` +
          `• Aroma Principal: ${giftCandle.subtitle}\n` +
          `• Precio: $${Number(giftCandle.price).toFixed(2)} USD\n` +
          `• Justificación: Su figura escultórica 3D en cera vegetal, el vaso de cristal artesanal y su empaque kraft listo para regalo la convierten en una pieza de colección inolvidable. 🌸\n\n` +
          `Además, puedes añadir grabado personalizado (+ $3.50) y envoltura de regalo (+ $2.50).`,
        recommendedCandle: giftCandle,
        recommendedCandles: candidates.filter((c) => c.id !== giftCandle.id).slice(0, 2),
      };
    }

    // Case 1C: Specific Need - Warm & Cozy Home
    if (isWarmHomeQuery) {
      const warmCandle =
        candidates.find(
          (c) =>
            c.category === "Cálido & Especiado" ||
            normalizeText(c.name).includes("osito") ||
            normalizeText(c.subtitle).includes("canela")
        ) || topFeatured;

      return {
        text: `🕯️ [RECOMENDACIÓN DESTACADA • HOGAR CÁLIDO & ACOGEDOR]\n` +
          `Para llenar los espacios de calidez y dulzura hogareña, te sugiero nuestra Pieza de Autor:\n\n` +
          `⭐ **${warmCandle.name}**\n` +
          `• Aroma Principal: ${warmCandle.subtitle}\n` +
          `• Precio: $${Number(warmCandle.price).toFixed(2)} USD\n` +
          `• Justificación: Notas reconfortantes de canela en rama y vainilla cremosa que envuelven el ambiente con sensación de hogar y cariño. 🍯`,
        recommendedCandle: warmCandle,
        recommendedCandles: candidates.filter((c) => c.id !== warmCandle.id).slice(0, 2),
      };
    }

    // Case 1D: Specific Need - Freshness & Zen Concentration
    if (isFreshZenQuery) {
      const freshCandle =
        candidates.find(
          (c) =>
            c.category === "Fresco & Vital" ||
            normalizeText(c.name).includes("panda") ||
            normalizeText(c.subtitle).includes("te verde")
        ) || topFeatured;

      return {
        text: `🌱 [RECOMENDACIÓN DESTACADA • FRESCURA & VITALIDAD ZEN]\n` +
          `Para renovar la atmósfera y potenciar el enfoque en tu espacio de trabajo o estudio:\n\n` +
          `⭐ **${freshCandle.name}**\n` +
          `• Aroma Principal: ${freshCandle.subtitle}\n` +
          `• Precio: $${Number(freshCandle.price).toFixed(2)} USD\n` +
          `• Justificación: Infusión fresca de brotes de bambú, hojas de té verde y sutiles toques cítricos para revitalizar la mente. 🌿`,
        recommendedCandle: freshCandle,
      };
    }

    // Case 1E: General Recommendation ("¿Qué me recomiendas?", "Destacados")
    if (isRecommendationQuery) {
      const otherFeatured = candidates.filter((c) => c.id !== topFeatured.id);
      const otherList = otherFeatured
        .map((c) => `• **${c.name}** ($${Number(c.price).toFixed(2)}) — ${c.subtitle}`)
        .join("\n");

      return {
        text: `⭐ [NUESTRAS PIEZAS DE AUTOR DESTACADAS]\n` +
          `Nuestra recomendación estrella del taller es:\n\n` +
          `🕯️ **${topFeatured.name}** ($${Number(topFeatured.price).toFixed(2)} USD)\n` +
          `• Aroma: ${topFeatured.subtitle}\n` +
          `• Por qué elegirla: ${topFeatured.tagline || topFeatured.description}\n\n` +
          (otherFeatured.length > 0
            ? `Otras piezas destacadas de la colección:\n${otherList}\n\n`
            : "") +
          `¿Te gustaría ver los detalles de alguna en específico o explorar según una necesidad de aroma? 🌸`,
        recommendedCandle: topFeatured,
        recommendedCandles: otherFeatured.slice(0, 2),
      };
    }

    // 2. Greetings & Saludos
    if (
      cleaned === "hola" ||
      cleaned === "buenos dias" ||
      cleaned === "buenas tardes" ||
      cleaned === "buenas noches" ||
      cleaned === "buenas" ||
      cleaned === "hey"
    ) {
      return {
        text: `¡Hola! 🕯️✨ Qué alegría saludarte. Cuéntame qué tipo de aroma o vela buscas para tu hogar o para regalar (relax, regalo especial, dulzura, frescura) y con gusto te asesoro al instante. 🌸`,
        recommendedCandle: topFeatured,
      };
    }

    // 3. Shipping & Payment Policies
    if (
      cleaned.includes("envio") ||
      cleaned.includes("envios") ||
      cleaned.includes("portes") ||
      cleaned.includes("entrega") ||
      cleaned.includes("cuanto tarda") ||
      cleaned.includes("tiempo de entrega")
    ) {
      return {
        text: `📦 [POLÍTICAS DE ENVÍO]\n` +
          `• Realizamos envíos seguros a todo el país. ✨\n` +
          `• Envío GRATIS en compras superiores a $${brandConfig.shippingFreeThreshold}.\n` +
          `• Coste estándar para pedidos menores: $4.50.\n` +
          `• Tiempo de preparación artesanal y despacho: 24 a 72 horas en empaque biodegradable y protegido. 🌿`,
      };
    }

    if (
      cleaned.includes("pago") ||
      cleaned.includes("pagar") ||
      cleaned.includes("metodos de pago") ||
      cleaned.includes("tarjeta") ||
      cleaned.includes("transferencia") ||
      cleaned.includes("bizum")
    ) {
      return {
        text: `💳 [MÉTODOS DE PAGO DISPONIBLES]\n` +
          `Aceptamos con total seguridad:\n` +
          `• Tarjeta de crédito y débito (Visa, Mastercard, etc.). 💳\n` +
          `• Transferencia bancaria directa con confirmación de comprobante.\n` +
          `• Pago contra entrega en efectivo.\n\n` +
          `Todos los pedidos son procesados con total garantía artesanal. 🔒`,
      };
    }

    // 4. Customization & Laser Engraving
    if (
      cleaned.includes("personalizar") ||
      cleaned.includes("personalizacion") ||
      cleaned.includes("grabado") ||
      cleaned.includes("laser") ||
      cleaned.includes("tapa") ||
      cleaned.includes("dedicatoria")
    ) {
      return {
        text: `🎁 [PERSONALIZACIÓN DE VELAS & GRABADO ARTESANAL]\n` +
          `• Módulo "Personalizar": Puedes formular tu propia vela eligiendo la vasija mineral, la mecha (madera o algodón), combinando entre 2 y 5 botánicos aromáticos reales y redactando el mensaje de la etiqueta en tiempo real. 🕯️✨\n` +
          `• Grabado Láser Personalizado: Puedes grabar nombres, fechas memorables o frases (+ $3.50).\n` +
          `• Envoltura para Regalo Botánica: Papel kraft artesanal, lazo de lino y flores secas (+ $2.50). 🌸\n` +
          `• ¡Explora la sección "Personalizar" en el menú para diseñar tu vela ahora! 🌿`,
      };
    }

    // 5. Brand origin & Ayllu Philosophy
    if (
      cleaned.includes("ayllu") ||
      cleaned.includes("significa") ||
      cleaned.includes("filosofia") ||
      cleaned.includes("manifiesto") ||
      cleaned.includes("historia") ||
      cleaned.includes("nosotros")
    ) {
      return {
        text: `🌿 [NUESTRA ESENCIA AYLLU]\n` +
          `"${brandConfig.aboutDescription}"\n\n` +
          `Ayllu es un concepto ancestral quechua que representa la comunidad viva, el trabajo colectivo y la reciprocidad con la naturaleza. ${brandConfig.aboutDetailedStory} 🕯️✨`,
      };
    }

    // 6. Check if inquiring about specific Artist / Collaborator
    const matchedCollab = collaborators.find((col) => {
      const colNameNorm = normalizeText(col.name);
      return (
        cleaned.includes(colNameNorm) ||
        colNameNorm.split(" ").some((p) => p.length > 3 && cleaned.includes(p))
      );
    });

    if (matchedCollab) {
      const associated = candles.find((c) => c.id === matchedCollab.associatedCandleId);
      return {
        text: `🎨 [FICHA DE CREADOR - ${matchedCollab.name.toUpperCase()}]\n` +
          `• Edad y Ubicación: ${matchedCollab.age} años, ${matchedCollab.location}.\n` +
          `• Disciplina: ${matchedCollab.discipline}.\n` +
          `• Técnica: ${matchedCollab.technique}.\n` +
          `• Inspiración: ${matchedCollab.artistInspiration}.\n` +
          `• Significado del diseño: "${matchedCollab.designMeaning}"\n` +
          (matchedCollab.associatedCandleName
            ? `• Vela ilustrada: ${matchedCollab.associatedCandleName} 🕯️\n`
            : "") +
          `• Cita: "${matchedCollab.quote}" ✨`,
        recommendedCandle: associated,
      };
    }

    if (
      cleaned.includes("artista") ||
      cleaned.includes("artistas") ||
      cleaned.includes("creador") ||
      cleaned.includes("creadores") ||
      cleaned.includes("ilustrador") ||
      cleaned.includes("colaborador")
    ) {
      const collabList = collaborators
        .map((c) => `• ${c.name} (${c.age} años, ${c.location}) — ${c.discipline}`)
        .join("\n");
      return {
        text: `🌸 [JÓVENES CREADORES DEL COLECTIVO AYLLU]\n` +
          `Actualmente contamos con ${collaborators.length} artistas colaborando en nuestras colecciones:\n\n` +
          `${collabList}\n\n` +
          `Cada ilustración en nuestras vasijas y empaques lleva su historia y técnica artística. ✨`,
      };
    }

    // 7. Check if inquiring about a specific Candle product by name / partial name
    const matchedCandle = candles.find((c) => {
      const cNameNorm = normalizeText(c.name);
      const cSubNorm = normalizeText(c.subtitle || "");
      return (
        cleaned.includes(cNameNorm) ||
        cNameNorm.split("•").some((part) => part.trim().length > 3 && cleaned.includes(part.trim())) ||
        (cSubNorm && cleaned.includes(cSubNorm))
      );
    });

    if (matchedCandle) {
      return {
        text: `🕯️ [DETALLES DE: ${matchedCandle.name}]\n` +
          `• Precio: $${Number(matchedCandle.price).toFixed(2)} USD\n` +
          `• Disponibilidad: ${matchedCandle.inStock ? "✅ En Stock Disponible" : "❌ Temporalmente Agotada"}\n` +
          `• Subtítulo / Aroma: ${matchedCandle.subtitle}\n` +
          `• Pirámide Olfativa:\n` +
          `   - Salida: ${matchedCandle.olfactoryPyramid.salida}\n` +
          `   - Corazón: ${matchedCandle.olfactoryPyramid.corazon}\n` +
          `   - Fondo: ${matchedCandle.olfactoryPyramid.fondo}\n` +
          `• Vasija & Mecha: ${matchedCandle.vesselName} • Mecha de algodón natural (${matchedCandle.burnHours}h de quemado / ${matchedCandle.weightGrams}g).\n` +
          `• Valoración: ${matchedCandle.rating} / 5.0 ⭐ (${matchedCandle.reviewsCount} reseñas verificadas) ✨`,
        recommendedCandle: matchedCandle,
      };
    }

    // 8. Check if inquiring by Scent Notes
    const aromaticTerms = [
      "canela", "lavanda", "sandalo", "vainilla", "eucalipto", "menta",
      "naranja", "citrico", "citricos", "cedro", "bergamota", "jazmin",
      "ambar", "rosas", "cafe", "clavo", "cardamomo", "pino", "manzanilla",
      "pachuli", "tonka", "incienso", "mirra", "bambu", "te verde"
    ];

    const matchedTerms = aromaticTerms.filter((term) => cleaned.includes(term));

    if (matchedTerms.length > 0) {
      const scentMatches = candles.filter((c) => {
        const fullProfile = normalizeText(
          `${c.name} ${c.subtitle} ${c.olfactoryPyramid.salida} ${c.olfactoryPyramid.corazon} ${c.olfactoryPyramid.fondo} ${c.category} ${c.botanicals?.join(" ") || ""}`
        );
        return matchedTerms.some((term) => fullProfile.includes(term));
      });

      if (scentMatches.length > 0) {
        const matchesList = scentMatches
          .map(
            (c) =>
              `• **${c.name}** ($${Number(c.price).toFixed(2)}) — ${c.subtitle} [${c.inStock ? "✅ Disponible" : "❌ Agotada"}]`
          )
          .join("\n");

        return {
          text: `🌿 [VELAS CON NOTAS DE ${matchedTerms.join(", ").toUpperCase()}]\n` +
            `Hemos encontrado estas opciones en nuestro catálogo en tiempo real:\n\n` +
            `${matchesList}\n\n` +
            `¿Te gustaría ver los detalles o pedir alguna de ellas? 🕯️✨`,
          recommendedCandle: scentMatches[0],
          recommendedCandles: scentMatches.slice(1, 3),
        };
      }
    }

    // 9. General Price & Inventory Inquiry
    if (
      cleaned.includes("precio") ||
      cleaned.includes("precios") ||
      cleaned.includes("cuanto cuesta") ||
      cleaned.includes("catalogo") ||
      cleaned.includes("disponibilidad") ||
      cleaned.includes("stock") ||
      cleaned.includes("velas")
    ) {
      const summaryList = candidates
        .map(
          (c) =>
            `• **${c.name}**: $${Number(c.price).toFixed(2)} USD — ${c.inStock ? "✅ En Stock" : "❌ Agotada"} (${c.subtitle})`
        )
        .join("\n");

      return {
        text: `🕯️ [INVENTARIO & PRECIOS EN TIEMPO REAL]\n` +
          `Actualmente tenemos las siguientes piezas artesanales registradas:\n\n` +
          `${summaryList}\n\n` +
          `Todas están elaboradas a mano con ceras seleccionadas de soja vegetal y parafina refinada. 🌿✨`,
        recommendedCandle: topFeatured,
      };
    }

    // 10. Aromas List
    if (cleaned.includes("aroma") || cleaned.includes("aromas") || cleaned.includes("fragancias") || cleaned.includes("olores")) {
      const aromasList = aromas
        .map((a) => `• ${a.name} (${a.family}) — Notas: ${a.notes.join(", ")}`)
        .join("\n");

      return {
        text: `🌸 [FAMILIAS OLFATIVAS REGISTRADAS]\n` +
          `${aromasList}\n\n` +
          `Utilizamos aceites botánicos puros y esencias de alta concentración. 🕯️`,
        recommendedCandle: topFeatured,
      };
    }

    // 11. Materials & Wax Types
    if (
      cleaned.includes("cera") ||
      cleaned.includes("soja") ||
      cleaned.includes("soya") ||
      cleaned.includes("mecha") ||
      cleaned.includes("ingredientes") ||
      cleaned.includes("materiales") ||
      cleaned.includes("parafina")
    ) {
      return {
        text: `🌱 [MATERIA PRIMA CONSCIENTE & ARTESANAL]\n` +
          `• Cera de Soja 100% Vegetal: Biodegradable, combustión limpia sin toxinas ni humo negro.\n` +
          `• Cera de Parafina Refinada: Alta definición escultórica y potente difusión aromática.\n` +
          `• Mechas de Algodón Puro & Madera FSC: Crepitar suave y quemado uniforme.\n` +
          `• Vasos de Vidrio Fino: Envases reutilizables de alta pureza y estética atemporal. 🌿`,
        recommendedCandle: topFeatured,
      };
    }

    // 12. Human Advisor & Contact
    if (
      cleaned.includes("humano") ||
      cleaned.includes("asesor") ||
      cleaned.includes("persona") ||
      cleaned.includes("contacto") ||
      cleaned.includes("telefono") ||
      cleaned.includes("whatsapp") ||
      cleaned.includes("ayuda")
    ) {
      return {
        text: `🤝 [ATENCIÓN PERSONALIZADA DIRECTA]\n` +
          `Puedes hablar directamente con nuestro equipo de artesanos y asesores:\n` +
          `• WhatsApp: ${brandConfig.whatsappNumber}\n` +
          `• Teléfono: ${brandConfig.contactPhone}\n` +
          `• Email: ${brandConfig.contactEmail}\n` +
          `Haz clic en el botón de abajo para iniciar la conversación directa. 💬`,
        recommendHuman: true,
      };
    }

    // 13. Fallback with Featured Recommendation
    return {
      text: `No encontré esa consulta exacta en el catálogo, pero te recomiendo explorar nuestra Pieza de Autor destacada del momento: **${topFeatured.name}** ($${Number(topFeatured.price).toFixed(2)} USD • ${topFeatured.subtitle}).\n\n¿Deseas consultarme sobre aromas, regalos o contactar a un asesor humano? 🌸`,
      recommendedCandle: topFeatured,
      recommendHuman: true,
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const messageText = textToSend || inputValue;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate natural fast response
    setTimeout(() => {
      const response = processQuery(messageText);
      const botMessage: Message = {
        id: `msg-bot-${Date.now()}`,
        sender: "bot",
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        recommendHuman: response.recommendHuman,
        recommendedCandle: response.recommendedCandle,
        recommendedCandles: response.recommendedCandles,
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 320);
  };

  const generateWhatsAppDirectUrl = (customText?: string) => {
    const rawNumber = brandConfig.whatsappNumber.replace(/[^0-9]/g, "");
    const encodedText = encodeURIComponent(
      customText ||
        `¡Hola equipo de ${brandConfig.brandName}! Me gustaría recibir atención y asesoramiento personalizado sobre sus velas aromáticas.`
    );
    return `https://wa.me/${rawNumber}?text=${encodedText}`;
  };

  return (
    <>
      {/* Floating WhatsApp Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {!isOpen && unreadCount > 0 && (
          <div
            onClick={() => setIsOpen(true)}
            className="bg-white text-[#423D33] px-3.5 py-2 rounded-2xl shadow-lg border border-[#E5E0DA] text-xs font-semibold flex items-center gap-2 cursor-pointer animate-fade-in hover:scale-105 transition-transform"
          >
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
            <span>¿Buscas recomendación o regalo? ¡Pregúntame! ⭐</span>
          </div>
        )}

        <button
          id="open-whatsapp-chat-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer relative"
          aria-label="Abrir Asistente de WhatsApp"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageSquare className="w-7 h-7 fill-white" />
          )}

          {!isOpen && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D98B68] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          id="whatsapp-chat-modal"
          className="fixed bottom-24 right-4 sm:right-6 z-40 w-[92vw] sm:w-[420px] max-h-[620px] h-[560px] bg-[#FAF7F2] rounded-3xl border border-[#E5E0DA] shadow-2xl flex flex-col overflow-hidden animate-fade-in"
        >
          {/* Header styled as WhatsApp Ayllu Concierge */}
          <div className="bg-[#075E54] text-white p-4 flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/30 flex items-center justify-center">
                  {Boolean(brandConfig.logoUrl && brandConfig.logoUrl.trim()) ? (
                    <img
                      src={brandConfig.logoUrl}
                      alt={brandConfig.brandName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="font-serif font-bold text-sm text-white">
                      {brandConfig.brandName ? brandConfig.brandName.charAt(0) : "A"}
                    </span>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] rounded-full border-2 border-[#075E54]" />
              </div>

              <div>
                <h4 className="font-serif font-bold text-sm tracking-wide flex items-center gap-1.5">
                  <span>Asistente {brandConfig.brandName}</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#D9C5B2]" />
                </h4>
                <p className="text-[10px] text-white/80 flex items-center gap-1">
                  <span>En línea</span> • <span>Recomendador de Destacados</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href={generateWhatsAppDirectUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Hablar directamente en WhatsApp Web"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-header Data Policy Badge */}
          <div className="bg-[#EAE4DC] px-3 py-1.5 border-b border-[#E5E0DA] flex items-center justify-between text-[10px] text-[#423D33]/80">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-[#D98B68] fill-[#D98B68]" />
              <span>Priorizando Piezas de Autor Destacadas en tiempo real</span>
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#efeae2]/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                    msg.sender === "user"
                      ? "bg-[#DCF8C6] text-[#423D33] rounded-tr-xs"
                      : "bg-white text-[#423D33] border border-[#E5E0DA] rounded-tl-xs"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Rich Interactive Recommended Product Card */}
                  {msg.recommendedCandle && (
                    <div className="mt-3 p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E5E0DA] flex flex-col gap-2 shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        {Boolean(msg.recommendedCandle.image && msg.recommendedCandle.image.trim()) && (
                          <img
                            src={msg.recommendedCandle.image}
                            alt={msg.recommendedCandle.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-lg object-contain p-0.5 border border-[#E5E0DA] shrink-0 bg-white"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] uppercase tracking-wider font-bold bg-[#8C7A6B]/15 text-[#8C7A6B] px-1.5 py-0.5 rounded-full">
                              ⭐ Destacado
                            </span>
                            {msg.recommendedCandle.limitedBatchText && (
                              <span className="text-[8px] bg-[#D98B68]/15 text-[#D98B68] px-1.5 py-0.5 rounded-full font-semibold">
                                {msg.recommendedCandle.limitedBatchText}
                              </span>
                            )}
                          </div>
                          <h5 className="font-serif font-bold text-xs text-[#423D33] truncate mt-0.5">
                            {msg.recommendedCandle.name}
                          </h5>
                          <p className="text-[10px] text-[#423D33]/70 truncate">
                            {msg.recommendedCandle.subtitle}
                          </p>
                          <p className="text-[11px] font-bold text-[#8C7A6B] mt-0.5">
                            ${Number(msg.recommendedCandle.price).toFixed(2)} USD
                          </p>
                        </div>
                      </div>

                      {/* Interactive Action Buttons */}
                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-[#E5E0DA]/80">
                        {onSelectCandle && (
                          <button
                            onClick={() => {
                              onSelectCandle(msg.recommendedCandle!);
                              setIsOpen(false);
                            }}
                            className="flex-1 bg-white hover:bg-[#F2EDE7] text-[#423D33] border border-[#E5E0DA] py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3 h-3 text-[#8C7A6B]" />
                            <span>Ver Ficha</span>
                          </button>
                        )}
                        {onAddToCart && (
                          <button
                            onClick={() => onAddToCart(msg.recommendedCandle!)}
                            className="flex-1 bg-[#4A4541] hover:bg-[#35312E] text-white py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          >
                            <ShoppingBag className="w-3 h-3 text-[#D9C5B2]" />
                            <span>Añadir</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Secondary Recommended Cards Carousel/List if multiple */}
                  {msg.recommendedCandles && msg.recommendedCandles.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <p className="text-[9px] uppercase tracking-wider font-bold text-[#8C7A6B]">
                        Otras Piezas Destacadas:
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {msg.recommendedCandles.map((rec) => (
                          <div
                            key={rec.id}
                            className="p-1.5 bg-[#FAF7F2] rounded-lg border border-[#E5E0DA] flex flex-col justify-between"
                          >
                            <div className="flex items-center gap-1.5">
                              {Boolean(rec.image && rec.image.trim()) && (
                                <img
                                  src={rec.image}
                                  alt={rec.name}
                                  referrerPolicy="no-referrer"
                                  className="w-8 h-8 rounded-md object-contain p-0.5 bg-white border border-[#E5E0DA] shrink-0"
                                />
                              )}
                              <div className="min-w-0">
                                <p className="text-[9px] font-bold text-[#423D33] truncate">
                                  {rec.name}
                                </p>
                                <p className="text-[9px] text-[#8C7A6B] font-semibold">
                                  ${Number(rec.price).toFixed(2)}
                                </p>
                              </div>
                            </div>
                            {onSelectCandle && (
                              <button
                                onClick={() => {
                                  onSelectCandle(rec);
                                  setIsOpen(false);
                                }}
                                className="mt-1 w-full bg-white hover:bg-[#F2EDE7] text-[#423D33] border border-[#E5E0DA] py-0.5 rounded text-[8px] font-bold uppercase tracking-wider cursor-pointer"
                              >
                                Ver Pieza
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggest human advisor button if flagged */}
                  {msg.recommendHuman && (
                    <div className="mt-2.5 pt-2 border-t border-[#E5E0DA] flex flex-col gap-1.5">
                      <a
                        href={generateWhatsAppDirectUrl(
                          "Hola, estuve conversando con el asistente virtual de la tienda y me gustaría consultar directamente con un asesor humano sobre sus piezas destacadas."
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366] text-white text-[11px] font-bold hover:bg-[#20bd5a] transition-colors"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Hablar con un Asesor Humano</span>
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-[#8C7A6B]">
                    <span>{msg.timestamp}</span>
                    {msg.sender === "user" && <CheckCheck className="w-3 h-3 text-[#34B7F1]" />}
                  </div>
                </div>

                {/* Preset quick question pills */}
                {msg.options && msg.options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[92%]">
                    {msg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(opt)}
                        className="text-[11px] bg-white hover:bg-[#FAF7F2] text-[#423D33] px-2.5 py-1 rounded-full border border-[#E5E0DA] shadow-2xs transition-all text-left cursor-pointer hover:border-[#8C7A6B]"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Field */}
          <div className="p-3 bg-white border-t border-[#E5E0DA] flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
              placeholder="Pide una recomendación, aroma o regalo..."
              className="flex-1 text-xs px-3.5 py-2.5 rounded-full bg-[#F4EFEA] border border-[#E5E0DA] text-[#423D33] focus:outline-none focus:ring-1 focus:ring-[#8C7A6B]"
            />
            <button
              id="whatsapp-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-full bg-[#075E54] text-white disabled:opacity-40 hover:bg-[#064d45] transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
