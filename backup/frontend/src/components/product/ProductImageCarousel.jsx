import { useState } from 'react'

export default function ProductImageCarousel({ images }) {
  const [mainImage, setMainImage] = useState(images?.[0]?.url || '/placeholder-product.webp')

  if (!images || images.length === 0) {
    return <img src="/placeholder-product.webp" alt="Product" className="w-full rounded-lg" />
  }

  return (
    <div>
      <img src={mainImage} alt="Product" className="w-full rounded-lg mb-4" />
      <div className="flex space-x-2 overflow-x-auto">
        {images.map((img, idx) => (
          <button key={idx} onClick={() => setMainImage(img.url)} className="flex-none w-20 h-20 border-2 rounded overflow-hidden hover:border-primary">
            <img src={img.url} alt={img.alt_text} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}