export interface SiteSettings {
  site_name: string;
  logo_url: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  announcement_text?: string;
  hero_image_url?: string;
  hero_title?: string;
  hero_subtitle?: string;
  delivery_company_name?: string;
}

export interface Category {
  id: string;
  name: string;
  image_url?: string;
  display_order: number;
}

export interface AboutUsContent {
  title: string;
  content: string;
  features: { title: string; description: string; icon?: string }[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color_name: string;
  color_hex: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  discount_price?: number;
  category: string;
  images: string[];
  description: string;
  variants?: ProductVariant[];
  sizes: string[];
  colors: { name: string; hex: string }[];
}

export interface CartItem extends Product {
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface Wilaya {
  id: string;
  name: string;
  deliveryHome: number;
  deliveryPost: number;
}

export interface Municipality {
  id: string;
  wilaya_id: string;
  name: string;
}
