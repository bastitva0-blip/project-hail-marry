// ═══════════════════════════════════════════════════
//  All Devices — searchable, paginated table view
// ═══════════════════════════════════════════════════
import { useState, useMemo } from 'react'
import { C, thStyle, tdStyle, cardStyle } from '../tokens.js'
import { typeInfo } from '../data/types.js'
import { Btn, Input, Select, SectionHead, Pagination, Pill, Empty } from '../components/UI.jsx'
import { CONNS } from '../data/generate.js'
import { hasAlert } from '../components/DeviceCard.jsx'

const PER_PAGE = 25

export default function DevicesView({ devices, onView, onRename, onAdd, addLog, addToast }) {
  const [page,    setPage]    = useState(1)
  const [search,  setSearch]  = useState('')
  const [statusF, setStatusF] = useState('')
  const [connF,   setConnF]   = useState('')
  const [typeF,   setTypeF]   = useState('')

  const locs = useMemo(() => [...new Set(devices.map(d => d.location))].sort(), [devices])
  const types = useMemo(() => [...new Set(devices.map(d => d.type))].sort(), [devices])

  const filtered = useMemo(() => devices.filter(d => {
    if (statusF && d.status !== statusF) return false
    if (connF   && d.conn   !== connF)   return false
    if (typeF   && d.type   !== typeF)   return false
    if (search) {
      const q = search.toLowerCase()
      if (!d.name.toLowerCase().includes(q) &&
          !d.location.toLowerCase().includes(q) &&
          !d.vendor.toLowerCase().includes(q)) return false
    }
    return true
  }), [devices, search, statusF, connF, typeF])

  const visible = useMemo(() => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE), [filtered, page])

  const exportJSON = () => {
    const data = JSON.stringify(
      devices.map(({ id, type, name, location, vendor, conn, status, fw }) => ({ id, type, name, location, vendor, conn, status, fw })),
      null, 2
    )
    const a = document.createElement('a')
    a.href = 'data:application/json,' + encodeURIComponent(data)
    a.download = 'kgp-devices-export.json'
    a.click()
    addToast('Devices exported as JSON')
  }

  const exportCSV = () => {
    const header = 'id,type,name,location,vendor,conn,status,fw\n'
    const rows = devices.map(d => `${d.id},${d.type},"${d.name}","${d.location}","${d.vendor}",${d.conn},${d.status},${d.fw}`).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv,' + encodeURIComponent(header + rows)
    a.download = 'kgp-devices.csv'
    a.click()
    addToast('Devices exported as CSV')
  }

  const reboot = (d) => {
    addLog(d.name, 'Admin', 'Reboot command sent', 'Manual reboot from device table')
    addToast(`Reboot sent → ${d.name}`)
  }

  const resetPage = () => setPage(1)

  return (
    <div className="fade-in">
      <SectionHead
        title="Device Registry"
        subtitle={`Full inventory of ${devices.length.toLocaleString()} devices across all types & connectivity`}
        right={
          <>
            <Btn v="ghost" onClick={exportCSV}>⬇ CSV</Btn>
            <Btn v="ghost" onClick={exportJSON}>⬇ JSON</Btn>
            <Btn v="primary" onClick={onAdd}>+ Add Device</Btn>
          </>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input value={search} onChange={e => { setSearch(e.target.value); resetPage() }} placeholder="Search name, location, vendor…" style={{ width: 240 }} />
        <Select value={statusF} onChange={e => { setStatusF(e.target.value); resetPage() }}>
          <option value="">All Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </Select>
        <Select value={connF} onChange={e => { setConnF(e.target.value); resetPage() }}>
          <option value="">All Connectivity</option>
          {CONNS.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select value={typeF} onChange={e => { setTypeF(e.target.value); resetPage() }}>
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t}>{typeInfo(t).icon} {typeInfo(t).label}</option>)}
        </Select>
        {(search || statusF || connF || typeF) && (
          <Btn v="ghost" onClick={() => { setSearch(''); setStatusF(''); setConnF(''); setTypeF(''); setPage(1) }}>✕ Clear</Btn>
        )}
        <span style={{ fontSize: 12, color: C.faint, marginLeft: 'auto' }}>
          {filtered.length.toLocaleString()} of {devices.length.toLocaleString()} devices
        </span>
      </div>

      {/* Table */}
      <div style={{ ...cardStyle, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {['Device', 'Type', 'Location', 'Connectivity', 'Status', 'Key Reading', 'Firmware', 'Alert', 'Actions'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0
              ? <tr><td colSpan={9} style={{ ...tdStyle, textAlign: 'center', padding: '40px 20px', color: C.faint }}>No devices match your filters.</td></tr>
              : visible.map(d => <DeviceRow key={d.id} d={d} onView={onView} onRename={onRename} onReboot={() => reboot(d)} />)
            }
          </tbody>
        </table>
      </div>

      <Pagination page={page} total={filtered.length} pageSize={PER_PAGE} onChange={setPage} />
    </div>
  )
}

function DeviceRow({ d, onView, onRename, onReboot }) {
  const t  = typeInfo(d.type)
  const pv = d.values[t.primary]
  const al = hasAlert(d)

  return (
    <tr style={{ transition: 'background .12s' }}
      onMouseEnter={e => e.currentTarget.style.background = C.bg}
      onMouseLeave={e => e.currentTarget.style.background = ''}
    >
      <td style={tdStyle}>
        <div style={{ fontWeight: 700, fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
        <div style={{ fontSize: 11, color: C.faint }}>{d.vendor}</div>
      </td>
      <td style={tdStyle}>
        <span style={{ background: t.bg, color: t.color, fontWeight: 700, padding: '3px 9px', borderRadius: 20, fontSize: 11, whiteSpace: 'nowrap' }}>
          {t.icon} {t.label}
        </span>
      </td>
      <td style={tdStyle}>{d.location}</td>
      <td style={tdStyle}><Pill type="conn">{d.conn}</Pill></td>
      <td style={tdStyle}><Pill type={d.status}>{d.status}</Pill></td>
      <td style={{ ...tdStyle, fontWeight: 600 }}>
        {typeof pv === 'number' ? pv.toFixed(1) : (pv || '—')}
        {' '}{typeof pv === 'number' ? t.unit : ''}
      </td>
      <td style={tdStyle}>
        <code style={{ fontSize: 11 }}>{d.fw || '—'}</code>
        {d.fw && d.latestFw && d.fw !== d.latestFw && (
          <span style={{ fontSize: 9.5, background: C.amberBg, color: C.amber, padding: '2px 6px', borderRadius: 6, marginLeft: 5 }}>
            update
          </span>
        )}
      </td>
      <td style={tdStyle}>
        {al ? <Pill type="alert">⚠ Alert</Pill> : <Pill type="ok">OK</Pill>}
      </td>
      <td style={tdStyle}>
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn v="ghost" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => onView(d.id)}>View →</Btn>
          <Btn v="ghost" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => onRename(d)}>✏</Btn>
          <Btn v="ghost" style={{ padding: '5px 10px', fontSize: 11 }} onClick={onReboot}>🔁</Btn>
        </div>
      </td>
    </tr>
  )
}