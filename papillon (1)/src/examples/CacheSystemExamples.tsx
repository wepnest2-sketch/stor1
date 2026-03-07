/**
 * مثال عملي: كيفية استخدام نظام السلة والـ Cache
 * 
 * هذا الملف يوضح الطرق المختلفة للاستخدام
 */

// ============================================
// 1️⃣ استخدام useCart في مكون السلة
// ============================================

import { useCart } from './lib/hooks';

export function ShoppingCartDemo() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
  } = useCart();

  // الآن السلة تُحفظ تلقائياً في localStorage!
  // والمستخدم سيرى نفس السلة حتى بعد تحديث الصفحة

  return (
    <div className="shopping-cart">
      <h2>سلة التسوق ({getCartCount()} عنصر)</h2>
      
      {cart.length === 0 ? (
        <p>السلة فارغة</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <h3>{item.name}</h3>
              <p>السعر: {item.discount_price || item.price} د.ج</p>
              <p>المقاس: {item.selectedSize}</p>
              
              <div className="quantity-control">
                <button
                  onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  readOnly
                />
                <button
                  onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <button onClick={() => removeFromCart(item.id)}>
                حذف من السلة
              </button>
            </div>
          ))}

          <div className="cart-summary">
            <h3>الإجمالي: {getCartTotal()} د.ج</h3>
            <button onClick={clearCart}>حذف جميع العناصر</button>
            <button>إتمام الشراء</button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// 2️⃣ استخدام useCart في صفحة المنتجات
// ============================================

import { useCachedData } from './lib/hooks';
import { fetchProducts } from './lib/api';
import { Product } from './types';

export function ProductsPageDemo() {
  // استخدام Cached Data للمنتجات (5 دقائق)
  const { data: products, loading, error, refresh } = useCachedData(
    'all_products',
    fetchProducts,
    { ttl: 5 * 60 * 1000 } // 5 دقائق
  );

  // استخدام السلة
  const { addToCart } = useCart();

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error.message}</div>;

  const handleAddToCart = (product: Product, size: string) => {
    addToCart({
      ...product,
      selectedSize: size,
      selectedColor: product.colors[0]?.name || '',
      quantity: 1,
    });
    alert('تم إضافة المنتج للسلة!');
  };

  return (
    <div className="products-grid">
      <button onClick={refresh}>تحديث المنتجات</button>
      
      {products?.map((product) => (
        <div key={product.id} className="product-card">
          <h3>{product.name}</h3>
          <p>{product.price} د.ج</p>
          
          <select onChange={(e) => handleAddToCart(product, e.target.value)}>
            <option value="">اختر المقاس</option>
            {product.sizes?.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

// ============================================
// 3️⃣ استخدام CacheManager مباشرة (متقدم)
// ============================================

import { cacheManager, cartManager } from './lib/cacheManager';

export function AdvancedCacheExample() {
  const handleManualCache = () => {
    // تخزين بيانات مخصصة
    cacheManager.set('user_preferences', {
      theme: 'dark',
      language: 'ar',
      notifications: true,
    }, 30 * 24 * 60 * 60 * 1000); // 30 يوم

    // الحصول على البيانات
    const preferences = cacheManager.get('user_preferences');
    console.log('التفضيلات المحفوظة:', preferences);

    // الحصول على إحصائيات الـ Cache
    const stats = cacheManager.getStats();
    console.log('إحصائيات الـ Cache:', stats);
  };

  const handleCartStats = () => {
    const count = cartManager.getCartCount();
    const total = cartManager.getCartTotal();
    console.log(`السلة: ${count} عنصر، الإجمالي: ${total}`);
  };

  return (
    <div>
      <button onClick={handleManualCache}>عرض إحصائيات الـ Cache</button>
      <button onClick={handleCartStats}>عرض إحصائيات السلة</button>
    </div>
  );
}

// ============================================
// 4️⃣ كيفية تحديث App.tsx الرئيسي
// ============================================

/*
في App.tsx، استبدل رمز إدارة السلة التقليدي بـ:

BEFORE (بدون Cache):
--------------------
function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // السلة تُفقد عند تحديث الصفحة ❌
  
  const addToCart = (item: CartItem) => {
    setCart([...cart, item]);
  };
}

AFTER (مع Cache):
--------------------
function App() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    getCartCount,
    getCartTotal,
  } = useCart();
  
  // السلة تُحفظ تلقائياً! ✅
  
  return (
    <>
      <Navbar cartCount={getCartCount()} />
      <CartSidebar cart={cart} onRemove={removeFromCart} />
      {/* باقي الكود */}
    </>
  );
}
*/

// ============================================
// 5️⃣ مثال متقدم: مزامنة بين الـ Tabs
// ============================================

import { useLocalStorageSync, useCleanupCache } from './lib/hooks';
import { useState } from 'react';

export function MultiTabSyncDemo() {
  const [syncedData, setSyncedData] = useState<any>(null);
  const { cleanup } = useCleanupCache();

  // مزامنة البيانات من tabs أخرى
  useLocalStorageSync('products_cache', (data) => {
    console.log('تحديث من tab آخر:', data);
    setSyncedData(data);
  });

  return (
    <div>
      <h3>بيانات مزامنة من tabs أخرى:</h3>
      {syncedData && <pre>{JSON.stringify(syncedData, null, 2)}</pre>}
      
      <button onClick={() => cleanup()}>
        تنظيف الـ Cache
      </button>
    </div>
  );
}

// ============================================
// 6️⃣ الفوائد الرئيسية
// ============================================

/*
✅ تقليل الطلبات للخادم
   - لا تحتاج لطلب المنتجات كل مرة (5 دقائق كافية)
   
✅ أداء أسرع
   - البيانات من الذاكرة أسرع 1000x من الشبكة
   
✅ تجربة مستخدم أفضل
   - السلة تبقى حتى بعد تحديث الصفحة
   - المعلومات تحمل بسرعة
   
✅ عمل بدون إنترنت
   - يمكنك مراجعة السلة والمنتجات حتى بدون اتصال
   
✅ توفير استهلاك البيانات
   - تقليل عمليات تحميل البيانات من الخادم
   
✅ سهل الاستخدام
   - Hooks بسيطة وأنيقة
   - تكامل سهل مع الكود الموجود
*/
