import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit3, Trash2, Search, X, Upload, Image as ImageIcon, Home, LayoutGrid, Package, Check } from 'lucide-react';

const NerLiyaDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // מודאלים ועריכה
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [managingImages, setManagingImages] = useState(null);
  const [productImages, setProductImages] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category_id: '',
    is_active: true,
    engraving_available: false,
    engraving_price: 10
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: catData } = await supabase.from('categories').select('*').order('display_order');
    const { data: prodData } = await supabase.from('products').select(`*, categories(name), product_images(id, image_url, is_primary)`);
    setCategories(catData || []);
    setProducts(prodData || []);
    setLoading(false);
  };

  const handleCategoryClick = (id) => {
    setSelectedCategory(id);
    setActiveTab('products');
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // --- לוגיקת עריכה והוספה ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      category_id: formData.category_id,
      price: parseFloat(formData.price),
      is_active: formData.is_active,
      engraving_available: formData.engraving_available,
      engraving_price: parseFloat(formData.engraving_price)
    };

    const { error } = editingProduct 
      ? await supabase.from('products').update(payload).eq('id', editingProduct.id)
      : await supabase.from('products').insert([payload]);

    if (!error) {
      setShowProductModal(false);
      resetForm();
      fetchData();
    } else {
      alert("שגיאה בשמירה: " + error.message);
    }
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description || '',
      category_id: product.category_id,
      is_active: product.is_active,
      engraving_available: product.engraving_available,
      engraving_price: product.engraving_price
    });
    setShowProductModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', description: '', category_id: '', is_active: true, engraving_available: false, engraving_price: 10 });
    setEditingProduct(null);
  };

  // --- לוגיקת תמונות ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !managingImages) return;

    const fileName = `${managingImages}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('product-images').upload(`products/${fileName}`, file);

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(`products/${fileName}`);
      await supabase.from('product_images').insert([{ product_id: managingImages, image_url: publicUrl, is_primary: productImages.length === 0 }]);
      loadImages(managingImages);
      fetchData();
    }
  };

  const loadImages = async (id) => {
    const { data } = await supabase.from('product_images').select('*').eq('product_id', id);
    setProductImages(data || []);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px', fontFamily: 'system-ui' }}>טוען מערכת...</div>;

  return (
    <div dir="rtl" style={{ minHeight: '100vh', backgroundColor: '#f9f9f9', fontFamily: 'system-ui' }}>
      
      {/* Navbar קבוע */}
      <nav style={{ backgroundColor: '#000', color: '#d4af37', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: 0, fontWeight: 'bold', letterSpacing: '1px' }}>נר-ליה</h2>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => {setActiveTab('overview'); setSelectedCategory('all');}} style={{ background: activeTab === 'overview' ? '#d4af37' : '#222', color: activeTab === 'overview' ? '#000' : '#fff', border: 'none', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LayoutGrid size={18} /> סקירה
          </button>
          <button onClick={() => setActiveTab('products')} style={{ background: activeTab === 'products' ? '#d4af37' : '#222', color: activeTab === 'products' ? '#000' : '#fff', border: 'none', padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={18} /> מוצרים
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px' }}>
        
        {activeTab === 'overview' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.03)', borderRight: '5px solid #d4af37' }}>
                <span style={{ color: '#888', fontSize: '14px' }}>סה"כ מוצרים</span>
                <h1 style={{ margin: '10px 0 0', fontSize: '32px' }}>{products.length}</h1>
              </div>
              <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.03)', borderRight: '5px solid #ff4d4d' }}>
                <span style={{ color: '#888', fontSize: '14px' }}>אזל מהמלאי</span>
                <h1 style={{ margin: '10px 0 0', fontSize: '32px', color: '#ff4d4d' }}>{products.filter(p => !p.is_active).length}</h1>
              </div>
            </div>

            <h3 style={{ marginBottom: '20px' }}>בחרי קטגוריה למעבר מהיר:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
              {categories.map(cat => (
                <div key={cat.id} onClick={() => handleCategoryClick(cat.id)} style={{ background: '#fff', padding: '25px', borderRadius: '15px', textAlign: 'center', cursor: 'pointer', border: '1px solid #eee', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#d4af37'}>
                  <div style={{ fontSize: '30px', marginBottom: '10px' }}>📂</div>
                  <div style={{ fontWeight: 'bold' }}>{cat.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', right: '15px', top: '13px', color: '#aaa' }} />
                  <input placeholder="חיפוש מוצר..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '12px 45px 12px 15px', borderRadius: '12px', border: '1px solid #eee', outline: 'none', background: '#fcfcfc' }} />
                </div>
                <button onClick={() => {resetForm(); setShowProductModal(true);}} style={{ background: '#000', color: '#fff', padding: '0 25px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>+ מוצר חדש</button>
              </div>

              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                <button onClick={() => setSelectedCategory('all')} style={{ padding: '8px 18px', borderRadius: '20px', border: 'none', background: selectedCategory === 'all' ? '#d4af37' : '#f0f0f0', color: selectedCategory === 'all' ? '#fff' : '#666', fontWeight: 'bold', cursor: 'pointer' }}>הכל</button>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{ padding: '8px 18px', borderRadius: '20px', border: 'none', background: selectedCategory === cat.id ? '#d4af37' : '#f0f0f0', color: selectedCategory === cat.id ? '#fff' : '#666', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>{cat.name}</button>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9f9f9' }}>
                  <tr>
                    <th style={{ padding: '15px 20px', textAlign: 'right' }}>מוצר</th>
                    <th style={{ padding: '15px 20px', textAlign: 'right' }}>מחיר</th>
                    <th style={{ padding: '15px 20px', textAlign: 'right' }}>סטטוס</th>
                    <th style={{ padding: '15px 20px', textAlign: 'left' }}>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img src={p.product_images?.find(i => i.is_primary)?.image_url || 'https://via.placeholder.com/45'} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '8px', background: '#eee' }} />
                        <span style={{ fontWeight: '600' }}>{p.name}</span>
                      </td>
                      <td style={{ padding: '12px 20px', fontWeight: 'bold' }}>₪{p.price}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', background: p.is_active ? '#e7f5ec' : '#fdebeb', color: p.is_active ? '#218838' : '#dc3545' }}>
                          {p.is_active ? 'במלאי' : 'אזל'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'left' }}>
                        <button onClick={() => {setManagingImages(p.id); loadImages(p.id);}} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginLeft: '10px' }}><ImageIcon size={18} /></button>
                        <button onClick={() => openEdit(p)} style={{ background: 'none', border: 'none', color: '#3182ce', cursor: 'pointer', marginLeft: '10px' }}><Edit3 size={18} /></button>
                        <button onClick={async () => {if(confirm('למחוק?')) {await supabase.from('products').delete().eq('id', p.id); fetchData();}}} style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer' }}><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* מודאל הוספה/עריכה - כולל הכל */}
      {showProductModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0 }}>{editingProduct ? 'עריכת מוצר' : 'הוספת מוצר'}</h2>
            <form onSubmit={handleProductSubmit}>
              <label>שם מוצר</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd' }} />
              
              <label>תיאור</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px' }} />

              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label>מחיר (₪)</label>
                  <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#f9f9f9', padding: '10px', borderRadius: '8px', width: '100%', border: '1px solid #eee' }}>
                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>קיים במלאי</span>
                  </label>
                </div>
              </div>

              <label>קטגוריה</label>
              <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <option value="">בחרי קטגוריה...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <div style={{ background: '#fcf8e8', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #f3ebc0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                  <input type="checkbox" checked={formData.engraving_available} onChange={e => setFormData({...formData, engraving_available: e.target.checked})} />
                  אפשרות חריטה
                </label>
                {formData.engraving_available && (
                  <input type="number" value={formData.engraving_price} onChange={e => setFormData({...formData, engraving_price: e.target.value})} style={{ marginTop: '10px', padding: '5px', width: '80px' }} />
                )}
              </div>

              <button type="submit" style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>שמור שינויים</button>
              <button type="button" onClick={() => setShowProductModal(false)} style={{ width: '100%', marginTop: '10px', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>ביטול</button>
            </form>
          </div>
        </div>
      )}

      {/* מודאל תמונות */}
      {managingImages && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', width: '550px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3>ניהול תמונות</h3>
              <X onClick={() => setManagingImages(null)} style={{ cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              {productImages.map(img => (
                <div key={img.id} style={{ position: 'relative', border: img.is_primary ? '3px solid #d4af37' : '1px solid #eee', borderRadius: '10px', padding: '3px' }}>
                  <img src={img.image_url} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px' }} />
                  <button onClick={async () => {await supabase.from('product_images').delete().eq('id', img.id); loadImages(managingImages); fetchData();}} style={{ position: 'absolute', top: '5px', left: '5px', background: 'white', borderRadius: '50%', border: 'none', color: 'red', cursor: 'pointer' }}><X size={12} /></button>
                </div>
              ))}
              <label style={{ border: '2px dashed #ddd', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '110px', cursor: 'pointer' }}>
                <Upload size={20} />
                <span style={{ fontSize: '12px', marginTop: '5px' }}>העלאה</span>
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            <button onClick={() => setManagingImages(null)} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff', borderRadius: '10px' }}>סיום</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        label { display: block; margin-bottom: 5px; font-weight: 600; font-size: 14px; }
      `}</style>
    </div>
  );
};

export default NerLiyaDashboard;