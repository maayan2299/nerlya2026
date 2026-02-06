import ProductCard from './ProductCard'

export default function ProductGrid({ products, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10" dir="rtl">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse space-y-4">
            <div className="aspect-square bg-gray-100 rounded-sm shadow-sm" />
            <div className="space-y-2 px-2">
              <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto"></div>
              <div className="h-3 bg-gray-50 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-32" dir="rtl">
        <p className="text-gray-300 text-xl font-serif italic tracking-wide">לא נמצאו מוצרים בקולקציה זו</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10" dir="rtl">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}