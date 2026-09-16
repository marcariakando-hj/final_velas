-- ==============================================================================
-- AYLLU VELAS ARTESANALES - ESQUEMA SUPABASE POSTGRESQL
-- Copia y pega esto en Supabase -> SQL Editor -> Run
-- ==============================================================================

-- 1. Tabla de Productos y Modelos 2D
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

-- 2. Tabla para configuraciones globales (Marca, Opciones del Personalizador, Esculturas y Reseñas)
CREATE TABLE IF NOT EXISTS store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Acceso Públicas y Seguras para Productos
CREATE POLICY "Lectura pública de productos"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Inserción de productos pública o autenticada"
  ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Actualización de productos pública o autenticada"
  ON products FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Eliminación de productos pública o autenticada"
  ON products FOR DELETE
  USING (true);

-- 5. Políticas de Acceso Públicas y Seguras para Configuraciones Generales
CREATE POLICY "Lectura pública de configuraciones"
  ON store_settings FOR SELECT
  USING (true);

CREATE POLICY "Inserción de configuraciones pública o autenticada"
  ON store_settings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Actualización de configuraciones pública o autenticada"
  ON store_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Eliminación de configuraciones pública o autenticada"
  ON store_settings FOR DELETE
  USING (true);

-- 6. Bucket de Almacenamiento (Supabase Storage):
-- En el menú izquierdo de Supabase: Storage -> 'New bucket' -> Name: 'candle-assets' -> Activar 'Public bucket'.
