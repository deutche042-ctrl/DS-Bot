// Pure drawer geometry, shared by the gestures in Drawer.tsx and the unit
// tests: the closed panel rests one full width offscreen on its own side, and
// RTL mirrors the side of the panel and the sign of every drag and flick. The
// 'worklet' directives keep the helpers callable from the UI-thread gesture
// callbacks; under the plain node tests they are inert strings.
export function panelOffset(open: 0 | 1, width: number, rtl: boolean): number {
  'worklet'
  return rtl ? (1 - open) * width : (open - 1) * width
}

export function clampedDrag(translationX: number, width: number, open: 0 | 1, rtl: boolean): number {
  'worklet'
  // Decide in the LTR frame and mirror, so one clamp serves both sides.
  const t = rtl ? -translationX : translationX
  const x = open === 0
    ? Math.min(0, Math.max(-width, -width + Math.max(0, t)))
    : Math.min(0, Math.max(-width, t))
  // 0 - x mirrors the sign without turning a clamped 0 into -0.
  return rtl ? 0 - x : x
}

export function snapOnFlick(velocityX: number, x: number, width: number, rtl: boolean, open: 0 | 1): number {
  'worklet'
  const v = rtl ? -velocityX : velocityX
  const px = rtl ? -x : x
  // A flick in the gesture's own direction wins over the position half; the
  // edge pan settles toward open, the panel pan toward closed.
  if (open === 0) return v > 350 || px > -width / 2 ? panelOffset(1, width, rtl) : panelOffset(0, width, rtl)
  return v < -350 || px < -width / 2 ? panelOffset(0, width, rtl) : panelOffset(1, width, rtl)
}

// The style that puts the panel and its edge sensor on the physical side `rtl` names.
// Yoga treats left and right as physical edges and does not mirror them (only start/end
// mirror), so the property is the side itself. An earlier attempt inverted it for native
// RTL and anchored the panel on the left of an Arabic tablet while the offsets still
// assumed the right, which parked the closed panel in the middle of the screen.
export function panelAnchor(rtl: boolean): { left?: number; right?: number } {
  'worklet'
  return rtl ? { right: 0 } : { left: 0 }
}
