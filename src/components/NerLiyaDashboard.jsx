import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Trash2, Edit3, Save, X, Upload, Image as ImageIcon, Tag, LogOut, Eye, EyeOff, Search } from 'lucide-react';

// Supabase Configuration
const supabaseUrl = 'https://ormbbartqrpgtsmoqxhm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ybWJiYXJ0cXJwZ3RzbW9xeGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NTQwMzMsImV4cCI6MjA4MzUzMDAzM30.vcddF1aQahJTZfv7GNK7_onPR2dt-l_dmDCzEt-EnAg';
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_USERNAME = 'nerlya';
const ADMIN_PASSWORD = 'nerlya2026';

const AdminDashboard = () => {
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', fontFamily: '"Heebo", sans-serif', direction: 'rtl', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: '#fff', border: '2px solid #000', padding: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px', textAlign: 'center' }}>נר-ליה</h1>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <input type="text" value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} style={{ width: '100%', padding: '14px', border: '1px solid #ddd', fontSize: '15px' }} placeholder="שם משתמש" />
            </div>
            <div style={{ marginBottom: '24px', position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} style={{ width: '100%', padding: '14px', paddingLeft: '45px', border: '1px solid #ddd', fontSize: '15px' }} placeholder="סיסמה" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {loginError && <div style={{ padding: '12px', background: '#ffe6e6', color: '#cc0000', marginBottom: '20px', fontSize: '14px', textAlign: 'center', borderRadius: '4px' }}>{loginError}</div>}
            <button type="submit" style={{ width: '100%', padding: '14px', background: '#000', color: '#fff', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>כניסה</button>
          </form>
        </div>
      </div>
    );
  }

  return <MainDashboard onLogout={handleLogout} />;
};

const MainDashboard = ({ onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Modal states
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImagesModal, setShowImagesModal] = useState(null);
  const [showColorsModal, setShowColorsModal] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category_id: '',
    stock_quantity: 0,
    allows_engraving: false,
    on_sale: false,
    sale_type: 'percentage',
    sale_percentage: '',
    sale_price: ''
  });
  
  // Image/Color states
  const [productImages, setProductImages] = useState([]);
  const [productColors, setProductColors] = useState([]);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newColor, setNewColor] = useState({ name: '', code: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select(`*, categories(name), product_images(image_url, is_primary), product_colors(id)`).order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('display_order')
      ]);
      
      if (productsRes.data) {
        setProducts(productsRes.data.map(p => ({
          ...p,
          category_name: p.categories?.name || '',
          primary_image: p.product_images?.find(i => i.is_primary)?.image_url || p.product_images?.[0]?.image_url,
          images_count: p.product_images?.length || 0,
          colors_count: p.product_colors?.length || 0
        })));
      }
      
      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    try {
      setUploading(true);
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('product-images').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setUploading(false);
      return data.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      return null;
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('אנא מלא שם ומחיר');
      return;
    }

    try {
      // Calculate sale_price based on sale_type
      let finalSalePrice = null;
      if (formData.on_sale) {
        if (formData.sale_type === 'percentage' && formData.sale_percentage) {
          const discount = (parseFloat(formData.price) * parseFloat(formData.sale_percentage)) / 100;
          finalSalePrice = parseFloat(formData.price) - discount;
        } else if (formData.sale_type === 'fixed' && formData.sale_price) {
          finalSalePrice = parseFloat(formData.sale_price);
        }
      }

      if (editingProduct) {
        // Update
        await supabase.from('products').update({
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          category_id: formData.category_id || null,
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          allows_engraving: formData.allows_engraving,
          on_sale: formData.on_sale,
          sale_type: formData.on_sale ? formData.sale_type : null,
          sale_percentage: formData.on_sale && formData.sale_type === 'percentage' ? parseInt(formData.sale_percentage) : null,
          sale_price: finalSalePrice
        }).eq('id', editingProduct.id);
        
        alert('המוצר עודכן!');
      } else {
        // Create
        const { data: newProduct, error } = await supabase.from('products').insert([{
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          category_id: formData.category_id || null,
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          allows_engraving: formData.allows_engraving,
          on_sale: formData.on_sale,
          sale_type: formData.on_sale ? formData.sale_type : null,
          sale_percentage: formData.on_sale && formData.sale_type === 'percentage' ? parseInt(formData.sale_percentage) : null,
          sale_price: finalSalePrice,
          is_active: true
        }]).select().single();

        if (error) throw error;

        if (newImageFile) {
          const imageUrl = await uploadImage(newImageFile);
          if (imageUrl) {
            await supabase.from('product_images').insert([{
              product_id: newProduct.id,
              image_url: imageUrl,
              is_primary: true,
              display_order: 0
            }]);
          }
        }
        
        alert('המוצר נוסף!');
      }

      await loadData();
      closeModal();
    } catch (error) {
      console.error('Error:', error);
      alert('שגיאה: ' + error.message);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('למחוק את המוצר?')) return;
    
    try {
      const { data: images } = await supabase.from('product_images').select('image_url').eq('product_id', productId);
      if (images) {
        for (const img of images) {
          const fileName = img.image_url.split('/').pop();
          await supabase.storage.from('product-images').remove([fileName]);
        }
      }
      
      await supabase.from('product_images').delete().eq('product_id', productId);
      await supabase.from('product_colors').delete().eq('product_id', productId);
      await supabase.from('products').delete().eq('id', productId);
      
      await loadData();
      alert('המוצר נמחק!');
    } catch (error) {
      console.error('Error:', error);
      alert('שגיאה במחיקה');
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description || '',
      category_id: product.category_id || '',
      stock_quantity: product.stock_quantity || 0,
      allows_engraving: product.allows_engraving || false,
      on_sale: product.on_sale || false,
      sale_type: product.sale_type || 'percentage',
      sale_percentage: product.sale_percentage || '',
      sale_price: product.sale_price || ''
    });
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      description: '',
      category_id: '',
      stock_quantity: 0,
      allows_engraving: false,
      on_sale: false,
      sale_type: 'percentage',
      sale_percentage: '',
      sale_price: ''
    });
    setNewImageFile(null);
  };

  const closeModal = () => {
    setEditingProduct(null);
    setShowAddModal(false);
    setNewImageFile(null);
  };

  const openImagesModal = async (product) => {
    setShowImagesModal(product);
    const { data } = await supabase.from('product_images').select('*').eq('product_id', product.id).order('display_order');
    setProductImages(data || []);
  };

  const addImage = async () => {
    if (!newImageFile || !showImagesModal) return;
    
    const imageUrl = await uploadImage(newImageFile);
    if (!imageUrl) return;

    await supabase.from('product_images').insert([{
      product_id: showImagesModal.id,
      image_url: imageUrl,
      is_primary: productImages.length === 0,
      display_order: productImages.length
    }]);

    const { data } = await supabase.from('product_images').select('*').eq('product_id', showImagesModal.id);
    setProductImages(data || []);
    setNewImageFile(null);
    await loadData();
  };

  const deleteImage = async (imageId, imageUrl) => {
    if (!confirm('למחוק תמונה?')) return;
    
    const fileName = imageUrl.split('/').pop();
    await supabase.storage.from('product-images').remove([fileName]);
    await supabase.from('product_images').delete().eq('id', imageId);
    
    const { data } = await supabase.from('product_images').select('*').eq('product_id', showImagesModal.id);
    setProductImages(data || []);
    await loadData();
  };

  const setPrimary = async (imageId) => {
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', showImagesModal.id);
    await supabase.from('product_images').update({ is_primary: true }).eq('id', imageId);
    
    const { data } = await supabase.from('product_images').select('*').eq('product_id', showImagesModal.id);
    setProductImages(data || []);
    await loadData();
  };

  const openColorsModal = async (product) => {
    setShowColorsModal(product);
    const { data } = await supabase.from('product_colors').select('*').eq('product_id', product.id).order('display_order');
    setProductColors(data || []);
  };

  const addColor = async () => {
    if (!newColor.name || !newColor.code) {
      alert('מלא שם וקוד צבע');
      return;
    }

    let colorCode = newColor.code.trim();
    if (!colorCode.startsWith('#')) colorCode = '#' + colorCode;

    await supabase.from('product_colors').insert([{
      product_id: showColorsModal.id,
      color_name: newColor.name,
      color_code: colorCode.toLowerCase(),
      display_order: productColors.length
    }]);

    const { data } = await supabase.from('product_colors').select('*').eq('product_id', showColorsModal.id);
    setProductColors(data || []);
    setNewColor({ name: '', code: '' });
    await loadData();
  };

  const deleteColor = async (colorId) => {
    if (!confirm('למחוק צבע?')) return;
    await supabase.from('product_colors').delete().eq('id', colorId);
    const { data } = await supabase.from('product_colors').select('*').eq('product_id', showColorsModal.id);
    setProductColors(data || []);
    await loadData();
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || p.category_id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>טוען...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: '"Heebo", sans-serif', direction: 'rtl' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        input, select, textarea { border: 1px solid #ddd; padding: 12px; font-family: 'Heebo', sans-serif; font-size: 15px; width: 100%; border-radius: 4px; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #000; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal { background: #fff; border-radius: 8px; padding: 30px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; }
        @media (max-width: 768px) { .modal { padding: 20px; } }
      `}</style>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '2px solid #eee', padding: '20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>נר-ליה - ניהול מוצרים</h1>
          <button onClick={onLogout} style={{ background: '#000', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <LogOut size={16} /> יציאה
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        
        {/* Toolbar */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <button onClick={openAddModal} style={{ background: '#000', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} /> הוסף מוצר חדש
          </button>
          
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="חיפוש מוצר..." style={{ paddingRight: '40px' }} />
          </div>

          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ minWidth: '180px' }}>
            <option value="">כל הקטגוריות</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredProducts.map(product => (
            <div key={product.id} style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              
              {/* Image */}
              <div style={{ width: '100%', height: '250px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {product.primary_image ? (
                  <img src={product.primary_image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ImageIcon size={60} color="#ccc" />
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#000' }}>{product.name}</h3>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>{product.category_name || 'ללא קטגוריה'}</p>
                
                {product.on_sale && product.sale_price && (
                  <div style={{ display: 'inline-block', background: '#dc2626', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                    🏷️ מבצע!
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    {product.on_sale && product.sale_price ? (
                      <div>
                        <span style={{ fontSize: '16px', color: '#999', textDecoration: 'line-through', marginLeft: '8px' }}>₪{product.price}</span>
                        <span style={{ fontSize: '22px', fontWeight: '700', color: '#dc2626' }}>₪{product.sale_price}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '20px', fontWeight: '700', color: '#000' }}>₪{product.price}</span>
                    )}
                  </div>
                  <span style={{ fontSize: '14px', color: '#666' }}>מלאי: {product.stock_quantity || 0}</span>
                </div>

                {product.allows_engraving && (
                  <div style={{ fontSize: '13px', color: '#4CAF50', marginBottom: '12px' }}>✓ חריטה אישית</div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button onClick={() => openImagesModal(product)} style={{ flex: 1, padding: '8px', background: '#f5f5f5', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                    📷 {product.images_count} תמונות
                  </button>
                  <button onClick={() => openColorsModal(product)} style={{ flex: 1, padding: '8px', background: '#f5f5f5', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                    🎨 {product.colors_count} צבעים
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEditModal(product)} style={{ flex: 1, padding: '10px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                    ערוך
                  </button>
                  <button onClick={() => handleDelete(product.id)} style={{ padding: '10px 16px', background: '#fff', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '4px', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <p style={{ fontSize: '18px' }}>לא נמצאו מוצרים</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingProduct) && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700' }}>{editingProduct ? 'עריכת מוצר' : 'הוספת מוצר חדש'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>שם המוצר *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="לדוגמה: ברכות השחר" required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>מחיר (₪) *</label>
                    <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>כמות במלאי</label>
                    <input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>קטגוריה</label>
                  <select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})}>
                    <option value="">בחר קטגוריה</option>
                    {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>תיאור</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="4" placeholder="תיאור מפורט של המוצר..."></textarea>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.allows_engraving} onChange={(e) => setFormData({...formData, allows_engraving: e.target.checked})} style={{ width: 'auto' }} />
                    <span style={{ fontSize: '15px' }}>מאפשר חריטה אישית (+10 ₪)</span>
                  </label>
                </div>

                <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.on_sale} 
                      onChange={(e) => setFormData({
                        ...formData, 
                        on_sale: e.target.checked, 
                        sale_percentage: e.target.checked ? formData.sale_percentage : '',
                        sale_price: e.target.checked ? formData.sale_price : ''
                      })} 
                      style={{ width: 'auto' }} 
                    />
                    <span style={{ fontSize: '15px', fontWeight: '600' }}>🏷️ יש הנחה / מבצע</span>
                  </label>
                  
                  {formData.on_sale && (
                    <div>
                      {/* בחירת סוג הנחה */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>סוג ההנחה:</label>
                        <div style={{ display: 'flex', gap: '20px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input 
                              type="radio" 
                              name="sale_type" 
                              value="percentage" 
                              checked={formData.sale_type === 'percentage'}
                              onChange={(e) => setFormData({...formData, sale_type: e.target.value, sale_price: ''})}
                              style={{ width: 'auto' }}
                            />
                            <span style={{ fontSize: '14px' }}>אחוזים (%)</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input 
                              type="radio" 
                              name="sale_type" 
                              value="fixed" 
                              checked={formData.sale_type === 'fixed'}
                              onChange={(e) => setFormData({...formData, sale_type: e.target.value, sale_percentage: ''})}
                              style={{ width: 'auto' }}
                            />
                            <span style={{ fontSize: '14px' }}>מחיר קבוע (₪)</span>
                          </label>
                        </div>
                      </div>

                      {/* שדות לפי סוג ההנחה */}
                      {formData.sale_type === 'percentage' ? (
                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>אחוז הנחה *</label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type="number" 
                              min="1" 
                              max="99"
                              value={formData.sale_percentage} 
                              onChange={(e) => setFormData({...formData, sale_percentage: e.target.value})} 
                              placeholder="לדוגמה: 20" 
                              required={formData.on_sale}
                              style={{ paddingLeft: '30px' }}
                            />
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: '14px' }}>%</span>
                          </div>
                          {formData.price && formData.sale_percentage && (
                            <div style={{ marginTop: '12px', padding: '12px', background: '#fff', borderRadius: '4px', border: '1px solid #ddd' }}>
                              <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>מחיר אחרי הנחה:</div>
                              <div style={{ fontSize: '20px', fontWeight: '700', color: '#16a34a' }}>
                                ₪{(parseFloat(formData.price) - (parseFloat(formData.price) * parseFloat(formData.sale_percentage) / 100)).toFixed(2)}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                חיסכון: ₪{((parseFloat(formData.price) * parseFloat(formData.sale_percentage)) / 100).toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>מחיר מבצע (₪) *</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={formData.sale_price} 
                            onChange={(e) => setFormData({...formData, sale_price: e.target.value})} 
                            placeholder="המחיר החדש במבצע" 
                            required={formData.on_sale}
                          />
                          {formData.price && formData.sale_price && parseFloat(formData.sale_price) < parseFloat(formData.price) && (
                            <div style={{ marginTop: '12px', padding: '12px', background: '#fff', borderRadius: '4px', border: '1px solid #ddd' }}>
                              <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>פרטי ההנחה:</div>
                              <div style={{ fontSize: '16px', fontWeight: '600', color: '#16a34a' }}>
                                {Math.round(((parseFloat(formData.price) - parseFloat(formData.sale_price)) / parseFloat(formData.price)) * 100)}% הנחה
                              </div>
                              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                חיסכון: ₪{(parseFloat(formData.price) - parseFloat(formData.sale_price)).toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!editingProduct && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>תמונה ראשית</label>
                    <input type="file" accept="image/*" onChange={(e) => setNewImageFile(e.target.files[0])} style={{ padding: '8px' }} />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="submit" disabled={uploading} style={{ flex: 1, padding: '14px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', opacity: uploading ? 0.5 : 1 }}>
                    {uploading ? 'שומר...' : (editingProduct ? 'שמור שינויים' : 'הוסף מוצר')}
                  </button>
                  <button type="button" onClick={closeModal} style={{ padding: '14px 24px', background: '#fff', color: '#000', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
                    ביטול
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Images Modal */}
      {showImagesModal && (
        <div className="modal-overlay" onClick={() => setShowImagesModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>ניהול תמונות - {showImagesModal.name}</h2>
              <button onClick={() => setShowImagesModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <input type="file" accept="image/*" onChange={(e) => setNewImageFile(e.target.files[0])} style={{ marginBottom: '10px' }} />
              <button onClick={addImage} disabled={!newImageFile || uploading} style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: (!newImageFile || uploading) ? 0.5 : 1 }}>
                {uploading ? 'מעלה...' : 'הוסף תמונה'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
              {productImages.map(img => (
                <div key={img.id} style={{ position: 'relative', border: img.is_primary ? '3px solid #000' : '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                  <img src={img.image_url} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '4px', left: '4px' }}>
                    <button onClick={() => deleteImage(img.id, img.image_url)} style={{ background: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {img.is_primary ? (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#000', color: '#fff', padding: '4px', fontSize: '11px', textAlign: 'center', fontWeight: '600' }}>ראשית</div>
                  ) : (
                    <button onClick={() => setPrimary(img.id)} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', border: 'none', padding: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>הגדר ראשית</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Colors Modal */}
      {showColorsModal && (
        <div className="modal-overlay" onClick={() => setShowColorsModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>ניהול צבעים - {showColorsModal.name}</h2>
              <button onClick={() => setShowColorsModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '20px' }}>
              <input type="text" value={newColor.name} onChange={(e) => setNewColor({...newColor, name: e.target.value})} placeholder="שם צבע (חום, כחול...)" />
              <input type="text" value={newColor.code} onChange={(e) => setNewColor({...newColor, code: e.target.value})} placeholder="קוד (#4d4037)" />
              <button onClick={addColor} style={{ padding: '12px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}>הוסף</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {productColors.map(color => (
                <div key={color.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: color.color_code }}></div>
                    <div>
                      <div style={{ fontWeight: '600' }}>{color.color_name}</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>{color.color_code}</div>
                    </div>
                  </div>
                  <button onClick={() => deleteColor(color.id)} style={{ background: '#fff', border: '1px solid #dc2626', color: '#dc2626', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
