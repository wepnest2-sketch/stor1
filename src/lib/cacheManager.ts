/**
 * Cache Manager - نظام إدارة التخزين المؤقت
 * يدعم: Memory Cache + LocalStorage + TTL (مدة انتهاء الصلاحية)
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheConfig {
  useLocalStorage?: boolean; // تفعيل تخزين localStorage
  ttl?: number; // مدة الصلاحية الافتراضية (ميلي ثانية)
}

export class CacheManager {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private useLocalStorage: boolean = true;
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default

  constructor(config?: CacheConfig) {
    if (config?.useLocalStorage !== undefined) {
      this.useLocalStorage = config.useLocalStorage;
    }
    if (config?.ttl) {
      this.defaultTTL = config.ttl;
    }
  }

  /**
   * الحصول على بيانات من الـ Cache
   * أولاً من الذاكرة، إذا لم توجد من localStorage
   */
  get(key: string): any | null {
    // محاولة من memory cache أولاً (أسرع)
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isValid(memoryEntry)) {
      return memoryEntry.data;
    }

    // محاولة من localStorage
    if (this.useLocalStorage) {
      try {
        const localData = localStorage.getItem(`cache:${key}`);
        if (localData) {
          const entry: CacheEntry = JSON.parse(localData);
          if (this.isValid(entry)) {
            // إعادة التخزين في الذاكرة للأداء الأفضل
            this.memoryCache.set(key, entry);
            return entry.data;
          } else {
            // حذف البيانات المنتهية الصلاحية
            localStorage.removeItem(`cache:${key}`);
          }
        }
      } catch (error) {
        console.error('Error reading from localStorage:', error);
      }
    }

    // حذف المدخل المنتهي الصلاحية من الذاكرة
    if (memoryEntry) {
      this.memoryCache.delete(key);
    }

    return null;
  }

  /**
   * تخزين البيانات في الـ Cache
   */
  set(key: string, data: any, ttl?: number): void {
    const expiryTTL = ttl || this.defaultTTL;
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: expiryTTL,
    };

    // تخزين في الذاكرة
    this.memoryCache.set(key, entry);

    // تخزين في localStorage
    if (this.useLocalStorage) {
      try {
        localStorage.setItem(`cache:${key}`, JSON.stringify(entry));
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    }
  }

  /**
   * حذف مدخل من الـ Cache
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
    if (this.useLocalStorage) {
      try {
        localStorage.removeItem(`cache:${key}`);
      } catch (error) {
        console.error('Error deleting from localStorage:', error);
      }
    }
  }

  /**
   * تفريغ جميع المدخلات من الـ Cache
   */
  clear(): void {
    this.memoryCache.clear();
    if (this.useLocalStorage) {
      try {
        const keysToDelete: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('cache:')) {
            keysToDelete.push(key);
          }
        }
        keysToDelete.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }
  }

  /**
   * التحقق من صلاحية المدخل
   */
  private isValid(entry: CacheEntry): boolean {
    const now = Date.now();
    const expiryTime = entry.timestamp + entry.ttl;
    return now < expiryTime;
  }

  /**
   * الحصول على معلومات الـ Cache (للتصحيح)
   */
  getStats(): Record<string, any> {
    return {
      memoryCacheSize: this.memoryCache.size,
      useLocalStorage: this.useLocalStorage,
      defaultTTL: this.defaultTTL,
    };
  }

  /**
   * تحديث مدخل بدون تغيير البيانات (تحديث التاريخ فقط)
   */
  refresh(key: string, ttl?: number): boolean {
    const data = this.get(key);
    if (data !== null) {
      this.set(key, data, ttl);
      return true;
    }
    return false;
  }
}

/**
 * Cart Manager - إدارة سلة التسوق
 * تخزين دائم للسلة في localStorage
 */
export class CartManager {
  private cacheManager: CacheManager;
  private readonly CART_KEY = 'app:cart';
  private readonly CART_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

  constructor(cacheManager: CacheManager) {
    this.cacheManager = cacheManager;
  }

  /**
   * الحصول على السلة الحالية
   */
  getCart(): any[] {
    return this.cacheManager.get(this.CART_KEY) || [];
  }

  /**
   * حفظ السلة
   */
  saveCart(cart: any[]): void {
    this.cacheManager.set(this.CART_KEY, cart, this.CART_TTL);
  }

  /**
   * إضافة منتج للسلة
   */
  addItem(item: any): void {
    const cart = this.getCart();
    const existingItem = cart.find(
      (i) => i.id === item.id && i.selectedSize === item.selectedSize
    );

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + (item.quantity || 1);
    } else {
      cart.push({ ...item, quantity: item.quantity || 1 });
    }

    this.saveCart(cart);
  }

  /**
   * إزالة منتج من السلة
   */
  removeItem(itemId: string): void {
    const cart = this.getCart();
    const filteredCart = cart.filter((i) => i.id !== itemId);
    this.saveCart(filteredCart);
  }

  /**
   * تحديث كمية المنتج
   */
  updateItemQuantity(itemId: string, quantity: number): void {
    const cart = this.getCart();
    const item = cart.find((i) => i.id === itemId);
    if (item) {
      item.quantity = Math.max(0, quantity);
      this.saveCart(cart);
    }
  }

  /**
   * تفريغ السلة
   */
  clearCart(): void {
    this.cacheManager.delete(this.CART_KEY);
  }

  /**
   * الحصول على إجمالي عدد العناصر في السلة
   */
  getCartCount(): number {
    return this.getCart().reduce((sum, item) => sum + (item.quantity || 1), 0);
  }

  /**
   * الحصول على إجمالي السعر
   */
  getCartTotal(): number {
    return this.getCart().reduce((sum, item) => {
      const price = item.discount_price || item.price;
      return sum + price * (item.quantity || 1);
    }, 0);
  }
}

// إنشاء مثيل عام من CacheManager
export const cacheManager = new CacheManager({
  useLocalStorage: true,
  ttl: 5 * 60 * 1000, // 5 minutes
});

// إنشاء مثيل عام من CartManager
export const cartManager = new CartManager(cacheManager);
