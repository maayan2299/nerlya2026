import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Package, DollarSign, Users, TrendingUp, Plus, Edit3, Trash2, Search, Filter, X, Upload, Image as ImageIcon } from 'lucide-react';

const NerLiyaDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [managingImages, setManagingImages] = useState(null);
  const [productImages, setProductImages] = useState([]);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    price: '',
    description: '',
    category_id: '',
    stock: '',
    engraving_available: false,
    engraving_price: 10,
    is_featured: false // ⭐ מוצר מומלץ
  });

  // Statistics
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    outOfStock: 0,
    totalCategories: 0
  });

  // Load data on mount
  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [products]);

  // Load categories
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

  // Load products
  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          product_images(id, image_url, is_primary, display_order)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price) * p.stock), 0);
    const outOfStock = products.filter(p => p.stock === 0).length;
    const totalCategories = categories.length;

    setStats({
      totalProducts,
      totalValue,
      outOfStock,
      totalCategories
    });
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.name_en && product.name_en.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle product form submit
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        alert('המוצר עודכן בהצלחה!');
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([formData]);
        
        if (error) throw error;
        alert('המוצר נוסף בהצלחה!');
      }
      
      setShowProductModal(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('שגיאה בשמירת המוצר: ' + error.message);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      alert('המוצר נמחק בהצלחה!');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('שגיאה במחיקת המוצר: ' + error.message);
    }
  };

  // Open edit modal
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      name_en: product.name_en || '',
      price: product.price,
      description: product.description || '',
      category_id: product.category_id,
      stock: product.stock,
      engraving_available: product.engraving_available || false,
      engraving_price: product.engraving_price || 10
    });
    setShowProductModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      name_en: '',
      price: '',
      description: '',
      category_id: '',
      stock: '',
      engraving_available: false,
      engraving_price: 10
    });
  };

  // Load product images
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
      console.error('Error loading images:', error);
    }
  };

  // Upload image
  const handleImageUpload = async (file) => {
    if (!managingImages) return;
    
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${managingImages}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      // Save to database
      const isPrimary = productImages.length === 0;
      const { error: dbError } = await supabase
        .from('product_images')
        .insert([{
          product_id: managingImages,
          image_url: publicUrl,
          is_primary: isPrimary,
          display_order: productImages.length
        }]);

      if (dbError) throw dbError;

      alert('התמונה הועלתה בהצלחה!');
      loadProductImages(managingImages);
      loadProducts();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('שגיאה בהעלאת התמונה: ' + error.message);
    }
  };

  // Delete image
  const handleDeleteImage = async (imageId, imageUrl) => {
    if (!confirm('האם למחוק תמונה זו?')) return;
    
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      // Delete from storage
      const filePath = imageUrl.split('/').slice(-2).join('/');
      await supabase.storage
        .from('product-images')
        .remove([filePath]);

      alert('התמונה נמחקה בהצלחה!');
      loadProductImages(managingImages);
      loadProducts();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('שגיאה במחיקת התמונה: ' + error.message);
    }
  };

  // Set primary image
  const setPrimaryImage = async (imageId) => {
    try {
      // Set all to non-primary
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', managingImages);

      // Set selected as primary
      const { error } = await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      if (error) throw error;

      alert('התמונה הראשית עודכנה!');
      loadProductImages(managingImages);
      loadProducts();
    } catch (error) {
      console.error('Error setting primary:', error);
      alert('שגיאה בעדכון תמונה ראשית: ' + error.message);
    }
  };

  return (
    <div dir="rtl" style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#000', color: '#fff', padding: '20px 40px', borderBottom: '3px solid #d4af37' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: "'StamSefarad', serif" }}>
          דשבורד ניהול נר-ליה
        </h1>
        <p style={{ fontSize: '14px', color: '#ddd', marginTop: '8px' }}>מערכת ניהול מוצרים מתקדמת</p>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #ddd' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '0' }}>
          {['overview', 'products', 'categories'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 32px',
                border: 'none',
                backgroundColor: activeTab === tab ? '#000' : 'transparent',
                color: activeTab === tab ? '#fff' : '#666',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                transition: 'all 0.3s',
                borderBottom: activeTab === tab ? '3px solid #d4af37' : '3px solid transparent'
              }}
            >
              {tab === 'overview' && '📊 סקירה כללית'}
              {tab === 'products' && '📦 מוצרים'}
              {tab === 'categories' && '🗂️ קטגוריות'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>סקירה כללית</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <Package size={32} color="#000" />
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>סך מוצרים</h3>
                </div>
                <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#d4af37' }}>{stats.totalProducts}</p>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <DollarSign size={32} color="#000" />
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>שווי כולל</h3>
                </div>
                <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#d4af37' }}>₪{stats.totalValue.toLocaleString()}</p>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <TrendingUp size={32} color="#000" />
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>אזל מהמלאי</h3>
                </div>
                <p style={{ fontSize: '36px', fontWeight: 'bold', color: stats.outOfStock > 0 ? '#dc3545' : '#28a745' }}>
                  {stats.outOfStock}
                </p>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <Users size={32} color="#000" />
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>קטגוריות</h3>
                </div>
                <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#d4af37' }}>{stats.totalCategories}</p>
              </div>
            </div>

            {/* Out of stock products alert */}
            {stats.outOfStock > 0 && (
              <div style={{ marginTop: '30px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', padding: '20px', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#856404', marginBottom: '12px' }}>
                  ⚠️ התראה: {stats.outOfStock} מוצרים אזלו מהמלאי
                </h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {products.filter(p => p.stock === 0).map(product => (
                    <li key={product.id} style={{ padding: '8px 0', borderBottom: '1px solid #ffe69c' }}>
                      <strong>{product.name}</strong> - {categories.find(c => c.id === product.category_id)?.name || 'ללא קטגוריה'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>ניהול מוצרים</h2>
              <button
                onClick={() => {
                  resetForm();
                  setEditingProduct(null);
                  setShowProductModal(true);
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '15px',
                  fontWeight: 'bold'
                }}
              >
                <Plus size={20} />
                הוסף מוצר חדש
              </button>
            </div>

            {/* Search and Filter */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                    <Search size={16} style={{ display: 'inline', marginLeft: '6px' }} />
                    חיפוש מוצר
                  </label>
                  <input
                    type="text"
                    placeholder="חפש לפי שם..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                    <Filter size={16} style={{ display: 'inline', marginLeft: '6px' }} />
                    סינון לפי קטגוריה
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="all">כל הקטגוריות</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
                מציג {filteredProducts.length} מתוך {products.length} מוצרים
              </div>
            </div>

            {/* Products Table */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#fff', borderRadius: '8px' }}>
                <p style={{ fontSize: '18px', color: '#666' }}>טוען מוצרים...</p>
              </div>
            ) : (
              <div style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#000', color: '#fff' }}>
                    <tr>
                      <th style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>תמונה</th>
                      <th style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>שם המוצר</th>
                      <th style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>קטגוריה</th>
                      <th style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>מחיר</th>
                      <th style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>מלאי</th>
                      <th style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>חריטה</th>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>⭐ מומלץ</th>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>תמונות</th>
                      <th style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product, index) => {
                      const primaryImage = product.product_images?.find(img => img.is_primary);
                      const imageCount = product.product_images?.length || 0;
                      return (
                        <tr key={product.id} style={{ 
                          borderBottom: '1px solid #eee',
                          backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9'
                        }}>
                          <td style={{ padding: '16px' }}>
                            {primaryImage ? (
                              <img 
                                src={primaryImage.image_url} 
                                alt={product.name}
                                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                              />
                            ) : (
                              <div style={{ 
                                width: '60px', 
                                height: '60px', 
                                backgroundColor: '#f0f0f0', 
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <ImageIcon size={24} color="#ccc" />
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '16px', fontWeight: 'bold' }}>
                            {product.name}
                            {product.stock === 0 && (
                              <span style={{ 
                                display: 'block', 
                                color: '#dc3545', 
                                fontSize: '12px',
                                marginTop: '4px',
                                fontWeight: 'bold'
                              }}>
                                ⚠️ אזל מהמלאי
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '16px', color: '#666' }}>
                            {categories.find(c => c.id === product.category_id)?.name || 'ללא קטגוריה'}
                          </td>
                          <td style={{ padding: '16px', fontWeight: 'bold', color: '#d4af37' }}>
                            ₪{parseFloat(product.price).toLocaleString()}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '13px',
                              fontWeight: 'bold',
                              backgroundColor: product.stock === 0 ? '#dc3545' : product.stock < 10 ? '#ffc107' : '#28a745',
                              color: '#fff'
                            }}>
                              {product.stock}
                            </span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            {product.engraving_available ? (
                              <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                                ✓ זמין (+₪{product.engraving_price || 10})
                              </span>
                            ) : (
                              <span style={{ color: '#999' }}>לא זמין</span>
                            )}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            {product.is_featured ? (
                              <span style={{ 
                                fontSize: '24px',
                                filter: 'drop-shadow(0 2px 4px rgba(212, 175, 55, 0.4))'
                              }}>
                                ⭐
                              </span>
                            ) : (
                              <span style={{ color: '#ddd', fontSize: '20px' }}>
                                ☆
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <button
                              onClick={() => {
                                setManagingImages(product.id);
                                loadProductImages(product.id);
                              }}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#6c757d',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                margin: '0 auto'
                              }}
                            >
                              <ImageIcon size={16} />
                              {imageCount}
                            </button>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleEditProduct(product)}
                                style={{
                                  padding: '8px',
                                  backgroundColor: '#007bff',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                                title="עריכה"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                style={{
                                  padding: '8px',
                                  backgroundColor: '#dc3545',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                                title="מחיקה"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>קטגוריות</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {categories.map(category => (
                <div key={category.id} style={{
                  backgroundColor: '#fff',
                  padding: '24px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #eee'
                }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{category.name}</h3>
                  {category.name_en && (
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>{category.name_en}</p>
                  )}
                  <p style={{ fontSize: '14px', color: '#999' }}>
                    {products.filter(p => p.category_id === category.id).length} מוצרים
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '40px',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {editingProduct ? 'עריכת מוצר' : 'הוספת מוצר חדש'}
              </h2>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleProductSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>שם המוצר (עברית) *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>שם המוצר (אנגלית)</label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>תיאור</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>מחיר (₪) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>מלאי *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>קטגוריה *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">בחר קטגוריה</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Engraving Section */}
              <div style={{ 
                marginBottom: '20px', 
                padding: '16px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                border: '2px solid #e9ecef'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <input
                    type="checkbox"
                    id="engraving_available"
                    checked={formData.engraving_available}
                    onChange={(e) => setFormData({ ...formData, engraving_available: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <label htmlFor="engraving_available" style={{ fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
                    ✨ זמין לחריטה/הטבעה
                  </label>
                </div>
                
                {formData.engraving_available && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                      מחיר חריטה (₪)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.engraving_price}
                      onChange={(e) => setFormData({ ...formData, engraving_price: parseFloat(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                      מחיר ברירת המחדל: ₪10
                    </p>
                  </div>
                )}
              </div>

              {/* Featured Product Section - NEW */}
              <div style={{ 
                marginBottom: '20px', 
                padding: '16px', 
                backgroundColor: '#fff9e6', 
                borderRadius: '8px',
                border: '2px solid #d4af37'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <label htmlFor="is_featured" style={{ fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
                    ⭐ מוצר מומלץ (יוצג בדף הבית)
                  </label>
                </div>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', marginRight: '32px' }}>
                  מוצרים מומלצים יופיעו בקטע "המומלצים שלנו" בעמוד הראשי
                </p>
              </div>
                      type="number"
                      step="0.01"
                      value={formData.engraving_price}
                      onChange={(e) => setFormData({ ...formData, engraving_price: parseFloat(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                      מחיר ברירת המחדל: ₪10
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '15px'
                  }}
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 'bold'
                  }}
                >
                  {editingProduct ? 'עדכן מוצר' : 'הוסף מוצר'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Management Modal */}
      {managingImages && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '40px',
            borderRadius: '12px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>
                ניהול תמונות - {products.find(p => p.id === managingImages)?.name}
              </h2>
              <button
                onClick={() => {
                  setManagingImages(null);
                  setProductImages([]);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Upload Section */}
            <div style={{ 
              marginBottom: '30px', 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              border: '2px dashed #dee2e6'
            }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
                <Upload size={20} style={{ display: 'inline', marginLeft: '8px' }} />
                הוסף תמונה חדשה
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleImageUpload(e.target.files[0]);
                    e.target.value = '';
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Images Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {productImages.map(image => (
                <div key={image.id} style={{
                  position: 'relative',
                  border: image.is_primary ? '3px solid #000' : '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#f8f9fa'
                }}>
                  <img
                    src={image.image_url}
                    alt="Product"
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover'
                    }}
                  />
                  {image.is_primary && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: '#000',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      תמונה ראשית
                    </div>
                  )}
                  <div style={{ 
                    padding: '8px', 
                    display: 'flex', 
                    gap: '8px',
                    backgroundColor: '#fff'
                  }}>
                    {!image.is_primary && (
                      <button
                        onClick={() => setPrimaryImage(image.id)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          backgroundColor: '#28a745',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        הגדר כראשית
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteImage(image.id, image.image_url)}
                      style={{
                        flex: image.is_primary ? 1 : 0,
                        padding: '6px',
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {productImages.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px',
                color: '#999',
                fontSize: '16px'
              }}>
                <ImageIcon size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <p>עדיין לא הועלו תמונות למוצר זה</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NerLiyaDashboard;
