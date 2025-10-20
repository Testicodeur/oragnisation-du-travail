"use client"
import { useEffect, useState } from 'react'

export default function DocsPage() {
  const [docs, setDocs] = useState<any[]>([])
  const api = process.env.NEXT_PUBLIC_API_URL

  const headers = () => {
    const access = localStorage.getItem("access")
    return { Authorization: `Bearer ${access}`, "Content-Type": "application/json" }
  }

  useEffect(() => {
    fetch(api + '/api/docs/', { headers: headers() }).then(async r => {
      if (r.ok) setDocs(await r.json())
    })
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Docs</h1>
      <ul className="space-y-2">
        {docs.map(d => (
          <li key={d.id} className="bg-background p-3 rounded">
            <div className="font-medium">{d.title}</div>
            <div className="text-sm text-muted">{d.category}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
