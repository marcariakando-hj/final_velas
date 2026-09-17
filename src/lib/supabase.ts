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
 * Sube un archivo a Supabase Storage con soporte prioritario para 'candle-assets' y buckets alternativos,
 * garantizando persistencia pública en la nube y fallback seguro.
 */
export const uploadFileToSupabaseStorage = async (
  file: File | Blob,
  path: string,
  preferredBucketName = "candle-assets"
): Promise<string> => {
  if (!isSupabaseConfigured()) {
    return fallbackUploadToServer(file, path);
  }

  const cleanPath = path.replace(/^\/+/, "");
  const mimeType = (file as any).type || (cleanPath.endsWith(".png") ? "image/png" : "image/jpeg");

  // Lista ordenada de buckets candidatos
  const candidateBuckets = Array.from(
    new Set(
      [
        cachedBucketName,
        preferredBucketName,
        "candle-assets",
        "images",
        "products",
        "public",
      ].filter(Boolean) as string[]
    )
  );

  let lastError: any = null;

  for (const bucket of candidateBuckets) {
    try {
      const { data, error } = await supabase.storage.from(bucket).upload(cleanPath, file, {
        upsert: true,
        cacheControl: "3600",
        contentType: mimeType,
      });

      if (!error && data?.path) {
        cachedBucketName = bucket;
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
        if (publicUrlData?.publicUrl) {
          console.log(`✓ Archivo subido con éxito a Supabase Storage [${bucket}]: ${cleanPath}`);
          return publicUrlData.publicUrl;
        }
      } else if (error) {
        lastError = error;
        // Si no es un error de "not found", puede ser RLS o permisos
        if (!error.message?.toLowerCase().includes("not found")) {
          console.warn(`Supabase Storage (${bucket}) aviso:`, error.message);
        }
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  if (lastError) {
    console.warn(
      `Supabase Storage no pudo almacenar el archivo directamente (${lastError?.message || lastError}). Se utilizará almacenamiento local como respaldo. Recuerda ejecutar el script de políticas RLS en Supabase SQL Editor para el bucket 'candle-assets'.`
    );
  }

  return await fallbackUploadToServer(file, path);
};
