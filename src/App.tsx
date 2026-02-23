/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Instagram, 
  Phone, 
  MapPin, 
  Truck, 
  CreditCard,
  Plus,
  Minus,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Product, CartItem, Wilaya, Category, SiteSettings, AboutUsContent } from './types';
import { PRODUCTS as MOCK_PRODUCTS, CATEGORIES as MOCK_CATEGORIES, WILAYAS as MOCK_WILAYAS, MUNICIPALITIES, LOGO_URL } from './constants';
import { fetchProducts, fetchWilayas, createOrder, fetchCategories, fetchSiteSettings, fetchAboutUs } from './lib/api';

// --- Components ---

const AnnouncementBar = ({ text }: { text?: string }) => (
  <div className="bg-black text-white py-2 text-center text-xs md:text-sm font-medium tracking-wide">
    {text || "توصيل متوفر لكل ولايات الوطن مع دفع عند استلام"}
  </div>
);

const Navbar = ({ 
  onCartOpen, 
  cartCount, 
  onNavigate,
  siteSettings
}: { 
  onCartOpen: () => void; 
  cartCount: number;
  onNavigate: (page: string, params?: any) => void;
  siteSettings: SiteSettings | null;
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' : 'bg-white py-4 border-b border-black/5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2">
          <img src={siteSettings?.logo_url || LOGO_URL} alt="Logo" className="h-10 w-10 object-contain" />
          <span className="font-serif font-bold text-xl tracking-tighter hidden sm:block">{siteSettings?.site_name || "PAPILLON"}</span>
        </button>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest">
          <button onClick={() => onNavigate('home')} className="hover:opacity-50 transition-opacity">الرئيسية</button>
          <button onClick={() => onNavigate('all')} className="hover:opacity-50 transition-opacity">المتجر</button>
          <button onClick={() => onNavigate('about')} className="hover:opacity-50 transition-opacity">من نحن</button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={onCartOpen}
            className="relative p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <button className="md:hidden p-2 hover:bg-black/5 rounded-full">
            <Menu size={22} />
          </button>
        </div>
      </div>
    </nav>
  );
};

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  key?: React.Key;
}

const ProductCard = ({ product, onClick }: ProductCardProps) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="group cursor-pointer"
    onClick={onClick}
  >
    <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-4">
      <img 
        src={product.images[0]} 
        alt={product.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      {product.discount_price && (
        <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
          تخفيض
        </span>
      )}
    </div>
    <h3 className="text-sm font-medium mb-1">{product.name}</h3>
    <div className="flex items-center gap-2">
      {product.discount_price ? (
        <>
          <p className="text-sm font-bold text-red-600">{product.discount_price.toLocaleString()} دج</p>
          <p className="text-xs text-neutral-400 line-through">{product.price.toLocaleString()} دج</p>
        </>
      ) : (
        <p className="text-sm text-neutral-500">{product.price.toLocaleString()} دج</p>
      )}
    </div>
  </motion.div>
);

const CartDrawer = ({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemove,
  onCheckout
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  items: CartItem[];
  onUpdateQuantity: (id: string, size: string, color: string, delta: number) => void;
  onRemove: (id: string, size: string, color: string) => void;
  onCheckout: () => void;
}) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
            dir="rtl"
          >
            <div className="p-6 border-bottom flex items-center justify-between">
              <h2 className="text-xl font-bold">سلة التسوق</h2>
              <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                  <ShoppingBag size={48} className="mb-4 opacity-20" />
                  <p>سلتك فارغة حالياً</p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4">
                    <img src={item.images[0]} alt={item.name} className="w-20 h-24 object-cover bg-neutral-100" />
                    <div className="flex-1">
                      <h3 className="text-sm font-bold">{item.name}</h3>
                      <p className="text-xs text-neutral-500 mb-2">
                        المقاس: {item.selectedSize} | اللون: {item.selectedColor}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-neutral-200 rounded">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.selectedColor, -1)}
                            className="p-1 hover:bg-neutral-50"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.selectedColor, 1)}
                            className="p-1 hover:bg-neutral-50"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="text-sm font-bold">{(item.price * item.quantity).toLocaleString()} دج</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t bg-neutral-50">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-neutral-500">المجموع الفرعي</span>
                  <span className="text-xl font-bold">{total.toLocaleString()} دج</span>
                </div>
                <button 
                  onClick={onCheckout}
                  className="w-full bg-black text-white py-4 font-bold tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                >
                  إتمام الطلب <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Pages ---

