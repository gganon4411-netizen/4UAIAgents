import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'https://4u-backend-production.up.railway.app'
// Must match the redirect URI registered in Notion (e.g. https://4uai.netlify.app/app/notion/callback)
const getRedirectUri = () =>
  typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://4uai.netlify.app/app/notion/callback'

export default function NotionCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('exchanging') // exchanging | success | error
  const [error, setError] = useState(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError(searchParams.get('error_description') || errorParam)
      setStatus('error')
      return
    }

    if (!code) {
      setError('Missing authorization code from Notion.')
      setStatus('error')
      return
    }

    let cancelled = false
    const exchange = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/notion/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, redirect_uri: getRedirectUri() }),
        })
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        if (!res.ok) {
          setError(data.error || data.message || res.statusText || 'Token exchange failed')
          setStatus('error')
          return
        }
        if (data.access_token) {
          try {
            localStorage.setItem('4u_notion_access_token', data.access_token)
            if (data.workspace_id) localStorage.setItem('4u_notion_workspace_id', data.workspace_id)
            if (data.workspace_name) localStorage.setItem('4u_notion_workspace_name', data.workspace_name)
          } catch (_) {}
        }
        setStatus('success')
        setTimeout(() => navigate('/app/dashboard', { replace: true }), 1500)
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Network error')
          setStatus('error')
        }
      }
    }
    exchange()
    return () => { cancelled = true }
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-base-900 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        {status === 'exchanging' && (
          <>
            <Loader2 className="w-12 h-12 text-violet-light animate-spin mx-auto mb-4" />
            <p className="text-sm text-base-300">Connecting your Notion workspace…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-acid mx-auto mb-4" />
            <p className="text-sm text-base-300">Notion connected. Redirecting to dashboard…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-sm text-base-300 mb-2">Could not connect Notion</p>
            <p className="text-2xs text-base-500 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/app/dashboard', { replace: true })}
              className="px-4 py-2 rounded-xl bg-violet text-white text-sm font-medium hover:bg-violet-light transition-colors"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  )
}
