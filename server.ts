import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const PORT = 3000;

// Set high body limits to allow high-res image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Configure directory for persistent uploads and database files
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const DATA_DIR = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const COLLABORATORS_FILE = path.join(DATA_DIR, "collaborators.json");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");
const BRAND_FILE = path.join(DATA_DIR, "brand.json");
const STORE_SETTINGS_FILE = path.join(DATA_DIR, "store_settings.json");

// Server-side Supabase Client
const serverSupabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const serverSupabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "";

let serverSupabase: SupabaseClient | null = null;
function getServerSupabase(): SupabaseClient | null {
  if (!serverSupabaseUrl || !serverSupabaseKey || serverSupabaseUrl.includes("placeholder")) {
    return null;
  }
  if (!serverSupabase) {
    serverSupabase = createClient(serverSupabaseUrl, serverSupabaseKey, {
      auth: { persistSession: false },
    });
  }
  return serverSupabase;
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Serve uploaded images statically
app.use("/uploads", express.static(UPLOADS_DIR));

// Helper: Save Base64 data URL to Supabase Storage 'candle-assets' (primary) and permanent disk file in /uploads (fallback)
async function saveImageToStorageOrDisk(
  dataString: string,
  prefix = "asset",
  folder = "products"
): Promise<string> {
  if (!dataString || typeof dataString !== "string") return dataString;
  if (!dataString.startsWith("data:image/")) {
    return dataString; // Already a URL or relative path
  }

  try {
    const matches = dataString.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      return dataString;
    }

    let ext = matches[1].toLowerCase();
    if (ext === "jpeg") ext = "jpg";
    if (ext === "svg+xml") ext = "svg";
    const mimeType = ext === "svg" ? "image/svg+xml" : `image/${ext}`;
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    const cleanPrefix = prefix.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const cleanFolder = folder.replace(/^\/+|\/+$/g, "") || "uploads";
    const filename = `${cleanPrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // Always keep a local copy on disk as safety net
    try {
      const filepath = path.join(UPLOADS_DIR, filename);
      fs.writeFileSync(filepath, buffer);
    } catch (fsErr) {
      console.warn("Local upload write error:", fsErr);
    }

    // Primary: Upload directly to Supabase Storage in 'candle-assets' bucket
    const sb = getServerSupabase();
    if (sb) {
      try {
        const storagePath = `${cleanFolder}/${filename}`;
        const { data: uploadData, error: uploadErr } = await sb.storage
          .from("candle-assets")
          .upload(storagePath, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!uploadErr && uploadData?.path) {
          const { data: pubData } = sb.storage.from("candle-assets").getPublicUrl(uploadData.path);
          if (pubData?.publicUrl) {
            console.log(`✓ [Supabase Storage] Imagen guardada en la base [candle-assets/${storagePath}]: ${pubData.publicUrl}`);
            return pubData.publicUrl;
          }
        } else if (uploadErr) {
          console.warn("[Supabase Storage] Aviso al subir imagen:", uploadErr.message);
        }
      } catch (sbEx: any) {
        console.warn("[Supabase Storage] Error de conexión al subir imagen:", sbEx?.message || sbEx);
      }
    }

    return `/uploads/${filename}`;
  } catch (err) {
    console.error("Error saving base64 image:", err);
    return dataString;
  }
}

// Helper: Synchronous fallback for local saving
function saveBase64Image(dataString: string, prefix = "candle"): string {
  if (!dataString || typeof dataString !== "string") return dataString;
  if (!dataString.startsWith("data:image/")) {
    return dataString; // Already a URL or relative path
  }

  try {
    const matches = dataString.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      return dataString;
    }

    let ext = matches[1].toLowerCase();
    if (ext === "jpeg") ext = "jpg";
    if (ext === "svg+xml") ext = "svg";
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    const cleanPrefix = prefix.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const filename = `${cleanPrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filepath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filepath, buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error("Error saving base64 image:", err);
    return dataString;
  }
}

// Endpoint for direct image upload with Supabase Storage support
app.post("/api/upload", async (req, res) => {
  try {
    const { image, name, folder } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image payload provided" });
    }
    const savedUrl = await saveImageToStorageOrDisk(image, name || "candle_upload", folder || "products");
    return res.status(200).json({ success: true, url: savedUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Failed to save image" });
  }
});

// Helper: Process and save all product images (main, 2D model, gallery) to permanent disk
function processProductPayload(candle: any): any {
  if (!candle || typeof candle !== "object") return candle;

  const result = { ...candle };
  const name = result.name || "candle";

  // 1. Process Main Image
  if (result.image && typeof result.image === "string" && result.image.startsWith("data:image")) {
    result.image = saveBase64Image(result.image, `${name}_main`);
  }
  if (result.mainImage && typeof result.mainImage === "string" && result.mainImage.startsWith("data:image")) {
    result.mainImage = saveBase64Image(result.mainImage, `${name}_main`);
  } else if (!result.mainImage && result.image) {
    result.mainImage = result.image;
  }
  if (!result.image && result.mainImage) {
    result.image = result.mainImage;
  }

  // 2. Process Custom 2D Model Image Cutout
  if (result.custom2DImageUrl && typeof result.custom2DImageUrl === "string" && result.custom2DImageUrl.startsWith("data:image")) {
    result.custom2DImageUrl = saveBase64Image(result.custom2DImageUrl, `${name}_2d_model`);
  }
  if (result.base2DImage && typeof result.base2DImage === "string" && result.base2DImage.startsWith("data:image")) {
    result.base2DImage = saveBase64Image(result.base2DImage, `${name}_2d_model`);
  }

  // Synchronize 2D image fields
  const resolved2D = result.custom2DImageUrl || result.base2DImage || result.image;
  result.custom2DImageUrl = resolved2D;
  result.base2DImage = resolved2D;

  // 3. Process Customizer 2D Config nested fields if present
  if (result.customizer2DConfig && typeof result.customizer2DConfig === "object") {
    let conf2d = result.customizer2DConfig.base2DImage || result.customizer2DConfig.custom2DImageUrl;
    if (conf2d && typeof conf2d === "string" && conf2d.startsWith("data:image")) {
      conf2d = saveBase64Image(conf2d, `${name}_2d_config`);
    }
    result.customizer2DConfig = {
      ...result.customizer2DConfig,
      base2DImage: conf2d || resolved2D,
      custom2DImageUrl: conf2d || resolved2D,
    };
  }

  // 4. Process secondary gallery images
  if (Array.isArray(result.images)) {
    result.images = result.images.map((img: string, idx: number) =>
      img && typeof img === "string" && img.startsWith("data:image")
        ? saveBase64Image(img, `${name}_gallery_${idx}`)
        : img
    );
  } else if (result.image) {
    result.images = [result.image];
  }

  // 5. Process layers2D images if raw base64 exists
  if (Array.isArray(result.layers2D)) {
    result.layers2D = result.layers2D.map((layer: any, idx: number) => {
      if (layer && typeof layer.imageUrl === "string" && layer.imageUrl.startsWith("data:image")) {
        const cleanLayerName = (layer.name || `layer_${idx}`).toLowerCase().replace(/[^a-z0-9]/g, "_");
        return {
          ...layer,
          imageUrl: saveBase64Image(layer.imageUrl, `${name}_layer_${cleanLayerName}`),
        };
      }
      return layer;
    });
  }

  return result;
}

// Endpoint to retrieve all products (Both standard and admin paths)
const getProductsHandler = (req: express.Request, res: express.Response) => {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const raw = fs.readFileSync(PRODUCTS_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) {
        return res.json(data);
      }
    }
    return res.json([]);
  } catch (err) {
    console.error("Error reading products:", err);
    return res.status(500).json({ error: "Failed to read products" });
  }
};
app.get("/api/products", getProductsHandler);
app.get("/api/admin/products", getProductsHandler);

