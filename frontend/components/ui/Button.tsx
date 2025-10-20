"use client"
import React from 'react'
import { motion } from 'framer-motion'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: Variant
  size?: Size
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants: Record<Variant, string> = {
    primary: 'bg-gradient-to-r from-accent to-blue-600 text-white hover:from-blue-600 hover:to-accent shadow-lg hover:shadow-xl',
    secondary: 'bg-surface text-offwhite hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700',
    ghost: 'bg-transparent text-offwhite hover:bg-neutral-900/50 border border-neutral-800/50 hover:border-neutral-700',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-600 shadow-lg hover:shadow-xl',
  }
  
  const sizes: Record<Size, string> = {
    sm: 'h-8 px-3 text-sm rounded-lg',
    md: 'h-10 px-4 text-sm rounded-lg',
    lg: 'h-12 px-6 text-base rounded-xl',
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  )
}
