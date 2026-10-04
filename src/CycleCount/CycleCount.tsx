import { useEffect, useMemo, useState } from 'react'
import './CycleCount.css'
import { exportCycleCountWorkbook } from './cycleCountExcel'
import { parseCycleCountMhtml, parseCycleCountText, parseMaterialPaste, parsePikFacesPaste } from './cycleCountParser'
import type { CycleCountCountRow, CycleCountMaterialInput, CycleCountSourceRow } from './cycleCountTypes'

type Day = 1 | 2 | 3

const ASSUMPTION = 'Assumption: if a pasted material does not include a /1 /2 /3 suffix, it is assigned to days in pasted order, repeating across the selected day count.'
const SESSION_STORAGE_KEY = 'orders-dashboard-cycle-count'

type CycleCountSessionState = {
  step: 1 | 2 | 3 | 4 | 5
  dayCount: 1 | 2 | 3
  materialText: string
  pikFacesText: string
  lx03Text: string
  parsedRows: CycleCountSourceRow[]
  rows: CycleCountCountRow[]
  activeDay: Day
}

function getStoredSessionState(): Partial<CycleCountSessionState> {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY)
    return stored ? JSON.parse(stored) as Partial<CycleCountSessionState> : {}
  } catch {
    return {}
  }
}

function formatStorageBin(storageBin: string) {
  return storageBin.trim() ? storageBin : 'No PIK'
}

function compareStorageBins(left: CycleCountCountRow, right: CycleCountCountRow) {
  const leftEmpty = left.storageBin.trim() === ''
  const rightEmpty = right.storageBin.trim() === ''

  if (leftEmpty !== rightEmpty) {
    return leftEmpty ? 1 : -1
  }

  const binComparison = left.storageBin.localeCompare(right.storageBin, undefined, { numeric: true, sensitivity: 'base' })
  if (binComparison !== 0) {
    return binComparison
  }

  return left.material.localeCompare(right.material, undefined, { numeric: true, sensitivity: 'base' })
}

function buildRows(materials: CycleCountMaterialInput[], sourceRows: CycleCountSourceRow[], pikFaces: Record<string, string>): CycleCountCountRow[] {
  const byMaterial = new Map<string, CycleCountSourceRow[]>()
  for (const row of sourceRows) {
    const list = byMaterial.get(row.material) ?? []
    list.push(row)
    byMaterial.set(row.material, list)
  }

  const rows: CycleCountCountRow[] = []
  for (const item of materials) {
    const matches = byMaterial.get(item.material) ?? []
    if (matches.length > 0) {
      for (const match of matches) {
        rows.push({ ...match, actualCount: '', variance: '', day: item.day, recountRequired: false, confirmed: false })
      }
      continue
    }

    rows.push({
      material: item.material,
      storageType: 'PIK',
      storageBin: pikFaces[item.material] ?? '',
      baseUnitOfMeasure: '',
      sumOfTotalStock: 0,
      countOfTotalStock2: 0,
      actualCount: '',
      variance: '',
      day: item.day,
      recountRequired: false,
      confirmed: false
    })
  }

  return rows
}

