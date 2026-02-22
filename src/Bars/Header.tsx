import React, { useRef } from 'react'
import './Header.css'
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { MdDarkMode, MdLightMode } from 'react-icons/md'
import { useThemeStore } from '../Stores/ThemeStore';
import DatePicker from 'react-datepicker';

import "react-datepicker/dist/react-datepicker.css";
import { useUIStore } from '../Stores/UIStore';


interface HeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onImportClick: (e: any) => void;
  showFilters?: {layout?: boolean, filter?: boolean, date?: boolean};
}

const Header: React.FC<HeaderProps> = ({ onImportClick, showFilters }) => {

  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const dateRange = useUIStore((s) => s.dateRange)
  const setDateRange = useUIStore((s) => s.setDateRange)
  const currentFilter = useUIStore((s) => s.deliveryFilter)
  const setFilter = useUIStore((s) => s.setDeliveryFilter)
  const layout = useUIStore((s) => s.dashboardLayout)
  const setLayout = useUIStore((s) => s.setDashboardLayout)
  const dateMode = useUIStore((s) => s.dateMode)
  const setDateMode = useUIStore((s) => s.setDateMode)

  const toast = useRef<Toast>(null);
  const fileRef = useRef<FileUpload>(null);


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const import_data = async (e: any) => {
    const file = e.files[0];
    if ( !file ) return;
    await onImportClick(file);
    fileRef.current?.clear();
  }

  const onDateChange = (dates: [Date | null, Date | null]) => {
    setDateRange?.(dates);
}

  const dateType = () => {

  const isPick = dateMode === "pick"

  return (
    <div className="datepicker-footer">

      <div className="datepicker-mode-label">
        Timeline
      </div>

      <div className="segmented-control">

        {/* sliding background */}
        <div
          className={
            isPick
              ? "segment-highlight left"
              : "segment-highlight right"
          }
        />

        <button
          type="button"
          title='Order Pick Date'
          className="segment-btn"
          onClick={() => setDateMode("pick")}
        >
          Pick Date
        </button>

        <button
          type="button"
          title='Order Delivery Date'
          className="segment-btn"
          onClick={() => setDateMode("delivery")}
        >
          Delivery Date
        </button>

      </div>

    </div>
  )
}

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="page-title">Warehouse Order Dashboard</h1>
      </div>
      <div className="header-right">
        {showFilters && showFilters.layout && setLayout && (
          <Dropdown value={layout} options={
            [0, 1].map(i => ({ label: `Layout ${i + 1}`, value: i }))
          } onChange={(e) => setLayout && setLayout(e.value)} 
          style={{width: "150px", marginRight: "10px"}}
          />
        )}
        <Toast ref={toast} />
        <div>
          {showFilters && showFilters.filter && setFilter && (
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
        {showFilters && showFilters.date && dateRange && (
          <div className="date-picker-wrapper">
              <DatePicker
                  selectsRange
                  startDate={dateRange?.[0] ?? null}
                  endDate={dateRange?.[1] ?? null}
                  onChange={onDateChange}
                  isClearable
                  placeholderText="Select date range"
                  dateFormat="dd/MM/yyyy"
              >
                {dateType()}
              </DatePicker>
          </div>
        )}
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
