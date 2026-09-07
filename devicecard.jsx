// ═══════════════════════════════════════════════════
//  Device Card — memoised grid card for overview
// ═══════════════════════════════════════════════════
import { memo, useState } from 'react'
import { C } from '../tokens.js'
import { typeInfo } from '../data/types.js'
import { Pill } from './UI.jsx'

const fmt = (v, dec = 1) => typeof v === 'number' ? v.toFixed(dec) : (v || '—')

function hasAlert(d) {
  const t = typeInfo(d.type)
  if (d.status !== 'online') return false
  const v = d.values[t.primary]
  if (typeof v !== 'number') return false
  if (t.alertHigh != null && v > t.alertHigh) return true
  if (t.alertLow  != null && v < t.alertLow)  return true
  return false
}

const DeviceCard = memo(function DeviceCard({ d, onView, onRename }) {
  const [hover, setHover] = useState(false)
  const t     = typeInfo(d.type)
  const pv    = d.values[t.primary]
  const alert = hasAlert(d)

  // Show 4 secondary metrics below the primary
  const secondaryKeys = Object.keys(d.values)
    .filter(k => k !== t.primary)
    .slice(0, 4)

  return (
    <div
      onClick={() => onView(d.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff',
        borderRadius: 14,
        padding: 16,
        boxShadow: '0 1px 2px rgba(17,24,39,.04),0 4px 14px rgba(17,24,39,.05)',
        cursor: 'pointer',
        border: `1.5px solid ${hover ? t.color : 'transparent'}`,
        transition: 'border-color .15s, box-shadow .15s',
        boxShadow: hover ? `0 4px 20px ${t.color}22` : '0 1px 2px rgba(17,24,39,.04),0 4px 14px rgba(17,24,39,.05)',
      }}
    >
      {/* Top row: icon + name + status pills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', gap: 10, minWidth: 0 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: t.bg, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18, flexShrink: 0,
          }}>
            {t.icon}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 12, lineHeight: 1.3, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>{d.name}</div>
            <div style={{ fontSize: 10.5, color: C.faint, marginTop: 2 }}>
              {d.location} · <span style={{ color: t.color, fontWeight: 700 }}>{t.label}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <Pill type={d.status}>{d.status === 'online' ? 'Online' : 'Offline'}</Pill>
          <Pill type="conn">{d.conn}</Pill>
        </div>
      </div>

      {/* Primary reading */}
      <div style={{ textAlign: 'center', margin: '12px 0 8px' }}>
        <b style={{ fontSize: 26, color: t.color }}>
          {typeof pv === 'number' ? fmt(pv, 1) : (pv || '—')}
        </b>
        <span style={{ display: 'block', fontSize: 10, color: C.faint, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginTop: 2 }}>
          {t.unit || t.primary}
        </span>
      </div>

      {/* Alert or power badge */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        {alert
          ? <Pill type="alert">⚠ Needs attention</Pill>
          : <Pill type={d.power === 'on' ? 'on' : 'off'}>{d.power === 'on' ? 'ACTIVE' : 'INACTIVE'}</Pill>
        }
      </div>

      {/* Secondary metrics mini-grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4 }}>
        {secondaryKeys.map(k => {
          const sv = d.values[k]
          return (
            <div key={k} style={{ background: C.bg, borderRadius: 7, padding: '5px 8px' }}>
              <b style={{ display: 'block', fontSize: 12 }}>{fmt(sv, 1)}</b>
              <span style={{ fontSize: 10, color: C.faint }}>{k}</span>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
        <button
          onClick={e => { e.stopPropagation(); onRename(d) }}
          style={{ background: 'none', border: 'none', fontSize: 11, color: C.blue, cursor: 'pointer', fontWeight: 700, padding: 0 }}
        >
          ✏ Rename
        </button>
        <span style={{ fontSize: 10.5, color: C.faint }}>{d.vendor}</span>
      </div>
    </div>
  )
})

export default DeviceCard
export { hasAlert }