import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const DELIVERY_FEE = 5000

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ['Your Order', 'Your Details', 'Payment', 'Confirm']
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((label, i) => {
        const n = i + 1
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: step >= n ? '#B8752A' : 'rgba(61,32,0,0.6)',
                  color:      step >= n ? '#1A0A00' : '#8C7355',
                  border:     step === n ? '2px solid #E8C88A' : '2px solid transparent',
                }}
              >
                {step > n ? '✓' : n}
              </div>
              <p className="text-[9px] mt-1 hidden md:block whitespace-nowrap"
                style={{ color: step === n ? '#B8752A' : '#8C7355' }}>{label}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px mx-2"
                style={{ background: step > n ? '#B8752A' : 'rgba(61,32,0,0.6)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Box row in order summary — collapsible ────────────────────────────────────
function BoxSummaryRow({ item }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-4">
      {/* Box header row — only shows box total price, not individual cookies */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-2 text-left group"
          >
            <p className="font-serif font-bold text-sm" style={{ color: '#F2EAD8' }}>
              {item.name}
            </p>
            <span
              className="text-[10px] transition-all duration-200"
              style={{ color: '#8C7355', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
            >▾</span>
          </button>
          <p className="text-[10px] mt-0.5" style={{ color: '#8C7355' }}>Box of 4 · tap to see contents</p>
        </div>
        {/* Box price only — no individual cookie prices */}
        <p className="font-bold text-sm flex-shrink-0" style={{ color: '#B8752A' }}>
          UGX {(item.price * item.quantity).toLocaleString()}
        </p>
      </div>

      {/* Collapsible cookie list — names only, no prices */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '200px' : '0' }}
      >
        <div className="mt-2 space-y-1 pl-3"
          style={{ borderLeft: '2px solid rgba(184,117,42,0.25)', paddingLeft: '10px', paddingTop: '4px' }}>
          {item.boxContents?.map((cookie, i) => (
            <p key={i} className="text-[11px]" style={{ color: 'rgba(242,234,216,0.45)' }}>
              {cookie.quantity}× {cookie.name}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Order Summary sidebar ─────────────────────────────────────────────────────
function OrderSummary({ items, subtotal }) {
  const total = subtotal + DELIVERY_FEE

  return (
    <div className="sticky top-6 p-5" style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.2)' }}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: '#8C7355' }}>
        Order Summary
      </p>

      {items.map(item => (
        item.itemType === 'box'
          ? <BoxSummaryRow key={item.key} item={item} />
          : (
            <div key={item.key} className="flex justify-between mb-3">
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs truncate" style={{ color: '#F2EAD8' }}>
                  {item.quantity}× {item.name}
                </p>
                <p className="text-[10px]" style={{ color: '#8C7355' }}>{item.variantLabel}</p>
              </div>
              <p className="text-xs font-medium whitespace-nowrap" style={{ color: 'rgba(242,234,216,0.7)' }}>
                UGX {(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          )
      ))}

      <div className="pt-3 space-y-1.5 mt-2" style={{ borderTop: '1px solid rgba(184,117,42,0.2)' }}>
        <div className="flex justify-between text-xs">
          <span style={{ color: '#8C7355' }}>Subtotal</span>
          <span style={{ color: 'rgba(242,234,216,0.7)' }}>UGX {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span style={{ color: '#8C7355' }}>Delivery</span>
          <span style={{ color: 'rgba(242,234,216,0.7)' }}>UGX {DELIVERY_FEE.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm font-bold pt-2" style={{ borderTop: '1px solid rgba(184,117,42,0.2)' }}>
          <span style={{ color: '#F2EAD8' }}>Total</span>
          <span style={{ color: '#E8C88A' }}>UGX {total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

// ── Step 1: Order review ──────────────────────────────────────────────────────
function Step1Review({ items, onNext }) {
  return (
    <div>
      <h2 className="font-serif font-bold text-2xl mb-6" style={{ color: '#F2EAD8' }}>Review Your Order</h2>

      <div className="space-y-3 mb-8">
        {items.map(item => (
          item.itemType === 'box' ? (
            <ReviewBoxCard key={item.key} item={item} />
          ) : (
            <ReviewSingleCard key={item.key} item={item} />
          )
        ))}
      </div>

      <button onClick={onNext}
        className="w-full py-4 font-bold text-[11px] tracking-[0.25em] uppercase transition hover:opacity-90"
        style={{ background: '#B8752A', color: '#1A0A00' }}>
        Continue to Details →
      </button>
    </div>
  )
}

function ReviewBoxCard({ item }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="p-4" style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.2)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-serif font-bold text-sm" style={{ color: '#F2EAD8' }}>{item.name}</p>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5"
              style={{ background: 'rgba(232,200,138,0.12)', color: '#E8C88A' }}>Box</span>
          </div>
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-1.5 mt-1.5 hover:opacity-70 transition"
            style={{ color: '#8C7355' }}
          >
            <span className="text-[10px]">{open ? 'Hide contents' : 'See cookies inside'}</span>
            <span className="text-[10px] transition-transform duration-200"
              style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
          </button>

          {/* Cookie list — no prices */}
          <div className="overflow-hidden transition-all duration-300"
            style={{ maxHeight: open ? '200px' : '0' }}>
            <div className="mt-2 space-y-1 pl-3"
              style={{ borderLeft: '2px solid rgba(184,117,42,0.25)', paddingLeft: '10px' }}>
              {item.boxContents?.map((cookie, i) => (
                <p key={i} className="text-[11px]" style={{ color: 'rgba(242,234,216,0.45)' }}>
                  {cookie.quantity}× {cookie.name}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Box total only */}
        <p className="font-bold text-base flex-shrink-0" style={{ color: '#E8C88A' }}>
          UGX {(item.price).toLocaleString()}
        </p>
      </div>
    </div>
  )
}

function ReviewSingleCard({ item }) {
  return (
    <div className="flex items-center gap-3 p-4"
      style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.2)' }}>
      <div className="w-10 h-10 flex-shrink-0 overflow-hidden" style={{ background: '#1A0A00' }}>
        {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: '#F2EAD8' }}>{item.name}</p>
        <p className="text-[10px]" style={{ color: '#8C7355' }}>Qty: {item.quantity}</p>
      </div>
      <p className="text-xs font-bold flex-shrink-0" style={{ color: '#B8752A' }}>
        UGX {(item.price * item.quantity).toLocaleString()}
      </p>
    </div>
  )
}

// ── Payment method button ─────────────────────────────────────────────────────
function PayBtn({ value, label, desc, icon, selected, onSelect }) {
  return (
    <button onClick={() => onSelect(value)}
      className="w-full flex items-center gap-4 p-4 text-left transition-all"
      style={{
        background: selected ? 'rgba(184,117,42,0.1)' : 'rgba(42,18,0,0.5)',
        border:     selected ? '1px solid #B8752A' : '1px solid rgba(61,32,0,0.8)',
      }}>
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-bold" style={{ color: '#F2EAD8' }}>{label}</p>
        <p className="text-[10px]" style={{ color: '#8C7355' }}>{desc}</p>
      </div>
      <div className="w-4 h-4 rounded-full flex-shrink-0 transition-all"
        style={{
          border:     `2px solid ${selected ? '#B8752A' : '#3D2000'}`,
          background: selected ? '#B8752A' : 'transparent',
        }} />
    </button>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, subtotal, toOrderItems, clearCart } = useCart()
  const [step, setStep] = useState(1)

  const [details, setDetails] = useState({
    first_name:       user?.first_name || (user?.full_name?.split(' ')[0] ?? ''),
    last_name:        user?.last_name  || (user?.full_name?.split(' ').slice(1).join(' ') ?? ''),
    email:            user?.email  || '',
    phone:            user?.phone  || '',
    delivery_address: '',
    delivery_note:    '',
  })

  const [payMethod,   setPayMethod]   = useState('')
  const [payerPhone,  setPayerPhone]  = useState(details.phone || '')
  const [consent,     setConsent]     = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const total = subtotal + DELIVERY_FEE
  const upd = field => e => setDetails(d => ({ ...d, [field]: e.target.value }))

  useEffect(() => {
    if (items.length === 0) navigate('/shop', { replace: true })
  }, [items, navigate])

  const detailsValid =
    details.first_name.trim() && details.last_name.trim() &&
    details.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email) &&
    details.phone.trim() && details.delivery_address.trim().length >= 5

  const paymentValid =
    payMethod !== '' &&
    (payMethod === 'cash_on_delivery' || payMethod === 'bank_transfer' ||
     payerPhone.replace(/\D/g,'').length >= 9)

  const handleSubmit = async () => {
    if (!consent) { setSubmitError('Please confirm your agreement.'); return }
    setSubmitting(true); setSubmitError(null)
    try {
      const body = {
        first_name:       details.first_name.trim(),
        last_name:        details.last_name.trim(),
        email:            details.email.trim().toLowerCase(),
        phone:            details.phone.trim(),
        delivery_address: details.delivery_address.trim(),
        delivery_note:    details.delivery_note.trim() || undefined,
        items:            toOrderItems(),
        payment_method:   payMethod,
        consent_given:    true,
      }
      if (payMethod === 'mtn_momo' || payMethod === 'airtel') {
        body.payer_phone = payerPhone.trim()
      }
      const { data } = await api.post('/orders', body)
      clearCart()
      navigate(`/order-confirmation/${data.tracking_token || data.order?.tracking_token}`)
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Something went wrong. Please try again.'
      setSubmitError(msg)
    } finally { setSubmitting(false) }
  }

  if (items.length === 0) return null

  const inputStyle = { background: '#1A0A00', border: '1px solid #3D2000', color: '#F2EAD8' }
  const inputClass = 'w-full px-4 py-3 text-sm focus:outline-none transition-colors'
  const lbl = (text, req) => (
    <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5"
      style={{ color: '#8C7355' }}>
      {text}{req && <span style={{ color: '#B8752A' }}> *</span>}
    </label>
  )

  return (
    <div style={{ background: '#0E0600', minHeight: '100vh' }}>
      <div className="flex items-center justify-between px-6 md:px-12 py-4"
        style={{ borderBottom: '1px solid rgba(184,117,42,0.2)', background: '#1A0A00' }}>
        <Link to="/"><img src="/HAIQmain.png" alt="HAIQ" className="h-9 w-auto object-contain" /></Link>
        <Link to="/shop" className="text-[10px] font-semibold uppercase tracking-[0.2em] hover:opacity-70 transition"
          style={{ color: '#8C7355' }}>← Back to Shop</Link>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-10 max-w-5xl">
        <StepBar step={step} />

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-6">

            {/* Step 1 */}
            {step === 1 && <Step1Review items={items} onNext={() => setStep(2)} />}

            {/* Step 2 */}
            {step === 2 && (
              <div>
                <h2 className="font-serif font-bold text-2xl mb-6" style={{ color: '#F2EAD8' }}>Your Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>{lbl('First Name', true)}<input className={inputClass} style={inputStyle} value={details.first_name} onChange={upd('first_name')} placeholder="Amara"/></div>
                    <div>{lbl('Last Name', true)}<input className={inputClass} style={inputStyle} value={details.last_name} onChange={upd('last_name')} placeholder="Nakato"/></div>
                  </div>
                  <div>{lbl('Email', true)}<input type="email" className={inputClass} style={inputStyle} value={details.email} onChange={upd('email')} placeholder="you@example.com"/></div>
                  <div>{lbl('Phone', true)}<input type="tel" className={inputClass} style={inputStyle} value={details.phone} onChange={upd('phone')} placeholder="+256 700 000 000"/></div>
                  <div>{lbl('Delivery Address', true)}<textarea rows={2} className={`${inputClass} resize-none`} style={inputStyle} value={details.delivery_address} onChange={upd('delivery_address')} placeholder="Plot 12, Muyenga Hill, Kampala..."/></div>
                  <div>{lbl('Delivery Note')}<input className={inputClass} style={inputStyle} value={details.delivery_note} onChange={upd('delivery_note')} placeholder="Leave at gate / call on arrival…"/></div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="flex-1 py-3.5 font-bold text-[11px] tracking-[0.2em] uppercase transition"
                    style={{ border: '1px solid rgba(184,117,42,0.4)', color: '#B8752A' }}>← Back</button>
                  <button onClick={() => setStep(3)} disabled={!detailsValid}
                    className="flex-1 py-3.5 font-bold text-[11px] tracking-[0.2em] uppercase transition disabled:opacity-40"
                    style={{ background: '#B8752A', color: '#1A0A00' }}>Continue to Payment →</button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div>
                <h2 className="font-serif font-bold text-2xl mb-6" style={{ color: '#F2EAD8' }}>Payment Method</h2>
                <div className="space-y-3 mb-6">
                  <PayBtn value="mtn_momo"         label="MTN Mobile Money"  desc="Approve the prompt on your MTN line."           icon="📱" selected={payMethod==='mtn_momo'}         onSelect={setPayMethod}/>
                  <PayBtn value="airtel"            label="Airtel Money"      desc="Approve the prompt on your Airtel line."        icon="📲" selected={payMethod==='airtel'}            onSelect={setPayMethod}/>
                  <PayBtn value="bank_transfer"     label="Bank Transfer"     desc="Transfer and upload your proof of payment."     icon="🏦" selected={payMethod==='bank_transfer'}     onSelect={setPayMethod}/>
                  <PayBtn value="cash_on_delivery"  label="Cash on Delivery"  desc="Pay in cash when your order arrives."          icon="💵" selected={payMethod==='cash_on_delivery'}  onSelect={setPayMethod}/>
                </div>

                {(payMethod==='mtn_momo'||payMethod==='airtel') && (
                  <div className="mb-5">
                    {lbl(`${payMethod==='mtn_momo'?'MTN':'Airtel'} number to charge`, true)}
                    <input type="tel" className={inputClass} style={inputStyle} value={payerPhone} onChange={e=>setPayerPhone(e.target.value)} placeholder="+256 700 000 000"/>
                  </div>
                )}

                {payMethod==='bank_transfer' && (
                  <div className="mb-5 p-4" style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.2)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-3" style={{ color: '#B8752A' }}>Bank Details</p>
                    {[['Bank','Stanbic Bank Uganda'],['Account','9030012345678'],['Name','HAIQ Bakery Ltd'],['Branch','Kampala Road']].map(([k,v])=>(
                      <div key={k} className="flex justify-between mb-1.5">
                        <span className="text-[11px]" style={{ color: '#8C7355' }}>{k}</span>
                        <span className="text-[11px] font-medium" style={{ color: '#F2EAD8' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 py-3.5 font-bold text-[11px] tracking-[0.2em] uppercase"
                    style={{ border: '1px solid rgba(184,117,42,0.4)', color: '#B8752A' }}>← Back</button>
                  <button onClick={() => setStep(4)} disabled={!paymentValid}
                    className="flex-1 py-3.5 font-bold text-[11px] tracking-[0.2em] uppercase disabled:opacity-40"
                    style={{ background: '#B8752A', color: '#1A0A00' }}>Review Order →</button>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div>
                <h2 className="font-serif font-bold text-2xl mb-6" style={{ color: '#F2EAD8' }}>Confirm & Place Order</h2>

                <div className="space-y-3 mb-6">
                  <div className="p-4" style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.15)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2" style={{ color: '#B8752A' }}>Delivery To</p>
                    <p className="text-sm" style={{ color: '#F2EAD8' }}>{details.first_name} {details.last_name}</p>
                    <p className="text-xs mt-1" style={{ color: '#8C7355' }}>{details.email}</p>
                    <p className="text-xs" style={{ color: '#8C7355' }}>{details.phone}</p>
                    <p className="text-xs mt-1" style={{ color: '#8C7355' }}>{details.delivery_address}</p>
                  </div>
                  <div className="p-4" style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.15)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2" style={{ color: '#B8752A' }}>Payment</p>
                    <p className="text-sm capitalize" style={{ color: '#F2EAD8' }}>{payMethod.replace(/_/g,' ')}</p>
                    {(payMethod==='mtn_momo'||payMethod==='airtel') && (
                      <p className="text-xs mt-1" style={{ color: '#8C7355' }}>{payerPhone}</p>
                    )}
                  </div>
                  <div className="p-4" style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.15)' }}>
                    <div className="flex justify-between text-sm font-bold">
                      <span style={{ color: '#F2EAD8' }}>Total due</span>
                      <span style={{ color: '#E8C88A' }}>UGX {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 mb-6 cursor-pointer">
                  <div onClick={() => setConsent(c => !c)}
                    className="w-5 h-5 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all"
                    style={{ background: consent ? '#B8752A' : 'transparent', border: `2px solid ${consent ? '#B8752A' : '#3D2000'}` }}>
                    {consent && <span style={{ color: '#1A0A00', fontSize: '11px', fontWeight: 'bold' }}>✓</span>}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#8C7355' }}>
                    I agree that my order is correct and that HAIQ Bakery will prepare it as specified.
                  </p>
                </label>

                {submitError && (
                  <div className="mb-4 px-4 py-3 text-sm"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                    {submitError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(3)} className="flex-1 py-3.5 font-bold text-[11px] tracking-[0.2em] uppercase"
                    style={{ border: '1px solid rgba(184,117,42,0.4)', color: '#B8752A' }}>← Back</button>
                  <button onClick={handleSubmit} disabled={submitting || !consent}
                    className="flex-1 py-3.5 font-bold text-[11px] tracking-[0.2em] uppercase disabled:opacity-50 transition"
                    style={{ background: '#B8752A', color: '#1A0A00' }}>
                    {submitting ? 'Placing Order…' : `Place Order — UGX ${total.toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <OrderSummary items={items} subtotal={subtotal} />
          </div>
        </div>
      </div>
    </div>
  )
}
