import { Link } from 'react-router-dom'

export default function Breadcrumbs({ items }) {
  return (
    <nav className="py-4 px-4 md:px-8 bg-gray-50 border-b border-gray-200" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center gap-2 text-sm">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-gray-400">/</span>
              )}
              {item.link ? (
                <Link 
                  to={item.link}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-black font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
}