const HomePage = ({ 
  onNavigate, 
  products, 
  categories, 
  siteSettings 
}: { 
  onNavigate: (page: string, params?: any) => void; 
  products: Product[];
  categories: Category[];
  siteSettings: SiteSettings | null;
}) => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img 
            src={siteSettings?.hero_image_url || "https://picsum.photos/seed/luxury-hero/1920/1080"} 
            alt="Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
        
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-5xl md:text-8xl font-serif font-bold mb-6 tracking-tighter"
          >
            {siteSettings?.hero_title || "PAPILLON"}
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto font-light"
          >
            {siteSettings?.hero_subtitle || "اكتشف مجموعتنا الجديدة المصممة خصيصاً لمن يبحث عن التميز والرقي."}
          </motion.p>
          <motion.button 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            onClick={() => onNavigate('all')}
            className="bg-white text-black px-10 py-4 font-bold tracking-widest hover:bg-black hover:text-white transition-all duration-300"
          >
            تسوق الآن
          </motion.button>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-bold mb-4">تسوق حسب الصنف</h2>
          <div className="w-20 h-1 bg-black mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <motion.div 
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              onClick={() => onNavigate('category', { id: cat.id })}
              className="relative aspect-[4/5] overflow-hidden group cursor-pointer"
            >
              <img src={cat.image_url || `https://picsum.photos/seed/${cat.id}/800/1000`} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-3xl font-bold tracking-widest uppercase">{cat.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products Strip */}
      <section className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-serif font-bold">وصلنا حديثاً</h2>
            <button onClick={() => onNavigate('all')} className="text-sm font-bold border-b border-black pb-1 hover:opacity-50 transition-opacity">مشاهدة الكل</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.slice(0, 4).map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => onNavigate('product', { id: product.id })} 
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const ProductDetailPage = ({ 
  productId, 
  onAddToCart,
  onNavigate,
  products,
  wilayas,
  categories
}: { 
  productId: string; 
  onAddToCart: (item: CartItem) => void;
  onNavigate: (page: string, params?: any) => void;
  products: Product[];
  wilayas: Wilaya[];
  categories: Category[];
}) => {
  const product = products.find(p => p.id === productId);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showQuickOrder, setShowQuickOrder] = useState(false);
  const quickOrderRef = React.useRef<HTMLDivElement>(null);

  // Form state for Quick Order
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    wilayaId: '',
    municipalityName: '',
    deliveryType: 'home' as 'home' | 'post',
    address: ''
  });

  if (!product) return <div>Product not found</div>;

  const variants = product.variants || [];
  const hasVariants = variants.length > 0;

  // Derived state for available options
  const availableSizes = useMemo(() => {
    if (!hasVariants) return product.sizes;
    if (selectedColor) {
      return Array.from(new Set(variants
        .filter(v => v.color_name === selectedColor && v.quantity > 0)
        .map(v => v.size)));
    }
    return Array.from(new Set(variants.filter(v => v.quantity > 0).map(v => v.size)));
  }, [product, selectedColor, hasVariants, variants]);

  const availableColors = useMemo(() => {
    if (!hasVariants) return product.colors;
    if (selectedSize) {
      const filtered = variants.filter(v => v.size === selectedSize && v.quantity > 0);
      const map = new Map();
      filtered.forEach(v => map.set(v.color_name, { name: v.color_name, hex: v.color_hex }));
      return Array.from(map.values());
    }
    const map = new Map();
    variants.filter(v => v.quantity > 0).forEach(v => map.set(v.color_name, { name: v.color_name, hex: v.color_hex }));
    return Array.from(map.values());
  }, [product, selectedSize, hasVariants, variants]);

  const maxQuantity = useMemo(() => {
    if (!hasVariants) return 10;
    if (selectedSize && selectedColor) {
      const variant = variants.find(v => v.size === selectedSize && v.color_name === selectedColor);
      return variant ? variant.quantity : 0;
    }
    return 1;
  }, [product, selectedSize, selectedColor, hasVariants, variants]);

  // Reset selection if not available
  useEffect(() => {
    if (selectedSize && !availableSizes.includes(selectedSize)) {
      setSelectedSize('');
    }
  }, [availableSizes, selectedSize]);

  useEffect(() => {
    if (selectedColor && !availableColors.some(c => c.name === selectedColor)) {
      setSelectedColor('');
    }
  }, [availableColors, selectedColor]);

  const isSelectionComplete = selectedSize !== '' && selectedColor !== '';
  
  const selectedWilaya = useMemo(() => wilayas.find(w => w.id === formData.wilayaId), [formData.wilayaId, wilayas]);
  const deliveryFee = selectedWilaya ? (formData.deliveryType === 'home' ? selectedWilaya.deliveryHome : selectedWilaya.deliveryPost) : 0;
  const total = (product.price * quantity) + deliveryFee;

  const handleQuickOrderClick = () => {
    setShowQuickOrder(true);
    setTimeout(() => {
      quickOrderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleQuickOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWilaya) return;

    try {
      const orderItem: CartItem = {
        ...product,
        selectedSize,
        selectedColor,
        quantity
      };

      await createOrder({
        customer_name: `${formData.firstName} ${formData.lastName}`,
        phone_number: formData.phone,
        wilaya_id: parseInt(formData.wilayaId),
        municipality: formData.municipalityName,
        address: formData.address,
        delivery_type: formData.deliveryType,
        total_amount: total,
        items: [orderItem]
      });

      onNavigate('success');
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
    }
  };

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[3/4] bg-neutral-100 overflow-hidden">
            <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-4">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`w-20 h-24 border-2 transition-colors ${activeImage === idx ? 'border-black' : 'border-transparent'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <button 
            onClick={() => onNavigate('category', { id: product.category })}
            className="text-xs text-neutral-400 uppercase tracking-widest mb-2 hover:text-black transition-colors text-right"
          >
            {categories.find(c => c.id === product.category)?.name}
          </button>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <div className="flex items-center gap-4 mb-8">
            {product.discount_price ? (
              <>
                <p className="text-2xl font-bold text-red-600">{product.discount_price.toLocaleString()} دج</p>
                <p className="text-xl text-neutral-400 line-through">{product.price.toLocaleString()} دج</p>
              </>
            ) : (
              <p className="text-2xl font-light">{product.price.toLocaleString()} دج</p>
            )}
          </div>
          
          <div className="space-y-8 mb-12">
            {/* Sizes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-4">المقاس <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-2 border text-sm transition-all ${
                      selectedSize === size ? 'bg-black text-white border-black' : 'border-neutral-200 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
                {availableSizes.length === 0 && <p className="text-sm text-neutral-400">لا توجد مقاسات متوفرة</p>}
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-4">اللون <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`px-6 py-2 border text-sm transition-all ${
                      selectedColor === color.name ? 'bg-black text-white border-black' : 'border-neutral-200 hover:border-black'
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
                {availableColors.length === 0 && <p className="text-sm text-neutral-400">لا توجد ألوان متوفرة</p>}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-4">
                الكمية 
                {hasVariants && isSelectionComplete && (
                  <span className={`font-normal mr-2 ${maxQuantity > 5 ? 'text-green-600' : maxQuantity > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                    ({maxQuantity > 5 ? 'متوفر' : maxQuantity > 0 ? 'منخفض' : 'غير متوفر'})
                  </span>
                )}
              </label>
              <div className="flex items-center border border-neutral-200 w-fit rounded">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-neutral-50"><Minus size={18} /></button>
                <span className="px-8 font-bold">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))} className="p-3 hover:bg-neutral-50" disabled={quantity >= maxQuantity}><Plus size={18} /></button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button 
              disabled={!isSelectionComplete}
              onClick={() => onAddToCart({ ...product, selectedSize, selectedColor, quantity })}
              className={`w-full py-5 font-bold tracking-widest transition-all ${
                isSelectionComplete 
                ? 'bg-neutral-100 text-black hover:bg-neutral-200' 
                : 'bg-neutral-50 text-neutral-300 cursor-not-allowed'
              }`}
            >
              إضافة إلى السلة
            </button>
            <button 
              disabled={!isSelectionComplete}
              onClick={handleQuickOrderClick}
              className={`w-full py-5 font-bold tracking-widest transition-all ${
                isSelectionComplete 
                ? 'bg-black text-white hover:bg-neutral-800' 
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              طلب سريع الآن
            </button>
          </div>

          {!isSelectionComplete && (
            <p className="text-xs text-red-500 mb-6 animate-pulse">يرجى اختيار المقاس واللون للمتابعة</p>
          )}

          <div className="border-t pt-8 space-y-4 text-sm text-neutral-600 leading-relaxed">
            <p>{product.description}</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2"><Truck size={16} /> توصيل سريع لجميع الولايات</li>
              <li className="flex items-center gap-2"><CreditCard size={16} /> الدفع عند الاستلام</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Order Form Section */}
      <AnimatePresence>
        {showQuickOrder && isSelectionComplete && (
          <motion.div 
            ref={quickOrderRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-neutral-50 p-8 md:p-12 border border-neutral-200"
          >
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold mb-2">نموذج الطلب السريع</h2>
                <p className="text-neutral-500">املأ المعلومات التالية لتأكيد طلبك فوراً</p>
              </div>

              <form onSubmit={handleQuickOrder} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase">اللقب</label>
                      <input 
                        required
                        className="w-full border border-neutral-200 p-3 focus:border-black outline-none transition-colors bg-white"
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase">الاسم</label>
                      <input 
                        required
                        className="w-full border border-neutral-200 p-3 focus:border-black outline-none transition-colors bg-white"
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase">رقم الهاتف</label>
                    <input 
                      required
                      type="tel"
                      className="w-full border border-neutral-200 p-3 focus:border-black outline-none transition-colors bg-white"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase">الولاية</label>
                      <select 
                        required
                        className="w-full border border-neutral-200 p-3 focus:border-black outline-none transition-colors bg-white"
                        value={formData.wilayaId}
                        onChange={e => setFormData({...formData, wilayaId: e.target.value, municipalityName: ''})}
                      >
                        <option value="">اختر الولاية</option>
                        {wilayas.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase">البلدية</label>
                      <input 
                        required
                        placeholder="اكتب اسم البلدية"
                        className="w-full border border-neutral-200 p-3 focus:border-black outline-none transition-colors bg-white"
                        value={formData.municipalityName}
                        onChange={e => setFormData({...formData, municipalityName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase">طريقة التوصيل</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, deliveryType: 'home'})}
                        className={`p-4 border flex flex-col items-center gap-2 transition-all ${
                          formData.deliveryType === 'home' ? 'border-black bg-black text-white' : 'border-neutral-200 bg-white hover:border-black'
                        }`}
                      >
                        <Truck size={20} />
                        <span className="text-sm font-bold">توصيل للمنزل</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, deliveryType: 'post'})}
                        className={`p-4 border flex flex-col items-center gap-2 transition-all ${
                          formData.deliveryType === 'post' ? 'border-black bg-black text-white' : 'border-neutral-200 bg-white hover:border-black'
                        }`}
                      >
                        <MapPin size={20} />
                        <span className="text-sm font-bold">مكتب البريد</span>
                      </button>
                    </div>
                  </div>

                  {formData.deliveryType === 'home' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase">عنوان المنزل</label>
                      <textarea 
                        required
                        className="w-full border border-neutral-200 p-3 focus:border-black outline-none transition-colors bg-white min-h-[80px]"
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                <div className="bg-white p-8 border border-neutral-200 h-fit">
                  <h3 className="font-bold mb-6">تفاصيل الطلب</h3>
                  <div className="space-y-4 text-sm mb-8">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">المنتج:</span>
                      <span className="font-bold">{product.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">المتغيرات:</span>
                      <span>{selectedSize} / {selectedColor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">الكمية:</span>
                      <span>{quantity}</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between">
                      <span className="text-neutral-500">سعر المنتج:</span>
                      <span>{(product.price * quantity).toLocaleString()} دج</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">سعر التوصيل:</span>
                      <span>{deliveryFee.toLocaleString()} دج</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between text-lg font-bold">
                      <span>الإجمالي:</span>
                      <span>{total.toLocaleString()} دج</span>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-black text-white py-5 font-bold tracking-widest hover:bg-neutral-800 transition-colors"
                  >
                    تأكيد الطلب الآن
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CheckoutPage = ({ items, onOrderComplete, wilayas }: { items: CartItem[]; onOrderComplete: () => void; wilayas: Wilaya[] }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    instagram: '',
    wilayaId: '',
    municipalityName: '',
    deliveryType: 'home' as 'home' | 'post',
    address: ''
  });

  const selectedWilaya = useMemo(() => wilayas.find(w => w.id === formData.wilayaId), [formData.wilayaId, wilayas]);
  
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = selectedWilaya ? (formData.deliveryType === 'home' ? selectedWilaya.deliveryHome : selectedWilaya.deliveryPost) : 0;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWilaya) return;

    try {
      await createOrder({
        customer_name: `${formData.firstName} ${formData.lastName}`,
        phone_number: formData.phone,
        wilaya_id: parseInt(formData.wilayaId),
        municipality: formData.municipalityName,
        address: formData.address,
        delivery_type: formData.deliveryType,
        total_amount: total,
        items: items
      });

      onOrderComplete();
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
    }
  };

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Form */}
        <div>
          <h1 className="text-3xl font-bold mb-8">معلومات الشحن</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase">اللقب</label>
                <input 
                  required
                  className="w-full border border-neutral-200 p-3 focus:border-black outline-none transition-colors"
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase">الاسم</label>
                <input 
                  required
                  className="w-full border border-neutral-200 p-3 focus:border-black outline-none transition-colors"
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase">رقم الهاتف</label>
              <input 
                required
                type="tel"
                className="w-full border border-neutral-200 p-3 focus:border-black outline-none transition-colors"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase">حساب انستغرام (اختياري)</label>
              <input 
                className="w-full border border-neutral-200 p-3 focus:border-black outline-none transition-colors"
                value={formData.instagram}
                onChange={e => setFormData({...formData, instagram: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase">الولاية</label>
                <select 
                  required
                  className="w-full border border-neutral-200 p-3 focus:border-black outline-none transition-colors bg-white"
                  value={formData.wilayaId}
                  onChange={e => setFormData({...formData, wilayaId: e.target.value, municipalityName: ''})}
                >
                  <option value="">اختر الولاية</option>
                  {wilayas.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase">البلدية</label>
                <input 
                  required
                  placeholder="اكتب اسم البلدية"
                  className="w-full border border-neutral-200 p-3 focus:border-black outline-none transition-colors bg-white"
                  value={formData.municipalityName}
                  onChange={e => setFormData({...formData, municipalityName: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase">طريقة التوصيل</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, deliveryType: 'home'})}
                  className={`p-4 border flex flex-col items-center gap-2 transition-all ${
                    formData.deliveryType === 'home' ? 'border-black bg-black text-white' : 'border-neutral-200 hover:border-black'
                  }`}
                >
                  <Truck size={20} />
                  <span className="text-sm font-bold">توصيل للمنزل</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, deliveryType: 'post'})}
                  className={`p-4 border flex flex-col items-center gap-2 transition-all ${
                    formData.deliveryType === 'post' ? 'border-black bg-black text-white' : 'border-neutral-200 hover:border-black'
                  }`}
                >
                  <MapPin size={20} />
                  <span className="text-sm font-bold">مكتب البريد</span>
                </button>
              </div>
            </div>

            {formData.deliveryType === 'home' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <label className="text-xs font-bold uppercase">عنوان المنزل بالتفصيل</label>
                <textarea 
                  required
                  className="w-full border border-neutral-200 p-3 focus:border-black outline-none transition-colors min-h-[100px]"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  placeholder="رقم الباب، الشارع، الحي..."
                />
              </motion.div>
            )}

            <button 
              type="submit"
              className="w-full bg-black text-white py-5 font-bold tracking-widest hover:bg-neutral-800 transition-colors"
            >
              تأكيد الطلب
            </button>
          </form>
        </div>

        {/* Summary */}
        <div className="bg-neutral-50 p-8 h-fit">
          <h2 className="text-xl font-bold mb-8">ملخص الطلب</h2>
          <div className="space-y-4 mb-8">
            {items.map(item => (
              <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4">
                <div className="relative">
                  <img src={item.images[0]} alt="" className="w-16 h-20 object-cover" />
                  <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold">{item.name}</h3>
                  <p className="text-xs text-neutral-500">{item.selectedSize} / {item.selectedColor}</p>
                </div>
                <p className="text-sm font-bold">{(item.price * item.quantity).toLocaleString()} دج</p>
              </div>
            ))}
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">المجموع الفرعي</span>
              <span>{subtotal.toLocaleString()} دج</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">التوصيل</span>
              <span>{deliveryFee === 0 ? 'يحدد لاحقاً' : `${deliveryFee.toLocaleString()} دج`}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-4 border-t">
              <span>الإجمالي</span>
              <span>{total.toLocaleString()} دج</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuccessPage = ({ onHome }: { onHome: () => void }) => (
  <div className="py-24 flex flex-col items-center justify-center text-center px-4">
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mb-8"
    >
      <CheckCircle2 size={40} />
    </motion.div>
    <h1 className="text-4xl font-bold mb-4">تم استلام طلبك بنجاح!</h1>
    <p className="text-neutral-500 mb-12 max-w-md">
      شكراً لتسوقك معنا. سنتصل بك قريباً عبر الهاتف لتأكيد الطلب وبدء عملية الشحن.
    </p>
    <button 
      onClick={onHome}
      className="bg-black text-white px-12 py-4 font-bold tracking-widest hover:bg-neutral-800 transition-colors"
    >
      العودة للرئيسية
    </button>
  </div>
);

const AboutUsPage = ({ aboutUs }: { aboutUs: AboutUsContent | null }) => (
  <div className="py-12 md:py-20 max-w-7xl mx-auto px-4" dir="rtl">
    <div className="max-w-3xl mx-auto text-center">
      <h1 className="text-4xl font-serif font-bold mb-8">{aboutUs?.title || "من نحن"}</h1>
      <div className="w-20 h-1 bg-black mx-auto mb-12" />
      <div className="space-y-6 text-lg text-neutral-600 leading-relaxed whitespace-pre-line">
        {aboutUs?.content || `مرحباً بكم في LUXURY STORE، وجهتكم الأولى للأناقة والفخامة في قلب الجزائر.
        
        تأسس متجرنا برؤية واضحة: تقديم أرقى التصاميم العالمية والمحلية التي تجمع بين الجودة العالية والذوق الرفيع. نحن نؤمن أن الملابس ليست مجرد مظهر، بل هي تعبير عن الشخصية والتميز.
        
        نحن نفخر بتقديم خدمة توصيل احترافية تغطي كافة ولايات الوطن (58 ولاية)، مع ضمان الدفع عند الاستلام لتوفير أقصى درجات الراحة والأمان لزبائننا الكرام.
        
        فريقنا يعمل بشغف لاختيار قطع فريدة تناسب تطلعاتكم، ونسعى دائماً لتطوير خدماتنا لنكون عند حسن ظنكم دائماً.`}
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {(aboutUs?.features || [
          { title: "الجودة", description: "نختار أفضل الأقمشة والخامات لضمان ديمومة القطع." },
          { title: "الثقة", description: "الدفع عند الاستلام هو ضماننا لراحتكم." },
          { title: "التوصيل", description: "نصل إليكم أينما كنتم في ربوع الجزائر." }
        ]).map((feature, idx) => (
          <div key={idx} className="p-8 bg-neutral-50">
            <h3 className="font-bold mb-2">{feature.title}</h3>
            <p className="text-sm text-neutral-500">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AllProductsPage = ({ 
  title, 
  products, 
  onNavigate,
  categories
}: { 
  title: string; 
  products: Product[]; 
  onNavigate: (page: string, params?: any) => void;
  categories: Category[];
}) => (
  <div className="py-12 md:py-20 max-w-7xl mx-auto px-4" dir="rtl">
    <div className="mb-12">
      <h1 className="text-4xl font-serif font-bold mb-4">{title}</h1>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
      {products.map(product => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onClick={() => onNavigate('product', { id: product.id })} 
        />
      ))}
    </div>
  </div>
);

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [wilayas, setWilayas] = useState<Wilaya[]>(MOCK_WILAYAS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [aboutUs, setAboutUs] = useState<AboutUsContent | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const fetchedProducts = await fetchProducts();
      if (fetchedProducts.length > 0) {
        setProducts(fetchedProducts);
      }
      
      const fetchedWilayas = await fetchWilayas();
      if (fetchedWilayas.length > 0) {
        setWilayas(fetchedWilayas);
      }

      const fetchedCategories = await fetchCategories();
      if (fetchedCategories.length > 0) {
        setCategories(fetchedCategories);
      }

      const settings = await fetchSiteSettings();
      if (settings) {
        setSiteSettings(settings);
      }

      const about = await fetchAboutUs();
      if (about) {
        setAboutUs(about);
      }
    };
    loadData();
  }, []);

  const navigate = (page: string, params: any = null) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo(0, 0);
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => 
        i.id === item.id && 
        i.selectedSize === item.selectedSize && 
        i.selectedColor === item.selectedColor
      );
      if (existing) {
        return prev.map(i => 
          i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, size: string, color: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.selectedSize === size && item.selectedColor === color) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string, size: string, color: string) => {
    setCart(prev => prev.filter(item => 
      !(item.id === id && item.selectedSize === size && item.selectedColor === color)
    ));
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} products={products} categories={categories} siteSettings={siteSettings} />;
      case 'all':
        return <AllProductsPage title="جميع المنتجات" products={products} onNavigate={navigate} categories={categories} />;
      case 'category':
        const catProducts = products.filter(p => p.category === pageParams.id);
        const catName = categories.find(c => c.id === pageParams.id)?.name || '';
        return <AllProductsPage title={catName} products={catProducts} onNavigate={navigate} categories={categories} />;
      case 'product':
        return <ProductDetailPage productId={pageParams.id} onAddToCart={addToCart} onNavigate={navigate} products={products} wilayas={wilayas} categories={categories} />;
      case 'checkout':
        return <CheckoutPage items={cart} onOrderComplete={() => { setCart([]); navigate('success'); }} wilayas={wilayas} />;
      case 'success':
        return <SuccessPage onHome={() => navigate('home')} />;
      case 'about':
        return <AboutUsPage aboutUs={aboutUs} />;
      default:
        return <HomePage onNavigate={navigate} products={products} categories={categories} siteSettings={siteSettings} />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-black selection:bg-black selection:text-white">
      <AnnouncementBar text={siteSettings?.announcement_text} />
      <Navbar 
        onCartOpen={() => setIsCartOpen(true)} 
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        onNavigate={navigate}
        siteSettings={siteSettings}
      />
      
      <main>
        {renderPage()}
      </main>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={() => { setIsCartOpen(false); navigate('checkout'); }}
      />

      {/* Footer */}
      <footer className="bg-black text-white py-24" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img src={siteSettings?.logo_url || LOGO_URL} alt="Logo" className="h-12 w-12 object-contain" />
              <span className="font-serif font-bold text-2xl tracking-tighter">{siteSettings?.site_name || "PAPILLON"}</span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed">
              وجهتكم الأولى للأناقة والفخامة في الجزائر. نوفر لكم أجود أنواع الملابس مع خدمة توصيل احترافية لجميع الولايات.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm">روابط سريعة</h4>
            <ul className="space-y-4 text-neutral-400 text-sm">
              <li><button onClick={() => navigate('home')} className="hover:text-white transition-colors">الرئيسية</button></li>
              <li><button onClick={() => navigate('all')} className="hover:text-white transition-colors">المتجر</button></li>
              <li><button onClick={() => navigate('about')} className="hover:text-white transition-colors">من نحن</button></li>
              <li><button className="hover:text-white transition-colors">سياسة الاستبدال</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm">تواصل معنا</h4>
            <ul className="space-y-4 text-neutral-400 text-sm">
              <li className="flex items-center gap-2"><Phone size={16} /> 0555 00 00 00</li>
              <li className="flex items-center gap-2"><Instagram size={16} /> @luxury_store_dz</li>
              <li className="flex items-center gap-2"><MapPin size={16} /> الجزائر العاصمة</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm">النشرة البريدية</h4>
            <p className="text-neutral-400 text-sm mb-4">اشترك ليصلك كل جديد عن عروضنا ومجموعاتنا الجديدة.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="بريدك الإلكتروني" 
                className="bg-neutral-900 border-none p-3 text-sm flex-1 outline-none focus:ring-1 ring-white/20"
              />
              <button className="bg-white text-black px-4 font-bold text-xs uppercase tracking-widest">اشترك</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-24 pt-8 border-t border-white/10 text-center text-neutral-500 text-xs">
          &copy; {new Date().getFullYear()} {siteSettings?.site_name || "LUXURY STORE DZ"}. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}
