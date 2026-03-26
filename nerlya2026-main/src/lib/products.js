import { supabase, supabaseUrl } from './supabase'

// Cache למוצרים - מאיץ את המעבר בין קטגוריות!
let productsCache = null
let cacheTime = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 דקות

/**
 * Get all products with their main images
 */
export async function getProducts() {
  // בדוק אם יש cache תקף
  const now = Date.now()
  if (productsCache && cacheTime && (now - cacheTime < CACHE_DURATION)) {
    return productsCache
  }
  // טען מוצרים עם הקטגוריות והתמונות שלהם
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (name),
      product_images (image_url, is_primary)
    `)
    .eq('is_active', true)  // 👈 רק מוצרים פעילים!
    .order('display_order', { ascending: true })
  if (error) {
    console.error('Error fetching products:', error)
    throw error
  }
  // עיבוד הנתונים - הוסף את שם הקטגוריה והתמונה הראשית
  const processedProducts = products.map(product => ({
    ...product,
    category: product.categories?.name,
    main_image_url: product.product_images?.find(img => img.is_primary)?.image_url || 
                    product.product_images?.[0]?.image_url || null
  }))
  // שמור ב-cache
  productsCache = processedProducts
  cacheTime = now
  return processedProducts
}

/**
 * Get a single product by ID with images
 */
export async function getProductById(productId) {
  const { data: product, error: productError } = await supabase
    .from('products')
    .select(`
      *,
      categories (name),
      product_images (image_url, is_primary, display_order)
    `)
    .eq('id', productId)
    .eq('is_active', true)  // 👈 גם פה - רק מוצרים פעילים!
    .single()
  if (productError) {
    console.error('Error fetching product:', productError)
    throw productError
  }
  if (!product) {
    return null
  }
  return {
    ...product,
    category: product.categories?.name,
    images: product.product_images || []
  }
}

/**
 * Get public URL for an image
 * התמונות כבר מגיעות עם URL מלא מהטבלה product_images
 */
export function getImageUrl(imageUrl) {
  if (!imageUrl) return null
  
  // אם זה כבר URL מלא - החזר אותו
  if (imageUrl.startsWith('http')) {
    return imageUrl
  }
  // אם זה רק שם קובץ - בנה URL מלא
  const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl
  return `${baseUrl}/storage/v1/object/public/product-images/${imageUrl}`
}

/**
 * Clear products cache
 */
export function clearProductsCache() {
  productsCache = null
  cacheTime = null
}

// ← נוסף: שליפת תוספות לפי קטגוריה (לטליתות)
export async function getAddonsByCategory(categoryId) {
  const { data, error } = await supabase
    .from('category_addons')
    .select(`
      product_addons (id, name, price)
    `)
    .eq('category_id', categoryId)
  if (error) {
    console.error('Error fetching addons:', error)
    return []
  }
  return data?.map(row => row.product_addons).filter(Boolean) || []
}
