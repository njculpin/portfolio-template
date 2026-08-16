import { useConfig } from '@/hooks/useConfig'
import { Product } from '@/config/products'
import Grid from './variants/Grid'

const variants = {
  grid: Grid,
} as const

export default function ProductGrid({ products }: { products: Product[] }) {
  const config = useConfig()
  const layout = (config.store?.layout || 'grid') as keyof typeof variants
  const Variant = variants[layout] || Grid

  return <Variant products={products} />
}
