import { useState } from 'react'
import { motion } from 'motion/react'
import { Product } from '@/config/products'
import { useConfig } from '@/hooks/useConfig'
import { useCart } from '@/hooks/useCart'
import { getProductImageUrl } from '@/utils/media'
import styles from './Standard.module.css'

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)
}

export default function Standard({ product }: { product: Product }) {
  const config = useConfig()
  const { addItem } = useCart()
  const currency = config.store?.currency || 'usd'
  const [selectedVariant, setSelectedVariant] = useState(product.variants.length > 0 ? 0 : -1)
  const [activeImage, setActiveImage] = useState(0)

  const allImages = [{ src: product.cover, alt: product.title }, ...product.images]

  const variant = selectedVariant >= 0 ? product.variants[selectedVariant] : null
  const currentPrice = variant ? variant.price : product.price
  const currentVariantName = variant ? variant.name : ''

  function handleAddToCart() {
    addItem({
      slug: product.slug,
      title: product.title,
      price: currentPrice,
      providerId: variant?.providerId || product.providerId,
      variantName: currentVariantName,
      image: product.cover,
    })
  }

  return (
    <div className={styles.detail}>
      <div className={styles.detail__gallery}>
        <motion.div
          className={styles.detail__mainImage}
          key={activeImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={getProductImageUrl(product.slug, allImages[activeImage].src)}
            alt={allImages[activeImage].alt}
            className={styles.detail__image}
          />
        </motion.div>
        {allImages.length > 1 && (
          <div className={styles.detail__thumbnails}>
            {allImages.map((img, i) => (
              <button
                key={i}
                className={`${styles.detail__thumb} ${
                  i === activeImage ? styles['detail__thumb--active'] : ''
                }`}
                onClick={() => setActiveImage(i)}
              >
                <img
                  src={getProductImageUrl(product.slug, img.src)}
                  alt={img.alt}
                  className={styles.detail__thumbImage}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.detail__info}>
        <h1 className={styles.detail__title}>{product.title}</h1>

        <div className={styles.detail__pricing}>
          <span className={styles.detail__price}>{formatPrice(currentPrice, currency)}</span>
          {product.compareAtPrice && product.compareAtPrice > currentPrice && (
            <span className={styles.detail__comparePrice}>
              {formatPrice(product.compareAtPrice, currency)}
            </span>
          )}
        </div>

        {product.description && <p className={styles.detail__description}>{product.description}</p>}

        {product.edition && <p className={styles.detail__edition}>Edition: {product.edition}</p>}

        {product.variants.length > 0 && (
          <div className={styles.detail__variants}>
            <span className={styles.detail__variantLabel}>Option</span>
            <div className={styles.detail__variantOptions}>
              {product.variants.map((v, i) => (
                <button
                  key={v.name}
                  className={`${styles.detail__variantBtn} ${
                    i === selectedVariant ? styles['detail__variantBtn--active'] : ''
                  }`}
                  onClick={() => setSelectedVariant(i)}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          className={styles.detail__addToCart}
          onClick={handleAddToCart}
          disabled={!product.inStock}
        >
          {product.inStock ? 'Add to Cart' : 'Sold Out'}
        </button>

        {product.tags.length > 0 && (
          <div className={styles.detail__tags}>
            {product.tags.map((tag) => (
              <span key={tag} className={styles.detail__tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
