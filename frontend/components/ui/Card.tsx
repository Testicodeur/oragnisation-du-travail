import React from 'react'
import { motion } from 'framer-motion'

export default function Card({ 
  children, 
  className = '', 
  hover = false 
}: { 
  children: React.ReactNode
  className?: string
  hover?: boolean 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -2, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' } : {}}
      className={`bg-surface/80 backdrop-blur rounded-xl border border-neutral-900/60 shadow-card ${className}`}
    >
      {children}
    </motion.div>
  )
}
