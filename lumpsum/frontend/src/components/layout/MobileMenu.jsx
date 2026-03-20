import { Link } from 'react-router-dom'
import { useEffect } from 'react'

export default function MobileMenu({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-dark/95 text-light flex flex-col">
      <div className="flex justify-end p-4">
        <button onClick={onClose} className="text-2xl">&times;</button>
      </div>
      <div className="flex flex-col items-center justify-center flex-1 space-y-6 text-xl">
        <Link to="/shop" onClick={onClose}>Shop</Link>
        <Link to="/build-your-own" onClick={onClose}>Build Your Box</Link>
        <Link to="/contact" onClick={onClose}>Contact</Link>
        <Link to="/account" onClick={onClose}>Account</Link>
        <Link to="/faq" onClick={onClose}>FAQ</Link>
      </div>
    </div>
  )
}