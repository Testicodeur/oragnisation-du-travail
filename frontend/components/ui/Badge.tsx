import React from 'react'
import { motion } from 'framer-motion'

export default function Badge({ 
  children, 
  tone = 'neutral' 
}: { 
  children: React.ReactNode
  tone?: 'neutral'|'success'|'warning'|'danger' 
}) {
  const tones: Record<string,string> = {
    neutral: 'bg-neutral-900/80 text-neutral-300 border-neutral-800/60',
    success: 'bg-emerald-900/60 text-emerald-300 border-emerald-800/60',
    warning: 'bg-amber-900/60 text-amber-200 border-amber-800/60',
    danger: 'bg-red-900/60 text-red-300 border-red-800/60',
  }
  
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium backdrop-blur ${tones[tone]}`}
    >
      {children}
    </motion.span>
  )
}