// Endpoint to add a new product
const createProductHandler = (req: express.Request, res: express.Response) => {
  try {
    const rawCandle = req.body;
    if (!rawCandle || !rawCandle.name) {
      return res.status(400).json({ error: "El nombre de la vela es obligatorio" });
    }

    const newCandle = processProductPayload(rawCandle);

    if (!newCandle.id) {
      newCandle.id = `vela-${Date.now()}`;
    }

    let products: any[] = [];
    if (fs.existsSync(PRODUCTS_FILE)) {
      try {
        products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
      } catch {
        products = [];
      }
    }

    const existingIndex = products.findIndex((p: any) => p.id === newCandle.id);
    if (existingIndex >= 0) {
      products[existingIndex] = { ...products[existingIndex], ...newCandle };
    } else {
      products.unshift(newCandle);
    }

    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
    console.log(`[API] Saved product ${newCandle.id} with 2D model: ${newCandle.custom2DImageUrl}`);
    return res.status(201).json({ success: true, candle: newCandle, product: newCandle });
  } catch (err) {
    console.error("Error creating product:", err);
    return res.status(500).json({ error: "Error al registrar el producto" });
  }
};
app.post("/api/products", createProductHandler);
app.post("/api/admin/products", createProductHandler);

// Endpoint to update an existing product
const updateProductHandler = (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const rawData = req.body;

    const updatedData = processProductPayload({ ...rawData, id });

    let products: any[] = [];
    if (fs.existsSync(PRODUCTS_FILE)) {
      try {
        products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
      } catch {
        products = [];
      }
    }

    const index = products.findIndex((p: any) => p.id === id);
    if (index >= 0) {
      products[index] = { ...products[index], ...updatedData, id };
    } else {
      products.push({ ...updatedData, id });
    }

    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
    const finalCandle = index >= 0 ? products[index] : products[products.length - 1];
    console.log(`[API] Updated product ${id} with 2D model: ${finalCandle.custom2DImageUrl}`);
    return res.status(200).json({ success: true, candle: finalCandle, product: finalCandle });
  } catch (err) {
    console.error("Error updating product:", err);
    return res.status(500).json({ error: "Error al actualizar el producto" });
  }
};
app.put("/api/products/:id", updateProductHandler);
app.put("/api/admin/products/:id", updateProductHandler);

