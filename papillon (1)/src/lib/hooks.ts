/**
 * React Hooks للتعامل مع الـ Cache والسلة
 */

import { useState, useEffect, useCallback } from 'react';
import { cartManager, cacheManager } from './cacheManager';
import { CartItem } from '../types';

/**
 * Hook عام للعمل مع الـ Cache
 * @param key مفتاح الـ Cache
 * @param fetcher دالة لجلب البيانات إذا لم تكن محفوظة
 * @param options خيارات إضافية (ttl وغيرها)
 */
export const useCachedData = <T,>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { ttl?: number }
) => {
  const [data, setData] = useState<T | null>(() => cacheManager.get(key));
  const [loading, setLoading] = useState(data === null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // محاولة من الـ Cache أولاً
        const cached = cacheManager.get(key);
        if (cached) {
          setData(cached);
          setLoading(false);
          return;
        }

        // جلب البيانات من الخادم
        setLoading(true);
        const result = await fetcher();
        setData(result);
        
        // تخزين في الـ Cache
        cacheManager.set(key, result, options?.ttl);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key, fetcher, options?.ttl]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetcher();
      setData(result);
      cacheManager.set(key, result, options?.ttl);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, options?.ttl]);

  return { data, loading, error, refresh };
};

/**
 * Hook خاص لإدارة سلة التسوق
 */
export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>(() => cartManager.getCart());
  const [isLoading, setIsLoading] = useState(false);

  // تحديث الـ localStorage عند تغيير السلة
  const updateCart = useCallback((newCart: CartItem[]) => {
    setCart(newCart);
    cartManager.saveCart(newCart);
  }, []);

  const addToCart = useCallback((item: CartItem) => {
    setIsLoading(true);
    try {
      cartManager.addItem(item);
      setCart(cartManager.getCart());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setIsLoading(true);
    try {
      cartManager.removeItem(itemId);
      setCart(cartManager.getCart());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateItemQuantity = useCallback((itemId: string, quantity: number) => {
    setIsLoading(true);
    try {
      cartManager.updateItemQuantity(itemId, quantity);
      setCart(cartManager.getCart());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCart = useCallback(() => {
    setIsLoading(true);
    try {
      cartManager.clearCart();
      setCart([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCartCount = useCallback(() => {
    return cartManager.getCartCount();
  }, []);

  const getCartTotal = useCallback(() => {
    return cartManager.getCartTotal();
  }, []);

  return {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    updateCart,
    getCartCount,
    getCartTotal,
  };
};

/**
 * Hook للاستماع للتغييرات في localStorage
 * يستخدم لمزامنة البيانات بين الـ tabs المختلفة
 */
export const useLocalStorageSync = (key: string, callback: (data: any) => void) => {
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === `cache:${key}` && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          callback(data.data);
        } catch (error) {
          console.error('Error parsing synced data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, callback]);
};

/**
 * Hook لحذف البيانات القديمة من الـ Cache
 * (لتنظيف localStorage)
 */
export const useCleanupCache = (prefixes: string[] = []) => {
  const cleanup = useCallback(() => {
    try {
      const keysToDelete: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache:')) {
          const shouldDelete = prefixes.length === 0 || 
            prefixes.some(prefix => key.includes(prefix));
          
          if (shouldDelete) {
            keysToDelete.push(key);
          }
        }
      }
      keysToDelete.forEach(key => localStorage.removeItem(key));
      console.log(`Cleaned up ${keysToDelete.length} cache entries`);
    } catch (error) {
      console.error('Error cleaning up cache:', error);
    }
  }, [prefixes]);

  return { cleanup };
};

/**
 * Hook للحصول على معلومات الـ Cache
 * (مفيد للتصحيح)
 */
export const useCacheStats = () => {
  const [stats, setStats] = useState(cacheManager.getStats());

  const refresh = useCallback(() => {
    setStats(cacheManager.getStats());
  }, []);

  return { stats, refresh };
};
