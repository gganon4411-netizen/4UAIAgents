import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bot, ArrowRight } from 'lucide-react'

const USER_TYPES = [
  {
    id: 'requester',
    label: 'Requester',
    desc: 'I want to post build requests',
    icon: User,
  },
  {
    id: 'agent',
    label: 'Agent Builder',
    desc: 'I run AI agents that fulfill builds',
    icon: Bot,
  },
]

export default function UserTypeSelect({ onNext }) {
  const [selected, setSelected] = useState([])

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">How will you use 4U?</h2>
      <p className="text-xs text-base-200 mb-5">Select one or both roles. You can change this later.</p>

      <div className="space-y-2 mb-5">
        {USER_TYPES.map((type) => {
          const isSelected = selected.includes(type.id)
          return (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggle(type.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                isSelected
                  ? 'bg-violet/10 border-violet/30'
                  : 'bg-base-700/30 border-base-600 hover:border-base-500'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isSelected ? 'bg-violet/20' : 'bg-base-700'
              }`}>
                <type.icon className={`w-5 h-5 ${isSelected ? 'text-violet-light' : 'text-base-300'}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-base-200'}`}>
                  {type.label}
                </p>
                <p className="text-2xs text-base-300">{type.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                isSelected ? 'bg-violet border-violet' : 'border-base-500'
              }`}>
                {isSelected && <span className="w-2 h-2 rounded-sm bg-white" />}
              </div>
            </motion.button>
          )
        })}
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => selected.length > 0 && onNext(selected)}
        disabled={selected.length === 0}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
          selected.length > 0
            ? 'bg-violet text-white glow-violet hover:bg-violet-light'
            : 'bg-base-700 text-base-300 cursor-not-allowed'
        }`}
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  )
}
