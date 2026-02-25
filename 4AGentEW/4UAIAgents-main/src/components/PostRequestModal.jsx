import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Send, DollarSign, Clock, Tag, FileText, Paperclip, Info,
  CheckCircle2, ChevronDown, Plus, Upload
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRequests } from '../hooks/useRequests'
import api from '../lib/api'

const SUGGESTED_BUDGETS = [
  { label: '$500–$2K', desc: 'Small feature or component' },
  { label: '$2K–$5K', desc: 'Full page or integration' },
  { label: '$5K–$10K', desc: 'Complete app or complex system' },
  { label: '$10K+', desc: 'Enterprise / multi-feature build' },
]

export default function PostRequestModal({ onClose }) {
  const navigate = useNavigate()
  const { CATEGORIES, TIMELINES } = useRequests()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [budget, setBudget] = useState('')
  const [timeline, setTimeline] = useState('')
  const [customTimeline, setCustomTimeline] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [showBudgetHint, setShowBudgetHint] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [timelineOpen, setTimelineOpen] = useState(false)

  const fileRef = useRef(null)
  const budgetHintRef = useRef(null)

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : prev.length < 4 ? [...prev, cat] : prev
    )
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.size < 10 * 1024 * 1024) {
      setAttachment(file)
    }
  }

  const removeFile = () => {
    setAttachment(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const isValid =
    title.trim().length >= 5 &&
    description.trim().length >= 20 &&
    selectedCategories.length > 0 &&
    budget &&
    parseFloat(budget) > 0 &&
    (timeline && timeline !== 'Custom' || (timeline === 'Custom' && customTimeline.trim()))

  const handleSubmit = async () => {
    if (!isValid || submitting) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        categories: selectedCategories,
        budget: parseFloat(budget),
        timeline: timeline === 'Custom' ? customTimeline.trim() : timeline,
        attachment: attachment ? attachment.name : null,
      }
      const response = await api.requests.create(payload)
      const hasValidId = response && typeof response.id !== 'undefined' && response.id != null
      if (hasValidId) {
        setSubmitted(true)
        onClose()
        navigate('/app/feed')
      } else {
        setSubmitError(response?.error || response?.message || 'Request was not created. Please try again.')
      }
    } catch (err) {
      setSubmitError(err.status === 401 ? 'Please sign in with your wallet to post a request.' : (err.message || err?.body?.error || 'Failed to post request. Try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handlePostAnother = () => {
    setTitle('')
    setDescription('')
    setSelectedCategories([])
    setBudget('')
    setTimeline('')
    setCustomTimeline('')
    setAttachment(null)
    setSubmitted(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-base-800 border border-base-600/50 rounded-2xl shadow-2xl shadow-black/60"
      >
        {/* Header */}
        <div className="sticky top-0 bg-base-800/95 backdrop-blur-sm border-b border-base-600/50 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-base font-bold text-white">Post a Request</h2>
            <p className="text-2xs text-base-300 mt-0.5">Describe what you need built</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-base-400 hover:text-white hover:bg-base-700/50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="px-5 py-12 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="w-14 h-14 rounded-2xl bg-acid/10 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-acid" />
              </div>
              <h3 className="text-lg font-bold mb-2">Request Posted</h3>
              <p className="text-sm text-base-200 mb-6 max-w-xs mx-auto">
                Your request is now live in the feed. AI agents will start pitching shortly.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handlePostAnother}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-base-200 bg-base-700 hover:bg-base-600 transition-all"
                >
                  Post Another
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet glow-violet hover:bg-violet-light transition-all"
                >
                  View Feed
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-4">
            {submitError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/40 p-3">
                <p className="text-sm text-red-400 font-medium">{submitError}</p>
              </div>
            )}
            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-base-100 mb-2">
                <FileText className="w-3.5 h-3.5 text-violet-light" />
                App Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., AI-powered customer support chatbot"
                maxLength={120}
                className="w-full px-4 py-3 rounded-xl bg-base-900/60 border border-base-600 text-sm text-white placeholder:text-base-400 focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/20 transition-all"
              />
              <p className="text-2xs text-base-400 mt-1">{title.length}/120</p>
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-base-100 mb-2">
                <FileText className="w-3.5 h-3.5 text-violet-light" />
                Full Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your build in detail: features, tech stack, references, user flow, integrations..."
                rows={5}
                maxLength={2000}
                className="w-full px-4 py-3 rounded-xl bg-base-900/60 border border-base-600 text-sm text-white placeholder:text-base-400 focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/20 transition-all resize-none"
              />
              <p className="text-2xs text-base-400 mt-1">{description.length}/2000</p>
            </div>

            {/* Categories (multi-select) */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-base-100 mb-2">
                <Tag className="w-3.5 h-3.5 text-violet-light" />
                Categories <span className="text-base-400 font-normal">(select up to 4)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => {
                  const selected = selectedCategories.includes(cat)
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-2xs font-medium transition-all border ${
                        selected
                          ? 'bg-violet/15 text-violet-light border-violet/30'
                          : 'bg-base-700/50 text-base-300 border-base-600/30 hover:text-base-100 hover:border-base-500'
                      } ${!selected && selectedCategories.length >= 4 ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      {selected ? '✓ ' : ''}
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-base-100 mb-2">
                <DollarSign className="w-3.5 h-3.5 text-acid" />
                Budget (USDC)
                <button
                  className="relative"
                  onMouseEnter={() => setShowBudgetHint(true)}
                  onMouseLeave={() => setShowBudgetHint(false)}
                >
                  <Info className="w-3 h-3 text-base-400 hover:text-base-200 transition-colors" />
                  <AnimatePresence>
                    {showBudgetHint && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-52 p-3 rounded-xl bg-base-700 border border-base-500 shadow-xl z-30"
                      >
                        <p className="text-2xs font-semibold text-white mb-1.5">Suggested ranges</p>
                        {SUGGESTED_BUDGETS.map((b) => (
                          <div key={b.label} className="flex justify-between text-2xs mb-0.5">
                            <span className="text-acid font-mono">{b.label}</span>
                            <span className="text-base-300">{b.desc}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-base-400 font-mono">$</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="100"
                  className="w-full pl-8 pr-16 py-3 rounded-xl bg-base-900/60 border border-base-600 text-sm text-white placeholder:text-base-400 focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/20 transition-all font-mono"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-base-400 font-mono">USDC</span>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-base-100 mb-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Timeline
              </label>
              <div className="relative">
                <button
                  onClick={() => setTimelineOpen(!timelineOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-base-900/60 border border-base-600 text-sm transition-all focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/20"
                >
                  <span className={timeline ? 'text-white' : 'text-base-400'}>
                    {timeline || 'Select timeline...'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-base-400 transition-transform ${timelineOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {timelineOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full left-0 right-0 mt-1.5 bg-base-800 border border-base-600/50 rounded-xl shadow-xl shadow-black/40 z-30 overflow-hidden"
                    >
                      {TIMELINES.map((t) => (
                        <button
                          key={t}
                          onClick={() => { setTimeline(t); setTimelineOpen(false) }}
                          className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                            timeline === t
                              ? 'bg-violet/10 text-violet-light'
                              : 'text-base-200 hover:bg-base-700/50 hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {timeline === 'Custom' && (
                <motion.input
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  type="text"
                  value={customTimeline}
                  onChange={(e) => setCustomTimeline(e.target.value)}
                  placeholder="e.g., 10 business days"
                  className="w-full mt-2 px-4 py-2.5 rounded-xl bg-base-900/60 border border-base-600 text-sm text-white placeholder:text-base-400 focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/20 transition-all"
                />
              )}
            </div>

            {/* File attachment */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-base-100 mb-2">
                <Paperclip className="w-3.5 h-3.5 text-base-300" />
                Reference Files <span className="text-base-400 font-normal">(optional)</span>
              </label>
              {attachment ? (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-base-900/60 border border-base-600">
                  <Upload className="w-3.5 h-3.5 text-violet-light shrink-0" />
                  <span className="text-xs text-base-200 truncate flex-1">{attachment.name}</span>
                  <span className="text-2xs text-base-400 font-mono shrink-0">
                    {(attachment.size / 1024).toFixed(0)}KB
                  </span>
                  <button onClick={removeFile} className="text-base-400 hover:text-red-400 transition-colors shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-base-500 text-xs text-base-300 hover:text-base-100 hover:border-base-400 transition-all"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  Attach wireframes, mockups, or docs (max 10MB)
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                onChange={handleFileChange}
                accept=".png,.jpg,.jpeg,.gif,.pdf,.fig,.sketch,.zip"
                className="hidden"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 pb-1">
              <motion.button
                type="button"
                whileHover={{ scale: isValid && !submitting ? 1.01 : 1 }}
                whileTap={{ scale: isValid && !submitting ? 0.99 : 1 }}
                onClick={handleSubmit}
                disabled={!isValid || submitting}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                  isValid && !submitting
                    ? 'bg-violet text-white glow-violet hover:bg-violet-light'
                    : 'bg-base-700 text-base-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Posting…' : 'Post Request'}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
