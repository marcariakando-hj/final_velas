import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // Handle CORS & Preflight if needed
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      useFallback: true,
      error: "GEMINI_API_KEY no está configurada en las variables de entorno de Vercel",
    });
  }

  try {
    const { message, catalog, brandName } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Mensaje requerido" });
    }

    const ai = new GoogleGenAI({ apiKey });

    const catalogText = Array.isArray(catalog)
      ? catalog
          .map(
            (c: any) =>
              `- ${c.name}: $${c.price} USD | Aroma: ${c.subtitle || c.category} | ${
                c.description?.slice(0, 120) || ""
              }`
          )
          .join("\n")
      : "";

    const systemPrompt = `Eres el Sommelier y Asistente Virtual Inteligente de "${
      brandName || "Ayllu"
    }", un taller exclusivo de velas botánicas de cera 100% vegetal, mechas de algodón y madera y esencias puras.
Tu objetivo es asesorar a los visitantes con amabilidad, calidez, elegancia y concisión en español.

Catálogo oficial disponible en la tienda:
${catalogText}

Directrices:
1. Si el cliente busca calma, regalo, energía, dormir bien o una fragancia específica, recomiéndale la vela del catálogo que mejor coincida y explica sus notas aromáticas.
2. Menciona siempre el nombre exacto de la vela y su precio.
3. Explica que pueden personalizar el envase, color de cera, dedicatoria grabada y botánicos en el botón "Velas a Medida / Personalizador".
4. Respuestas claras y compactas (máximo 2 párrafos breves), ideales para chat móvil.
5. Usa emojis sutiles y elegantes (🕯️, 🌿, ✨, 🌸).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return res.status(200).json({
      text: response.text || "¡Hola! Estoy a tu disposición para ayudarte con cualquier consulta sobre nuestras velas.",
      isAi: true,
    });
  } catch (error: any) {
    console.error("Error en Vercel Serverless Gemini Assistant:", error);
    return res.status(200).json({
      useFallback: true,
      error: error?.message || "Error al consultar Gemini",
    });
  }
}
