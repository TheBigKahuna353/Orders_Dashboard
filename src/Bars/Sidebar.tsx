import React from 'react'
import './Sidebar.css'
import { Link, useLocation } from 'react-router';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const menuItems = [
    { icon: '📊', label: 'Dashboard', active: location.pathname === '/dashboard' || location.pathname === '/' },
    { icon: '📦', label: 'Orders', active: location.pathname === '/orders' },
    { icon: '🚚', label: 'Workload', active: location.pathname === '/workload' },
    { icon: '📈', label: 'Summary', active: location.pathname === '/summary' },
    { icon: '⚙️', label: 'Settings', active: false }
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">📦</div>
          <span className="logo-text">WarehouseOps</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <Link key={index} to={item.label.toLowerCase()}>
            <div className={`nav-item ${item.active ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
