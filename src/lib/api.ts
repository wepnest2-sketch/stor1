import { supabase } from './supabase';
import { Product, Wilaya, Municipality, Category, SiteSettings, AboutUsContent } from '../types';

export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });
    
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  return data.map((c: any) => ({
    id: c.id,
    name: c.name,
    image_url: c.image_url,
    display_order: c.display_order,
  }));
};

export const fetchSiteSettings = async (): Promise<SiteSettings | null> => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .single();
    
  if (error) {
    console.error('Error fetching site settings:', error);
    return null;
  }
  
  return data;
};

export const fetchAboutUs = async (): Promise<AboutUsContent | null> => {
  const { data, error } = await supabase
    .from('about_us_content')
    .select('*')
    .single();
    
  if (error) {
    console.error('Error fetching about us content:', error);
    return null;
  }
  
  return {
    title: data.title,
    content: data.content,
    features: data.features || [],
  };
};

export const fetchProducts = async (): Promise<Product[]> => {
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      product_variants (*)
    `);
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return products.map((p: any) => {
    const variants = p.product_variants || [];
    // Derive unique sizes and colors from variants
    const sizes = Array.from(new Set(variants.map((v: any) => v.size))) as string[];
    const colorsMap = new Map();
    variants.forEach((v: any) => {
        colorsMap.set(v.color_name, { name: v.color_name, hex: v.color_hex });
    });
    const colors = Array.from(colorsMap.values()) as { name: string; hex: string }[];

    return {
      id: p.id,
      name: p.name,
      price: p.price,
      discount_price: p.discount_price,
      category: p.category_id,
      images: p.images,
      description: p.description,
      variants: variants,
      sizes: sizes.length > 0 ? sizes : p.sizes || [],
      colors: colors.length > 0 ? colors : p.colors || [],
    };
  });
};

export const fetchWilayas = async (): Promise<Wilaya[]> => {
  const { data, error } = await supabase
    .from('wilayas')
    .select('*')
    .order('id', { ascending: true });
    
  if (error) {
    console.error('Error fetching wilayas:', error);
    return [];
  }

  return data.map((w: any) => ({
    id: w.id,
    name: w.name,
    deliveryHome: w.delivery_price_home,
    deliveryPost: w.delivery_price_desk,
  }));
};

export const createOrder = async (orderData: any) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select();
    
  if (error) {
    throw error;
  }
  return data;
};
