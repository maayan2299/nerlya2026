import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Trash2, Edit3, Save, X, Package, TrendingUp, Upload, Image as ImageIcon, Tag, Images, LogOut, Eye, EyeOff, Folder, Filter } from 'lucide-react';

// Supabase Configuration
const supabaseUrl = 'https://ormbbartqrpgtsmoqxhm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybWJiYXJ0cXJwZ3RzbW9xeGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NTQwMzMsImV4cCI6MjA4MzUzMDAzM30.vcddF1aQahJTZfv7GNK7_onPR2dt-l_dmDCzEt-EnAg';
const supabase = createClient(supabaseUrl, supabaseKey);

// Simple authentication
const ADMIN_USERNAME = 'nerlya';
const ADMIN_PASSWORD = 'nerlya2026';

const AdminDashboard = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem('nerlya_admin_auth');
    if (authToken === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === ADMIN_USERNAME && loginForm.password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('nerlya_admin_auth', 'authenticated');
      setLoginError('');
    } else {
      setLoginError('שם משתמש או סיסמה שגויים');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('nerlya_admin_auth');
    setLoginForm({ username: '', password: '' });
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        fontFamily: '"Heebo", sans-serif',
        direction: 'rtl',
        padding: '20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          background: '#fff',
          border: '2px solid #000',
          padding: '40px',
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>נר-ליה</h1>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '32px', textAlign: 'center' }}>דשבורד ניהול</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>שם משתמש</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                style={{ width: '100%', padding: '12px', border: '1px solid #000', fontSize: '14px', fontFamily: 'inherit' }}
                placeholder="הכנס שם משתמש"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>סיסמה</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  style={{ width: '100%', padding: '12px', paddingLeft: '40px', border: '1px solid #000', fontSize: '14px', fontFamily: 'inherit' }}
                  placeholder="הכנס סיסמה"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div style={{ padding: '12px', background: '#ffebee', border: '1px solid #f44336', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
                {loginError}
              </div>
            )}

            <button type="submit" style={{ width: '100%', padding: '14px', background: '#000', color: '#fff', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
              כניסה
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <MainDashboard onLogout={handleLogout} />;
};

const MainDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editData, setEditData] = useState({});
  
  // Category management
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryData, setEditCategoryData] = useState({});
  const [newCategory, setNewCategory] = useState({ name: '', name_en: '' });
  
  // Image management states
  const [managingImages, setManagingImages] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [newImageFile, setNewImageFile] = useState(null);
  
  // Color management states
  const [managingColors, setManagingColors] = useState(null);
  const [productColors, setProductColors] = useState([]);
  const [newColor, setNewColor] = useState({ name: '', code: '' });
  
  // Form states
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category_id: '',
    stock_quantity: 0,
    allows_engraving: false,
    image: null,
    is_active: true
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadProducts(), loadCategories()]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const loadProducts = async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          categories (id, name),
          product_images (id, image_url, is_primary),
          product_colors (id)
        `)
        .order('created_at', { ascending: false });
      
      if (productsError) throw productsError;

      const processedProducts = productsData.map(product => ({
        ...product,
        category_name: product.categories?.name || 'ללא קטגוריה',
        primary_image: product.product_images?.find(img => img.is_primary)?.image_url || 
                       product.product_images?.[0]?.image_url || null,
        images_count: product.product_images?.length || 0,
        colors_count: product.product_colors?.length || 0
      }));

      setProducts(processedProducts || []);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('שגיאה בטעינת המוצרים');
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProductImages = async (productId) => {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('display_order');
      
      if (error) throw error;
      setProductImages(data || []);
    } catch (error) {
      console.error('Error loading product images:', error);
      alert('שגיאה בטעינת התמונות');
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert('שגיאה בהעלאת התמונה');
        setUploading(false);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setUploading(false);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading:', error);
      setUploading(false);
      return null;
    }
  };

  const openImageManager = async (productId) => {
    setManagingImages(productId);
    await loadProductImages(productId);
  };

  const closeImageManager = () => {
    setManagingImages(null);
    setProductImages([]);
    setNewImageFile(null);
  };

  const addImageToProduct = async () => {
    if (!newImageFile || !managingImages) return;

    try {
      const imageUrl = await uploadImage(newImageFile);
      if (!imageUrl) return;

      const isPrimary = productImages.length === 0;

      const { error } = await supabase
        .from('product_images')
        .insert([{
          product_id: managingImages,
          image_url: imageUrl,
          is_primary: isPrimary,
          display_order: productImages.length
        }]);

      if (error) throw error;

      await loadProductImages(managingImages);
      await loadProducts();
      setNewImageFile(null);
      
      const fileInput = document.getElementById('manage-image-input');
      if (fileInput) fileInput.value = '';
      
      alert('התמונה נוספה בהצלחה!');
    } catch (error) {
      console.error('Error adding image:', error);
      alert('שגיאה בהוספת התמונה');
    }
  };

  const deleteImage = async (imageId, imageUrl) => {
    if (!confirm('האם למחוק את התמונה?')) return;

    try {
      const fileName = imageUrl.split('/').pop();
      await supabase.storage
        .from('product-images')
        .remove([fileName]);

      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      await loadProductImages(managingImages);
      await loadProducts();
      alert('התמונה נמחקה בהצלחה!');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('שגיאה במחיקת התמונה');
    }
  };

  const setPrimaryImage = async (imageId) => {
    try {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', managingImages);

      const { error } = await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      if (error) throw error;

      await loadProductImages(managingImages);
      await loadProducts();
      alert('התמונה הראשית עודכנה!');
    } catch (error) {
      console.error('Error setting primary image:', error);
      alert('שגיאה בעדכון התמונה הראשית');
    }
  };

  const loadProductColors = async (productId) => {
    try {
      const { data, error } = await supabase
        .from('product_colors')
        .select('*')
        .eq('product_id', productId)
        .order('display_order');
      
      if (error) throw error;
      setProductColors(data || []);
    } catch (error) {
      console.error('Error loading product colors:', error);
      alert('שגיאה בטעינת הצבעים');
    }
  };

  const openColorManager = async (productId) => {
    setManagingColors(productId);
    await loadProductColors(productId);
  };

  const closeColorManager = () => {
    setManagingColors(null);
    setProductColors([]);
    setNewColor({ name: '', code: '' });
  };

  const addColorToProduct = async () => {
    if (!newColor.name.trim() || !newColor.code.trim() || !managingColors) {
      alert('אנא מלא שם וקוד צבע');
      return;
    }

    const hexPattern = /^#?[0-9A-Fa-f]{6}$/;
    let colorCode = newColor.code.trim();
    
    if (!colorCode.startsWith('#')) {
      colorCode = '#' + colorCode;
    }
    
    if (!hexPattern.test(colorCode)) {
      alert('קוד צבע לא תקין. השתמש בפורמט: #4d4037 או 4d4037');
      return;
    }

    try {
      const { error } = await supabase
        .from('product_colors')
        .insert([{
          product_id: managingColors,
          color_name: newColor.name.trim(),
          color_code: colorCode.toLowerCase(),
          display_order: productColors.length
        }]);

      if (error) throw error;

      await loadProductColors(managingColors);
      await loadProducts();
      setNewColor({ name: '', code: '' });
      alert('הצבע נוסף בהצלחה!');
    } catch (error) {
      console.error('Error adding color:', error);
      alert('שגיאה בהוספת הצבע');
    }
  };

  const deleteColor = async (colorId) => {
    if (!confirm('האם למחוק את הצבע?')) return;

    try {
      const { error } = await supabase
        .from('product_colors')
        .delete()
        .eq('id', colorId);

      if (error) throw error;

      await loadProductColors(managingColors);
      await loadProducts();
      alert('הצבע נמחק בהצלחה!');
    } catch (error) {
      console.error('Error deleting color:', error);
      alert('שגיאה במחיקת הצבע');
    }
  };

  // Category Management Functions
  const addCategory = async () => {
    if (!newCategory.name.trim()) {
      alert('אנא הזן שם קטגוריה');
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .insert([{
          name: newCategory.name.trim(),
          name_en: newCategory.name_en.trim() || null,
          display_order: categories.length
        }]);

      if (error) throw error;

      await loadCategories();
      setNewCategory({ name: '', name_en: '' });
      alert('הקטגוריה נוספה בהצלחה!');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('שגיאה בהוספת הקטגוריה');
    }
  };

  const startEditCategory = (category) => {
    setEditingCategory(category.id);
    setEditCategoryData({
      name: category.name,
      name_en: category.name_en || ''
    });
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryData({});
  };

  const saveEditCategory = async () => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: editCategoryData.name,
          name_en: editCategoryData.name_en || null
        })
        .eq('id', editingCategory);

      if (error) throw error;

      await loadCategories();
      await loadProducts();
      setEditingCategory(null);
      setEditCategoryData({});
      alert('הקטגוריה עודכנה בהצלחה!');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('שגיאה בעדכון הקטגוריה');
    }
  };

  const deleteCategory = async (categoryId) => {
    const productsInCategory = products.filter(p => p.category_id === categoryId).length;
    
    if (productsInCategory > 0) {
      if (!confirm(`יש ${productsInCategory} מוצרים בקטגוריה זו. האם למחוק את הקטגוריה? (המוצרים יישארו ללא קטגוריה)`)) {
        return;
      }
    } else {
      if (!confirm('האם למחוק את הקטגוריה?')) return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      await loadCategories();
      await loadProducts();
      alert('הקטגוריה נמחקה בהצלחה!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('שגיאה במחיקת הקטגוריה');
    }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert('אנא מלא שם ומחיר למוצר');
      return;
    }

    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          description: newProduct.description,
          category_id: newProduct.category_id || null,
          stock_quantity: parseInt(newProduct.stock_quantity) || 0,
          allows_engraving: newProduct.allows_engraving,
          is_active: true,
          has_color_options: false,
          display_order: 0
        }])
        .select()
        .single();

      if (productError) throw productError;

      if (newProduct.image) {
        const imageUrl = await uploadImage(newProduct.image);
        
        if (imageUrl) {
          const { error: imageError } = await supabase
            .from('product_images')
            .insert([{
              product_id: productData.id,
              image_url: imageUrl,
              is_primary: true,
              display_order: 0
            }]);

          if (imageError) {
            console.error('Error saving image record:', imageError);
          }
        }
      }

      await loadProducts();
      
      setNewProduct({
        name: '',
        price: '',
        description: '',
        category_id: '',
        stock_quantity: 0,
        allows_engraving: false,
        image: null,
        is_active: true
      });
      
      const fileInput = document.getElementById('product-image-input');
      if (fileInput) fileInput.value = '';
      
      alert('המוצר נוסף בהצלחה!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('שגיאה בהוספת המוצר: ' + error.message);
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את המוצר?')) return;

    try {
      const { data: images } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', productId);

      if (images && images.length > 0) {
        for (const img of images) {
          const fileName = img.image_url.split('/').pop();
          await supabase.storage
            .from('product-images')
            .remove([fileName]);
        }
      }

      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId);

      await supabase
        .from('product_colors')
        .delete()
        .eq('product_id', productId);

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      await loadProducts();
      alert('המוצר נמחק בהצלחה!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('שגיאה במחיקת המוצר: ' + error.message);
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product.id);
    setEditData({
      name: product.name,
      price: product.price,
      description: product.description || '',
      category_id: product.category_id,
      stock_quantity: product.stock_quantity || 0,
      allows_engraving: product.allows_engraving || false,
      is_active: product.is_active
    });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setEditData({});
  };

  const saveEdit = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editData.name,
          price: parseFloat(editData.price),
          description: editData.description,
          category_id: editData.category_id,
          stock_quantity: parseInt(editData.stock_quantity) || 0,
          allows_engraving: editData.allows_engraving,
          is_active: editData.is_active
        })
        .eq('id', editingProduct);

      if (error) throw error;

      await loadProducts();
      setEditingProduct(null);
      setEditData({});
      alert('המוצר עודכן בהצלחה!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('שגיאה בעדכון המוצר: ' + error.message);
    }
  };

  const toggleProductActive = async (productId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;
      await loadProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category_id === selectedCategory)
    : products;

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.is_active).length,
    inactiveProducts: products.filter(p => !p.is_active).length,
    totalCategories: categories.length,
    lowStock: products.filter(p => (p.stock_quantity || 0) < 5).length,
    withEngraving: products.filter(p => p.allows_engraving).length
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', fontFamily: '"Heebo", sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #f0f0f0', borderTop: '4px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ fontSize: '18px', color: '#666' }}>טוען...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: '"Heebo", sans-serif', color: '#000', direction: 'rtl' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        input, select, textarea { background: #fff; border: 1px solid #000; color: #000; padding: 10px; font-family: 'Heebo', sans-serif; font-size: 14px; width: 100%; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #000; }
        button { font-family: 'Heebo', sans-serif; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-content { background: white; border: 2px solid #000; padding: 20px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; }
        @media (max-width: 768px) { .modal-content { padding: 16px; } .mobile-menu-btn { display: block !important; } .sidebar { position: fixed; top: 72px; right: ${mobileMenuOpen ? '0' : '-240px'}; height: calc(100vh - 72px); transition: right 0.3s ease; z-index: 50; } .logout-text { display: none; } table { font-size: 12px; } th, td { padding: 8px !important; } }
      `}</style>
      
      {/* Header */}
      <div style={{ background: '#000', color: '#fff', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 100, borderBottom: '2px solid #000' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px' }} className="mobile-menu-btn">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '700' }}>דשבורד נר-ליה</h1>
              <p style={{ fontSize: '12px', opacity: 0.8 }}>ניהול מוצרים</p>
            </div>
          </div>
          <button onClick={onLogout} style={{ background: '#fff', color: '#000', border: 'none', padding: '8px 16px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={16} />
            <span className="logout-text">יציאה</span>
          </button>
        </div>
      </div>

      {/* Image Manager Modal */}
      {managingImages && (
        <div className="modal-overlay" onClick={closeImageManager}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>ניהול תמונות</h2>
              <button onClick={closeImageManager} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><X size={24} /></button>
            </div>
            <div style={{ background: '#f5f5f5', padding: '16px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>הוסף תמונה</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <label style={{ flex: '1', minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fff', border: '1px solid #000', cursor: 'pointer', fontSize: '14px' }}>
                  <Upload size={16} />
                  {newImageFile ? newImageFile.name : 'בחר תמונה'}
                  <input id="manage-image-input" type="file" accept="image/*" onChange={(e) => setNewImageFile(e.target.files[0])} style={{ display: 'none' }} />
                </label>
                <button onClick={addImageToProduct} disabled={!newImageFile || uploading} style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', opacity: (!newImageFile || uploading) ? 0.5 : 1 }}>
                  {uploading ? 'מעלה...' : 'הוסף'}
                </button>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>תמונות ({productImages.length})</h3>
              {productImages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}><ImageIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} /><p>אין תמונות</p></div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                  {productImages.map((image) => (
                    <div key={image.id} style={{ position: 'relative', border: image.is_primary ? '3px solid #000' : '1px solid #ddd', overflow: 'hidden' }}>
                      <img src={image.image_url} alt="Product" style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '4px', left: '4px', display: 'flex', gap: '4px' }}>
                        <button onClick={() => deleteImage(image.id, image.image_url)} style={{ background: '#fff', border: 'none', padding: '4px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                      </div>
                      {image.is_primary ? (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#000', color: '#fff', padding: '4px', fontSize: '10px', fontWeight: '600', textAlign: 'center' }}>ראשית</div>
                      ) : (
                        <button onClick={() => setPrimaryImage(image.id)} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.9)', border: 'none', padding: '4px', fontSize: '10px', fontWeight: '600', cursor: 'pointer' }}>הגדר ראשית</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Color Manager Modal */}
      {managingColors && (
        <div className="modal-overlay" onClick={closeColorManager}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>ניהול צבעים</h2>
              <button onClick={closeColorManager} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><X size={24} /></button>
            </div>
            <div style={{ background: '#f5f5f5', padding: '16px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>הוסף צבע</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>שם הצבע</label>
                  <input type="text" value={newColor.name} onChange={(e) => setNewColor({...newColor, name: e.target.value})} placeholder="חום, כחול..." />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>קוד HEX</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="text" value={newColor.code} onChange={(e) => setNewColor({...newColor, code: e.target.value})} placeholder="4d4037" style={{ flex: 1 }} />
                    {newColor.code && <div style={{ width: '30px', height: '30px', border: '1px solid #000', backgroundColor: newColor.code.startsWith('#') ? newColor.code : `#${newColor.code}` }} />}
                  </div>
                </div>
                <button onClick={addColorToProduct} style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap' }}>הוסף</button>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>צבעים ({productColors.length})</h3>
              {productColors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}><Tag size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} /><p>אין צבעים</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {productColors.map((color) => (
                    <div key={color.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#fff', border: '1px solid #ddd' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', border: '1px solid #000', backgroundColor: color.color_code }} />
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px' }}>{color.color_name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{color.color_code}</div>
                        </div>
                      </div>
                      <button onClick={() => deleteColor(color.id)} style={{ background: '#fff', border: '1px solid #000', padding: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Sidebar */}
        <div style={{ width: '240px', background: '#f5f5f5', borderLeft: '1px solid #ddd', padding: '20px', minHeight: 'calc(100vh - 72px)' }} className="sidebar">
          {[
            { id: 'overview', icon: <TrendingUp size={18} />, label: 'סקירה' },
            { id: 'products', icon: <Package size={18} />, label: 'מוצרים' },
            { id: 'categories', icon: <Folder size={18} />, label: 'קטגוריות' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); setSelectedCategory(null); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', background: activeTab === tab.id ? '#000' : 'transparent', border: 'none', color: activeTab === tab.id ? '#fff' : '#000', cursor: 'pointer', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* Main Content */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>סקירה כללית</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {[
                  { label: 'סה"כ מוצרים', value: stats.totalProducts },
                  { label: 'מוצרים פעילים', value: stats.activeProducts },
                  { label: 'מלאי נמוך', value: stats.lowStock },
                  { label: 'עם חריטה', value: stats.withEngraving },
                  { label: 'קטגוריות', value: stats.totalCategories }
                ].map((stat, index) => (
                  <div key={index} style={{ background: '#fff', border: '2px solid #000', padding: '20px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: '500' }}>{stat.label}</div>
                    <div style={{ fontSize: '32px', fontWeight: '700' }}>{stat.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fff', border: '2px solid #000', padding: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>מוצרים אחרונים</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {products.slice(0, 5).map((product) => (
                    <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f5f5f5' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {product.primary_image ? (
                          <img src={product.primary_image} alt={product.name} style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '60px', height: '60px', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={24} color="#999" /></div>
                        )}
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px' }}>{product.name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{product.category_name} • מלאי: {product.stock_quantity || 0}{product.allows_engraving ? ' • חריטה ✓' : ''}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '700' }}>₪{product.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700' }}>ניהול מוצרים</h2>
                {categories.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Filter size={18} />
                    <select value={selectedCategory || ''} onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)} style={{ padding: '8px 12px', width: 'auto' }}>
                      <option value="">כל הקטגוריות</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name} ({products.filter(p => p.category_id === cat.id).length})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              {/* Add Product Form */}
              <div style={{ background: '#fff', border: '2px solid #000', padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18} />הוסף מוצר</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <input type="text" placeholder="שם המוצר *" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
                  <input type="number" placeholder="מחיר (₪) *" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
                  <input type="number" placeholder="כמות במלאי" value={newProduct.stock_quantity} onChange={(e) => setNewProduct({...newProduct, stock_quantity: e.target.value})} />
                  <select value={newProduct.category_id} onChange={(e) => setNewProduct({...newProduct, category_id: e.target.value})}>
                    <option value="">בחר קטגוריה</option>
                    {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </select>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <textarea placeholder="תיאור המוצר..." value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} style={{ minHeight: '60px', resize: 'vertical' }} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                    <input type="checkbox" checked={newProduct.allows_engraving} onChange={(e) => setNewProduct({...newProduct, allows_engraving: e.target.checked})} />
                    <span>מאפשר חריטה אישית (+10 ₪)</span>
                  </label>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#f5f5f5', border: '1px solid #000', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                    <Upload size={16} />
                    {newProduct.image ? newProduct.image.name : 'העלה תמונה'}
                    <input id="product-image-input" type="file" accept="image/*" onChange={(e) => setNewProduct({...newProduct, image: e.target.files[0]})} style={{ display: 'none' }} />
                  </label>
                </div>
                <button onClick={addProduct} disabled={uploading} style={{ padding: '12px 24px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', opacity: uploading ? 0.5 : 1 }}>
                  {uploading ? 'מעלה...' : 'הוסף מוצר'}
                </button>
              </div>
              
              {/* Products Table */}
              <div style={{ background: '#fff', border: '2px solid #000', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#000', color: '#fff' }}>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600' }}>תמונה</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600' }}>שם</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600' }}>מחיר</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600' }}>מלאי</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600' }}>חריטה</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600' }}>תמונות</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600' }}>צבעים</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600' }}>פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} style={{ borderBottom: '1px solid #ddd' }}>
                        {editingProduct === product.id ? (
                          <>
                            <td style={{ padding: '12px' }}></td>
                            <td style={{ padding: '12px' }} colSpan="2">
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input type="text" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} style={{ padding: '8px', fontSize: '12px' }} placeholder="שם" />
                                <textarea value={editData.description || ''} onChange={(e) => setEditData({...editData, description: e.target.value})} style={{ padding: '8px', fontSize: '12px', minHeight: '60px' }} placeholder="תיאור" />
                                <input type="number" value={editData.price} onChange={(e) => setEditData({...editData, price: e.target.value})} style={{ padding: '8px', fontSize: '12px' }} placeholder="מחיר" />
                              </div>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <input type="number" value={editData.stock_quantity} onChange={(e) => setEditData({...editData, stock_quantity: e.target.value})} style={{ padding: '8px', fontSize: '12px', width: '80px' }} />
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <input type="checkbox" checked={editData.allows_engraving} onChange={(e) => setEditData({...editData, allows_engraving: e.target.checked})} />
                            </td>
                            <td style={{ padding: '12px' }}></td>
                            <td style={{ padding: '12px' }}></td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                <button onClick={saveEdit} style={{ background: '#000', color: '#fff', border: 'none', padding: '6px', cursor: 'pointer' }}><Save size={14} /></button>
                                <button onClick={cancelEdit} style={{ background: '#fff', color: '#000', border: '1px solid #000', padding: '6px', cursor: 'pointer' }}><X size={14} /></button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td style={{ padding: '12px' }}>
                              {product.primary_image ? (
                                <img src={product.primary_image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '50px', height: '50px', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={20} color="#999" /></div>
                              )}
                            </td>
                            <td style={{ padding: '12px', fontWeight: '600', fontSize: '14px' }}>{product.name}</td>
                            <td style={{ padding: '12px', fontWeight: '600', fontSize: '14px' }}>₪{product.price}</td>
                            <td style={{ padding: '12px', fontSize: '14px' }}>
                              <span style={{ padding: '4px 8px', background: (product.stock_quantity || 0) < 5 ? '#ffebee' : '#f5f5f5', color: (product.stock_quantity || 0) < 5 ? '#c62828' : '#000', fontSize: '12px', fontWeight: '600' }}>
                                {product.stock_quantity || 0}
                              </span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              {product.allows_engraving ? <span style={{ fontSize: '18px' }}>✓</span> : '-'}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <button onClick={() => openImageManager(product.id)} style={{ background: '#f5f5f5', border: '1px solid #000', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Images size={14} />
                                {product.images_count}
                              </button>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <button onClick={() => openColorManager(product.id)} style={{ background: '#f5f5f5', border: '1px solid #000', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Tag size={14} />
                                {product.colors_count || 0}
                              </button>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                <button onClick={() => startEdit(product)} style={{ background: '#fff', border: '1px solid #000', padding: '6px', cursor: 'pointer' }}><Edit3 size={14} /></button>
                                <button onClick={() => deleteProduct(product.id)} style={{ background: '#fff', border: '1px solid #000', padding: '6px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>ניהול קטגוריות</h2>
              
              {/* Add Category Form */}
              <div style={{ background: '#fff', border: '2px solid #000', padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18} />הוסף קטגוריה</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>שם בעברית *</label>
                    <input type="text" placeholder="תפילות וברכונים" value={newCategory.name} onChange={(e) => setNewCategory({...newCategory, name: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px' }}>שם באנגלית (אופציונלי)</label>
                    <input type="text" placeholder="prayers" value={newCategory.name_en} onChange={(e) => setNewCategory({...newCategory, name_en: e.target.value})} />
                  </div>
                  <button onClick={addCategory} style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>הוסף</button>
                </div>
              </div>

              {/* Categories List */}
              <div style={{ background: '#fff', border: '2px solid #000', padding: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>קטגוריות ({categories.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {categories.map((category) => {
                    const productsCount = products.filter(p => p.category_id === category.id).length;
                    
                    return (
                      <div key={category.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f5f5f5', border: '1px solid #ddd' }}>
                        {editingCategory === category.id ? (
                          <>
                            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginLeft: '12px' }}>
                              <input type="text" value={editCategoryData.name} onChange={(e) => setEditCategoryData({...editCategoryData, name: e.target.value})} placeholder="שם בעברית" style={{ padding: '8px' }} />
                              <input type="text" value={editCategoryData.name_en} onChange={(e) => setEditCategoryData({...editCategoryData, name_en: e.target.value})} placeholder="שם באנגלית" style={{ padding: '8px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button onClick={saveEditCategory} style={{ background: '#000', color: '#fff', border: 'none', padding: '8px', cursor: 'pointer' }}><Save size={16} /></button>
                              <button onClick={cancelEditCategory} style={{ background: '#fff', color: '#000', border: '1px solid #000', padding: '8px', cursor: 'pointer' }}><X size={16} /></button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{category.name}</div>
                              <div style={{ fontSize: '13px', color: '#666' }}>
                                {category.name_en && `${category.name_en} • `}
                                {productsCount} מוצרים
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => { setActiveTab('products'); setSelectedCategory(category.id); }} style={{ padding: '8px 12px', background: '#f5f5f5', border: '1px solid #000', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                                <Filter size={14} style={{ display: 'inline', marginLeft: '4px' }} />
                                צפה במוצרים
                              </button>
                              <button onClick={() => startEditCategory(category)} style={{ background: '#fff', border: '1px solid #000', padding: '8px', cursor: 'pointer' }}><Edit3 size={16} /></button>
                              <button onClick={() => deleteCategory(category.id)} style={{ background: '#fff', border: '1px solid #000', padding: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                {categories.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    <Folder size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <p>אין קטגוריות. הוסף קטגוריה ראשונה!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
