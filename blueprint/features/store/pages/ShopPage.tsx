import { useState } from 'react'
import { useProducts, useFilteredProducts } from '@/hooks/useProducts'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMetaTags } from '@/hooks/useMetaTags'
import TagFilter from '@/components/TagFilter/TagFilter'
import ProductGrid from '@/components/ProductGrid/ProductGrid'

export default function ShopPage() {
  useDocumentTitle('Shop')
  useMetaTags({ title: 'Shop' })
  const { products } = useProducts()
  const [activeCategory, setActiveCategory] = useState('all')
  const { filtered, allCategories } = useFilteredProducts(products, activeCategory)

  return (
    <div>
      {allCategories.length > 1 && (
        <TagFilter tags={allCategories} activeTag={activeCategory} onFilter={setActiveCategory} />
      )}
      <ProductGrid products={filtered} />
    </div>
  )
}
