import { useCart } from '@/hooks/useCart'
import styles from './CartButton.module.css'

export default function CartButton() {
  const { itemCount, openCart } = useCart()

  return (
    <button
      className={styles.cartButton}
      onClick={openCart}
      aria-label={`Cart with ${itemCount} items`}
    >
      <svg
        className={styles.cartButton__icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
      {itemCount > 0 && <span className={styles.cartButton__count}>{itemCount}</span>}
    </button>
  )
}
