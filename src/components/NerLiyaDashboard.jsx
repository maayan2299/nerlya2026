import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  LayoutDashboard, Package, FolderTree, LogOut, Plus, 
  Trash2, Edit, Save, X, Upload, ChevronRight, Settings,
  CheckCircle2, AlertCircle
} from 'lucide-react';

const NerLiyaDashboard = () => {
  // State Management
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Forms State
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    name: '', price: '', category_id: '', description: '', image_url: '', options: []
  });
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    name: '', image_url: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [categoryImageFile, setCategoryImageFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: catData } = await supabase.from('categories').select('*');
    const { data: prodData } = await supabase.from('products').select('*, categories(name)');
    setCategories(catData || []);
    setProducts(prodData || []);
    setLoading(false);
  };

  // --- Image Upload Logic ---
  const uploadImage = async (file, bucket) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // --- Options Management Logic ---
  const addOptionGroup = () => {
    const newOptions = [...(currentProduct.options || []), { title: '', items: [{ name: '', price: 0 }] }];
    setCurrentProduct({ ...currentProduct, options: newOptions });
  };

  const updateOptionTitle = (index, title) => {
    const newOptions = [...currentProduct.options];
    newOptions[index].title = title;
    setCurrentProduct({ ...currentProduct, options: newOptions });
  };

  const addOptionItem = (groupIndex) => {
    const newOptions = [...currentProduct.options];
    newOptions[groupIndex].items.push({ name: '', price: 0 });
    setCurrentProduct({ ...currentProduct, options: newOptions });
  };

  const updateOptionItem = (groupIndex, itemIndex, field, value) => {
    const newOptions = [...currentProduct.options];
    newOptions[groupIndex].items[itemIndex][field] = value;
    setCurrentProduct({ ...currentProduct, options: newOptions });
  };

  const removeOptionGroup = (index) => {
    const newOptions = currentProduct.options.filter((_, i) => i !== index);
    setCurrentProduct({ ...currentProduct, options: newOptions });
  };

  // --- Save Product ---
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = currentProduct.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'product-images');
      }

      const productData = {
        name: currentProduct.name,
        price: parseFloat(currentProduct.price),
        category_id: currentProduct.category_id,
        description: currentProduct.description,
        image_url: imageUrl,
        options: currentProduct.options || []
      };

      if (isEditing) {
        await supabase.from('products').update(productData).eq('id', currentProduct.id);
        setMessage({ text: 'המוצר עודכן בהצלחה', type: 'success' });
      } else {
        await supabase.from('products').insert([productData]);
        setMessage({ text: 'מוצר חדש נוסף בהצלחה', type: 'success' });
      }

      setIsEditing(false);
      setCurrentProduct({ name: '', price: '', category_id: '', description: '', image_url: '', options: [] });
      setImageFile(null);
      fetchData();
    } catch (error) {
      setMessage({ text: 'שגיאה בשמירה', type: 'error' });
    }
    setLoading(false);
  };

  // ... (שאר הפונקציות של הקטגוריות נשארות אותו דבר, רק נשתמש בתיקיית product-images גם להן)

  return (
    <div className="min-h-screen bg-gray-50 flex dir-rtl" dir="rtl">
      {/* Sidebar */}
      <div className="w-64 bg-white border-l border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
            <Settings className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-gray-800">ניהול נרליה</span>
        </div>
        
        <nav className="space-y-2">
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Package size={20} />
            <span className="font-medium">מוצרים</span>
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'categories' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <FolderTree size={20} />
            <span className="font-medium">קטגוריות</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeTab === 'products' && (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">ניהול מוצרים</h1>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus size={20} /> מוצר חדש
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                <form onSubmit={handleSaveProduct} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">שם המוצר</label>
                      <input 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                        value={currentProduct.name}
                        onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">מחיר בסיס</label>
                      <input 
                        type="number"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                        value={currentProduct.price}
                        onChange={(e) => setCurrentProduct({...currentProduct, price: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  {/* ניהול אופציות (כמו בטליתות) */}
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-700 text-lg">אפשרויות בחירה (תוספות)</h3>
                      <button 
                        type="button"
                        onClick={addOptionGroup}
                        className="text-sm bg-white border border-amber-600 text-amber-600 px-3 py-1 rounded hover:bg-amber-600 hover:text-white transition-colors"
                      >
                        + הוסף קבוצת אפשרויות (למשל: סוג בד)
                      </button>
                    </div>

                    {(currentProduct.options || []).map((group, gIdx) => (
                      <div key={gIdx} className="bg-white p-4 rounded-lg border border-gray-200 mb-4 shadow-sm">
                        <div className="flex gap-4 mb-4">
                          <input 
                            placeholder="שם הקבוצה (למשל: סוג קשירה)"
                            className="flex-1 px-3 py-2 border rounded font-bold"
                            value={group.title}
                            onChange={(e) => updateOptionTitle(gIdx, e.target.value)}
                          />
                          <button type="button" onClick={() => removeOptionGroup(gIdx)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        <div className="space-y-3 pr-6 border-r-2 border-amber-100">
                          {group.items.map((item, iIdx) => (
                            <div key={iIdx} className="flex gap-4 items-center">
                              <input 
                                placeholder="שם האופציה (למשל: עבודת יד)"
                                className="flex-1 px-3 py-1 border rounded text-sm"
                                value={item.name}
                                onChange={(e) => updateOptionItem(gIdx, iIdx, 'name', e.target.value)}
                              />
                              <input 
                                type="number"
                                placeholder="תוספת מחיר"
                                className="w-24 px-3 py-1 border rounded text-sm"
                                value={item.price}
                                onChange={(e) => updateOptionItem(gIdx, iIdx, 'price', e.target.value)}
                              />
                              <button type="button" onClick={() => {
                                const newOpts = [...currentProduct.options];
                                newOpts[gIdx].items = newOpts[gIdx].items.filter((_, i) => i !== iIdx);
                                setCurrentProduct({...currentProduct, options: newOpts});
                              }} className="text-gray-400 hover:text-red-500">
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                          <button 
                            type="button"
                            onClick={() => addOptionItem(gIdx)}
                            className="text-xs text-amber-600 font-medium hover:underline"
                          >
                            + הוסף פריט לרשימה
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button type="submit" className="flex-1 bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition-all flex items-center justify-center gap-2">
                      <Save size={20} /> שמור מוצר
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-8 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-all font-medium"
                    >
                      ביטול
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="grid gap-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 group">
                    <img src={product.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.categories?.name} • ₪{product.price}</p>
                      {product.options?.length > 0 && (
                        <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                          כולל אפשרויות בחירה ({product.options.length})
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => {
                          setCurrentProduct(product);
                          setIsEditing(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit size={20} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* קוד ניהול קטגוריות נשאר כאן למטה - אפשר להוסיף אותו באותו אופן */}
      </div>
    </div>
  );
};

export default NerLiyaDashboard;
