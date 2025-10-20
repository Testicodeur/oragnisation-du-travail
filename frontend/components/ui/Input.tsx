"use client"
import React from 'react'
import { motion } from 'framer-motion'

export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const baseClasses = 'px-4 py-3 rounded-lg bg-background/80 backdrop-blur border border-neutral-800/60 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none text-sm transition-all duration-200 placeholder:text-neutral-500'
  
  return (
    <motion.input
      whileFocus={{ scale: 1.01 }}
      {...props} 
      className={`${baseClasses} ${props.className || ''}`} 
    />
  )
}
