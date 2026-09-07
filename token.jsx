// ═══════════════════════════════════════════════════
//  KGP Innovation Design Tokens
// ═══════════════════════════════════════════════════

export const C = {
  blue:      '#4F6EF7',
  blueDark:  '#3B54D6',
  blueLight: '#EEF1FE',
  ink:       '#111827',
  soft:      '#4B5563',
  faint:     '#9CA3AF',
  bg:        '#F5F6FA',
  card:      '#FFFFFF',
  line:      '#E7E9F0',
  green:     '#0FA968',
  greenBg:   '#E7F8F0',
  red:       '#E4483C',
  redBg:     '#FDECEB',
  amber:     '#DB8B12',
  amberBg:   '#FDF3E0',
  teal:      '#0891B2',
  tealBg:    '#E4F6FA',
  purple:    '#7C5CE0',
  purpleBg:  '#F1ECFC',
}

export const SHADOW = '0 1px 2px rgba(17,24,39,.04), 0 4px 14px rgba(17,24,39,.05)'
export const RADIUS = 14

export const cardStyle = {
  background: '#fff',
  borderRadius: RADIUS,
  padding: 18,
  boxShadow: SHADOW,
}

export const inpStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 9,
  border: `1px solid ${C.line}`,
  fontSize: 13,
  fontFamily: 'inherit',
  color: C.ink,
  background: '#fff',
  boxSizing: 'border-box',
  outline: 'none',
}

export const PILL_STYLES = {
  online:  { bg: '#E7F8F0', c: '#0FA968' },
  offline: { bg: '#FDECEB', c: '#E4483C' },
  on:      { bg: '#EEF1FE', c: '#3B54D6' },
  off:     { bg: '#F1F2F6', c: '#9CA3AF' },
  warn:    { bg: '#FDF3E0', c: '#DB8B12' },
  alert:   { bg: '#FDECEB', c: '#E4483C' },
  conn:    { bg: '#E4F6FA', c: '#0891B2' },
  aws:     { bg: '#FFF1E4', c: '#C47300' },
  sim:     { bg: '#F3E8FF', c: '#7C5CE0' },
  admin:   { bg: '#F1ECFC', c: '#7C5CE0' },
  ok:      { bg: '#E7F8F0', c: '#0FA968' },
}

export function pillStyle(type) {
  const s = PILL_STYLES[type] || PILL_STYLES.off
  return {
    background: s.bg, color: s.c,
    fontSize: 10, fontWeight: 800,
    padding: '3px 9px', borderRadius: 20,
    whiteSpace: 'nowrap', display: 'inline-block',
    letterSpacing: '.02em',
  }
}

export function btnStyle(variant = 'primary') {
  const variants = {
    primary: { bg: C.blue,    c: '#fff',    border: 'none' },
    ghost:   { bg: C.bg,      c: C.ink,     border: 'none' },
    outline: { bg: '#fff',    c: C.ink,     border: `1px solid ${C.line}` },
    danger:  { bg: C.redBg,   c: C.red,     border: 'none' },
    success: { bg: C.greenBg, c: C.green,   border: 'none' },
    amber:   { bg: C.amberBg, c: C.amber,   border: 'none' },
  }
  const s = variants[variant] || variants.primary
  return {
    background: s.bg, color: s.c, border: s.border,
    borderRadius: 9, padding: '8px 15px',
    fontWeight: 700, fontSize: 13,
    cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontFamily: 'inherit', lineHeight: 1,
    transition: 'opacity .15s, background .15s',
  }
}

export const thStyle = {
  textAlign: 'left', fontSize: 11,
  textTransform: 'uppercase', letterSpacing: '.04em',
  color: C.faint, padding: '9px 12px',
  borderBottom: `1px solid ${C.line}`,
  fontWeight: 700,
}

export const tdStyle = {
  padding: '11px 12px',
  borderBottom: `1px solid ${C.line}`,
  verticalAlign: 'middle',
  fontSize: 13,
}