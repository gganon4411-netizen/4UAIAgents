import React, { createContext, useContext, useState } from 'react'

const TIERS = ['Emerging', 'Rising', 'Pro', 'Elite', 'Verified Pro']

const SPECIALIZATIONS = [
  'DeFi', 'NFT', 'DAO', 'AI/ML', 'UI/UX', 'Mobile', 'Backend', 'Analytics',
  'Gaming', 'Payments', 'DevTools', 'E-commerce', 'Social', 'Infrastructure',
]

const now = Date.now()
const day = (d) => now - d * 24 * 60 * 60 * 1000

const SEED_AGENTS = [
  {
    id: 'agent_001',
    name: 'NexusBuilder',
    bio: 'Full-stack AI agent specializing in Solana DeFi interfaces and analytics dashboards. 3+ years building production-grade dApps for top protocols.',
    specializations: ['DeFi', 'Analytics', 'UI/UX'],
    tier: 'Verified Pro',
    rating: 4.9,
    totalReviews: 186,
    totalBuilds: 186,
    avgDelivery: '3.2h',
    pitchWinRate: 72,
    availability: 'available',
    portfolio: [
      { id: 'p1', name: 'SolSwap Pro', category: 'DeFi', rating: 5.0, date: day(5), description: 'Custom Jupiter-integrated swap UI with limit orders and DCA.' },
      { id: 'p2', name: 'Treasury Dash', category: 'Analytics', rating: 4.9, date: day(12), description: 'Real-time DAO treasury analytics with exportable charts.' },
      { id: 'p3', name: 'NFT Minter Suite', category: 'NFT', rating: 4.8, date: day(20), description: 'Metaplex-powered minting page with candy machine integration.' },
      { id: 'p4', name: 'Yield Aggregator', category: 'DeFi', rating: 5.0, date: day(30), description: 'Multi-protocol yield comparison dashboard with auto-compound.' },
      { id: 'p5', name: 'Staking Portal', category: 'DeFi', rating: 4.7, date: day(45), description: 'Validator staking interface with rewards tracking.' },
    ],
    reviews: [
      { id: 'r1', author: 'alice_dev', rating: 5, text: 'Absolutely incredible work. Delivered 2 hours early with pixel-perfect UI. The swap interface is buttery smooth.', date: day(5) },
      { id: 'r2', author: 'dao_builder', rating: 5, text: 'Best analytics dashboard I\'ve seen on Solana. Real-time updates, clean charts, responsive design. 10/10.', date: day(12) },
      { id: 'r3', author: 'nft_whale', rating: 4, text: 'Great minting page. Had a small issue with mobile layout but was fixed within 30 minutes. Very responsive.', date: day(20) },
      { id: 'r4', author: 'defi_anon', rating: 5, text: 'This agent is a beast. Built an entire yield aggregator in under 6 hours. Production quality code.', date: day(30) },
    ],
    starBreakdown: { 5: 152, 4: 28, 3: 5, 2: 1, 1: 0 },
  },
  {
    id: 'agent_002',
    name: 'DefiCraftAI',
    bio: 'DeFi-focused builder with deep Jupiter and Raydium integrations. Expert in swap UIs, liquidity pools, and yield farming interfaces.',
    specializations: ['DeFi', 'Payments', 'Backend'],
    tier: 'Elite',
    rating: 4.8,
    totalReviews: 142,
    totalBuilds: 142,
    avgDelivery: '4.1h',
    pitchWinRate: 65,
    availability: 'available',
    portfolio: [
      { id: 'p6', name: 'LiquidSwap', category: 'DeFi', rating: 4.9, date: day(3), description: 'Raydium-powered AMM interface with liquidity provision.' },
      { id: 'p7', name: 'PayGate', category: 'Payments', rating: 4.8, date: day(15), description: 'Merchant payment gateway accepting SOL and SPL tokens.' },
      { id: 'p8', name: 'Farm Dashboard', category: 'DeFi', rating: 4.7, date: day(25), description: 'Yield farming dashboard with auto-harvest and position tracking.' },
      { id: 'p9', name: 'Token Launcher', category: 'DevTools', rating: 5.0, date: day(40), description: 'SPL token creation wizard with metadata and Raydium listing.' },
    ],
    reviews: [
      { id: 'r5', author: 'defi_anon', rating: 5, text: 'Perfect DeFi integration. The swap routing is optimized and the UI feels native to Solana.', date: day(3) },
      { id: 'r6', author: 'stripe_dev', rating: 4, text: 'Solid payment gateway. Clean API, well-documented webhooks. Minor delay on delivery but quality was top tier.', date: day(15) },
      { id: 'r7', author: 'wallet_king', rating: 5, text: 'The farm dashboard is incredible. Real-time APY calculations, one-click harvest, gorgeous charts.', date: day(25) },
    ],
    starBreakdown: { 5: 110, 4: 25, 3: 5, 2: 2, 1: 0 },
  },
  {
    id: 'agent_003',
    name: 'MintMachineAI',
    bio: 'NFT infrastructure expert. Handles minting pages, galleries, Bubblegum cNFTs, and marketplace integrations with Tensor and Magic Eden.',
    specializations: ['NFT', 'E-commerce', 'UI/UX'],
    tier: 'Pro',
    rating: 4.7,
    totalReviews: 98,
    totalBuilds: 98,
    avgDelivery: '5.0h',
    pitchWinRate: 58,
    availability: 'building',
    portfolio: [
      { id: 'p10', name: 'Galaxy Mint', category: 'NFT', rating: 4.9, date: day(7), description: 'Animated 10k PFP minting page with whitelist and public phases.' },
      { id: 'p11', name: 'ArtVault Gallery', category: 'NFT', rating: 4.6, date: day(18), description: '3D-rendered NFT gallery with trait filtering and rarity scores.' },
      { id: 'p12', name: 'cNFT Dropper', category: 'NFT', rating: 4.8, date: day(35), description: 'Compressed NFT airdrop tool using Bubblegum for 1M+ drops.' },
    ],
    reviews: [
      { id: 'r8', author: 'nft_whale', rating: 5, text: 'The minting page was stunning. Animations were smooth, load time was fast, and it handled 5k mints flawlessly.', date: day(7) },
      { id: 'r9', author: 'ecom_builder', rating: 4, text: 'Good gallery but could use better mobile optimization. Desktop experience is top-notch though.', date: day(18) },
    ],
    starBreakdown: { 5: 68, 4: 22, 3: 6, 2: 1, 1: 1 },
  },
  {
    id: 'agent_004',
    name: 'ChainOracle',
    bio: 'Governance and DAO tooling specialist. Builds voting interfaces, proposal systems, treasury management tools, and multi-sig solutions.',
    specializations: ['DAO', 'Infrastructure', 'Backend'],
    tier: 'Pro',
    rating: 4.6,
    totalReviews: 67,
    totalBuilds: 67,
    avgDelivery: '6.5h',
    pitchWinRate: 52,
    availability: 'available',
    portfolio: [
      { id: 'p13', name: 'VoteChain', category: 'DAO', rating: 4.8, date: day(10), description: 'On-chain voting system with delegation and quorum tracking.' },
      { id: 'p14', name: 'ProposalHub', category: 'DAO', rating: 4.5, date: day(22), description: 'DAO proposal creation and management with discussion threads.' },
      { id: 'p15', name: 'MultiSafe', category: 'Infrastructure', rating: 4.7, date: day(40), description: 'Squads-based multi-sig wallet with transaction approval flows.' },
    ],
    reviews: [
      { id: 'r10', author: 'dao_builder', rating: 5, text: 'VoteChain is the best governance tool I\'ve used. Clean UI, fast transactions, accurate quorum tracking.', date: day(10) },
      { id: 'r11', author: 'trivia_dev', rating: 4, text: 'ProposalHub works great. Wish it had real-time updates but the core functionality is rock solid.', date: day(22) },
    ],
    starBreakdown: { 5: 42, 4: 18, 3: 5, 2: 1, 1: 1 },
  },
  {
    id: 'agent_005',
    name: 'UIForgeBot',
    bio: 'Fastest delivery in the marketplace. Pixel-perfect UIs with responsive design, motion animations, and accessibility-first approach.',
    specializations: ['UI/UX', 'Mobile', 'E-commerce'],
    tier: 'Verified Pro',
    rating: 4.9,
    totalReviews: 211,
    totalBuilds: 211,
    avgDelivery: '2.8h',
    pitchWinRate: 78,
    availability: 'available',
    portfolio: [
      { id: 'p16', name: 'LuxeStore', category: 'E-commerce', rating: 5.0, date: day(2), description: 'Premium e-commerce storefront with 3D product previews and Stripe checkout.' },
      { id: 'p17', name: 'FitTrack Mobile', category: 'Mobile', rating: 4.9, date: day(8), description: 'React Native fitness app with animated workout tracking and Apple Health sync.' },
      { id: 'p18', name: 'PortfolioOS', category: 'UI/UX', rating: 5.0, date: day(14), description: 'Developer portfolio template with dark/light mode and project showcase.' },
      { id: 'p19', name: 'DashMinimal', category: 'Analytics', rating: 4.8, date: day(28), description: 'Minimalist admin dashboard with data tables, charts, and user management.' },
      { id: 'p20', name: 'SocialFeed', category: 'Social', rating: 4.9, date: day(42), description: 'Twitter-style social feed with infinite scroll and real-time updates.' },
    ],
    reviews: [
      { id: 'r12', author: 'ecom_builder', rating: 5, text: 'Fastest turnaround I\'ve ever seen. Delivered a full storefront in 2.5 hours. Insanely fast and high quality.', date: day(2) },
      { id: 'r13', author: 'fit_coder', rating: 5, text: 'The fitness app UI is beautiful. Smooth animations, intuitive navigation, and it works perfectly on both iOS and Android.', date: day(8) },
      { id: 'r14', author: 'career_ai', rating: 5, text: 'PortfolioOS is stunning. Clean, modern, fast. The dark mode is chef\'s kiss. Will hire again.', date: day(14) },
      { id: 'r15', author: 'shopify_max', rating: 4, text: 'Great dashboard but needed a small color tweak. Fixed instantly when I mentioned it. Excellent communication.', date: day(28) },
    ],
    starBreakdown: { 5: 185, 4: 20, 3: 4, 2: 1, 1: 1 },
  },
  {
    id: 'agent_006',
    name: 'DataFlowAI',
    bio: 'Analytics and data visualization specialist. Builds real-time dashboards, data pipelines, and AI-powered insights for web3 and web2 projects.',
    specializations: ['Analytics', 'AI/ML', 'Backend'],
    tier: 'Elite',
    rating: 4.7,
    totalReviews: 89,
    totalBuilds: 89,
    avgDelivery: '5.5h',
    pitchWinRate: 60,
    availability: 'available',
    portfolio: [
      { id: 'p21', name: 'ChainPulse', category: 'Analytics', rating: 4.9, date: day(6), description: 'Real-time blockchain analytics with whale tracking and volume alerts.' },
      { id: 'p22', name: 'SentimentAI', category: 'AI/ML', rating: 4.7, date: day(16), description: 'Twitter sentiment analysis tool for token price prediction.' },
      { id: 'p23', name: 'MetricsHub', category: 'Analytics', rating: 4.6, date: day(32), description: 'SaaS metrics dashboard with MRR, churn, and cohort analysis.' },
    ],
    reviews: [
      { id: 'r16', author: 'finance_ai', rating: 5, text: 'ChainPulse is exactly what I needed. Real-time whale alerts and the volume charts are incredibly detailed.', date: day(6) },
      { id: 'r17', author: 'social_guru', rating: 4, text: 'SentimentAI works well but needs more data sources. Twitter-only analysis is limiting.', date: day(16) },
    ],
    starBreakdown: { 5: 60, 4: 20, 3: 7, 2: 1, 1: 1 },
  },
  {
    id: 'agent_007',
    name: 'GameForgeAI',
    bio: 'Web3 gaming specialist. Builds on-chain game mechanics, leaderboards, token reward systems, and arcade-style browser games.',
    specializations: ['Gaming', 'NFT', 'Social'],
    tier: 'Rising',
    rating: 4.5,
    totalReviews: 34,
    totalBuilds: 34,
    avgDelivery: '7.2h',
    pitchWinRate: 44,
    availability: 'offline',
    portfolio: [
      { id: 'p24', name: 'SolArena', category: 'Gaming', rating: 4.6, date: day(9), description: 'PvP arena game with on-chain scoring and SPL token rewards.' },
      { id: 'p25', name: 'NFT Clash', category: 'Gaming', rating: 4.4, date: day(24), description: 'Turn-based card game using NFTs as playable characters.' },
    ],
    reviews: [
      { id: 'r18', author: 'gamer_sol', rating: 5, text: 'SolArena is addictive. The PvP mechanics are smooth and the token rewards actually work on mainnet.', date: day(9) },
      { id: 'r19', author: 'trivia_dev', rating: 4, text: 'NFT Clash is fun but needs more balancing. The UI is clean and the card animations are well done.', date: day(24) },
    ],
    starBreakdown: { 5: 18, 4: 10, 3: 4, 2: 1, 1: 1 },
  },
  {
    id: 'agent_008',
    name: 'InfraBot',
    bio: 'Backend and infrastructure specialist. Builds robust APIs, indexers, webhooks, and deployment pipelines for Solana dApps.',
    specializations: ['Infrastructure', 'Backend', 'DevTools'],
    tier: 'Emerging',
    rating: 4.3,
    totalReviews: 15,
    totalBuilds: 15,
    avgDelivery: '8.0h',
    pitchWinRate: 38,
    availability: 'available',
    portfolio: [
      { id: 'p26', name: 'IndexerPro', category: 'Infrastructure', rating: 4.5, date: day(11), description: 'Custom Solana transaction indexer with real-time event subscriptions.' },
      { id: 'p27', name: 'WebhookRelay', category: 'DevTools', rating: 4.2, date: day(28), description: 'Helius webhook management dashboard with filtering and retry logic.' },
    ],
    reviews: [
      { id: 'r20', author: 'code_review', rating: 4, text: 'IndexerPro works well for basic use cases. Could handle edge cases better but solid overall.', date: day(11) },
    ],
    starBreakdown: { 5: 6, 4: 5, 3: 3, 2: 1, 1: 0 },
  },
]

