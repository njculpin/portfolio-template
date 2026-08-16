import { Link } from 'react-router'
import { motion } from 'motion/react'
import { Product } from '@/config/products'
import { getProductImageUrl } from '@/utils/media'
import { useConfig } from '@/hooks/useConfig'
import styles from './ProductCard.module.css'

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)
}

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const config = useConfig()
  const currency = config.store?.currency || 'usd'

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4 }}
      layout
    >
      <Link to={`/shop/${product.slug}`} className={styles.card__link}>
        <div className={styles.card__imageWrap}>
          <img
            src={getProductImageUrl(product.slug, product.cover)}
            alt={product.title}
            className={styles.card__image}
            loading="lazy"
          />
          {!product.inStock && <span className={styles.card__badge}>Sold Out</span>}
          {product.edition && product.inStock && (
            <span className={styles['card__badge--edition']}>{product.edition}</span>
          )}
        </div>
        <div className={styles.card__info}>
          <h3 className={styles.card__title}>{product.title}</h3>
          <div className={styles.card__pricing}>
            <span className={styles.card__price}>{formatPrice(product.price, currency)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className={styles.card__comparePrice}>
                {formatPrice(product.compareAtPrice, currency)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
