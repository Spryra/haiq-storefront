import { useState, useEffect, useRef, useCallback } from 'react'
import adminApi from '../services/adminApi'

// 3-second polling for real-time feel
function useAdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading,  setLoading]  = useState(true)
  const intervalRef = useRef(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const r = await adminApi.get('/admin/messages')
      setMessages(r.data.messages || [])
    } catch {} finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    intervalRef.current = setInterval(() => load(true), 3000)
    return () => clearInterval(intervalRef.current)
  }, [load])

  return { messages, loading, refresh: load }
}

function useAdminThread(msgId, userId, orderId) {
  const [thread, setThread] = useState([])
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef(null)
  const bottomRef = useRef(null)

  const load = useCallback(async (silent = false) => {
    if (!msgId) return
    if (!silent) setLoading(true)
    try {
      let r
      if (userId) {
        r = await adminApi.get(`/admin/messages/thread/${userId}`)
      } else if (orderId) {
        r = await adminApi.get(`/admin/messages/order-thread/${orderId}`)
      }
      if (r) setThread(r.data.messages || [])
    } catch {} finally {
      if (!silent) setLoading(false)
    }
  }, [msgId, userId, orderId])

  useEffect(() => {
    setThread([])
    load()
    intervalRef.current = setInterval(() => load(true), 3000)
    return () => clearInterval(intervalRef.current)
  }, [load])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  return { thread, loading, refresh: () => load(true), bottomRef }
}

export default function MessagesPage() {
  const { messages, loading, refresh } = useAdminMessages()
  const [selected, setSelected] = useState(null)
  const [reply,    setReply]    = useState('')
  const [sending,  setSending]  = useState(false)

  const { thread, loading: threadLoading, refresh: refreshThread, bottomRef } = useAdminThread(
    selected?.id,
    selected?.user_id,
    selected?.order_id
  )

  const unread = messages.filter(m => !m.is_read).length

  const typeLabel = (msg) => {
    if (msg.is_direct)                         return 'Direct Message'
    if (msg.order_id)                          return `Order: ${msg.order_number || '—'}`
    if (msg.sender_type === 'contact_form')    return 'Contact Form'
    return 'Message'
  }

  const sendReply = async () => {
    if (!reply.trim() || !selected) return
    setSending(true)
    try {
      await adminApi.post(`/admin/messages/${selected.id}/reply`, { body: reply.trim() })
      setReply('')
      refreshThread()
      refresh(true)
    } catch {} finally { setSending(false) }
  }

  return (
    <div className="flex gap-4" style={{ height: 'calc(100vh - 80px)' }}>

      {/* Message list */}
      <div className="w-72 flex-shrink-0 flex flex-col overflow-hidden"
        style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.2)' }}>
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(61,32,0,0.8)' }}>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold" style={{ color: '#F2EAD8' }}>Inbox</p>
            {/* Live indicator */}
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[9px]" style={{ color: '#8C7355' }}>Live</span>
            </div>
          </div>
          {unread > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: '#B8752A', color: '#1A0A00' }}>{unread}</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            Array(5).fill(null).map((_,i) => (
              <div key={i} className="p-4" style={{ borderBottom: '1px solid rgba(61,32,0,0.5)' }}>
                <div className="h-3 rounded skeleton mb-2" style={{ background: '#3D2000', width: '60%' }} />
                <div className="h-2.5 rounded skeleton" style={{ background: '#3D2000', width: '85%' }} />
              </div>
            ))
          ) : messages.length === 0 ? (
            <p className="p-6 text-sm text-center" style={{ color: '#8C7355' }}>No messages yet.</p>
          ) : messages.map(m => (
            <button key={m.id} onClick={() => { setSelected(m); setReply('') }}
              className="w-full text-left px-4 py-3 transition-all"
              style={{
                borderBottom:  '1px solid rgba(61,32,0,0.5)',
                borderLeft:    selected?.id === m.id ? '2px solid #B8752A' : '2px solid transparent',
                background:    selected?.id === m.id ? 'rgba(184,117,42,0.08)' : 'transparent',
              }}>
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <p className="text-xs font-medium truncate" style={{ color: m.is_read ? '#8C7355' : '#F2EAD8' }}>
                  {m.user_name || m.order_customer || 'Anonymous'}
                </p>
                {!m.is_read && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style={{ background: '#B8752A' }} />}
              </div>
              {/* Tag showing message type */}
              <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(184,117,42,0.5)' }}>
                {typeLabel(m)}
              </p>
              <p className="text-[11px] truncate" style={{ color: 'rgba(242,234,216,0.4)' }}>{m.body}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Thread panel */}
      {selected ? (
        <div className="flex-1 flex flex-col overflow-hidden min-w-0"
          style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.2)' }}>
          <div className="px-5 py-4 flex-shrink-0 flex items-start justify-between"
            style={{ borderBottom: '1px solid rgba(61,32,0,0.8)' }}>
            <div>
              <p className="font-bold text-sm" style={{ color: '#F2EAD8' }}>
                {selected.user_name || selected.order_customer || 'Anonymous'}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: '#8C7355' }}>
                {typeLabel(selected)} &middot; {selected.user_email || ''}
              </p>
            </div>
            <button onClick={() => { setSelected(null); setReply('') }}
              className="text-xl hover:opacity-60 transition" style={{ color: '#8C7355' }}>x</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {threadLoading && thread.length === 0 ? (
              <div className="py-8 text-center text-sm" style={{ color: '#8C7355' }}>Loading...</div>
            ) : thread.map(m => (
              <div key={m.id} className={`flex ${m.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className="px-4 py-3 text-xs max-w-[80%] leading-relaxed"
                  style={{
                    background: m.sender_type === 'admin' ? '#B8752A' : '#1A0A00',
                    border:     `1px solid ${m.sender_type === 'admin' ? '#B8752A' : 'rgba(61,32,0,0.8)'}`,
                    color:      m.sender_type === 'admin' ? '#1A0A00' : '#F2EAD8',
                  }}>
                  {m.body}
                  <p className="text-[10px] mt-1.5 opacity-60">
                    {m.sender_type === 'admin' ? 'You' : 'Customer'} &middot; {new Date(m.created_at).toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Reply input */}
          <div className="flex gap-2 px-5 py-4 flex-shrink-0"
            style={{ borderTop: '1px solid rgba(61,32,0,0.8)' }}>
            <input value={reply} onChange={e => setReply(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendReply()}
              placeholder="Reply..."
              className="flex-1 px-4 py-2.5 text-sm focus:outline-none"
              style={{ background: '#1A0A00', border: '1px solid rgba(184,117,42,0.2)', color: '#F2EAD8' }} />
            <button onClick={sendReply} disabled={sending || !reply.trim()}
              className="px-5 py-2 font-bold text-[11px] tracking-wider uppercase disabled:opacity-40"
              style={{ background: '#B8752A', color: '#1A0A00' }}>
              {sending ? '...' : 'Reply'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center"
          style={{ background: '#2A1200', border: '1px solid rgba(184,117,42,0.2)' }}>
          <p className="text-sm" style={{ color: '#8C7355' }}>Select a message to view</p>
        </div>
      )}
    </div>
  )
}
