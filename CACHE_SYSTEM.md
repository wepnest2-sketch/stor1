# نظام التخزين المؤقت (Caching System)

## المحتويات
- CacheManager: نظام تخزين عام للبيانات
- CartManager: نظام إدارة سلة التسوق
- React Hooks: للعمل السهل مع الـ Cache في React

---

## 📦 CacheManager

### الوصف
نظام تخزين مؤقت يجمع بين:
- **Memory Cache**: تخزين سريع في الذاكرة
- **LocalStorage**: تخزين دائم في المتصفح
- **TTL**: انتهاء الصلاحية تلقائياً

### الاستخدام

```typescript
import { cacheManager } from './lib/cacheManager';

// تخزين البيانات
cacheManager.set('my_key', { name: 'أحمد', age: 25 }, 5 * 60 * 1000); // 5 دقائق

// الحصول على البيانات
const data = cacheManager.get('my_key');

// حذف مفتاح معين
cacheManager.delete('my_key');

// تفريغ جميع البيانات
cacheManager.clear();

// تحديث مدخل (تحديث التاريخ فقط)
cacheManager.refresh('my_key');
```

### الخيارات

```typescript
const cacheManager = new CacheManager({
  useLocalStorage: true,       // تفعيل localStorage
  ttl: 5 * 60 * 1000          // مدة الصلاحية الافتراضية (5 دقائق)
});
```

---

## 🛒 CartManager

### الوصف
نظام متخصص لإدارة سلة التسوق مع تخزين دائم

### الاستخدام

```typescript
import { cartManager } from './lib/cacheManager';

// إضافة منتج للسلة
cartManager.addItem({
  id: 'prod_1',
  name: 'فستان',
  price: 5000,
  selectedSize: 'M',
  quantity: 1
});

// الحصول على السلة
const cart = cartManager.getCart();

// تحديث الكمية
cartManager.updateItemQuantity('prod_1', 2);

// إزالة منتج
cartManager.removeItem('prod_1');

// الحصول على إجمالي العناصر
const count = cartManager.getCartCount();

// الحصول على إجمالي السعر
const total = cartManager.getCartTotal();

// تفريغ السلة
cartManager.clearCart();
```

---

## ⚛️ React Hooks

### 1. useCachedData - Hook عام للـ Cache

```typescript
import { useCachedData } from './lib/hooks';
import { fetchProducts } from './lib/api';

function ProductsPage() {
  const { data: products, loading, error, refresh } = useCachedData(
    'products_key',
    fetchProducts,
    { ttl: 10 * 60 * 1000 } // 10 دقائق
  );

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error.message}</div>;

  return (
    <div>
      {products?.map(p => (
        <div key={p.id}>{p.name}</div>
      ))}
      <button onClick={refresh}>تحديث</button>
    </div>
  );
}
```

### 2. useCart - Hook لسلة التسوق

```typescript
import { useCart } from './lib/hooks';

function ShoppingCart() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    getCartCount,
    getCartTotal
  } = useCart();

  return (
    <div>
      <p>عدد العناصر: {getCartCount()}</p>
      <p>المجموع: {getCartTotal()} د.ج</p>
      
      {cart.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value))}
          />
          <button onClick={() => removeFromCart(item.id)}>حذف</button>
        </div>
      ))}

      <button onClick={clearCart}>حذف الكل</button>
    </div>
  );
}
```

### 3. useLocalStorageSync - مزامنة بين الـ Tabs

```typescript
import { useLocalStorageSync } from './lib/hooks';

function App() {
  useLocalStorageSync('products_key', (newData) => {
    // عند تحديث البيانات من tab آخر
    console.log('بيانات جديدة من tab آخر:', newData);
  });

  return <div>...</div>;
}
```

### 4. useCleanupCache - تنظيف الـ Cache

```typescript
import { useCleanupCache } from './lib/hooks';

function Admin() {
  const { cleanup } = useCleanupCache(['temp_', 'session_']);

  return (
    <button onClick={cleanup}>
      تنظيف الـ Cache المؤقت
    </button>
  );
}
```

### 5. useCacheStats - معلومات الـ Cache

```typescript
import { useCacheStats } from './lib/hooks';

function CacheDebugger() {
  const { stats, refresh } = useCacheStats();

  return (
    <div>
      <p>حجم Memory Cache: {stats.memoryCacheSize}</p>
      <button onClick={refresh}>تحديث الإحصائيات</button>
    </div>
  );
}
```

---

## 🔄 الاستخدام في App.tsx

يمكنك تحديث `App.tsx` لاستخدام `useCart` بدلاً من `useState` العادي:

```typescript
function App() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    getCartCount,
    getCartTotal,
  } = useCart();

  // الآن السلة ستُحفظ تلقائياً في localStorage
  // وستبقى حتى بعد تحديث الصفحة!

  return (
    // ... باقي الكود
  );
}
```

---

## 📊 مخطط البيانات

```
┌─────────────────────────────────┐
│     Component (React)           │
├─────────────────────────────────┤
          ↓
┌─────────────────────────────────┐
│   Hooks (useCachedData, ...)    │
├─────────────────────────────────┤
          ↓
┌─────────────────────────────────┐
│   CartManager / CacheManager    │
├─────────────────────────────────┤
    ↙              ↘
┌──────────────┐  ┌──────────────┐
│   Memory     │  │ LocalStorage │
│   Cache      │  │   (Browser)  │
└──────────────┘  └──────────────┘
    ↙              ↘
┌─────────────────────────────────┐
│   API / Supabase (إذا لزم)     │
├─────────────────────────────────┤
```

---

## ⚡ الفوائد

✅ **تقليل الطلبات**: لا تطلب من قاعدة البيانات إذا كانت البيانات محفوظة
✅ **أداء أسرع**: البيانات من الذاكرة أسرع بـ 1000x من الشبكة
✅ **عمل بلا إنترنت**: يمكن الوصول للبيانات المحفوظة حتى بدون اتصال
✅ **تجربة مستخدم أفضل**: السلة تبقى حتى بعد تحديث الصفحة
✅ **سهل الاستخدام**: Hooks بسيطة وأنيقة

---

## 📝 ملاحظات مهمة

1. **مساحة التخزين**: LocalStorage محدود بـ ~5-10MB (حسب المتصفح)
2. **AAA الدقة**: البيانات في LocalStorage = ضعيفة التشفير، لا تحفظ كلمات مرور
3. **TTL**: البيانات تُحذف تلقائياً بعد انتهاء الصلاحية
4. **Cleanup**: استخدم `useCleanupCache` لتنظيف البيانات القديمة

---

## 🔗 الملفات المستخدمة

- `src/lib/cacheManager.ts` - نظام الـ Cache
- `src/lib/hooks.ts` - React Hooks
- `src/lib/api.ts` - دوال جلب البيانات (محدثة)
