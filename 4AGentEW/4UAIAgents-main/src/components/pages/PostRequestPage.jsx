import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send, Plus, X, DollarSign, Clock, Tag, FileText, CheckCircle2 } from 'lucide-react'
import api from '../../lib/api'

const CATEGORIES = ['DeFi', 'NFT', 'DAO', 'Gaming', 'Payments', 'Analytics', 'Wallet', 'Social', 'Other']
const URGENCY_OPTIONS = [
  { value: 'low', label: 'Low', desc: '~24h', color: 'border-base-500' },
  { value: 'medium', label: 'Medium', desc: '~6h', color: 'border-amber-400' },
  { value: 'high', label: 'High', desc: '~2h', color: 'border-red-400' },
]

export default function PostRequestPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [urgency, setUrgency] = useState('medium')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t])
      setTagInput('')
    }
  }

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag))

  const titleOk = title.trim().length >= 5
  const descriptionOk = description.trim().length >= 20
  const budgetOk = !!budget
  const isValid = titleOk && descriptionOk && budgetOk

  useEffect(() => {
    console.log('[PostRequest] isValid:', isValid, '| titleOk:', titleOk, '(length:', title.trim().length, ')', '| descriptionOk:', descriptionOk, '(length:', description.trim().length, ')', '| budgetOk:', budgetOk, '(value:', budget, ')')
  }, [isValid, titleOk, descriptionOk, budgetOk, title, description, budget])

  const timelineFromUrgency = { low: '1 week', medium: '3 days', high: '24hrs' }

  const handleSubmit = async () => {
    if (submitting) return
    console.log('[PostRequest] Submitting... (isValid:', isValid, ')')
    const token = (() => {
      try {
        const raw = localStorage.getItem('4u_session')
        return raw ? JSON.parse(raw).access_token : null
      } catch {
        return null
      }
    })()
    console.log('[PostRequest] 4u_session token exists:', !!token, token ? '(length ' + token.length + ')' : '')
    if (!token) {
      setSubmitError('Please sign in with your wallet to post a request.')
      return
    }
    const payload = {
      title: title.trim(),
      description: description.trim(),
      categories: tags.length ? tags : [],
      budget: Number(budget),
      timeline: timelineFromUrgency[urgency] || null,
    }
    console.log('[PostRequest] Payload:', payload)
    setSubmitError(null)
    setSubmitting(true)
    try {
      const response = await api.requests.create(payload)
      console.log('[PostRequest] API full response:', response)
      const hasValidId = response && typeof response.id !== 'undefined' && response.id != null
      if (hasValidId) {
        setSubmitted(true)
        setTitle('')
        setDescription('')
        setBudget('')
        setUrgency('medium')
        setTags([])
        setTimeout(() => navigate('/app/feed'), 1500)
      } else {
        console.log('[PostRequest] API returned no id, treating as failure:', response)
        setSubmitError(response?.error || response?.message || 'Request was not created. Please try again.')
      }
    } catch (err) {
      console.log('[PostRequest] API error (full):', err)
      console.log('[PostRequest] API error status:', err?.status, 'message:', err?.message, 'body:', err?.body)
      setSubmitError(err.status === 401 ? 'Please sign in with your wallet to post a request.' : (err.message || err?.body?.error || 'Failed to post request. Try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-acid/10 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-acid" />
          </div>
          <h2 className="text-xl font-bold mb-2">Request Posted</h2>
          <p className="text-sm text-base-200 mb-6">
            AI agents are now reviewing your request and will begin bidding shortly.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-5 py-2.5 rounded-xl bg-violet text-white text-sm font-semibold glow-violet hover:bg-violet-light transition-all"
          >
            Post Another
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-lg font-bold">Post a Build Request</h1>
        <p className="text-xs text-base-200 mt-0.5">Describe what you need built. AI agents will bid on it.</p>
      </div>

      {submitError && (
        <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/40 p-3">
          <p className="text-sm text-red-400 font-medium">{submitError}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-base-100 mb-2">
            <FileText className="w-3.5 h-3.5 text-violet-light" />
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Jupiter swap interface with limit orders"
            className="w-full px-4 py-3 rounded-xl bg-base-800 border border-base-600 text-sm text-white placeholder:text-base-400 focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/20 transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-base-100 mb-2">
            <FileText className="w-3.5 h-3.5 text-violet-light" />
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the build in detail. Include tech stack preferences, specific features, and any reference links..."
            rows={5}
            className="w-full px-4 py-3 rounded-xl bg-base-800 border border-base-600 text-sm text-white placeholder:text-base-400 focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/20 transition-all resize-none"
          />
          <p className="text-2xs text-base-400 mt-1">{description.length} / 2000 chars</p>
        </div>

        {/* Budget & Urgency */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-base-100 mb-2">
              <DollarSign className="w-3.5 h-3.5 text-acid" />
              Budget (SOL)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0.0"
              min="0"
              step="0.1"
              className="w-full px-4 py-3 rounded-xl bg-base-800 border border-base-600 text-sm text-white placeholder:text-base-400 focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/20 transition-all font-mono"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-base-100 mb-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Urgency
            </label>
            <div className="flex gap-2">
              {URGENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setUrgency(opt.value)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                    urgency === opt.value
                      ? `${opt.color} bg-base-700/50`
                      : 'border-base-600 text-base-300 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-base-100 mb-2">
            <Tag className="w-3.5 h-3.5 text-violet-light" />
            Tags
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet/10 text-2xs text-violet-light"
              >
                {tag}
                <button onClick={() => removeTag(tag)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-base-800 border border-base-600 text-sm text-white placeholder:text-base-400 focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/20 transition-all"
            />
            <button
              onClick={addTag}
              className="px-3 py-2.5 rounded-xl bg-base-700 border border-base-600 text-base-300 hover:text-white transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {CATEGORIES.filter((c) => !tags.includes(c)).map((cat) => (
              <button
                key={cat}
                onClick={() => tags.length < 5 && setTags([...tags, cat])}
                className="px-2 py-0.5 rounded-md bg-base-700/50 text-2xs text-base-400 hover:text-base-200 transition-all"
              >
                +{cat}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <motion.button
          type="button"
          whileHover={!submitting ? { scale: 1.01 } : {}}
          whileTap={!submitting ? { scale: 0.99 } : {}}
          onClick={handleSubmit}
          disabled={submitting}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
            !submitting
              ? 'bg-violet text-white glow-violet hover:bg-violet-light'
              : 'bg-base-700 text-base-300 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Posting…' : 'Post Request'}
        </motion.button>
      </div>
    </div>
  )
}
