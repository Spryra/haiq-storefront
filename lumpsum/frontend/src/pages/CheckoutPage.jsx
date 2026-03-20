import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import api from '../services/api'

// ── Step labels ──────────────────────────────────────────────────────────────
const STEPS = ['Details', 'Delivery', 'Payment', 'Review']

// ── Payment method definitions ───────────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    id: 'mtn_momo',
    label: 'MTN MoMo',
    icon: '📱',
    color: 'bg-yellow-400',
    description: 'Pay with MTN Mobile Money',
  },
  {
    id: 'airtel',
    label: 'Airtel Money',
    icon: '📲',
    color: 'bg-red-500',
    description: 'Pay with Airtel Money',
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    icon: '🏦',
    color: 'bg-blue-600',
    description: 'Direct bank deposit',
  },
]

// ── Field component ───────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-dark mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-dark focus:outline-none focus:border-primary transition bg-white"
    />
  )
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((label, i) => {
        const done    = i < current
        const active  = i === current
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${done   ? 'bg-primary text-dark'
                : active ? 'bg-dark text-light'
                : 'bg-gray-200 text-gray-400'}`}
              >
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] mt-1 font-medium tracking-wide ${active ? 'text-dark' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-10 h-0.5 mx-1 mb-4 ${i < current ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Order summary sidebar ─────────────────────────────────────────────────────
function OrderSummary({ items, subtotal, deliveryFee, total }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
      <h3 className="font-serif font-bold text-dark text-lg mb-4">Your Order</h3>
      <div className="space-y-3 mb-4">
        {items.map(item => (
          <div key={`${item.id}-${item.variant?.id}`} className="flex gap-3 items-center">
            <div className="w-12 h-12 rounded-xl bg-[#F0EBE3] overflow-hidden flex-shrink-0">
              {item.images?.[0]?.url && (
                <img src={item.images[0].url} alt={item.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark line-clamp-1">{item.name}</p>
              <p className="text-xs text-gray-400">{item.variant?.label} × {item.quantity}</p>
            </div>
            <p className="text-sm font-bold text-dark flex-shrink-0">
              UGX {Number(item.variant?.price * item.quantity).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium">UGX {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Delivery</span>
          <span className="font-medium">
            {deliveryFee === 0 ? 'Free' : `UGX ${deliveryFee.toLocaleString()}`}
          </span>
        </div>
        <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
          <span className="text-dark">Total</span>
          <span className="text-primary">UGX {total.toLocaleString()}</span>
        </div>
      </div>
      {subtotal >= 100000 && (
        <div className="mt-3 bg-green-50 text-green-700 text-xs font-medium px-3 py-2 rounded-xl text-center">
          🎉 You qualify for free delivery!
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [step,       setStep]       = useState(0)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)

  // Form state
  const [details, setDetails] = useState({
    first_name: '', last_name: '', email: '', phone: '',
  })
  const [delivery, setDelivery] = useState({
    delivery_address: '', delivery_note: '', gift_note: '',
  })
  const [payment, setPayment] = useState({
    method: '',
    payer_phone: '',
  })

  const deliveryFee = subtotal >= 100000 ? 0 : 5000
  const total       = subtotal + deliveryFee

  // Redirect to shop if cart empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🍪</p>
          <h2 className="font-serif text-2xl font-bold text-dark mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Add some products before checking out.</p>
          <Link to="/shop" className="bg-dark text-light px-6 py-3 rounded-full font-medium hover:bg-primary hover:text-dark transition">
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  // ── Field updaters ────────────────────────────────────────────────────────
  const upd = (setter) => (e) => setter(prev => ({ ...prev, [e.target.name]: e.target.value }))

  // ── Validation per step ───────────────────────────────────────────────────
  const canProceed = () => {
    if (step === 0) {
      return details.first_name && details.last_name && details.email && details.phone
    }
    if (step === 1) {
      return delivery.delivery_address.length >= 5
    }
    if (step === 2) {
      if (!payment.method) return false
      if (payment.method !== 'bank_transfer' && !payment.payer_phone) return false
      return true
    }
    return true
  }

  // ── Submit order ──────────────────────────────────────────────────────────
  const submitOrder = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/orders', {
        ...details,
        ...delivery,
        payment_method: payment.method,
        payer_phone:    payment.payer_phone || undefined,
        items: items.map(item => ({
          product_id: item.id,
          variant_id: item.variant.id,
          quantity:   item.quantity,
        })),
        consent_given: true,
      })

      clearCart()
      navigate(`/order-confirmation/${data.order.tracking_token}`, {
        state: { order: data.order }
      })
    } catch (err) {
      setError(err.response?.data?.error ?? 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  // ── Step renders ──────────────────────────────────────────────────────────
  const renderStep = () => {
    if (step === 0) return (
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-dark mb-6">Your Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name" required>
            <Input name="first_name" value={details.first_name} onChange={upd(setDetails)} placeholder="Amara" />
          </Field>
          <Field label="Last Name" required>
            <Input name="last_name" value={details.last_name} onChange={upd(setDetails)} placeholder="Nakato" />
          </Field>
        </div>
        <Field label="Email Address" required>
          <Input type="email" name="email" value={details.email} onChange={upd(setDetails)} placeholder="you@example.com" />
        </Field>
        <Field label="Phone Number" required>
          <Input name="phone" value={details.phone} onChange={upd(setDetails)} placeholder="+256 700 000 000" />
        </Field>
      </div>
    )

    if (step === 1) return (
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-dark mb-6">Delivery Details</h2>
        <Field label="Delivery Address" required>
          <textarea
            name="delivery_address"
            value={delivery.delivery_address}
            onChange={upd(setDelivery)}
            rows={3}
            placeholder="Plot 12, Kampala Road, Muyenga, Kampala"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-dark focus:outline-none focus:border-primary transition bg-white resize-none"
          />
        </Field>
        <Field label="Delivery Note">
          <Input name="delivery_note" value={delivery.delivery_note} onChange={upd(setDelivery)} placeholder="Gate colour, landmark, call on arrival..." />
        </Field>
        <Field label="Gift Note">
          <textarea
            name="gift_note"
            value={delivery.gift_note}
            onChange={upd(setDelivery)}
            rows={2}
            placeholder="Add a personal message to include in the box..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-dark focus:outline-none focus:border-primary transition bg-white resize-none"
          />
        </Field>
        {/* Delivery info */}
        <div className="bg-primary/10 rounded-2xl p-4">
          <p className="text-sm font-medium text-dark mb-1">📦 Delivery to Kampala</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Same-day delivery for orders placed before noon. Orders after noon deliver next morning.
            Delivery fee: <strong>UGX 5,000</strong> — waived on orders above UGX 100,000.
          </p>
        </div>
      </div>
    )

    if (step === 2) return (
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-dark mb-6">Payment Method</h2>

        {/* Method selection */}
        <div className="space-y-3">
          {PAYMENT_METHODS.map(m => (
            <button
              key={m.id}
              onClick={() => setPayment(p => ({ ...p, method: m.id }))}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                payment.method === m.id
                  ? 'border-dark bg-dark text-light'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className={`w-10 h-10 ${m.color} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                {m.icon}
              </div>
              <div>
                <p className="font-semibold text-sm">{m.label}</p>
                <p className={`text-xs ${payment.method === m.id ? 'text-light/60' : 'text-gray-400'}`}>
                  {m.description}
                </p>
              </div>
              <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                payment.method === m.id ? 'border-primary bg-primary' : 'border-gray-300'
              }`}>
                {payment.method === m.id && <div className="w-2 h-2 bg-dark rounded-full" />}
              </div>
            </button>
          ))}
        </div>

        {/* Phone number for mobile money */}
        {(payment.method === 'mtn_momo' || payment.method === 'airtel') && (
          <div className="mt-4">
            <Field label={`${payment.method === 'mtn_momo' ? 'MTN' : 'Airtel'} Phone Number`} required>
              <Input
                name="payer_phone"
                value={payment.payer_phone}
                onChange={upd(setPayment)}
                placeholder="+256 700 000 000"
              />
            </Field>
            <p className="text-xs text-gray-400 mt-2">
              You will receive a push notification on this number to approve the payment.
            </p>
          </div>
        )}

        {/* Bank transfer details */}
        {payment.method === 'bank_transfer' && (
          <div className="mt-4 bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <p className="font-semibold text-dark text-sm mb-3">Bank Transfer Details</p>
            <div className="space-y-2 text-sm">
              {[
                ['Bank', 'Stanbic Bank Uganda'],
                ['Account Name', 'HAIQ Bakery Ltd'],
                ['Account Number', '9030013788900'],
                ['Branch', 'Kampala Branch'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-dark">{value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              Use your order number as the payment reference. Your order will be confirmed once payment is verified — usually within 30 minutes.
            </p>
          </div>
        )}
      </div>
    )

    if (step === 3) return (
      <div>
        <h2 className="font-serif text-2xl font-bold text-dark mb-6">Review Your Order</h2>

        {/* Summary blocks */}
        {[
          {
            title: 'Your Details',
            step: 0,
            lines: [
              `${details.first_name} ${details.last_name}`,
              details.email,
              details.phone,
            ]
          },
          {
            title: 'Delivery',
            step: 1,
            lines: [
              delivery.delivery_address,
              delivery.delivery_note && `Note: ${delivery.delivery_note}`,
              delivery.gift_note && `Gift: "${delivery.gift_note}"`,
            ].filter(Boolean)
          },
          {
            title: 'Payment',
            step: 2,
            lines: [
              PAYMENT_METHODS.find(m => m.id === payment.method)?.label ?? '',
              payment.payer_phone && `Phone: ${payment.payer_phone}`,
            ].filter(Boolean)
          },
        ].map(block => (
          <div key={block.title} className="flex justify-between items-start py-4 border-b border-gray-100">
            <div>
              <p className="text-xs font-semibold text-primary tracking-widest uppercase mb-1">{block.title}</p>
              {block.lines.map((l, i) => (
                <p key={i} className="text-sm text-dark">{l}</p>
              ))}
            </div>
            <button
              onClick={() => setStep(block.step)}
              className="text-xs text-gray-400 hover:text-primary transition underline"
            >
              Edit
            </button>
          </div>
        ))}

        {/* Consent */}
        <div className="mt-6 p-4 bg-gray-50 rounded-2xl text-xs text-gray-500 leading-relaxed">
          By placing this order, you agree to our terms of service and consent to being contacted about your order via WhatsApp and email.
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-light min-h-screen">
      {/* Header bar */}
      <div className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/HAIQmain.png" alt="HAIQ" className="h-8 w-auto" />
          </Link>
          <Link to="/cart" className="text-sm text-gray-400 hover:text-dark transition">
            ← Back to cart
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10 max-w-5xl">
        <StepBar current={step} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              {renderStep()}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                {step > 0 ? (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="text-gray-400 hover:text-dark transition text-sm flex items-center gap-1"
                  >
                    ← Back
                  </button>
                ) : <div />}

                {step < 3 ? (
                  <button
                    onClick={() => setStep(s => s + 1)}
                    disabled={!canProceed()}
                    className="bg-dark text-light px-8 py-3 rounded-xl font-bold text-sm hover:bg-primary hover:text-dark transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    onClick={submitOrder}
                    disabled={loading}
                    className="bg-primary text-dark px-8 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Placing order…' : `Place Order — UGX ${total.toLocaleString()}`}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: order summary */}
          <div>
            <OrderSummary
              items={items}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
