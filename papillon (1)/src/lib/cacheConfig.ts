/**
 * إعدادات الـ Cache - خيارات قابلة للتخصيص
 * 
 * استخدم هذا الملف لتخصيص سلوك الـ Cache حسب احتياجات مشروعك
 */

/**
 * فترات TTL (Time To Live) المختلفة
 * مدة انتهاء صلاحية البيانات المخزنة
 */
export const CACHE_TTL = {
  // بيانات ثابتة (ثابتة طويلة الأجل)
  STATIC: 30 * 24 * 60 * 60 * 1000, // 30 يوم - الفئات، الإعدادات
  
  // بيانات متوسطة المدى
  MEDIUM: 60 * 60 * 1000, // ساعة واحدة
  
  // بيانات قصيرة المدى (تتغير بسرعة)
  SHORT: 5 * 60 * 1000, // 5 دقائق - المنتجات، الأسعار
  
  // بيانات سريعة جداً (تتغير باستمرار)
  VERY_SHORT: 1 * 60 * 1000, // دقيقة واحدة
  
  // سلة التسوق (طويلة جداً)
  CART: 30 * 24 * 60 * 60 * 1000, // 30 يوم
  
  // جلسة المستخدم
  SESSION: 24 * 60 * 60 * 1000, // 24 ساعة
};

/**
 * مفاتيح الـ Cache
 * استخدم هذه الثوابت لتجنب الأخطاء الإملائية
 */
export const CACHE_KEYS = {
  // بيانات المنتجات
  PRODUCTS: 'all_products',
  PRODUCT_DETAIL: (id: string) => `product_${id}`,
  
  // بيانات الفئات
  CATEGORIES: 'site_categories',
  
  // بيانات المناطق
  WILAYAS: 'wilayas_list',
  MUNICIPALITIES: (wilayaId: string) => `municipalities_${wilayaId}`,
  
  // بيانات الموقع
  SITE_SETTINGS: 'site_settings',
  ABOUT_US: 'about_us_content',
  
  // السلة
  CART: 'app:cart',
  
  // بيانات المستخدم
  USER_PREFERENCES: 'user_preferences',
  USER_HISTORY: 'user_history',
};

/**
 * سياسات الـ Cache (Cache Policies)
 * تحدد متى تحتاج لطلب البيانات من الخادم
 */
export enum CachePolicy {
  // استخدم الـ Cache دائماً إن وجدت
  CACHE_ONLY = 'cache_only',
  
  // استخدم الـ Cache إذا كانت موجودة وحديثة، وإلا اطلب من الخادم
  CACHE_FIRST = 'cache_first', // الافتراضي
  
  // اطلب من الخادم دائماً، وحدث الـ Cache
  NETWORK_FIRST = 'network_first',
  
  // اطلب مرة واحدة، ثم استخدم الـ Cache (للتطبيقات التي تتوقع تحديثات يدوية)
  ONCE = 'once',
}

/**
 * إعدادات منتجات محددة
 */
export const CACHE_CONFIG = {
  /**
   * إعدادات المنتجات
   * - تتغير بشكل متكرر (إضافة منتجات جديدة، تحديث الأسعار)
   * - استخدم TTL قصير نسبياً
   */
  products: {
    ttl: CACHE_TTL.SHORT, // 5 دقائق
    policy: CachePolicy.CACHE_FIRST,
  },

  /**
   * إعدادات الفئات
   * - بيانات شبه ثابتة
   * - تتغير نادراً
   */
  categories: {
    ttl: CACHE_TTL.STATIC, // 30 يوم
    policy: CachePolicy.CACHE_FIRST,
  },

  /**
   * إعدادات الولايات والبلديات
   * - بيانات ثابتة تماماً
   * - لا تتغير عملياً
   */
  wilayas: {
    ttl: CACHE_TTL.STATIC, // 30 يوم
    policy: CachePolicy.CACHE_FIRST,
  },

  /**
   * إعدادات إعدادات الموقع
   * - تتغير نادراً جداً
   * - تأثر جميع المستخدمين
   */
  siteSettings: {
    ttl: CACHE_TTL.STATIC, // 30 يوم
    policy: CachePolicy.CACHE_FIRST,
  },

  /**
   * إعدادات "من نحن"
   * - محتوى ثابت
   * - تتغير نادراً
   */
  aboutUs: {
    ttl: CACHE_TTL.STATIC, // 30 يوم
    policy: CachePolicy.CACHE_FIRST,
  },

  /**
   * إعدادات السلة
   * - بيانات مهمة جداً
   * - يجب حفظها لفترة طويلة
   */
  cart: {
    ttl: CACHE_TTL.CART, // 30 يوم
    policy: CachePolicy.CACHE_ONLY,
  },
};

