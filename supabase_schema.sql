-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. جدول إعدادات الموقع (Site Settings)
create table if not exists public.site_settings (
  id uuid primary key default uuid_generate_v4(),
  site_name text not null default 'Papillon',
  logo_url text not null,
  favicon_url text,
  primary_color text default '#000000',
  secondary_color text default '#FFFFFF',
  announcement_text text,
  hero_image_url text,
  hero_title text,
  hero_subtitle text,
  delivery_company_name text default 'Yalidine',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. جدول الولايات (Wilayas)
create table if not exists public.wilayas (
  id text primary key,
  name text not null,
  delivery_price_home integer not null default 0,
  delivery_price_desk integer not null default 0,
  is_active boolean default true
);

-- 3. جدول الأصناف (Categories)
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  image_url text,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. جدول المنتجات (Products)
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  price integer not null,
  category_id uuid references public.categories(id),
  images text[] not null default '{}',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add discount_price column to products table
alter table public.products add column if not exists discount_price integer;
-- يربط كل مقاس ولون بكمية محددة
create table if not exists public.product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade,
  size text not null, -- المقاس (S, M, L...)
  color_name text not null, -- اسم اللون (أبيض، أسود...)
  color_hex text not null, -- كود اللون (#FFFFFF...)
  quantity integer not null default 0, -- الكمية المتوفرة
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. جدول الطلبات (Orders)
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number serial,
  customer_first_name text not null,
  customer_last_name text not null,
  customer_phone text not null,
  wilaya_id text references public.wilayas(id),
  municipality_name text not null,
  address text,
  delivery_type text check (delivery_type in ('home', 'post')),
  total_price integer not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. جدول تفاصيل الطلب (Order Items)
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,
  price integer not null,
  quantity integer not null,
  selected_size text,
  selected_color text
);

-- 8. جدول صفحة "من نحن" (About Us Page)
create table if not exists public.about_us_content (
  id uuid primary key default uuid_generate_v4(),
  title text not null default 'من نحن',
  content text not null,
  features jsonb default '[]',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- تعطيل RLS على جميع الجداول (Disable RLS)
alter table public.site_settings disable row level security;
alter table public.wilayas disable row level security;
alter table public.categories disable row level security;
alter table public.products disable row level security;
alter table public.product_variants disable row level security;
alter table public.orders disable row level security;
alter table public.order_items disable row level security;
alter table public.about_us_content disable row level security;
