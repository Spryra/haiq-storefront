import Button from '../shared/Button'

export default function AddToCartButton({ onClick }) {
  return (
    <Button onClick={onClick} className="w-full mb-4">
      Add to Cart
    </Button>
  )
}