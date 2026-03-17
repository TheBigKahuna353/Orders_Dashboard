import React, { useRef, type Dispatch, type SetStateAction } from 'react'
import './Header.css'
import './HeaderModal.css'
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { MdDarkMode, MdLightMode } from 'react-icons/md'
import { useThemeStore } from '../Stores/ThemeStore';
import DatePicker from 'react-datepicker';
import { WIDGETS } from '../Widgets/Widgets';

import "react-datepicker/dist/react-datepicker.css";
import { useUIStore } from '../Stores/UIStore';


interface HeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onImportClick?: (e: any, importOption: 'clear' | 'overwrite' | 'add') => void;
  onExportClick?: () => void;
  setEditMode?: Dispatch<SetStateAction<boolean>>
  showFilters?: {
    filter?: boolean, 
    date?: boolean, 
    filetype?: string,
    export?: boolean
    addWidget?: boolean
  };
}

const Header: React.FC<HeaderProps> = ({ onImportClick, onExportClick, setEditMode, showFilters }) => {

  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
    const [showImportModal, setShowImportModal] = React.useState(false);
    const [importOption, setImportOption] = React.useState<'clear' | 'overwrite' | 'add'>('clear');
    const [pendingFile, setPendingFile] = React.useState<File | null>(null);
    const [showAddWidgetModal, setShowAddWidgetModal] = React.useState(false);
  const dateRange = useUIStore((s) => s.dateRange)
  const setDateRange = useUIStore((s) => s.setDateRange)
  const currentFilter = useUIStore((s) => s.deliveryFilter)
  const setFilter = useUIStore((s) => s.setDeliveryFilter)
  const dateMode = useUIStore((s) => s.dateMode)
  const setDateMode = useUIStore((s) => s.setDateMode)

  const toast = useRef<Toast>(null);
  const fileRef = useRef<FileUpload>(null);


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const import_data = async (e: any) => {
    const file = e.files[0];
    if ( !file ) return;
      setPendingFile(file);
      setShowImportModal(true);
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
        {showFilters && showFilters.export && onExportClick && (
          <button onClick={() => onExportClick()}>
            Export
          </button>
        )}
        {showFilters && showFilters.addWidget && (
          <>
            <button onClick={() => setShowAddWidgetModal(true)}>
              Add Widget
            </button>
            {showAddWidgetModal && (
              <div className="header-widget-modal-overlay">
                <div className="header-widget-modal-content">
                  <h2>Select Widget Type</h2>
                  <ul className="header-widget-modal-list">
                    {Object.keys(WIDGETS).map(widgetType => (
                      <li key={widgetType}>
                        <button
                          onClick={() => {
                            useUIStore.getState().addWidget(widgetType as WIDGET_NAMES);
                            setShowAddWidgetModal(false);
                          }}
                          className="header-widget-modal-btn"
                        >
                          {widgetType.charAt(0).toUpperCase() + widgetType.slice(1).replace('-', ' ')}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setShowAddWidgetModal(false)} className="header-widget-modal-cancel">Cancel</button>
                </div>
              </div>
            )}
          </>
        )}
          
          {/* Import Modal */}
          {showImportModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Import Orders</h2>
                <form>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="importOption"
                        value="clear"
                        checked={importOption === 'clear'}
                        onChange={() => setImportOption('clear')}
                      />
                      Clear orders and upload
                    </label>
                  </div>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="importOption"
                        value="overwrite"
                        checked={importOption === 'overwrite'}
                        onChange={() => setImportOption('overwrite')}
                      />
                      Overwrite and update
                    </label>
                  </div>
                  <div>
                    <label style={{color: 'gray', cursor: 'not-allowed'}}>
                      <input
                        type="radio"
                        name="importOption"
                        value="add"
                        disabled
                        checked={importOption === 'add'}
                        onChange={() => setImportOption('add')}
                      />
                      Add new orders only
                    </label>
                  </div>
                  <div style={{marginTop: '16px'}}>
                    <button
                      type="button"
                      onClick={async () => {
                        if (pendingFile) {
                          if (onImportClick) await onImportClick(pendingFile, importOption);
                          fileRef.current?.clear();
                          toast.current?.show({ severity: 'info', summary: 'Info', detail: 'File uploaded successfully!' });
                        }
                        setShowImportModal(false);
                        setPendingFile(null);
                      }}
                      style={{marginRight: '8px'}}
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowImportModal(false);
                        setPendingFile(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        {setEditMode && (
          <button onClick={() => setEditMode((prev: boolean) => !prev)}>
            Edit Dashboard
          </button>
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
        {onImportClick && (
          <FileUpload 
            ref={fileRef}
            mode="basic" 
            name="demo[]" 
            accept={showFilters?.filetype ?? "*"}
            uploadHandler={import_data}
            auto
            chooseLabel='Upload'
            customUpload/>)}
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
