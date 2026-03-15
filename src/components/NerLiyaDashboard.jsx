import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Package, FolderTree, Plus, Trash2, Edit, Save, X, Settings, 
  CheckCircle2, AlertCircle, Upload 
} from 'lucide-react';

const NerLiyaDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [currentProduct, setCurrentProduct] = useState({
    name: '', price: '', category_id: '', description: '', image_url: '', options: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: catData } = await supabase.from('categories').select('*');
      const { data: prodData } = await supabase.from('products').select('*, categories(name)');
      setCategories(catData || []);
      setProducts(prodData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uploadImage = async (file) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('product-images').upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = currentProduct.image_url;
      if (imageFile) imageUrl = await uploadImage(imageFile);

      const productData = {
        name: currentProduct.name,
        price: parseFloat(currentProduct.price),
        category_id: currentProduct.category_id || null,
        description: currentProduct.description,
        image_url: imageUrl,
        options: currentProduct.options || []
      };

      if (currentProduct.id) {
        await supabase.from('products').update(productData).eq('id', currentProduct.id);
      } else {
        await supabase.from('products').insert([productData]);
      }
      setIsEditing(false);
      fetchData();
    } catch (error) {
      alert("שגיאה בשמירה");
    }
    setLoading(false);
  };

  if (loading && products.length === 0) return <div className="p-10 text-center">טוען נתונים...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <div className="w-64 bg-white border-l p-6">
        <div className="flex items-center gap-2 mb-8 text-amber-600 font-bold text-xl">
          <Settings /> ניהול נרליה
        </div>
        <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-2 p-3 rounded-lg ${activeTab === 'products' ? 'bg-amber-50 text-amber-700' : ''}`}>
          <Package size={20} /> מוצרים
        </button>
      </div>

      <div className="flex-1 p-8">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">ניהול מוצרים</h1>
          {!isEditing && (
            <button onClick={() => { setCurrentProduct({name:'', price:'', options:[]}); setIsEditing(true); }} className="bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Plus size={20} /> מוצר חדש
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProduct} className="bg-white p-6 rounded-xl border space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="שם המוצר" className="p-2 border rounded" value={currentProduct.name} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} required />
              <input placeholder="מחיר" type="number" className="p-2 border rounded" value={currentProduct.price} onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})} required />
            </div>
            <select className="w-full p-2 border rounded" value={currentProduct.category_id} onChange={e => setCurrentProduct({...currentProduct, category_id: e.target.value})}>
              <option value="">בחר קטגוריה</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            
            <div className="border p-4 rounded-lg bg-gray-50">
              <div className="flex justify-between mb-2">
                <span className="font-bold">אופציות בחירה (כמו בטליתות)</span>
                <button type="button" className="text-amber-600 text-sm" onClick={() => setCurrentProduct({...currentProduct, options: [...(currentProduct.options || []), {title: '', items: [{name: '', price: 0}]}]})}>+ הוסף קבוצה</button>
              </div>
              {currentProduct.options?.map((group, gIdx) => (
                <div key={gIdx} className="bg-white p-3 border rounded mb-2">
                  <input placeholder="כותרת (למשל: סוג בד)" className="w-full mb-2 font-bold border-b" value={group.title} onChange={e => {
                    const newOps = [...currentProduct.options]; newOps[gIdx].title = e.target.value; setCurrentProduct({...currentProduct, options: newOps});
                  }} />
                  {group.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex gap-2 mb-1">
                      <input placeholder="שם האופציה" className="flex-1 text-sm border p-1 rounded" value={item.name} onChange={e => {
                        const newOps = [...currentProduct.options]; newOps[gIdx].items[iIdx].name = e.target.value; setCurrentProduct({...currentProduct, options: newOps});
                      }} />
                      <input placeholder="מחיר" type="number" className="w-20 text-sm border p-1 rounded" value={item.price} onChange={e => {
                        const newOps = [...currentProduct.options]; newOps[gIdx].items[iIdx].price = e.target.value; setCurrentProduct({...currentProduct, options: newOps});
                      }} />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-amber-600 text-white px-6 py-2 rounded-lg">שמור</button>
              <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 px-6 py-2 rounded-lg">ביטול</button>
            </div>
          </form>
        ) : (
          <div className="grid gap-2">
            {products.map(p => (
              <div key={p.id} className="bg-white p-3 border rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={p.image_url} className="w-12 h-12 object-cover rounded" alt="" />
                  <div>
                    <div className="font-bold">{p.name}</div>
                    <div className="text-sm text-gray-500">₪{p.price}</div>
                  </div>
                </div>
                <button onClick={() => { setCurrentProduct(p); setIsEditing(true); }} className="p-2 text-blue-600"><Edit size={20}/></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NerLiyaDashboard;
