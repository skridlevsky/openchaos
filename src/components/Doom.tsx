"use client"

import { useState, MouseEventHandler } from "react"

declare global {
  interface Window {
    Module?: any
  }
}

function RunDoom({ onClose }: { onClose: MouseEventHandler<HTMLDivElement> }) {
  return (
    <>
      <div className="freedoom-blur" onClick={onClose} />
      <div className="freedoom-computer">
        <div className="freedoom-title">FREEDOOM</div>
        <div className="freedoom-dialog">
          <iframe
            src="/doom.html"
            className="freedoom-iframe"
            allow="autoplay"
          />
          <div className="freedoom-scanline"></div>
        </div>
      </div>
    </>
  )
}

export function Doom() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className="launch-freedoom-button" onClick={() => setOpen(true)}>
        FREEDOOM
      </button>
      {open && <RunDoom onClose={() => setOpen(false)} />}
    </>
  )
}
