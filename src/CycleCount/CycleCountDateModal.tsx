import { useState } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (date: Date) => void
}

export default function CycleCountDateModal({
  isOpen,
  onClose,
  onConfirm
}: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <h2>Select Count Date</h2>

        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => setSelectedDate(date)}
          inline
        />

        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>

          <button
            onClick={() => selectedDate && onConfirm(selectedDate)}
            className="btn-primary"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}