export default function CycleCount() {
  const [storedState] = useState(getStoredSessionState)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(storedState.step ?? 1)
  const [dayCount, setDayCount] = useState<1 | 2 | 3>(storedState.dayCount ?? 3)
  const [materialText, setMaterialText] = useState(storedState.materialText ?? '')
  const [pikFacesText, setPikFacesText] = useState(storedState.pikFacesText ?? '')
  const [lx03Text, setLx03Text] = useState(storedState.lx03Text ?? '')
  const [lx03File, setLx03File] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<CycleCountSourceRow[]>(storedState.parsedRows ?? [])
  const [rows, setRows] = useState<CycleCountCountRow[]>(storedState.rows ?? [])
  const [activeDay, setActiveDay] = useState<Day>(storedState.activeDay ?? 1)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)

  const materials = useMemo(() => parseMaterialPaste(materialText, dayCount), [materialText, dayCount])
  const pikFaces = useMemo(() => parsePikFacesPaste(pikFacesText), [pikFacesText])
  const dayList = useMemo(() => Array.from({ length: dayCount }, (_, index) => (index + 1) as Day), [dayCount])
  const dayRows = useMemo(() => dayList.map(day => rows.filter(row => row.day === day).slice().sort(compareStorageBins)), [rows, dayList])
  const activeRows = dayRows[activeDay - 1] ?? []
  const activeDayComplete = activeRows.length > 0 && activeRows.every(row => row.actualCount !== '')
  const missingRows = activeRows.filter(row => row.actualCount === '')
  const recountRows = rows.filter(row => row.day === activeDay && row.recountRequired && !row.confirmed).slice().sort(compareStorageBins)
  const recountCanConfirm = activeDayComplete && recountRows.length > 0

  const getDayStatus = (day: Day) => {
    const rowsForDay = dayRows[day - 1] ?? []
    if (rowsForDay.length === 0) return 'Not started'

    const hasAnyCount = rowsForDay.some(row => row.actualCount !== '')
    const allCounted = rowsForDay.every(row => row.actualCount !== '')
    const hasVariance = rowsForDay.some(row => row.actualCount !== '' && Number(row.actualCount) !== row.sumOfTotalStock)
    const allConfirmed = allCounted && rowsForDay.every(row => row.confirmed)

    if (allConfirmed) return 'Confirmed'
    if (allCounted && !hasVariance) return 'Counted'
    if (hasVariance) return 'Recount'
    if (hasAnyCount) return 'Counting'
    return 'Not started'
  }

  useEffect(() => {
    if (activeDay > dayCount) {
      setActiveDay(dayCount)
    }
  }, [activeDay, dayCount])

  useEffect(() => {
    const sessionState: CycleCountSessionState = {
      step,
      dayCount,
      materialText,
      pikFacesText,
      lx03Text,
      parsedRows,
      rows,
      activeDay
    }

    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionState))
    } catch {
      // Session storage may be unavailable or full; the workflow still works in memory.
    }
  }, [step, dayCount, materialText, pikFacesText, lx03Text, parsedRows, rows, activeDay])

  const startMatching = () => {
    setError('')
    setStep(2)
  }

  const parseDayInputs = async () => {
    if (!lx03File && !lx03Text.trim()) {
      setError('Choose an LX03 file or paste the LX03 table first.')
      return
    }

    try {
      setError('')
      const sourceRows = lx03Text.trim()
        ? parseCycleCountText(lx03Text)
        : await parseCycleCountMhtml(lx03File as File)
      const dayMaterials = materials.filter(item => item.day === activeDay)
      const newDayRows = buildRows(dayMaterials, sourceRows, pikFaces)
      setParsedRows(current => [...current.filter(row => !dayMaterials.some(item => item.material === row.material)), ...sourceRows])
      setRows(current => [...current.filter(row => row.day !== activeDay), ...newDayRows])
      setLx03File(null)
      setLx03Text('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not parse the LX03 file.')
    }
  }

  const updateActualCount = (material: string, storageBin: string, value: string) => {
    const nextValue = value === '' ? '' : Number(value)
    setRows(current => current.map(row => {
      if (row.material !== material || row.storageBin !== storageBin) return row
      const actualCount = Number.isFinite(nextValue) ? nextValue : ''
      return {
        ...row,
        actualCount,
        variance: actualCount === '' ? '' : row.sumOfTotalStock - actualCount,
        confirmed: false
      }
    }))
  }

  const reviewRecount = (day: Day) => {
    setActiveDay(day)
    setRows(current => current.map(row => {
      if (row.day !== day) return row
      const hasVariance = row.actualCount !== '' && Number(row.actualCount) !== row.sumOfTotalStock
      return { ...row, recountRequired: row.recountRequired || hasVariance, confirmed: false }
    }))
    setStep(4)
  }

  const confirmRecount = () => {
    const blockingRows = activeRows.filter(row => row.actualCount === '')
    const reasons: string[] = []

    if (blockingRows.length > 0) {
      reasons.push(`${blockingRows.length} row(s) still have blank actual count`)
    }

    if (recountRows.length === 0 && activeRows.some(row => row.recountRequired)) {
      reasons.push('no recount rows entered yet')
    }

    console.log('[CycleCount] confirm recount attempt', {
      activeDay,
      activeDayComplete,
      recountRows: recountRows.length,
      recountCanConfirm,
      blockingRows: blockingRows.map(row => ({ material: row.material, storageBin: row.storageBin }))
    })

    if (reasons.length > 0) {
      console.log('[CycleCount] confirm recount blocked', reasons)
      return
    }

    setRows(current => current.map(row => {
      if (row.day !== activeDay) return row
      return { ...row, confirmed: true }
    }))
    if (activeDay < dayCount) {
      setActiveDay((activeDay + 1) as Day)
      setStep(2)
      return
    }

    setStep(5)
  }

  const onExport = async () => {
    setExporting(true)
    try {
      await exportCycleCountWorkbook(rows)
      setStep(5)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not export the workbook.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="cyclecount-page">
      <div className="cyclecount-shell">
        <header className="cyclecount-header">
          <div>
            <div className="cyclecount-kicker">Cycle Count</div>
            <h1>In-browser cycle count workflow</h1>
            <p>{ASSUMPTION}</p>
          </div>
          <div className="cyclecount-stepper">
            {['Setup', 'Match', 'Count', 'Recount', 'Report'].map((label, index) => (
              <button key={label} className={step === index + 1 ? 'active' : ''} onClick={() => setStep((index + 1) as 1 | 2 | 3 | 4 | 5)}>
                {index + 1}. {label}
              </button>
            ))}
          </div>
        </header>

        {error && <div className="cyclecount-error">{error}</div>}

        {step === 1 && (
          <section className="cyclecount-panel cyclecount-setup">
            <div className="cyclecount-grid">
              <label>
                <span>Day count</span>
                <select value={dayCount} onChange={e => setDayCount(Number(e.target.value) as 1 | 2 | 3)}>
                  <option value={1}>1 day</option>
                  <option value={2}>2 days</option>
                  <option value={3}>3 days</option>
                </select>
              </label>
              <label>
                <span>Materials</span>
                <textarea value={materialText} onChange={e => setMaterialText(e.target.value)} placeholder="Paste materials one per line or comma-separated. Optional suffix: 1234567/1" />
              </label>
              <label>
                <span>PIK Faces</span>
                <textarea value={pikFacesText} onChange={e => setPikFacesText(e.target.value)} placeholder="Paste Material and Stor. Bin, one per line or tab-separated" />
              </label>
            </div>
            <div className="cyclecount-actions">
              <button disabled={materials.length === 0} onClick={startMatching}>Continue to daily matching</button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="cyclecount-panel">
            <div className="cyclecount-tabs">
              {dayList.map(day => (
                <button key={day} className={activeDay === day ? 'active' : ''} onClick={() => setActiveDay(day as Day)}>
                  <span>Day {day}</span>
                  <span className="cyclecount-tab-status">{getDayStatus(day)}</span>
                </button>
              ))}
            </div>
            <div className="cyclecount-day-inputs">
              <label>
                <span>LX03 for Day {activeDay}</span>
                <input type="file" accept=".mhtml,.mht,.html,.htm" onChange={e => setLx03File(e.target.files?.[0] ?? null)} />
              </label>
              <label>
                <span>Or paste LX03 table</span>
                <textarea value={lx03Text} onChange={e => setLx03Text(e.target.value)} placeholder="Paste the LX03 table copied from a spreadsheet here." />
              </label>
              <button disabled={!lx03File && !lx03Text.trim()} onClick={parseDayInputs}>Parse and match Day {activeDay}</button>
            </div>
            <div className="cyclecount-table-wrap">
              <table className="cyclecount-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Storage Type</th>
                    <th>Storage Bin</th>
                    <th>Base Unit of Measure</th>
                    <th>Sum of Total Stock</th>
                    <th>Count of Total Stock2</th>
                    <th>Day</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRows.map(row => (
                    <tr key={`${row.material}-${row.storageBin}-${row.day}`}>
                      <td>{row.material}</td>
                      <td>{row.storageType}</td>
                      <td>{formatStorageBin(row.storageBin)}</td>
                      <td>{row.baseUnitOfMeasure}</td>
                      <td>{row.sumOfTotalStock}</td>
                      <td>{row.countOfTotalStock2}</td>
                      <td>{row.day}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cyclecount-actions">
              <button disabled={activeRows.length === 0} onClick={() => setStep(3)}>Start counting</button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="cyclecount-panel">
            <div className="cyclecount-tabs">
              {dayList.map(day => (
                <button key={day} className={activeDay === day ? 'active' : ''} onClick={() => setActiveDay(day as Day)}>
                  <span>Day {day}</span>
                  <span className="cyclecount-tab-status">{getDayStatus(day)}</span>
                </button>
              ))}
            </div>
            <div className="cyclecount-table-wrap">
              <table className="cyclecount-table cyclecount-count-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Storage Bin</th>
                    <th>Storage Type</th>
                    <th>Base UOM</th>
                    <th>Expected</th>
                    <th>Actual Count</th>
                    <th>Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRows.map(row => (
                    <tr key={`${row.material}-${row.storageBin}-${row.day}`}>
                      <td>{row.material}</td>
                      <td className="cyclecount-count-bin">{formatStorageBin(row.storageBin)}</td>
                      <td>{row.storageType}</td>
                      <td>{row.baseUnitOfMeasure}</td>
                      <td>{row.sumOfTotalStock}</td>
                      <td>
                        <input
                          className="cyclecount-count-input"
                          type="number"
                          inputMode="numeric"
                          value={row.actualCount}
                          onChange={e => updateActualCount(row.material, row.storageBin, e.target.value)}
                        />
                      </td>
                      <td>{row.variance === '' ? '—' : row.variance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cyclecount-print-sheet" aria-hidden="true">
              <div className="cyclecount-print-title">Cycle Count - Day {activeDay}</div>
              <table className="cyclecount-print-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Storage Bin</th>
                    <th>Actual Count</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRows.map(row => (
                    <tr key={`print-${row.material}-${row.storageBin}-${row.day}`}>
                      <td>{row.material}</td>
                      <td>{formatStorageBin(row.storageBin)}</td>
                      <td>{row.actualCount === '' ? '' : row.actualCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cyclecount-actions">
              <button onClick={() => reviewRecount(activeDay)}>Review recount</button>
              <button onClick={() => window.print()}>Print this day</button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="cyclecount-panel">
            <div className="cyclecount-recount-header">
              <h2>Flagged locations - Day {activeDay}</h2>
              <button onClick={confirmRecount}>Confirm day recount</button>
            </div>
            {missingRows.length > 0 && (
              <div className="cyclecount-recount-warning">
                <div className="cyclecount-recount-warning-title">
                  {missingRows.length} row{missingRows.length === 1 ? '' : 's'} still need an actual count before you can confirm.
                </div>
                <ul>
                  {missingRows.map(row => (
                    <li key={`missing-${row.material}-${row.storageBin}-${row.day}`}>
                      {row.material} {row.storageBin ? `- ${row.storageBin}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="cyclecount-actions">
              <button disabled={recountRows.length === 0} onClick={() => window.print()}>Print recounts</button>
            </div>
            <div className="cyclecount-print-sheet" aria-hidden="true">
              <div className="cyclecount-print-title">Recount Sheet - Day {activeDay}</div>
              <table className="cyclecount-print-table cyclecount-print-recount-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Storage Bin</th>
                    <th>Expected</th>
                    <th>Actual Count</th>
                  </tr>
                </thead>
                <tbody>
                  {recountRows.map(row => (
                    <tr key={`recount-print-${row.material}-${row.storageBin}-${row.day}`}>
                      <td>{row.material}</td>
                      <td>{formatStorageBin(row.storageBin)}</td>
                      <td>{row.sumOfTotalStock}</td>
                      <td>{row.actualCount === '' ? '' : row.actualCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cyclecount-flagged">
              {recountRows.length === 0 ? <p>No counted locations yet for this day.</p> : recountRows.map(row => (
                <div key={`${row.material}-${row.storageBin}-${row.day}`} className="cyclecount-flagged-row">
                  <div>{row.material}</div>
                  <div>{formatStorageBin(row.storageBin)}</div>
                  <div>Expected {row.sumOfTotalStock}</div>
                  <div className="cyclecount-flagged-status">{row.variance === '' || row.variance === 0 ? 'Matched, waiting for confirm' : 'Variance, replace actual count'}</div>
                  <label>
                    <span>Replace actual count</span>
                    <input type="number" inputMode="numeric" value={row.actualCount === '' ? '' : row.actualCount} onChange={e => updateActualCount(row.material, row.storageBin, e.target.value)} />
                  </label>
                </div>
              ))}
            </div>
          </section>
        )}

        {step === 5 && (
          <section className="cyclecount-panel">
            <h2>Final report preview</h2>
            <div className="cyclecount-table-wrap">
              <table className="cyclecount-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Storage Type</th>
                    <th>Storage Bin</th>
                    <th>Base Unit of Measure</th>
                    <th>Sum of Total Stock</th>
                    <th>Count of Total Stock2</th>
                    <th>Actual Count</th>
                    <th>Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={`${row.material}-${row.storageBin}-${row.day}`}>
                      <td>{row.material}</td>
                      <td>{row.storageType}</td>
                      <td>{row.storageBin}</td>
                      <td>{row.baseUnitOfMeasure}</td>
                      <td>{row.sumOfTotalStock}</td>
                      <td>{row.countOfTotalStock2}</td>
                      <td>{row.actualCount === '' ? '' : row.actualCount}</td>
                      <td>{row.variance === '' ? '' : row.variance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cyclecount-actions">
              <button disabled={exporting} onClick={onExport}>{exporting ? 'Exporting…' : 'Download XLSX'}</button>
            </div>
          </section>
        )}

        <section className="cyclecount-panel cyclecount-debug">
          <div>Materials pasted: {materials.length}</div>
          <div>Parsed LX03 rows: {parsedRows.length}</div>
          <div>PIK Faces entries: {Object.keys(pikFaces).length}</div>
          <div>Days: {dayCount}</div>
        </section>
      </div>
    </div>
  )
}
