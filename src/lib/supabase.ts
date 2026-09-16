import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Vite client-side environment variables
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "";

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://tu-proyecto.supabase.co" &&
    !supabaseUrl.includes("your-project") &&
    !supabaseUrl.includes("placeholder")
  );
};

// Fallback client to avoid crashes if environment variables are not yet entered
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? supabaseUrl : "https://placeholder-project.supabase.co",
  isSupabaseConfigured() ? supabaseAnonKey : "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

let cachedBucketName: string | null = null;

/**
 * Detecta un bucket existente o intenta crear el preferido
 */
async function getOrInitBucket(preferredBucket = "candle-assets"): Promise<string> {
  if (cachedBucketName) return cachedBucketName;

  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (!listError && buckets && buckets.length > 0) {
      // 1. Verificar si existe el preferido
      const found = buckets.find((b) => b.name === preferredBucket);
      if (found) {
        cachedBucketName = found.name;
        return cachedBucketName;
      }

      // 2. Buscar otros buckets comunes en proyectos Supabase
      const commonNames = ["images", "products", "public", "assets", "media", "photos", "uploads"];
      for (const name of commonNames) {
        const candidate = buckets.find((b) => b.name === name);
        if (candidate) {
          cachedBucketName = candidate.name;
          return cachedBucketName;
        }
      }

      // 3. Usar el primer bucket público si existe
      const anyPublic = buckets.find((b) => b.public);
      if (anyPublic) {
        cachedBucketName = anyPublic.name;
        return cachedBucketName;
      }

      // O el primer bucket que exista
      if (buckets[0]) {
        cachedBucketName = buckets[0].name;
        return cachedBucketName;
      }
    }
  } catch (listErr) {
    console.warn("No se pudieron listar los buckets de Supabase:", listErr);
  }

  // Intentar crear el bucket si no existe
  try {
    const { error: createError } = await supabase.storage.createBucket(preferredBucket, {
      public: true,
      fileSizeLimit: 20971520, // 20MB
    });
    if (!createError) {
      cachedBucketName = preferredBucket;
      return cachedBucketName;
    }
  } catch (createErr) {
    console.warn("No se pudo auto-crear bucket en Supabase:", createErr);
  }

  return preferredBucket;
}

/**
 * Convierte un File o Blob a DataURL base64
 */
function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Sube la imagen al endpoint local del servidor (/api/upload) como fallback seguro y persistente
 */
async function fallbackUploadToServer(file: File | Blob, path: string): Promise<string> {
  try {
    const base64Data = await fileToDataUrl(file);
    const cleanName = path.replace(/[^a-zA-Z0-9.-]/g, "_");

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Data, name: cleanName }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        return data.url;
      }
    }

    return base64Data;
  } catch (fallbackErr) {
    console.warn("Fallo en fallback de subida local, utilizando dataURL directa:", fallbackErr);
    return await fileToDataUrl(file);
  }
}

/**
 * Sube un archivo a Supabase Storage con autodetección de bucket y fallback local resiliente
 */
export const uploadFileToSupabaseStorage = async (
  file: File | Blob,
  path: string,
  preferredBucketName = "candle-assets"
): Promise<string> => {
  if (!isSupabaseConfigured()) {
    return fallbackUploadToServer(file, path);
  }

  try {
    const bucketName = await getOrInitBucket(preferredBucketName);

    const { data, error } = await supabase.storage.from(bucketName).upload(path, file, {
      upsert: true,
      cacheControl: "3600",
    });

    if (error) {
      // Si el bucket reporta no existir, intentamos crearlo y reintentar una vez
      if (error.message && error.message.toLowerCase().includes("not found")) {
        try {
          const { error: retryCreateErr } = await supabase.storage.createBucket(bucketName, {
            public: true,
          });
          if (!retryCreateErr) {
            const { data: retryData, error: retryUploadErr } = await supabase.storage
              .from(bucketName)
              .upload(path, file, { upsert: true, cacheControl: "3600" });
            if (!retryUploadErr && retryData) {
              const { data: retryPublicUrl } = supabase.storage.from(bucketName).getPublicUrl(retryData.path);
              return retryPublicUrl.publicUrl;
            }
          }
        } catch {
          // Continuar con fallback
        }
      }

      console.warn("Aviso de Supabase Storage (usando almacenamiento local respaldado):", error.message || error);
      return await fallbackUploadToServer(file, path);
    }

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  } catch (err: any) {
    console.warn("Excepción al comunicarse con Supabase Storage (usando almacenamiento local):", err?.message || err);
    return await fallbackUploadToServer(file, path);
  }
};
