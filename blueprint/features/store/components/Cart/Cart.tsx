import { motion, AnimatePresence } from 'motion/react'
import { useCart } from '@/hooks/useCart'
import { useConfig } from '@/hooks/useConfig'
import { useCheckout } from '@/checkout-handler'
import { getProductImageUrl } from '@/utils/media'
import styles from './Cart.module.css'

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)
}

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, isOpen, closeCart } = useCart()
  const config = useConfig()
  const currency = config.store?.currency || 'usd'
  const { handleCheckout: doCheckout } = useCheckout()

  function handleCheckout() {
    doCheckout(items, config)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.cart__backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
          />
          <motion.aside
            className={styles.cart}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className={styles.cart__header}>
              <h2 className={styles.cart__title}>Cart</h2>
              <button className={styles.cart__close} onClick={closeCart} aria-label="Close cart">
                &times;
              </button>
            </div>

            {items.length === 0 ? (
              <p className={styles.cart__empty}>Your cart is empty</p>
            ) : (
              <>
                <div className={styles.cart__items}>
                  {items.map((item) => (
                    <div key={`${item.slug}-${item.variantName}`} className={styles.cart__item}>
                      <img
                        src={getProductImageUrl(item.slug, item.image)}
                        alt={item.title}
                        className={styles.cart__itemImage}
                      />
                      <div className={styles.cart__itemInfo}>
                        <span className={styles.cart__itemTitle}>
                          {item.title}
                          {item.variantName && ` — ${item.variantName}`}
                        </span>
                        <span className={styles.cart__itemPrice}>
                          {formatPrice(item.price, currency)}
                        </span>
                        <div className={styles.cart__itemQuantity}>
                          <button
                            className={styles.cart__qtyBtn}
                            onClick={() =>
                              updateQuantity(item.slug, item.quantity - 1, item.variantName)
                            }
                          >
                            &minus;
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            className={styles.cart__qtyBtn}
                            onClick={() =>
                              updateQuantity(item.slug, item.quantity + 1, item.variantName)
                            }
                          >
                            +
                          </button>
                        </div>
                        <button
                          className={styles.cart__removeBtn}
                          onClick={() => removeItem(item.slug, item.variantName)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.cart__footer}>
                  <div className={styles.cart__subtotal}>
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal, currency)}</span>
                  </div>
                  <button className={styles.cart__checkout} onClick={handleCheckout}>
                    Checkout
                  </button>
                  <button className={styles.cart__clear} onClick={clearCart}>
                    Clear Cart
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
