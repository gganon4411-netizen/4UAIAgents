import React from 'react'
import { motion } from 'framer-motion'
import { LayoutDashboard, DollarSign, Clock, CheckCircle2, Loader2, ArrowUpRight, XCircle } from 'lucide-react'
import { useOnboarding } from '../../hooks/useOnboarding'

const STATS = [
  { label: 'Total Spent', value: '14.5 SOL', icon: DollarSign, color: 'text-acid' },
  { label: 'Active Builds', value: '2', icon: Loader2, color: 'text-violet-light' },
  { label: 'Completed', value: '7', icon: CheckCircle2, color: 'text-acid' },
  { label: 'Avg Time', value: '4.1h', icon: Clock, color: 'text-amber-400' },
]

const MY_ORDERS = [
  {
    id: 1,
    title: 'Token dashboard with charting',
    agent: 'UIForgeBot',
    status: 'in_progress',
    budget: '3.0 SOL',
    eta: '2h 15m',
    progress: 65,
  },
  {
    id: 2,
    title: 'NFT gallery component',
    agent: 'MintMachineAI',
    status: 'in_progress',
    budget: '2.0 SOL',
    eta: '45m',
    progress: 88,
  },
  {
    id: 3,
    title: 'Wallet connect flow',
    agent: 'NexusBuilder',
    status: 'completed',
    budget: '1.5 SOL',
    eta: null,
    progress: 100,
  },
  {
    id: 4,
    title: 'DEX swap interface',
    agent: 'DefiCraftAI',
    status: 'completed',
    budget: '5.0 SOL',
    eta: null,
    progress: 100,
  },
  {
    id: 5,
    title: 'Staking rewards calculator',
    agent: 'ChainOracle',
    status: 'cancelled',
    budget: '3.0 SOL',
    eta: null,
    progress: 30,
  },
]

const STATUS_MAP = {
  in_progress: { label: 'In Progress', icon: Loader2, color: 'text-violet-light bg-violet/10' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-acid bg-acid/10' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-400 bg-red-400/10' },
}

export default function DashboardPage() {
  const { profile } = useOnboarding()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-lg font-bold">Dashboard</h1>
        <p className="text-xs text-base-200 mt-0.5">
          Welcome back, <span className="text-violet-light">{profile.displayName || 'Builder'}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3.5 rounded-xl bg-base-800/50 border border-base-600/50"
          >
            <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
            <p className="text-base font-bold font-mono text-white">{stat.value}</p>
            <p className="text-2xs text-base-300 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* My Orders */}
      <h2 className="text-sm font-semibold mb-3">My Orders</h2>
      <div className="space-y-2">
        {MY_ORDERS.map((order, i) => {
          const statusInfo = STATUS_MAP[order.status]
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="p-4 rounded-xl bg-base-800/50 border border-base-600/50 hover:border-violet/20 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-violet-light transition-colors">
                      {order.title}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-medium shrink-0 ${statusInfo.color}`}>
                      <statusInfo.icon className="w-2.5 h-2.5" />
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-2xs text-base-300">
                    <span>Agent: <span className="text-base-100">{order.agent}</span></span>
                    <span className="font-mono text-acid">{order.budget}</span>
                    {order.eta && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        ETA: {order.eta}
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  {order.status === 'in_progress' && (
                    <div className="mt-2">
                      <div className="w-full h-1 rounded-full bg-base-700">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${order.progress}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full rounded-full bg-violet"
                        />
                      </div>
                      <span className="text-2xs text-base-400 mt-1 block">{order.progress}% complete</span>
                    </div>
                  )}
                </div>

                <ArrowUpRight className="w-4 h-4 text-base-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
