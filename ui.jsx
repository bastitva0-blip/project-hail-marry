// ═══════════════════════════════════════════════════
//  Shared primitive UI components
// ═══════════════════════════════════════════════════
import { C, pillStyle, btnStyle, inpStyle } from '../tokens.js'

// ── Pill badge ──────────────────────────────────────
export function Pill({ type = 'off', children, style = {} }) {
  return (
    <span style={{ ...pillStyle(type), ...style }}>
      {children}
    </span>
  )
}

// ── Button ──────────────────────────────────────────
export function Btn({ v = 'primary', onClick, disabled, children, style = {}, title }) {
  return (
    <button
      title={title}
      style={{
        ...btnStyle(v), ...style,
        opacity: disabled ? 0.48 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

// ── Input / Select helpers ──────────────────────────
export function Input({ value, onChange, placeholder, type = 'text', style = {}, onKeyDown }) {
  return (
    <input
      type={type} value={value}
      onChange={onChange} placeholder={placeholder}
      onKeyDown={onKeyDown}
      style={{ ...inpStyle, ...style }}
    />
  )
}

export function Select({ value, onChange, children, style = {} }) {
  return (
    <select value={value} onChange={onChange}
      style={{ ...inpStyle, width: 'auto', ...style }}>
      {children}
    </select>
  )
}

export function Textarea({ value, onChange, placeholder, rows = 4, style = {} }) {
  return (
    <textarea
      value={value} onChange={onChange} placeholder={placeholder}
      rows={rows}
      style={{ ...inpStyle, resize: 'vertical', ...style }}
    />
  )
}

// ── Form field wrapper ──────────────────────────────
export function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: C.soft }}>
          {label}
        </label>
      )}
      {children}
      {hint && <div style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

// ── Modal ───────────────────────────────────────────
export function Modal({ show, onClose, title, children, wide = false, maxWidth }) {
  if (!show) return null
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(17,24,39,.52)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff', borderRadius: 16, padding: 24,
        width: '100%', maxWidth: maxWidth || (wide ? 660 : 440),
        boxShadow: '0 20px 60px rgba(0,0,0,.25)',
        maxHeight: '90vh', overflowY: 'auto',
        animation: 'fadeIn .2s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 17 }}>{title}</h3>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: C.faint, lineHeight: 1, padding: 0 }}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Toast notification system ───────────────────────
export function Toast({ toasts }) {
  return (
    <div style={{ position: 'fixed', top: 18, right: 18, zIndex: 300, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id}
          style={{
            background: '#fff', borderLeft: `4px solid ${t.err ? C.red : C.green}`,
            boxShadow: '0 4px 24px rgba(0,0,0,.14)', borderRadius: 9,
            padding: '11px 16px', fontSize: 13, minWidth: 240,
            animation: 'slidein .2s ease', lineHeight: 1.4,
          }}>
          {t.msg}
        </div>
      ))}
    </div>
  )
}

// ── Stat card ───────────────────────────────────────
export function StatCard({ label, value, delta, color = C.blue, icon }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 2px rgba(17,24,39,.04),0 4px 14px rgba(17,24,39,.05)' }}>
      <div style={{ fontSize: 12, color: C.faint, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon && <span>{icon}</span>}{label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color }}>{value}</div>
      {delta && <div style={{ fontSize: 11.5, marginTop: 4, color: C.soft }}>{delta}</div>}
    </div>
  )
}

// ── Empty state ─────────────────────────────────────
export function Empty({ text = 'No data found.' }) {
  return <div style={{ textAlign: 'center', padding: '40px 20px', color: C.faint, fontSize: 14 }}>{text}</div>
}

// ── Section header ──────────────────────────────────
export function SectionHead({ title, subtitle, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{title}</h2>
        {subtitle && <p style={{ margin: '3px 0 0', fontSize: 12, color: C.faint }}>{subtitle}</p>}
      </div>
      {right && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>{right}</div>}
    </div>
  )
}

// ── Pagination ──────────────────────────────────────
export function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, alignItems: 'center' }}>
      <Btn v="ghost" onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}>‹ Prev</Btn>
      {/* Page number pills */}
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let p
        if (totalPages <= 5) p = i + 1
        else if (page <= 3) p = i + 1
        else if (page >= totalPages - 2) p = totalPages - 4 + i
        else p = page - 2 + i
        return (
          <button key={p} onClick={() => onChange(p)}
            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${p === page ? C.blue : C.line}`, background: p === page ? C.blue : '#fff', color: p === page ? '#fff' : C.ink, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            {p}
          </button>
        )
      })}
      <Btn v="ghost" onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}>Next ›</Btn>
      <span style={{ fontSize: 12, color: C.faint, marginLeft: 4 }}>{total.toLocaleString()} total</span>
    </div>
  )
}