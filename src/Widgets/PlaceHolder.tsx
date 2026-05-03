import { useDraggable } from "@dnd-kit/core"

import './PlaceHolder.css';
import { useUIStore } from "../Stores/UIStore";

const PlaceHolder: React.FC<{ 
    widget: DashboardWidget; 
    ROW_HEIGHT: number; 
    COL_WIDTH: number;
    openSettings: () => void;
}> = ({ widget, ROW_HEIGHT, COL_WIDTH, openSettings }) => {

    const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: widget.id
  })

  const {resizeWidget, removeWidget} = useUIStore()

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined
  }

  function startResize(e: React.MouseEvent<HTMLDivElement>, id: string) {

    const startX = e.clientX
    const startY = e.clientY
    e.stopPropagation() // Prevent triggering drag when starting resize
    e.preventDefault() // Prevent text selection during resize
    document.body.style.cursor = "se-resize"


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function onMove(ev:any) {

        const dx = ev.clientX - startX
        const dy = ev.clientY - startY

        const newColSpan =
            widget.colSpan + Math.round(dx / COL_WIDTH)

        const newRowSpan =
            widget.rowSpan + Math.round(dy / ROW_HEIGHT)

        resizeWidget(id, newColSpan, newRowSpan)
    }

    function stop() {
        window.removeEventListener("mousemove", onMove)
        window.removeEventListener("mouseup", stop)

        document.body.style.cursor = ""
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", stop)
    }


    return (
        <div className="placeholder-widget" ref={setNodeRef} style={style} {...attributes}>
            <button
                className="placeholder-widget-close"
                onClick={() => removeWidget(widget.id)}
                title="Remove widget"
            >
                ×
            </button>
            <div style={{width: "100%", height: "100%"}} {...listeners}>
                <p>Widget type: {widget.type}</p>
                <p>{widget.colSpan} x {widget.rowSpan}</p>
            </div>
            <button
                className="placeholder-widget-select"
                onClick={() => openSettings()}
                title="Widget settings"
            >
                ⚙
            </button>
            <div
                className="resize-handle"
                onMouseDown={(e) => startResize(e, widget.id)}
            />
        </div>
    );
}

export default PlaceHolder;
