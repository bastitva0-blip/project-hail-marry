// ═══════════════════════════════════════════════════
//  Sidebar — sticky left navigation
// ═══════════════════════════════════════════════════
import { C } from '../tokens.js'

const NAV = [
  { id: 'overview',  ic: '📡', lbl: 'Fleet Overview',    badge: 'Live' },
  { id: 'devices',   ic: '🧩', lbl: 'All Devices' },
  { id: 'analytics', ic: '📊', lbl: 'Analytics' },
  { id: 'reports',   ic: '🧾', lbl: 'Reports & Billing' },
  { id: 'ota',       ic: '⬆️', lbl: 'OTA Updates' },
  { id: 'logs',      ic: '🗒️', lbl: 'Audit Logs' },
]
const NAV2 = [
  { id: 'users',    ic: '👥', lbl: 'Users & Roles' },
  { id: 'settings', ic: '⚙️', lbl: 'Settings' },
]

function NavItem({ item, active, onClick }) {
  return (
    <div
      onClick={() => onClick(item.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 10px', borderRadius: 9,
        color: active ? C.blueDark : C.soft,
        fontWeight: active ? 700 : 500, fontSize: 13.5,
        cursor: 'pointer', marginBottom: 2,
        background: active ? C.blueLight : 'transparent',
        transition: 'background .12s, color .12s',
      }}
      onMouseEnter={e => !active && (e.currentTarget.style.background = C.bg)}
      onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ width: 17, textAlign: 'center', fontSize: 14 }}>{item.ic}</span>
      {item.lbl}
      {item.badge && (
        <span style={{ marginLeft: 'auto', fontSize: 9.5, fontWeight: 800, background: C.greenBg, color: C.green, padding: '2px 6px', borderRadius: 20 }}>
          {item.badge}
        </span>
      )}
    </div>
  )
}

function NavLabel({ text }) {
  return (
    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', color: C.faint, textTransform: 'uppercase', margin: '16px 10px 6px' }}>
      {text}
    </div>
  )
}

export default function Sidebar({ view, setView, currentUser, users = [] }) {
  const u = users.find(x => x.id === currentUser) || users[0] || {}
  const initial = (u.name || 'A')[0].toUpperCase()

  return (
    <div style={{
      width: 236, background: '#fff', borderRight: `1px solid ${C.line}`,
      display: 'flex', flexDirection: 'column',
      padding: '20px 14px', flexShrink: 0,
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '4px 8px 22px', fontWeight: 800, fontSize: 17 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 8,
          background: 'linear-gradient(135deg,#4F6EF7,#8B5CF6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 14,
        }}>
          ⚡
        </div>
        KGP Innovation
      </div>

      <NavLabel text="Unified IoT Console" />
      {NAV.map(item => (
        <NavItem key={item.id} item={item} active={view === item.id} onClick={setView} />
      ))}

      <NavLabel text="Administration" />
      {NAV2.map(item => (
        <NavItem key={item.id} item={item} active={view === item.id} onClick={setView} />
      ))}

      {/* User footer */}
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 9, padding: '14px 8px 0', borderTop: `1px solid ${C.line}` }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: C.blue,
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13, flexShrink: 0,
        }}>
          {initial}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name || 'admin'}</div>
          <div style={{ fontSize: 11, color: C.faint }}>{u.role || 'Admin'}</div>
        </div>
      </div>
    </div>
  )
}