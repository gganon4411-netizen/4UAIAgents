import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Compass, TrendingUp, Star, DollarSign, ArrowUpRight, Layers } from 'lucide-react'

const CATEGORIES = [
  { name: 'All', count: 340 },
  { name: 'DeFi', count: 89 },
  { name: 'NFT', count: 67 },
  { name: 'DAO', count: 43 },
  { name: 'Gaming', count: 38 },
  { name: 'Payments', count: 56 },
  { name: 'Analytics', count: 47 },
]

const TRENDING = [
  {
    id: 1,
    title: 'Jupiter Swap Interface',
    category: 'DeFi',
    totalBids: 42,
    avgPrice: '4.2 SOL',
    rating: 4.8,
    builds: 28,
    trend: '+23%',
  },
  {
    id: 2,
    title: 'cNFT Minting Page',
    category: 'NFT',
    totalBids: 38,
    avgPrice: '2.8 SOL',
    rating: 4.7,
    builds: 19,
    trend: '+18%',
  },
  {
    id: 3,
    title: 'DAO Voting Dashboard',
    category: 'DAO',
    totalBids: 31,
    avgPrice: '5.5 SOL',
    rating: 4.9,
    builds: 14,
    trend: '+31%',
  },
  {
    id: 4,
    title: 'Token Analytics Dashboard',
    category: 'Analytics',
    totalBids: 27,
    avgPrice: '3.0 SOL',
    rating: 4.6,
    builds: 22,
    trend: '+15%',
  },
  {
    id: 5,
    title: 'Solana Pay Widget',
    category: 'Payments',
    totalBids: 24,
    avgPrice: '3.5 SOL',
    rating: 4.8,
    builds: 16,
    trend: '+20%',
  },
  {
    id: 6,
    title: 'Play-to-Earn Leaderboard',
    category: 'Gaming',
    totalBids: 19,
    avgPrice: '4.0 SOL',
    rating: 4.5,
    builds: 11,
    trend: '+12%',
  },
]

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? TRENDING
    : TRENDING.filter((t) => t.category === activeCategory)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">Explore</h1>
          <p className="text-xs text-base-200 mt-0.5">Trending build categories and templates</p>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-acid" />
          <span className="text-xs font-mono text-acid">Trending</span>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.name
                ? 'bg-violet/10 text-violet-light'
                : 'text-base-300 hover:text-white'
            }`}
          >
            {cat.name}
            <span className="text-2xs text-base-400">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl bg-base-800/50 border border-base-600/50 hover:border-violet/20 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-md bg-violet/10 text-2xs font-mono text-violet-light">
                {item.category}
              </span>
              <span className="text-2xs font-mono text-acid">{item.trend}</span>
            </div>

            <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-violet-light transition-colors">
              {item.title}
            </h3>

            <div className="flex items-center justify-between text-2xs text-base-300">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400" />
                  {item.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {item.builds}
                </span>
              </div>
              <span className="font-mono text-acid flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                ~{item.avgPrice}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
