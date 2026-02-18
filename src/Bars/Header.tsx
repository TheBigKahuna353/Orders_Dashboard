import React, { useRef } from 'react'
import './Header.css'
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { MdDarkMode, MdLightMode } from 'react-icons/md'
import { useThemeStore } from '../Stores/ThemeStore';


interface HeaderProps {
  setFilter?: (filter: Filter) => void;
  currentFilter: Filter;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onImportClick: (e: any) => void;
  setLayout?: (layout: number) => void;
  layout?: number;
}

const Header: React.FC<HeaderProps> = ({ setFilter, currentFilter, onImportClick, setLayout, layout }) => {

  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  const toast = useRef<Toast>(null);
  const fileRef = useRef<FileUpload>(null);


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const import_data = async (e: any) => {
    const file = e.files[0];
    if ( !file ) return;
    await onImportClick(file);
    fileRef.current?.clear();
  }

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="page-title">Warehouse Order Dashboard</h1>
      </div>
      <div className="header-right">
        {setLayout && (
          <Dropdown value={layout} options={
            [0, 1].map(i => ({ label: `Layout ${i + 1}`, value: i }))
          } onChange={(e) => setLayout && setLayout(e.value)} 
          style={{width: "150px", marginRight: "10px"}}
          />
        )}
        <Toast ref={toast} />
        <FileUpload 
          ref={fileRef}
          mode="basic" 
          name="demo[]" 
          accept="text/csv" 
          maxFileSize={1000000} 
          uploadHandler={import_data}
          auto
          chooseLabel='Upload'
          customUpload/>
        <div>
          {setFilter && (
            <Dropdown value={currentFilter} options={
              [
                { label: 'All', value: 'All' },
                { label: 'All Out of Town', value: 'All Out of Town' },
                { label: 'Out of town small', value: 'Out of town small' },
                { label: 'All Locals', value: 'All Locals' },
                { label: 'Locals small', value: 'Locals small' },
                { label: 'Bulk', value: 'Bulk' }
              ]
            } onChange={(e) => setFilter(e.value)} 
            style={{width: "200px"}}
            />
           )}
          </div>
        <button className="date-btn">
          <span className="btn-icon">📅</span>
          Delivery Date
        </button>
        <button onClick={toggleTheme}>
          {theme === 'dark' ? <MdLightMode /> : <MdDarkMode />}
        </button>
        <div className="user-avatar">
          <img src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2" alt="User" />
          <span className="notification-badge">5</span>
        </div>
      </div>
    </header>
  )
}

export default Header
