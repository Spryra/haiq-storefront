// frontend/src/hooks/useRealtimeMessages.js
// Polls for new messages every 3 seconds using SSE or polling fallback
import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../services/api'

/**
 * Hook for real-time message polling.
 * Uses 3-second polling interval — fast enough to feel live.
 *
 * @param {string} endpoint - API endpoint to poll (e.g. '/messages/direct/me')
 * @param {boolean} enabled - Set to false to pause polling
 */
export function useRealtimeMessages(endpoint, enabled = true) {
  const [messages, setMessages]   = useState([])
  const [loading,  setLoading]    = useState(true)
  const [error,    setError]      = useState(null)
  const intervalRef               = useRef(null)
  const lastCountRef              = useRef(0)

  const fetch = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await api.get(endpoint)
      const msgs = res.data.messages || []
      setMessages(msgs)
      lastCountRef.current = msgs.length
      setError(null)
    } catch (e) {
      setError(e)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    if (!enabled || !endpoint) return

    fetch()  // initial load

    // Poll every 3 seconds silently
    intervalRef.current = setInterval(() => fetch(true), 3000)

    return () => clearInterval(intervalRef.current)
  }, [endpoint, enabled, fetch])

  const send = useCallback(async (body, subject) => {
    await api.post(endpoint.replace('/me', ''), { body, subject })
    await fetch(true)  // refresh immediately after sending
  }, [endpoint, fetch])

  const refresh = useCallback(() => fetch(true), [fetch])

  return { messages, loading, error, send, refresh }
}
