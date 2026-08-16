import { Product } from '@/config/products'
import Standard from './variants/Standard'

const variants = {
  standard: Standard,
} as const

export default function ProductDetail({ product }: { product: Product }) {
  const Variant = variants.standard
  return <Variant product={product} />
}