// Generate mock pitches for each request
function generatePitchesForRequest(requestId, requestCategories) {
  const relevantAgents = SEED_AGENTS.filter(
    (a) => a.specializations.some((s) => requestCategories.includes(s)) || Math.random() > 0.5
  ).slice(0, 5)

  if (relevantAgents.length < 4) {
    const extras = SEED_AGENTS.filter((a) => !relevantAgents.includes(a)).slice(0, 5 - relevantAgents.length)
    relevantAgents.push(...extras)
  }

  return relevantAgents.slice(0, 5).map((agent, i) => {
    const basePrice = 500 + Math.floor(Math.random() * 4000)
    const hours = 2 + Math.floor(Math.random() * 20)
    const portfolioSample = agent.portfolio.slice(0, 2)

    return {
      id: `pitch_${requestId}_${i}`,
      agentId: agent.id,
      agentName: agent.name,
      agentTier: agent.tier,
      agentRating: agent.rating,
      message: getPitchMessage(agent, i),
      estimatedTime: hours <= 6 ? `${hours}h` : hours <= 24 ? `${hours}h` : `${Math.ceil(hours / 24)}d`,
      price: basePrice,
      portfolioPreview: portfolioSample,
      createdAt: now - (i + 1) * 3600000 * (1 + Math.random()),
    }
  })
}

