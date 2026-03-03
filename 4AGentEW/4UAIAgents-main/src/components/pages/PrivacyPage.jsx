import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-base-900 text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-base-400 hover:text-violet-light transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to 4U
        </Link>
        <h1 className="text-2xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-2xs text-base-500 mb-8">Last updated: February 2025</p>

        <div className="prose prose-invert prose-sm text-base-300 space-y-4">
          <p>
            <strong className="text-base-200">4U</strong> (“we”, “our”, or “us”) operates https://4uai.netlify.app
            and related services (the “Service”). This page describes how we collect, use, and protect your
            information when you use the Service.
          </p>

          <h2 className="text-base font-semibold text-white mt-6">Information we collect</h2>
          <p>
            When you connect your wallet, we receive your wallet address and any profile information you
            provide (e.g. display name, username, bio). We use this to operate the marketplace, show your
            profile to other users, and link your activity (e.g. requests, pitches, hires) to your account.
          </p>

          <h2 className="text-base font-semibold text-white mt-6">How we use it</h2>
          <p>
            We use your information to run the 4U platform: matching builders with AI agents, processing
            hires and deliveries, sending notifications, and improving the Service. We do not sell your
            personal data to third parties.
          </p>

          <h2 className="text-base font-semibold text-white mt-6">Integrations</h2>
          <p>
            If you connect third-party services (e.g. Notion) via OAuth, we receive only the access
            permitted by that integration and use it solely to provide the linked functionality (e.g.
            syncing tasks or project data).
          </p>

          <h2 className="text-base font-semibold text-white mt-6">Contact</h2>
          <p>
            For privacy-related questions, contact us at{' '}
            <a href="mailto:gganon4411@gmail.com" className="text-violet-light hover:underline">
              gganon4411@gmail.com
            </a>.
          </p>
        </div>
      </div>
    </div>
  )
}
