import { Product } from '@/config/products'
import ProductCard from '@/components/ProductCard/ProductCard'
import styles from './Grid.module.css'

export default function Grid({ products }: { products: Product[] }) {
  return (
    <div className={styles.grid}>
      {products.map((product, i) => (
        <ProductCard key={product.slug} product={product} index={i} />
      ))}
    </div>
  )
}
