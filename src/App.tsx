
import { HashRouter, Route, Routes } from 'react-router';
import Dashboard from './Dashboard/Dashboard';
import Workload from './Workload/Workload';
import SideBar from './Bars/Sidebar';
import Orders from './Orders/Orders';
import Summary from './Summary/Summary';

import { useThemeStore } from './Stores/ThemeStore';
import { useEffect } from 'react';

import PrimeReact from 'primereact/api';

import './App.css'
import CycleCount from './CycleCount/CycleCount';


export default function App() {


  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    PrimeReact?.changeTheme?.(theme !== 'dark' ? 'bootstrap4-dark-blue' : 'bootstrap4-light-blue', theme === 'dark' ? 'bootstrap4-dark-blue' : 'bootstrap4-light-blue', 'app-theme');
  }, [theme])

  return (
      <HashRouter basename='/'>
      <div className="app-container">
        <SideBar />
        <Routes>
          <Route path="/workload" element={<Workload />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/cyclecount" element={<CycleCount />} />
        </Routes>
      </div>
      </HashRouter>
  );
}


