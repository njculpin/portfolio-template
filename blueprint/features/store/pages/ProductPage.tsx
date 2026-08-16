import { useParams, Link } from 'react-router'
import { useProduct } from '@/hooks/useProducts'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMetaTags } from '@/hooks/useMetaTags'
import { getProductImageUrl } from '@/utils/media'
import ProductDetail from '@/components/ProductDetail/ProductDetail'
import styles from './ProductPage.module.css'

export default function ProductPage() {
  const { slug } = useParams()
  const { product } = useProduct(slug!)
  useDocumentTitle(product?.title)
  useMetaTags(
    product
      ? {
          title: product.title,
          description: product.description,
          image: getProductImageUrl(product.slug, product.cover),
        }
      : undefined,
  )

  if (!product) {
    return (
      <div className={styles.productPage__notFound}>
        <h1 className={styles.productPage__notFoundTitle}>Product not found</h1>
        <Link to="/shop" className={styles.productPage__notFoundLink}>
          Back to shop
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/shop" className={styles.productPage__back}>
        &larr; Back to Shop
      </Link>
      <ProductDetail product={product} />
    </div>
  )
}
