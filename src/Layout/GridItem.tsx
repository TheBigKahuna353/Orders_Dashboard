import PlaceHolder from "../Widgets/PlaceHolder";



interface GridItemProps {
  children?: React.ReactNode;
  widget: DashboardWidget;
  editMode?: boolean;
  ROW_HEIGHT?: number;
  COL_WIDTH?: number;
}

export default function GridItem({children, widget, editMode, ROW_HEIGHT, COL_WIDTH}: GridItemProps) {
  const style: React.CSSProperties = {
    gridColumn: `${widget.col} / span ${widget.colSpan}`,
    gridRow: `${widget.row} / span ${widget.rowSpan}`,
    height: '100%',
  };

    return (
        <div style={style}>
            {editMode ? (
                <PlaceHolder widget={widget} ROW_HEIGHT={ROW_HEIGHT ?? 0} COL_WIDTH={COL_WIDTH ?? 0} />
            ) : (
                children
            )}
        </div>
    );
}