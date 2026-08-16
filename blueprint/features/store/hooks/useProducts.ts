import { useState, useMemo } from 'react'
import { loadProducts, loadProduct, Product } from '@/config/products'

export function useProducts() {
  const [products] = useState(() => loadProducts())
  return { products }
}

export function useProduct(slug: string) {
  const [product] = useState(() => loadProduct(slug))
  return { product }
}

export function useFilteredProducts(products: Product[], activeCategory: string) {
  const filtered = useMemo(() => {
    if (activeCategory === 'all') return products
    return products.filter((p) => p.category === activeCategory)
  }, [products, activeCategory])

  const allCategories = useMemo(() => {
    const catSet = new Set<string>()
    products.forEach((p) => {
      if (p.category) catSet.add(p.category)
    })
    return Array.from(catSet).sort()
  }, [products])

  return { filtered, allCategories }
}