// Endpoint to bulk sync all products
app.post("/api/products/sync-all", (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "Lista de productos inválida" });
    }

    const processedProducts = products.map((candle: any) => processProductPayload(candle));

    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(processedProducts, null, 2), "utf-8");
    return res.status(200).json({ success: true, products: processedProducts });
  } catch (err) {
    console.error("Error syncing products:", err);
    return res.status(500).json({ error: "Error al sincronizar productos" });
  }
});

// Endpoint to delete a product
const deleteProductHandler = (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    let products: any[] = [];
    if (fs.existsSync(PRODUCTS_FILE)) {
      try {
        products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
      } catch {
        products = [];
      }
    }

    products = products.filter((p: any) => p.id !== id);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error deleting product:", err);
    return res.status(500).json({ error: "Error al eliminar el producto" });
  }
};
app.delete("/api/products/:id", deleteProductHandler);
app.delete("/api/admin/products/:id", deleteProductHandler);

// Helper to process collaborator image
async function processCollaboratorPayloadAsync(collab: any): Promise<any> {
  if (!collab || typeof collab !== "object") return collab;
  const result = { ...collab };
  const name = result.name || "collab";
  if (result.image && typeof result.image === "string" && result.image.startsWith("data:image")) {
    result.image = await saveImageToStorageOrDisk(result.image, `${name}_profile`, "collaborators");
  }
  return result;
}

function processCollaboratorPayload(collab: any): any {
  if (!collab || typeof collab !== "object") return collab;
  const result = { ...collab };
  const name = result.name || "collab";
  if (result.image && typeof result.image === "string" && result.image.startsWith("data:image")) {
    result.image = saveBase64Image(result.image, `${name}_profile`);
  }
  return result;
}

// Collaborators API endpoints
app.get("/api/collaborators", async (req, res) => {
  try {
    const sb = getServerSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from("store_settings").select("value").eq("key", "collaborators").maybeSingle();
        if (!error && data?.value && Array.isArray(data.value) && data.value.length > 0) {
          return res.json(data.value);
        }
      } catch (sbErr) {
        console.warn("Aviso al consultar colaboradores en Supabase:", sbErr);
      }
    }
    if (fs.existsSync(COLLABORATORS_FILE)) {
      const raw = fs.readFileSync(COLLABORATORS_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) {
        return res.json(data);
      }
    }
    return res.json([]);
  } catch (err) {
    console.error("Error reading collaborators:", err);
    return res.status(500).json({ error: "Failed to read collaborators" });
  }
});

