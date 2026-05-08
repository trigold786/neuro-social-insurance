import { useState, useCallback, useRef, useEffect } from 'react'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (v: number) => void
}

export default function Slider({ label, value, min, max, step, unit, onChange }: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const percent = ((value - min) / (max - min)) * 100

  const handlePointer = useCallback((clientX: number) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const raw = min + ratio * (max - min)
    const stepped = Math.round(raw / step) * step
    onChange(Math.max(min, Math.min(max, stepped)))
  }, [min, max, step, onChange])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: PointerEvent) => {
      e.preventDefault()
      handlePointer(e.clientX)
    }
    const onUp = () => setDragging(false)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [dragging, handlePointer])

  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] text-nsi-muted uppercase tracking-wider">{label}</span>
        <span className="font-mono text-sm text-nsi-cyan text-glow-cyan nsi-number">
          {value.toLocaleString()}<span className="text-[10px] text-nsi-muted ml-1">{unit}</span>
        </span>
      </div>
      <div
        ref={trackRef}
        className="relative h-1.5 bg-nsi-border rounded-full cursor-pointer"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId)
          setDragging(true)
          handlePointer(e.clientX)
        }}
      >
        {/* Active track */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-nsi-cyan/60 to-nsi-cyan"
          style={{ width: `${percent}%` }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-nsi-cyan shadow-[0_0_10px_rgba(0,212,255,0.5)] border-2 border-nsi-bg"
          style={{ left: `calc(${percent}% - 10px)` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="font-mono text-[10px] text-nsi-muted">{min.toLocaleString()}</span>
        <span className="font-mono text-[10px] text-nsi-muted">{max.toLocaleString()}</span>
      </div>
    </div>
  )
}
