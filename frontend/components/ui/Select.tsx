import React from 'react'

export default function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const base = 'px-3 py-2 rounded-md bg-background border border-neutral-800 focus:border-accent focus:outline-none text-sm'
  return <select {...props} className={`${base} ${props.className || ''}`} />
}