app.post("/api/collaborators", async (req, res) => {
  try {
    const raw = req.body;
    if (!raw || !raw.name) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    const newCollab = await processCollaboratorPayloadAsync(raw);
    if (!newCollab.id) {
      newCollab.id = `collab-${Date.now()}`;
    }
    let collabs: any[] = [];
    if (fs.existsSync(COLLABORATORS_FILE)) {
      try {
        collabs = JSON.parse(fs.readFileSync(COLLABORATORS_FILE, "utf-8"));
      } catch {
        collabs = [];
      }
    }
    const existingIndex = collabs.findIndex((c: any) => c.id === newCollab.id);
    if (existingIndex >= 0) {
      collabs[existingIndex] = { ...collabs[existingIndex], ...newCollab };
    } else {
      collabs.push(newCollab);
    }
    fs.writeFileSync(COLLABORATORS_FILE, JSON.stringify(collabs, null, 2), "utf-8");

    // Sincronizar directamente con Supabase store_settings
    const sb = getServerSupabase();
    if (sb) {
      try {
        await sb.from("store_settings").upsert(
          { key: "collaborators", value: collabs, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
        console.log(`✓ Colaborador "${newCollab.name}" guardado en base Supabase (store_settings).`);
      } catch (sbErr) {
        console.warn("Aviso al sincronizar colaborador en Supabase:", sbErr);
      }
    }

    return res.status(201).json({ success: true, collaborator: newCollab });
  } catch (err) {
    console.error("Error creating collaborator:", err);
    return res.status(500).json({ error: "Error al registrar el colaborador" });
  }
});

app.put("/api/collaborators/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const rawData = req.body;
    const updated = await processCollaboratorPayloadAsync({ ...rawData, id });
    let collabs: any[] = [];
    if (fs.existsSync(COLLABORATORS_FILE)) {
      try {
        collabs = JSON.parse(fs.readFileSync(COLLABORATORS_FILE, "utf-8"));
      } catch {
        collabs = [];
      }
    }
    const index = collabs.findIndex((c: any) => c.id === id);
    if (index >= 0) {
      collabs[index] = { ...collabs[index], ...updated, id };
    } else {
      collabs.push({ ...updated, id });
    }
    fs.writeFileSync(COLLABORATORS_FILE, JSON.stringify(collabs, null, 2), "utf-8");

    // Sincronizar directamente con Supabase store_settings
    const sb = getServerSupabase();
    if (sb) {
      try {
        await sb.from("store_settings").upsert(
          { key: "collaborators", value: collabs, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
        console.log(`✓ Colaborador "${id}" actualizado en base Supabase (store_settings).`);
      } catch (sbErr) {
        console.warn("Aviso al actualizar colaborador en Supabase:", sbErr);
      }
    }

    const finalCollab = index >= 0 ? collabs[index] : collabs[collabs.length - 1];
    return res.status(200).json({ success: true, collaborator: finalCollab });
  } catch (err) {
    console.error("Error updating collaborator:", err);
    return res.status(500).json({ error: "Error al actualizar el colaborador" });
  }
});

app.delete("/api/collaborators/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let collabs: any[] = [];
    if (fs.existsSync(COLLABORATORS_FILE)) {
      try {
        collabs = JSON.parse(fs.readFileSync(COLLABORATORS_FILE, "utf-8"));
      } catch {
        collabs = [];
      }
    }
    collabs = collabs.filter((c: any) => c.id !== id);
    fs.writeFileSync(COLLABORATORS_FILE, JSON.stringify(collabs, null, 2), "utf-8");

    const sb = getServerSupabase();
    if (sb) {
      try {
        await sb.from("store_settings").upsert(
          { key: "collaborators", value: collabs, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
      } catch (sbErr) {
        console.warn("Aviso al eliminar colaborador en Supabase:", sbErr);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error deleting collaborator:", err);
    return res.status(500).json({ error: "Error al eliminar el colaborador" });
  }
});

app.post("/api/collaborators/sync-all", async (req, res) => {
  try {
    const { collaborators } = req.body;
    if (!Array.isArray(collaborators)) {
      return res.status(400).json({ error: "Lista de colaboradores inválida" });
    }
    const processed: any[] = [];
    for (const c of collaborators) {
      processed.push(await processCollaboratorPayloadAsync(c));
    }
    fs.writeFileSync(COLLABORATORS_FILE, JSON.stringify(processed, null, 2), "utf-8");

    const sb = getServerSupabase();
    if (sb) {
      try {
        await sb.from("store_settings").upsert(
          { key: "collaborators", value: processed, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
      } catch (sbErr) {
        console.warn("Aviso al sincronizar colaboradores en Supabase:", sbErr);
      }
    }

    return res.status(200).json({ success: true, collaborators: processed });
  } catch (err) {
    console.error("Error syncing collaborators:", err);
    return res.status(500).json({ error: "Error al sincronizar colaboradores" });
  }
});

// Default initial reviews if data/reviews.json does not exist
const DEFAULT_INITIAL_REVIEWS = [
  {
    id: "rev-1",
    author: "Elena Montero",
    rating: 5,
    date: "Hace 2 días",
    comment: "La vela del Zorro del Bosque es una obra de arte. El detalle del zorro esculpido sobre la base de cera y el aroma a vainilla con cedro llena toda la sala.",
    location: "Madrid",
    candleName: "Nº 01 • Zorro del Bosque",
    verified: true,
    createdAt: "2026-03-09T10:00:00.000Z",
  },
  {
    id: "rev-2",
    author: "Carlos De la Serna",
    rating: 5,
    date: "Hace 5 días",
    comment: "Pedí el Abrazo de Osito para un regalo y la presentación con la caja kraft y el grabado personalizado superó todas mis expectativas. Huele riquísimo a canela suave.",
    location: "Barcelona",
    candleName: "Nº 02 • Abrazo de Osito",
    verified: true,
    createdAt: "2026-03-06T14:30:00.000Z",
  },
  {
    id: "rev-3",
    author: "Valeria Ríos",
    rating: 5,
    date: "Hace 1 semana",
    comment: "El Santuario de Lavanda tiene una presencia angelical preciosa. La cera quema uniforme y la mezcla de lavanda con vainilla bourbon es un deleite para antes de dormir.",
    location: "Sevilla",
    candleName: "Nº 03 • Santuario de Lavanda",
    verified: true,
    createdAt: "2026-03-04T18:20:00.000Z",
  },
];

// Helper: read reviews from file or return defaults
function readReviewsFromFile(): any[] {
  if (fs.existsSync(REVIEWS_FILE)) {
    try {
      const raw = fs.readFileSync(REVIEWS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.warn("Could not read reviews file:", e);
    }
  }
  // Initialize with defaults if empty or missing
  fs.writeFileSync(REVIEWS_FILE, JSON.stringify(DEFAULT_INITIAL_REVIEWS, null, 2), "utf-8");
  return DEFAULT_INITIAL_REVIEWS;
}

// Reviews API endpoints
app.get("/api/reviews", (req, res) => {
  try {
    const reviews = readReviewsFromFile();
    return res.json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    return res.status(500).json({ error: "Failed to read reviews" });
  }
});

app.post("/api/reviews", (req, res) => {
  try {
    const raw = req.body;
    if (!raw || !raw.comment || !raw.author) {
      return res.status(400).json({ error: "Nombre del autor y comentario son obligatorios" });
    }

    const reviews = readReviewsFromFile();
    const newReview = {
      id: raw.id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      author: String(raw.author).trim(),
      userId: raw.userId || undefined,
      userEmail: raw.userEmail || undefined,
      rating: Number(raw.rating) || 5,
      date: raw.date || "Hoy",
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || undefined,
      comment: String(raw.comment).trim(),
      location: raw.location ? String(raw.location).trim() : "España",
      candleName: raw.candleName ? String(raw.candleName).trim() : "Ayllu Velas",
      candleId: raw.candleId || undefined,
      verified: raw.verified ?? true,
    };

    reviews.unshift(newReview);
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8");
    return res.status(201).json({ success: true, review: newReview });
  } catch (err) {
    console.error("Error creating review:", err);
    return res.status(500).json({ error: "Error al publicar la reseña" });
  }
});

app.put("/api/reviews/:id", (req, res) => {
  try {
    const { id } = req.params;
    const raw = req.body;
    const reviews = readReviewsFromFile();
    const index = reviews.findIndex((r: any) => r.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Reseña no encontrada" });
    }

    reviews[index] = {
      ...reviews[index],
      ...raw,
      id,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8");
    return res.status(200).json({ success: true, review: reviews[index] });
  } catch (err) {
    console.error("Error updating review:", err);
    return res.status(500).json({ error: "Error al actualizar la reseña" });
  }
});

app.delete("/api/reviews/:id", (req, res) => {
  try {
    const { id } = req.params;
    let reviews = readReviewsFromFile();
    const originalCount = reviews.length;
    reviews = reviews.filter((r: any) => r.id !== id);

    if (reviews.length === originalCount) {
      return res.status(404).json({ error: "Reseña no encontrada" });
    }

    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8");
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error deleting review:", err);
    return res.status(500).json({ error: "Error al eliminar la reseña" });
  }
});

app.post("/api/reviews/sync-all", (req, res) => {
  try {
    const { reviews } = req.body;
    if (!Array.isArray(reviews)) {
      return res.status(400).json({ error: "Lista de reseñas inválida" });
    }
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf-8");
    return res.status(200).json({ success: true, reviews });
  } catch (err) {
    console.error("Error syncing reviews:", err);
    return res.status(500).json({ error: "Error al sincronizar reseñas" });
  }
});

// Brand and Footer Configuration Endpoints
app.get("/api/brand-config", async (req, res) => {
  try {
    const sb = getServerSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from("store_settings").select("value").eq("key", "brand_config").maybeSingle();
        if (!error && data?.value && typeof data.value === "object") {
          return res.status(200).json(data.value);
        }
      } catch (sbErr) {
        console.warn("Aviso al consultar brand_config en Supabase:", sbErr);
      }
    }
    if (fs.existsSync(BRAND_FILE)) {
      const data = fs.readFileSync(BRAND_FILE, "utf-8");
      return res.status(200).json(JSON.parse(data));
    }
    return res.status(200).json(null);
  } catch (err) {
    console.error("Error reading brand config file:", err);
    return res.status(500).json({ error: "Error al leer configuración de marca" });
  }
});

app.post("/api/brand-config", async (req, res) => {
  try {
    const config = req.body;
    if (!config || typeof config !== "object") {
      return res.status(400).json({ error: "Configuración inválida" });
    }

    // Process logo if raw base64 exists -> save to Supabase Storage candle-assets/brand
    if (typeof config.logoUrl === "string" && config.logoUrl.startsWith("data:image")) {
      config.logoUrl = await saveImageToStorageOrDisk(config.logoUrl, "brand_logo", "brand");
    }

    fs.writeFileSync(BRAND_FILE, JSON.stringify(config, null, 2), "utf-8");

    // Sync to Supabase store_settings
    const sb = getServerSupabase();
    if (sb) {
      try {
        await sb.from("store_settings").upsert(
          { key: "brand_config", value: config, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
        console.log("✓ Logotipo y configuración de marca guardados en base Supabase (store_settings).");
      } catch (sbErr) {
        console.warn("Aviso al guardar brand_config en Supabase:", sbErr);
      }
    }

    return res.status(200).json({ success: true, brandConfig: config });
  } catch (err) {
    console.error("Error saving brand config file:", err);
    return res.status(500).json({ error: "Error al guardar configuración de marca" });
  }
});

// Store Settings API (Proxies to Supabase store_settings table and local file)
app.get("/api/store-settings", async (req, res) => {
  try {
    const sb = getServerSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from("store_settings").select("*");
        if (!error && data && Array.isArray(data) && data.length > 0) {
          return res.json(data);
        }
      } catch (sbErr) {
        console.warn("Aviso al consultar Supabase store_settings:", sbErr);
      }
    }
    if (fs.existsSync(STORE_SETTINGS_FILE)) {
      const fileData = JSON.parse(fs.readFileSync(STORE_SETTINGS_FILE, "utf-8"));
      return res.json(fileData);
    }
    return res.json([]);
  } catch (err) {
    console.warn("Error leyendo store_settings en servidor:", err);
    return res.status(200).json([]);
  }
});

app.get("/api/store-settings/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const sb = getServerSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from("store_settings").select("*").eq("key", key).maybeSingle();
        if (!error && data) {
          return res.json(data);
        }
      } catch (sbErr) {
        console.warn(`Aviso al consultar clave '${key}' en Supabase:`, sbErr);
      }
    }
    if (fs.existsSync(STORE_SETTINGS_FILE)) {
      const fileData = JSON.parse(fs.readFileSync(STORE_SETTINGS_FILE, "utf-8"));
      const found = Array.isArray(fileData) ? fileData.find((item: any) => item.key === key) : null;
      if (found) return res.json(found);
    }
    return res.status(404).json({ error: "Setting not found" });
  } catch (err) {
    console.warn("Error leyendo clave de store_settings en servidor:", err);
    return res.status(200).json({ key: req.params.key, value: null });
  }
});

app.post("/api/store-settings/:key", async (req, res) => {
  try {
    const { key } = req.params;
    let { value } = req.body;
    let savedToSupabase = false;

    // Process any embedded base64 images into Supabase Storage
    if (key === "brand_config" && value && typeof value === "object") {
      if (typeof value.logoUrl === "string" && value.logoUrl.startsWith("data:image")) {
        value.logoUrl = await saveImageToStorageOrDisk(value.logoUrl, "brand_logo", "brand");
      }
    } else if (key === "collaborators" && Array.isArray(value)) {
      const processedCollabs: any[] = [];
      for (const item of value) {
        processedCollabs.push(await processCollaboratorPayloadAsync(item));
      }
      value = processedCollabs;
    }

    // 1. Sync to Supabase with service role or anon key
    const sb = getServerSupabase();
    if (sb) {
      try {
        const { error } = await sb
          .from("store_settings")
          .upsert(
            { key, value, updated_at: new Date().toISOString() },
            { onConflict: "key" }
          );
        if (!error) {
          savedToSupabase = true;
          console.log(`✓ store_settings clave '${key}' sincronizada en Supabase.`);
        } else {
          console.warn(`Aviso al guardar '${key}' en Supabase:`, error.message);
        }
      } catch (sbErr: any) {
        console.warn(`Excepción de red al guardar '${key}' en Supabase:`, sbErr?.message || sbErr);
      }
    }

    // 2. Persist to local JSON files according to key
    try {
      if (key === "reviews" && Array.isArray(value)) {
        fs.writeFileSync(REVIEWS_FILE, JSON.stringify(value, null, 2), "utf-8");
      } else if (key === "collaborators" && Array.isArray(value)) {
        fs.writeFileSync(COLLABORATORS_FILE, JSON.stringify(value, null, 2), "utf-8");
      } else if (key === "brand_config" && typeof value === "object") {
        fs.writeFileSync(BRAND_FILE, JSON.stringify(value, null, 2), "utf-8");
      }

      let currentSettings: any[] = [];
      if (fs.existsSync(STORE_SETTINGS_FILE)) {
        try {
          currentSettings = JSON.parse(fs.readFileSync(STORE_SETTINGS_FILE, "utf-8"));
          if (!Array.isArray(currentSettings)) currentSettings = [];
        } catch {
          currentSettings = [];
        }
      }
      const existingIdx = currentSettings.findIndex((item) => item.key === key);
      const record = { key, value, updated_at: new Date().toISOString() };
      if (existingIdx >= 0) {
        currentSettings[existingIdx] = record;
      } else {
        currentSettings.push(record);
      }
      fs.writeFileSync(STORE_SETTINGS_FILE, JSON.stringify(currentSettings, null, 2), "utf-8");
    } catch (fsErr) {
      console.warn("Aviso al guardar store_settings en archivo local:", fsErr);
    }

    return res.status(200).json({ success: true, key, savedToSupabase });
  } catch (err) {
    console.warn("Aviso en endpoint /api/store-settings/:key:", err);
    return res.status(200).json({ success: true, key: req.params.key, fallback: true });
  }
});

// Initialize Gemini API client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API endpoint for AI Fragrance Concierge & Bespoke Candle Formulation
app.post("/api/fragrance-consultation", async (req, res) => {
  try {
    const { mood, notes, space, intention, currentSeason } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback expert handcrafted recommendations if API key isn't provided
      return res.json({
        candleName: "Serenidad Botánica & Cítricos Nobles",
        olfactoryPyramid: {
          salida: "Naranja Sanguina deshidratada, Bergamota de Calabria y Cardamomo",
          corazon: "Lavanda Silvestre de Provenza, Flor de Azahar y Rama de Canela",
          fondo: "Madera de Cedro ahumado, Haba Tonka y Vainilla Bourbon natural",
        },
        description: "Una sinfonía olfativa diseñada para calmar la mente y transformar tu hogar en un santuario botánico cálido y sereno.",
        vesselRecommendation: "Recipiente cerámico mate en tono terracota suave con mecha doble de madera de cerezo sostenible.",
        burningRitual: "Enciende la mecha de madera durante un mínimo de 2 horas en el primer encendido para permitir un derretimiento uniforme de la cera de soja.",
        moodAlignment: "Paz mental, introspección serena y armonía cálida.",
        soundAmbience: "Crepitar suave de chimenea campestre con notas de lluvia lejana."
      });
    }

    const prompt = `Eres la Maestra Perfumista Botánica y Artesana en jefe de "AYLLU BOTÁNICA", un taller exclusivo de velas artesanales de lujo ecológicas de cera de soja 100% natural, mechas de algodón puro y esencias botánicas vivas.
    
    El usuario busca una creación olfativa personalizada con los siguientes detalles:
    - Estado de ánimo deseado: ${mood || "Paz y relajación profunda"}
    - Ingredientes o notas aromáticas preferidas: ${notes || "Lavanda, Naranja seca, Canela y Maderas"}
    - Espacio o estancia: ${space || "Sala de estar / Rincón de lectura"}
    - Intención del ritual: ${intention || "Desconectar al final del día y meditar"}
    - Estación del año: ${currentSeason || "Otoño / Invierno"}

    Genera una recomendación de vela artesanal exclusiva en ESPAÑOL en formato JSON estricto con las siguientes claves:
    {
      "candleName": "Nombre evocador y poético en español para la vela",
      "olfactoryPyramid": {
        "salida": "Notas de salida (lo primero que se percibe)",
        "corazon": "Notas de corazón (el alma de la fragancia)",
        "fondo": "Notas de fondo (la base perdurable y cálida)"
      },
      "description": "Descripción sensorial poética de la experiencia olfativa y lumínica (2-3 oraciones)",
      "vesselRecommendation": "Tipo de vasija cerámica artesanal recomendada (color mate, textura, estilo)",
      "burningRitual": "Instrucciones de ritual de encendido y tiempo ideal de disfrute",
      "moodAlignment": "Cómo esta fórmula química-botánica equilibra las emociones y el ambiente",
      "soundAmbience": "Descripción del efecto sonoro del crepitar de la mecha de madera"
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Eres una perfumista botánica y sommelier de aromas de lujo. Responde siempre con elegancia, precisión poética y estrictamente en formato JSON."
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    return res.json(data);
  } catch (error) {
    console.error("Error in fragrance consultation:", error);
    return res.status(500).json({
      error: "No se pudo generar la consulta olfativa.",
      fallback: {
        candleName: "Bruma de Lavanda & Naranja Especiada",
        olfactoryPyramid: {
          salida: "Cáscara de naranja deshidratada y mandarina dulce",
          corazon: "Flores de lavanda francesa y canela de Ceilán",
          fondo: "Cera de soja virgen, sándalo y resina de ámbar cálido",
        },
        description: "Una mezcla equilibrada que abraza tus sentidos con el crepitar relajante de la madera natural.",
        vesselRecommendation: "Cerámica artesanal esmaltada en mate arena.",
        burningRitual: "Respira hondo 3 veces antes de encender con cerilla larga de madera.",
        moodAlignment: "Relajación y alivio de tensiones.",
        soundAmbience: "Suave sonido crujiente de leña en miniatura."
      }
    });
  }
});

// Start server and mount Vite
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const isHmrDisabled = process.env.DISABLE_HMR === "true";
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        port: PORT,
        strictPort: true,
        hmr: isHmrDisabled
          ? false
          : {
              server: httpServer,
              clientPort: 443,
              protocol: "wss",
            },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
