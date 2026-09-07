// ═══════════════════════════════════════════════════
//  Overview View
//  Stat cards + type filter strip + device grid
// ═══════════════════════════════════════════════════
import { useState, useMemo } from 'react'
import { C } from '../tokens.js'
import { TYPES, TYPE_KEYS } from '../data/types.js'
import { CONNS, LOCATIONS } from '../data/generate.js'
import { StatCard, Btn, Input, Select, Empty, Pagination } from '../components/UI.jsx'
import DeviceCard, { hasAlert } from '../components/DeviceCard.jsx'

const PER_PAGE = 30

export default function OverviewView({ devices, onView, onRename, typeFilter, setTypeFilter }) {
  const [search,   setSearch]   = useState('')
  const [statusF,  setStatusF]  = useState('')
  const [connF,    setConnF]    = useState('')
  const [locF,     setLocF]     = useState('')
  const [alertF,   setAlertF]   = useState('')
  const [page,     setPage]     = useState(1)

  // Dynamic location list
  const locs = useMemo(() => [...new Set(devices.map(d => d.location))].sort(), [devices])

  // Type counts for the strip
  const typeCounts = useMemo(() => {
    const c = {}
    devices.forEach(d => c[d.type] = (c[d.type] || 0) + 1)
    return c
  }, [devices])

  // Stats
  const online  = useMemo(() => devices.filter(d => d.status === 'online').length,  [devices])
  const offline = useMemo(() => devices.length - online,                             [devices, online])
  const alerts  = useMemo(() => devices.filter(hasAlert).length,                    [devices])
  const active  = useMemo(() => devices.filter(d => d.power === 'on').length,       [devices])

  // Filtered list
  const filtered = useMemo(() => devices.filter(d => {
    if (typeFilter && d.type !== typeFilter)  return false
    if (statusF    && d.status !== statusF)   return false
    if (connF      && d.conn   !== connF)     return false
    if (locF       && d.location !== locF)    return false
    if (alertF     && !hasAlert(d))           return false
    if (search) {
      const q = search.toLowerCase()
      if (!d.name.toLowerCase().includes(q) && !d.location.toLowerCase().includes(q)) return false
    }
    return true
  }), [devices, typeFilter, statusF, connF, locF, alertF, search])

  const visible = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page])

  // Reset page when filters change
  const resetPage = () => setPage(1)

  return (
    <div className="fade-in">

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 20 }}>
        <StatCard label="Total Devices"  value={devices.length.toLocaleString()} delta="Across all types"         color={C.blue}   icon="📡" />
        <StatCard label="Online"         value={online.toLocaleString()}          delta={`${((online/devices.length)*100).toFixed(1)}% fleet uptime`} color={C.green}  icon="✅" />
        <StatCard label="Offline"        value={offline.toLocaleString()}         delta="Need attention"           color={C.red}    icon="❌" />
        <StatCard label="Active"         value={active.toLocaleString()}          delta="Currently powered on"     color={C.teal}   icon="⚡" />
        <StatCard label="Alerts"         value={alerts.toLocaleString()}          delta="Threshold breaches"       color={C.amber}  icon="⚠️" />
        <StatCard label="Device Types"   value={Object.keys(typeCounts).length}   delta="Module types deployed"   color={C.purple} icon="🧩" />
      </div>

      {/* ── Device type chip strip ── */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
          Device Types <span style={{ color: C.faint, fontWeight: 400, fontSize: 12 }}>— tap to filter</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
        <TypeChip label="All" count={devices.length} active={typeFilter === ''} color={C.blue} bg={C.blueLight} onClick={() => { setTypeFilter(''); resetPage() }} />
        {Object.keys(typeCounts).map(tk => {
          const t = TYPES[tk]
          return (
            <TypeChip
              key={tk}
              label={`${t.icon} ${t.label}`}
              count={typeCounts[tk]}
              active={typeFilter === tk}
              color={t.color}
              bg={t.bg}
              onClick={() => { setTypeFilter(typeFilter === tk ? '' : tk); resetPage() }}
            />
          )
        })}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input value={search} onChange={e => { setSearch(e.target.value); resetPage() }} placeholder="Search devices or locations…" style={{ width: 220 }} />
        <Select value={statusF} onChange={e => { setStatusF(e.target.value); resetPage() }}>
          <option value="">All Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </Select>
        <Select value={connF} onChange={e => { setConnF(e.target.value); resetPage() }}>
          <option value="">All Connectivity</option>
          {CONNS.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select value={locF} onChange={e => { setLocF(e.target.value); resetPage() }}>
          <option value="">All Locations</option>
          {locs.map(l => <option key={l} value={l}>{l}</option>)}
        </Select>
        <Select value={alertF} onChange={e => { setAlertF(e.target.value); resetPage() }}>
          <option value="">All Devices</option>
          <option value="1">Needs Attention</option>
        </Select>
        {(search || statusF || connF || locF || alertF || typeFilter) && (
          <Btn v="ghost" onClick={() => { setSearch(''); setStatusF(''); setConnF(''); setLocF(''); setAlertF(''); setTypeFilter(''); setPage(1) }}>✕ Clear</Btn>
        )}
      </div>

      {/* ── Results count ── */}
      <div style={{ fontSize: 12, color: C.faint, marginBottom: 12 }}>
        Showing {visible.length} of {filtered.length.toLocaleString()} device{filtered.length !== 1 ? 's' : ''}
        {filtered.length !== devices.length && ` (${devices.length.toLocaleString()} total)`}
      </div>

      {/* ── Device grid ── */}
      {visible.length === 0
        ? <Empty text="No devices match your current filters." />
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(258px,1fr))', gap: 14 }}>
            {visible.map(d => (
              <DeviceCard key={d.id} d={d} onView={onView} onRename={onRename} />
            ))}
          </div>
      }

      {/* ── Pagination ── */}
      <Pagination page={page} total={filtered.length} pageSize={PER_PAGE} onChange={setPage} />
    </div>
  )
}

function TypeChip({ label, count, active, color, bg, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '6px 12px', borderRadius: 20,
        border: `1px solid ${active ? color : (hover ? color + '66' : C.line)}`,
        background: active ? color : (hover ? color + '11' : '#fff'),
        color: active ? '#fff' : (hover ? color : C.soft),
        fontSize: 12, fontWeight: 700, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 5,
        transition: 'all .15s',
      }}
    >
      {!active && <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />}
      {label}
      <span style={{ opacity: .7, fontWeight: 600 }}>{count}</span>
    </div>
  )
}