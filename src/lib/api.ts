import { supabase } from './supabase';
import { cacheManager } from './cacheManager';
import { Product, Wilaya, Municipality, Category, SiteSettings, AboutUsContent } from '../types';

// استخدام CacheManager المحسّن بدلاً من الـ cache البسيط
const getCachedData = (key: string) => {
  return cacheManager.get(key);
};

const setCachedData = (key: string, data: any, ttl?: number) => {
  cacheManager.set(key, data, ttl);
};

export const fetchCategories = async (): Promise<Category[]> => {
  const cached = getCachedData('categories');
  if (cached) return cached;

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });
    
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  const categories = data.map((c: any) => ({
    id: c.id,
    name: c.name,
    image_url: c.image_url,
    display_order: c.display_order,
  }));

  setCachedData('categories', categories);
  return categories;
};

export const fetchSiteSettings = async (): Promise<SiteSettings | null> => {
  const cached = getCachedData('site_settings');
  if (cached) return cached;

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .single();
    
  if (error) {
    console.error('Error fetching site settings:', error);
    return null;
  }
  
  setCachedData('site_settings', data);
  return data;
};

export const fetchAboutUs = async (): Promise<AboutUsContent | null> => {
  const cached = getCachedData('about_us');
  if (cached) return cached;

  const { data, error } = await supabase
    .from('about_us_content')
    .select('*')
    .single();
    
  if (error) {
    console.error('Error fetching about us content:', error);
    return null;
  }
  
  const aboutUs = {
    title: data.title,
    content: data.content,
    features: data.features || [],
  };

  setCachedData('about_us', aboutUs);
  return aboutUs;
};

export const fetchProducts = async (): Promise<Product[]> => {
  const cached = getCachedData('products');
  if (cached) return cached;

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
  
  const mappedProducts = products.map((p: any) => {
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

  setCachedData('products', mappedProducts);
  return mappedProducts;
};

export const fetchWilayas = async (): Promise<Wilaya[]> => {
  const cached = getCachedData('wilayas');
  if (cached) return cached;

  const { data, error } = await supabase
    .from('wilayas')
    .select('*')
    .order('id', { ascending: true });
    
  if (error || !data || data.length === 0) {
    if (error) console.error('Error fetching wilayas, using fallback:', error);
    // Fallback to constants if DB is empty or error
    // Import WILAYAS dynamically to avoid circular dependency issues if any, 
    // though here it's fine as api.ts imports types only usually.
    // But better to just return the hardcoded list from constants if we can't get it from DB.
    // We need to import WILAYAS from constants.
    const { WILAYAS } = await import('../constants');
    return WILAYAS;
  }

  const wilayas = data.map((w: any) => ({
    id: w.id,
    name: w.name,
    deliveryHome: w.delivery_price_home,
    deliveryPost: w.delivery_price_desk,
  }));

  setCachedData('wilayas', wilayas);
  return wilayas;
};

export const createOrder = async (orderData: any) => {
  // 1. Insert into orders table
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      customer_first_name: orderData.customer_first_name,
      customer_last_name: orderData.customer_last_name,
      customer_phone: orderData.phone_number,
      wilaya_id: orderData.wilaya_id.toString(), // Ensure it's a string as per schema
      municipality_name: orderData.municipality,
      address: orderData.address,
      delivery_type: orderData.delivery_type,
      total_price: orderData.total_amount,
      instagram_account: orderData.instagram_account,
      status: 'pending'
    }])
    .select()
    .single();
    
  if (orderError) {
    console.error('Error creating order:', orderError);
    throw orderError;
  }

  if (!order) {
    throw new Error('Failed to create order');
  }

  // 2. Prepare order items
  const orderItems = orderData.items.map((item: any) => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.name,
    price: item.price,
    quantity: item.quantity,
    selected_size: item.selectedSize,
    selected_color: item.selectedColor
  }));

  // 3. Insert into order_items table
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    // Ideally we should rollback the order here, but Supabase JS client doesn't support transactions easily without RPC.
    // For now, we'll just throw.
    throw itemsError;
  }

  return order;
};
