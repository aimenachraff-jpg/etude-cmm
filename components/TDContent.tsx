'use client'

import { useState, useEffect, useRef } from 'react'

interface TDContentProps {
  html: string
  loadScript?: () => Promise<string>
}

export function TDContent({ html, loadScript }: TDContentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const loadScriptRef = useRef(loadScript)
  loadScriptRef.current = loadScript

  const enhancedHtml = html.replace(
    /<button class="toggle" onclick="toggleSol\(this\)">(.*?)<\/button>/g,
    '<button class="toggle" data-toggle="true">$1</button>'
  )

  // Inject once per mount. A remount (route change) re-runs the script so
  // script-generated DOM (quiz, calculators) is rebuilt. The init hook is
  // re-run shortly after mount because React can repaint the wrapper's
  // dangerouslySetInnerHTML after the first effect (dev StrictMode/hydration).
  useEffect(() => {
    const load = loadScriptRef.current
    if (!load) return
    let cancelled = false
    const timers: number[] = []
    const runInit = () => {
      const init = (window as any).__tdScriptInit
      if (typeof init === 'function') init()
    }
    load().then((script) => {
      if (cancelled) return
      document.querySelectorAll('script[data-td-content-script]').forEach(el => el.remove())
      ;(window as any).__tdScriptInit = undefined
      const scriptEl = document.createElement('script')
      scriptEl.textContent = script
      scriptEl.dataset.tdContentScript = 'true'
      document.body.appendChild(scriptEl)
      timers.push(window.setTimeout(runInit, 60))
      timers.push(window.setTimeout(runInit, 400))
    }).catch((err) => {
      console.error('Failed to load script:', err)
    })
    return () => {
      cancelled = true
      timers.forEach(t => window.clearTimeout(t))
    }
  }, [])

  return (
    <>
      <div 
        ref={containerRef}
        className="td-content-wrapper"
        dangerouslySetInnerHTML={{ __html: enhancedHtml }}
        onClick={(e) => {
          const target = e.target as HTMLElement
          if (target.classList.contains('toggle')) {
            const sol = target.nextElementSibling
            if (sol) {
              sol.classList.toggle('show')
              target.textContent = sol.classList.contains('show') ? 'Masquer solution' : 'Voir solution'
            }
          }
        }}
      />
    </>
  )
}