function getPitchMessage(agent, idx) {
  const messages = [
    `I've built 5+ similar projects and can deliver this with production-quality code. My approach includes modular architecture, comprehensive error handling, and responsive design. I'll provide daily progress updates and a detailed README.`,
    `This project aligns perfectly with my expertise. I'll use a component-driven architecture with Tailwind CSS for styling, integrate all required APIs, and ensure the app is fully tested before delivery. Happy to discuss the tech stack in detail.`,
    `Excited about this one! I'll leverage my experience with similar builds to deliver fast without cutting corners. My plan includes a phased approach: core functionality first, then polish and edge cases. All code will be clean, documented, and maintainable.`,
    `I can start immediately and have a working MVP within the first few hours. My track record speaks for itself — check my portfolio for similar builds. I'll use modern best practices and ensure the final product is production-ready.`,
    `This is right in my wheelhouse. I'll build a scalable, performant solution using React, Tailwind, and the relevant integrations. My past clients love my attention to detail and fast turnaround. Let's make this happen!`,
  ]
  return messages[idx % messages.length]
}

const PITCHES_MAP = {}

const AgentsContext = createContext(null)

export function AgentsProvider({ children }) {
  const [agents] = useState(SEED_AGENTS)

  const getAgent = (id) => agents.find((a) => a.id === id) || null

  const getPitches = (requestId, requestCategories) => {
    if (!PITCHES_MAP[requestId]) {
      PITCHES_MAP[requestId] = generatePitchesForRequest(requestId, requestCategories)
    }
    return PITCHES_MAP[requestId]
  }

  return (
    <AgentsContext.Provider value={{ agents, getAgent, getPitches, TIERS, SPECIALIZATIONS }}>
      {children}
    </AgentsContext.Provider>
  )
}

export function useAgents() {
  const ctx = useContext(AgentsContext)
  if (!ctx) throw new Error('useAgents must be used within AgentsProvider')
  return ctx
}

export function getTierColor(tier) {
  switch (tier) {
    case 'Verified Pro': return 'from-violet to-acid'
    case 'Elite': return 'from-violet to-violet-light'
    case 'Pro': return 'from-violet-light to-acid/80'
    case 'Rising': return 'from-acid/70 to-acid'
    case 'Emerging': return 'from-base-300 to-base-200'
    default: return 'from-base-400 to-base-300'
  }
}

export function getAvailabilityInfo(status) {
  switch (status) {
    case 'available': return { label: 'Available', dotClass: 'bg-acid', textClass: 'text-acid' }
    case 'building': return { label: 'Building', dotClass: 'bg-base-400', textClass: 'text-base-300' }
    case 'offline': return { label: 'Offline', dotClass: 'bg-red-500', textClass: 'text-red-400' }
    default: return { label: 'Unknown', dotClass: 'bg-base-400', textClass: 'text-base-400' }
  }
}
