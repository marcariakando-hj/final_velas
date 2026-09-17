import React, { useState, useEffect } from "react";
import { Database, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, RefreshCw, Server, ArrowRight } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { CandleProduct } from "../types";
import { useStore } from "../context/StoreContext";

interface SupabaseSettingsTabProps {
  candles: CandleProduct[];
  onNotify: (msg: string) => void;
}

export const SupabaseSettingsTab: React.FC<SupabaseSettingsTabProps> = ({ candles, onNotify }) => {
  const { syncAllToSupabase } = useStore();
  const [copiedSql, setCopiedSql] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"unchecked" | "connected" | "error">("unchecked");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [syncingProducts, setSyncingProducts] = useState(false);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);

  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
  const hasValidUrl = isSupabaseConfigured();

  const testConnection = async () => {
    if (!hasValidUrl) {
      setConnectionStatus("error");
      setStatusMessage("No se han detectado las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el entorno.");
      return;
    }

    setTestingConnection(true);
    setStatusMessage("");
    try {
      const { data, error } = await supabase.from("products").select("id").limit(1);
      if (error) {
        setConnectionStatus("error");
        if (error.code === "42P01") {
          setStatusMessage("Conexión exitosa a Supabase, pero la tabla 'products' aún no ha sido creada en tu base de datos.");
        } else {
          setStatusMessage(`Error de Supabase (${error.code || "auth"}): ${error.message}`);
        }
      } else {
        setConnectionStatus("connected");
        setStatusMessage(`Conexión establecida con éxito. Tablas detectadas (${data?.length ?? 0} productos encontrados en prueba).`);
      }
    } catch (err: any) {
      setConnectionStatus("error");
      setStatusMessage(`Fallo en la llamada: ${err?.message || err}`);
    } finally {
      setTestingConnection(false);
    }
  };

  useEffect(() => {
    if (hasValidUrl) {
      testConnection();
    }
  }, [hasValidUrl]);

  const handleCopySql = () => {
    const sqlContent = `-- 1. Tabla de Productos y Modelos 2D
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subtitle TEXT,
  tagline TEXT,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  weight_grams NUMERIC DEFAULT 280,
  burn_hours NUMERIC DEFAULT 50,
  image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  custom_2d_image_url TEXT,
  base_2d_image TEXT,
  vessel_color TEXT,
  vessel_name TEXT,
  category TEXT,
  olfactory_pyramid JSONB DEFAULT '{}'::jsonb,
  ingredients JSONB DEFAULT '[]'::jsonb,
  botanicals JSONB DEFAULT '[]'::jsonb,
  artisan_note TEXT,
  layers_2d JSONB DEFAULT '[]'::jsonb,
  wax_mask_polygon TEXT,
  sculpture_type TEXT DEFAULT 'vaso-vidrio',
  wax_type TEXT DEFAULT 'soja',
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  customizer_2d_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla para configuraciones globales (Marca, Personalizador, Esculturas, Aromas, Reseñas)
CREATE TABLE IF NOT EXISTS store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla específica para Capas 2D del Administrador y Personalizador
CREATE TABLE IF NOT EXISTS candle_layers (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  colorable BOOLEAN DEFAULT false,
  z_index INTEGER DEFAULT 0,
  type TEXT DEFAULT 'figura',
  default_color_hex TEXT,
  allowed_color_hexes JSONB DEFAULT '[]'::jsonb,
  offset_x NUMERIC DEFAULT 0,
  offset_y NUMERIC DEFAULT 0,
  scale NUMERIC DEFAULT 1.0,
  opacity NUMERIC DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE candle_layers ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Acceso para Productos (Permite lectura y edición con anon key)
DROP POLICY IF EXISTS "Lectura pública de productos" ON products;
CREATE POLICY "Lectura pública de productos" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inserción de productos" ON products;
CREATE POLICY "Inserción de productos" ON products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Actualización de productos" ON products;
CREATE POLICY "Actualización de productos" ON products FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Eliminación de productos" ON products;
CREATE POLICY "Eliminación de productos" ON products FOR DELETE USING (true);

-- 6. Políticas de Acceso para Configuraciones
DROP POLICY IF EXISTS "Lectura pública de configuraciones" ON store_settings;
CREATE POLICY "Lectura pública de configuraciones" ON store_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inserción de configuraciones" ON store_settings;
CREATE POLICY "Inserción de configuraciones" ON store_settings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Actualización de configuraciones" ON store_settings;
CREATE POLICY "Actualización de configuraciones" ON store_settings FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Eliminación de configuraciones" ON store_settings;
CREATE POLICY "Eliminación de configuraciones" ON store_settings FOR DELETE USING (true);

-- 7. Políticas de Acceso para Capas 2D (candle_layers)
DROP POLICY IF EXISTS "Lectura pública de capas" ON candle_layers;
CREATE POLICY "Lectura pública de capas" ON candle_layers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inserción de capas" ON candle_layers;
CREATE POLICY "Inserción de capas" ON candle_layers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Actualización de capas" ON candle_layers;
CREATE POLICY "Actualización de capas" ON candle_layers FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Eliminación de capas" ON candle_layers;
CREATE POLICY "Eliminación de capas" ON candle_layers FOR DELETE USING (true);

-- 8. Bucket de Almacenamiento para Imágenes (candle-assets)
INSERT INTO storage.buckets (id, name, public)
VALUES ('candle-assets', 'candle-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 9. Políticas de Acceso para Storage (Imágenes de productos y capas 2D)
DROP POLICY IF EXISTS "Lectura pública de imágenes" ON storage.objects;
CREATE POLICY "Lectura pública de imágenes" ON storage.objects FOR SELECT USING (bucket_id = 'candle-assets');

DROP POLICY IF EXISTS "Subida pública de imágenes" ON storage.objects;
CREATE POLICY "Subida pública de imágenes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'candle-assets');

DROP POLICY IF EXISTS "Actualización pública de imágenes" ON storage.objects;
CREATE POLICY "Actualización pública de imágenes" ON storage.objects FOR UPDATE USING (bucket_id = 'candle-assets') WITH CHECK (bucket_id = 'candle-assets');

DROP POLICY IF EXISTS "Eliminación pública de imágenes" ON storage.objects;
CREATE POLICY "Eliminación pública de imágenes" ON storage.objects FOR DELETE USING (bucket_id = 'candle-assets');`;

    navigator.clipboard.writeText(sqlContent);
    setCopiedSql(true);
    onNotify("Script SQL completo copiado al portapapeles");
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSyncToSupabase = async () => {
    if (!hasValidUrl) {
      onNotify("Primero ingresa las variables de entorno de Supabase.");
      return;
    }

    setSyncingProducts(true);
    try {
      const result = await syncAllToSupabase();
      if (result.success) {
        setSyncedCount(result.count || candles.length);
        onNotify(result.message);
      } else {
        onNotify(result.message);
      }
    } catch (err: any) {
      console.error("Error syncing to Supabase:", err);
      onNotify(`Error al sincronizar: ${err?.message || err}`);
    } finally {
      setSyncingProducts(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header card */}
      <div className="bg-white p-6 rounded-3xl border border-[#E5E0DA] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3ECF8E]/15 text-[#107c41] flex items-center justify-center font-bold">
              <Database className="w-6 h-6 text-[#107c41]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#423D33]">
                Integración con Supabase PostgreSQL
              </h3>
              <p className="text-xs text-[#8C7A6B]">
                Persistencia duradera en la nube para productos, modelos 2D y capas sin pérdida al reiniciar el contenedor.
              </p>
            </div>
          </div>

          <button
            onClick={testConnection}
            disabled={testingConnection}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#D1C7BD] text-[#423D33] hover:bg-[#F2EDE7] flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? "animate-spin" : ""}`} />
            Probar Conexión
          </button>
        </div>

        {/* Status banner */}
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 ${
            connectionStatus === "connected"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : hasValidUrl
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-stone-50 border-stone-200 text-stone-700"
          }`}
        >
          {connectionStatus === "connected" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1 text-xs">
            <p className="font-semibold">
              {connectionStatus === "connected"
                ? "Conexión Activa con Supabase"
                : hasValidUrl
                ? "Credenciales detectadas - Requiere verificación"
                : "Variables de entorno pendientes de configurar"}
            </p>
            <p className="text-xs leading-relaxed opacity-90">
              {statusMessage ||
                (hasValidUrl
                  ? `URL configurada: ${envUrl}`
                  : "Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en la configuración de entorno para conectar la base de datos.")}
            </p>
          </div>
        </div>
      </div>

      {/* Step by step guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1: SQL Schema */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5E0DA] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
              Paso 1 • Crear Tablas
            </span>
            <button
              onClick={handleCopySql}
              className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#D9C5B2] text-xs font-semibold text-[#423D33] hover:bg-[#F0ECE6] flex items-center gap-1.5 cursor-pointer transition-all"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSql ? "Copiado" : "Copiar SQL"}
            </button>
          </div>

          <h4 className="font-serif text-base font-bold text-[#423D33]">
            Ejecutar esquema en Supabase SQL Editor
          </h4>
          <p className="text-xs text-[#8C7A6B] leading-relaxed">
            Copia el esquema SQL preparado para este proyecto y pégalo en el editor SQL de tu panel de Supabase. Creará la tabla <code className="bg-[#FAF7F2] px-1.5 py-0.5 rounded text-[#423D33]">products</code>, <code className="bg-[#FAF7F2] px-1.5 py-0.5 rounded text-[#423D33]">store_settings</code> y el bucket de almacenamiento <code className="bg-[#FAF7F2] px-1.5 py-0.5 rounded text-[#423D33]">candle-assets</code> con permisos públicos de lectura y subida.
          </p>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#608058] hover:underline"
          >
            Abrir panel de Supabase <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Step 2: Push products */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5E0DA] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B]">
              Paso 2 • Sincronización
            </span>
            <span className="text-xs font-mono text-[#8C7A6B]">{candles.length} velas locales</span>
          </div>

          <h4 className="font-serif text-base font-bold text-[#423D33]">
            Exportar catálogo actual a Supabase
          </h4>
          <p className="text-xs text-[#8C7A6B] leading-relaxed">
            Sube todas las velas actuales, capas 2D configuradas y detalles directamente a la tabla en tu nube de Supabase.
          </p>

          <button
            onClick={handleSyncToSupabase}
            disabled={syncingProducts || !hasValidUrl}
            className="w-full py-2.5 rounded-xl bg-[#4A4541] hover:bg-[#35312E] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Server className="w-4 h-4" />
            {syncingProducts ? "Subiendo productos..." : `Sincronizar ${candles.length} Productos a Supabase`}
          </button>

          {syncedCount !== null && (
            <p className="text-[11px] text-emerald-700 font-medium text-center">
              ✓ {syncedCount} productos guardados exitosamente en la base de datos.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