/**
 * الحد الأقصى لحجم LocalStorage
 * تنبيهات عندما يقترب التخزين من الامتلاء
 */
export const STORAGE_LIMITS = {
  // الحد الأقصى العام (معظم المتصفحات 5-10MB)
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  
  // عند الوصول لهذه النسبة، أعطِ تنبيهاً
  WARNING_THRESHOLD: 0.8, // 80%
  
  // عند الوصول لهذه النسبة، حاول الحذف التلقائي
  CRITICAL_THRESHOLD: 0.95, // 95%
};

/**
 * ترتيب الأولويات للحذف التلقائي
 * عندما تمتلئ المساحة، حذف البيانات بهذا الترتيب
 */
export const DELETE_PRIORITY = {
  // حذف أولاً
  HIGH: 999,
  
  // حذف ثانياً
  MEDIUM: 500,
  
  // حذف أخيراً
  LOW: 100,
};

/**
 * معدل الأولويات للبيانات المختلفة
 */
export const CACHE_PRIORITIES = {
  products: DELETE_PRIORITY.MEDIUM,
  categories: DELETE_PRIORITY.LOW, // الحفاظ على الفئات
  cart: DELETE_PRIORITY.LOW, // الحفاظ على السلة بكل الأحوال
  userPreferences: DELETE_PRIORITY.LOW,
  temporary: DELETE_PRIORITY.HIGH, // حذف البيانات المؤقتة أولاً
};

/**
 * تكوين التنبيهات والسجلات
 */
export const DEBUG_CONFIG = {
  // تفعيل السجلات المفصلة
  VERBOSE: false,
  
  // تسجيل أوقات الوصول
  LOG_ACCESS_TIME: false,
  
  // تسجيل أحجام البيانات
  LOG_DATA_SIZE: false,
  
  // إظهار تحذيرات عند امتلاء التخزين
  WARN_ON_STORAGE_FULL: true,
  
  // إظهار تحذيرات عند انتهاء صلاحية البيانات
  WARN_ON_EXPIRY: false,
};

/**
 * أمثلة على الاستخدام
 */
export const USAGE_EXAMPLES = {
  /**
   * مثال 1: جلب المنتجات مع cache قصير
   */
  example1: `
    const { data: products } = useCachedData(
      CACHE_KEYS.PRODUCTS,
      fetchProducts,
      { ttl: CACHE_CONFIG.products.ttl }
    );
  `,

  /**
   * مثال 2: جلب منتج محدد
   */
  example2: `
    const { data: product } = useCachedData(
      CACHE_KEYS.PRODUCT_DETAIL('123'),
      () => fetchProductDetail('123'),
      { ttl: CACHE_TTL.MEDIUM }
    );
  `,

  /**
   * مثال 3: تخزين البيانات مباشرة
   */
  example3: `
    cacheManager.set(
      CACHE_KEYS.USER_PREFERENCES,
      userPrefs,
      CACHE_TTL.SESSION
    );
  `,

  /**
   * مثال 4: استخدام السلة
   */
  example4: `
    const { cart, addToCart } = useCart();
    // السلة مخزنة تلقائياً بـ CACHE_TTL.CART
  `,
};

/**
 * الحصول على الإعدادات الافتراضية
 */
export function getDefaultCacheConfig() {
  return {
    useLocalStorage: true,
    ttl: CACHE_TTL.SHORT,
    ...CACHE_CONFIG,
  };
}

/**
 * التحقق من الإعدادات
 */
export function validateCacheConfig(config: any): boolean {
  // تحقق من وجود ttl موجبة
  return config.ttl > 0 && config.ttl < 365 * 24 * 60 * 60 * 1000; // أقل من سنة
}
