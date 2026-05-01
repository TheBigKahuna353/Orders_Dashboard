import React from 'react'
import './Sidebar.css'
import { Link, useLocation } from 'react-router';
import { useIsMobile } from '../Layout/isMobile';


const Sidebar: React.FC = () => {
  const location = useLocation();
  const menuItems = [
    { icon: '📊', label: 'Dashboard', active: location.pathname === '/dashboard' || location.pathname === '/' },
    { icon: '📦', label: 'Orders', active: location.pathname === '/orders' },
    { icon: '🕒', label: 'Pickups', active: location.pathname === '/pickups' },
    { icon: '🚚', label: 'Workload', active: location.pathname === '/workload' },
    { icon: '📈', label: 'Summary', active: location.pathname === '/summary' },
    { icon: '🔍', label: 'Cycle Count', active: location.pathname === '/cyclecount' },
    { icon: '📥', label: 'Inbounds', active: location.pathname === '/inbounds' },
    { icon: '🛠️', label: 'Utils', active: location.pathname === '/utils' },
    { icon: '⚙️', label: 'Settings', active: false }
  ];

  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  // Hamburger button for mobile
  // Sidebar is hidden on mobile unless open
  return (
    <>
      {isMobile && !open && (
        <button
          className="sidebar-hamburger"
          aria-label="Show menu"
          onClick={() => setOpen(true)}
        >
          <span className="sidebar-hamburger-bar" />
          <span className="sidebar-hamburger-bar" />
          <span className="sidebar-hamburger-bar" />
        </button>
      )}
      {(!isMobile || open) && (
        <div>
          {isMobile && (
            <div
              className="sidebar-overlay"
              onClick={() => setOpen(false)}
            />
          )}
          <aside
            className={`sidebar${isMobile ? ' sidebar-mobile' : ''}${open ? ' sidebar-mobile-open' : ''}`}
          >
            <div className="sidebar-header">
              <div className="logo">
                <div className="logo-icon">📦</div>
                <span className="logo-text">Better Ecargo</span>
                {isMobile && (
                  <button
                    className="sidebar-close"
                    aria-label="Close menu"
                    onClick={() => setOpen(false)}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <nav className="sidebar-nav">
              {menuItems.map((item, index) => (
                <Link key={index} to={item.label.toLowerCase().replace(' ', '')} onClick={() => isMobile && setOpen(false)}>
                  <div className={`nav-item ${item.active ? 'active' : ''}`}>
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </div>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

export default Sidebar
