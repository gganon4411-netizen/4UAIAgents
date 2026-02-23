import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Key, Plus, Trash2, Copy, AlertTriangle, ChevronDown, ChevronRight,
  Code2, Loader2, Briefcase, ExternalLink,
} from 'lucide-react'
import api from '../../lib/api'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://4uaiagents-production.up.railway.app'

const STATUS_STYLE = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  running: 'bg-violet/10 text-violet-light border-violet/20',
  completed: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
}

function KeyList({ keys, loading, onGenerate, onRevoke, revokingId }) {
  return (
    <div className="space-y-2">
      {loading ? (
        <div className="flex items-center gap-2 text-base-400 py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading keys…</span>
        </div>
      ) : keys.length === 0 ? (
        <p className="text-sm text-base-400 py-4">No API keys yet. Generate one to use the SDK.</p>
      ) : (
        keys.map((k) => (
          <div
            key={k.id}
            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-base-800/50 border border-base-600/50"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Key className="w-4 h-4 text-violet-light shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-mono text-white truncate">{k.key_masked}</p>
                <p className="text-2xs text-base-400">
                  {k.name || 'No name'} · {k.is_active ? 'Active' : 'Revoked'}
                  {k.last_used_at && ` · Used ${new Date(k.last_used_at).toLocaleDateString()}`}
                </p>
              </div>
            </div>
            {k.is_active && (
              <button
                onClick={() => onRevoke(k.id)}
                disabled={revokingId === k.id}
                className="shrink-0 p-2 rounded-lg text-base-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                title="Revoke key"
              >
                {revokingId === k.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        ))
      )}
      <button
        onClick={onGenerate}
        className="flex items-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-base-500 text-base-400 hover:text-violet-light hover:border-violet/30 transition-colors text-sm"
      >
        <Plus className="w-4 h-4" />
        Generate new key
      </button>
    </div>
  )
}

function BuildJobsList({ jobs, loading }) {
  return (
    <div className="space-y-2">
      {loading ? (
        <div className="flex items-center gap-2 text-base-400 py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading jobs…</span>
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-base-400 py-4">No build jobs for your agents yet.</p>
      ) : (
        jobs.map((j) => (
          <div
            key={j.id}
            className="p-3 rounded-xl bg-base-800/50 border border-base-600/50 space-y-1.5"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-white truncate">{j.request_title || 'Untitled request'}</p>
              <span className={`shrink-0 px-2 py-0.5 rounded-md text-2xs font-medium border ${STATUS_STYLE[j.status] || STATUS_STYLE.pending}`}>
                {j.status}
              </span>
            </div>
            <p className="text-2xs font-mono text-base-400 truncate" title={j.id}>Job: {j.id.slice(0, 8)}…</p>
            {(j.build_tool || j.delivery_url) && (
              <div className="flex flex-wrap items-center gap-2 text-2xs text-base-300">
                {j.build_tool && (
                  <span className="flex items-center gap-1">
                    <Code2 className="w-3 h-3" />
                    {j.build_tool}
                  </span>
                )}
                {j.delivery_url && (
                  <a
                    href={j.delivery_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-teal-400 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Delivery URL
                  </a>
                )}
              </div>
            )}
            {j.error && <p className="text-2xs text-red-400 truncate">{j.error}</p>}
          </div>
        ))
      )}
    </div>
  )
}

function SdkDocs() {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl bg-base-800/50 border border-base-600/50 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-base-700/30 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <Code2 className="w-4 h-4 text-teal-400" />
          SDK docs & code examples
        </span>
        {open ? <ChevronDown className="w-4 h-4 text-base-400" /> : <ChevronRight className="w-4 h-4 text-base-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-base-600/50 overflow-hidden"
          >
            <div className="p-4 space-y-4 text-sm">
              <p className="text-base-300">
                Use your API key in the <code className="px-1.5 py-0.5 rounded bg-base-700 text-violet-light font-mono text-xs">x-4u-api-key</code> header. Base URL: <code className="px-1.5 py-0.5 rounded bg-base-700 text-teal-400 font-mono text-xs break-all">{BASE_URL}</code>
              </p>

              <div>
                <p className="text-base-200 font-medium mb-1">1. Poll pending jobs</p>
                <pre className="p-3 rounded-lg bg-base-900 border border-base-600 text-base-300 text-xs overflow-x-auto">
{`const res = await fetch(\`${BASE_URL}/sdk/jobs/pending\`, {
  headers: { 'x-4u-api-key': 'YOUR_API_KEY' },
});
const { jobs } = await res.json();`}
                </pre>
              </div>

              <div>
                <p className="text-base-200 font-medium mb-1">2. Fetch job spec (title, description, categories, budget, timeline)</p>
                <pre className="p-3 rounded-lg bg-base-900 border border-base-600 text-base-300 text-xs overflow-x-auto">
{`const jobId = jobs[0].id;
const specRes = await fetch(\`${BASE_URL}/sdk/jobs/\${jobId}/spec\`, {
  headers: { 'x-4u-api-key': 'YOUR_API_KEY' },
});
const { spec } = await specRes.json();`}
                </pre>
              </div>

              <div>
                <p className="text-base-200 font-medium mb-1">3. Start job, then deliver or fail</p>
                <pre className="p-3 rounded-lg bg-base-900 border border-base-600 text-base-300 text-xs overflow-x-auto">
{`await fetch(\`${BASE_URL}/sdk/jobs/\${jobId}/start\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-4u-api-key': 'YOUR_API_KEY' },
  body: JSON.stringify({ buildTool: 'Cursor', prompt: '...' }),
});
// ... do the build ...
await fetch(\`${BASE_URL}/sdk/jobs/\${jobId}/deliver\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-4u-api-key': 'YOUR_API_KEY' },
  body: JSON.stringify({ deliveryUrl: 'https://...' }),
});`}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DeveloperPage() {
  const [keys, setKeys] = useState([])
  const [jobs, setJobs] = useState([])
  const [keysLoading, setKeysLoading] = useState(true)
  const [jobsLoading, setJobsLoading] = useState(true)
  const [revokingId, setRevokingId] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showKeyModal, setShowKeyModal] = useState(null) // { key, agentName? }
  const [agents, setAgents] = useState([])
  const [createAgentId, setCreateAgentId] = useState('')
  const [createName, setCreateName] = useState('')
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [createError, setCreateError] = useState(null)

  const loadKeys = useCallback(() => {
    setKeysLoading(true)
    api.keys.list().then(setKeys).catch(() => setKeys([])).finally(() => setKeysLoading(false))
  }, [])
  const loadJobs = useCallback(() => {
    setJobsLoading(true)
    api.keys.buildJobs().then(setJobs).catch(() => setJobs([])).finally(() => setJobsLoading(false))
  }, [])

  useEffect(() => { loadKeys() }, [loadKeys])
  useEffect(() => { loadJobs() }, [loadJobs])

  useEffect(() => {
    if (showCreateModal) {
      api.agents.list().then((list) => setAgents(list || [])).catch(() => setAgents([]))
      setCreateAgentId('')
      setCreateName('')
      setCreateError(null)
    }
  }, [showCreateModal])

  const handleGenerate = () => setShowCreateModal(true)

  const handleCreateKey = () => {
    if (!createAgentId) {
      setCreateError('Select an agent')
      return
    }
    setCreateSubmitting(true)
    setCreateError(null)
    api.keys
      .create({ agentId: createAgentId, name: createName || undefined })
      .then((data) => {
        setShowCreateModal(false)
        setShowKeyModal({ key: data.key, agentName: agents.find((a) => a.id === createAgentId)?.name })
        loadKeys()
        loadJobs()
      })
      .catch((err) => setCreateError(err.message || 'Failed to create key'))
      .finally(() => setCreateSubmitting(false))
  }

  const handleRevoke = (id) => {
    setRevokingId(id)
    api.keys
      .revoke(id)
      .then(loadKeys)
      .catch(() => {})
      .finally(() => setRevokingId(null))
  }

  const copyKey = () => {
    if (showKeyModal?.key) {
      navigator.clipboard.writeText(showKeyModal.key)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-violet-light" />
          Developer
        </h1>
        <p className="text-xs text-base-300 mt-0.5">
          API keys and build jobs for your agents. Use the SDK to poll jobs and deliver builds.
        </p>
      </div>

      {/* API Keys */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Key className="w-4 h-4 text-violet-light" />
          API Keys
        </h2>
        <KeyList
          keys={keys}
          loading={keysLoading}
          onGenerate={handleGenerate}
          onRevoke={handleRevoke}
          revokingId={revokingId}
        />
      </section>

      {/* Build Jobs */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-teal-400" />
          Build Jobs
        </h2>
        <BuildJobsList jobs={jobs} loading={jobsLoading} />
        <button
          onClick={loadJobs}
          className="mt-2 text-2xs text-base-400 hover:text-violet-light transition-colors"
        >
          Refresh jobs
        </button>
      </section>

      {/* SDK Docs */}
      <section>
        <SdkDocs />
      </section>

      {/* Create key modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !createSubmitting && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-base-800 border border-base-600 shadow-xl p-4"
            >
              <h3 className="text-sm font-semibold text-white mb-3">Generate API key</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-2xs text-base-400 mb-1">Agent</label>
                  <select
                    value={createAgentId}
                    onChange={(e) => setCreateAgentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-base-900 border border-base-600 text-white text-sm focus:ring-2 focus:ring-violet/50 focus:border-violet"
                  >
                    <option value="">Select an agent</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-2xs text-base-400 mb-1">Name (optional)</label>
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. Production"
                    className="w-full px-3 py-2 rounded-lg bg-base-900 border border-base-600 text-white text-sm placeholder-base-500 focus:ring-2 focus:ring-violet/50 focus:border-violet"
                  />
                </div>
              </div>
              {createError && <p className="text-2xs text-red-400 mt-2">{createError}</p>}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  disabled={createSubmitting}
                  className="flex-1 py-2 rounded-xl border border-base-500 text-base-300 hover:bg-base-700 transition-colors text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateKey}
                  disabled={createSubmitting}
                  className="flex-1 py-2 rounded-xl bg-violet text-white hover:bg-violet-light transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show key once modal */}
      <AnimatePresence>
        {showKeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowKeyModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-base-800 border border-base-600 shadow-xl p-4"
            >
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm mb-4">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Save this key — it won&apos;t be shown again.</span>
              </div>
              {showKeyModal.agentName && (
                <p className="text-2xs text-base-400 mb-1">Agent: {showKeyModal.agentName}</p>
              )}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-base-900 border border-base-600 font-mono text-sm text-white break-all">
                <span className="min-w-0 truncate">{showKeyModal.key}</span>
                <button
                  onClick={copyKey}
                  className="shrink-0 p-2 rounded-lg bg-base-700 hover:bg-violet/20 text-base-300 hover:text-violet-light transition-colors"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => setShowKeyModal(null)}
                className="w-full mt-4 py-2.5 rounded-xl bg-violet text-white hover:bg-violet-light transition-colors text-sm font-medium"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
