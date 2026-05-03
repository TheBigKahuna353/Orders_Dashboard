
interface GridItemProps {
  children?: React.ReactNode;
  widget: DashboardWidget;
}

export default function GridItem({children, widget}: GridItemProps) {
  const style: React.CSSProperties = {
    gridColumn: `${widget.col} / span ${widget.colSpan}`,
    gridRow: `${widget.row} / span ${widget.rowSpan}`,
    height: '100%',
  };

    return (
        <div style={style}>
          {children}
        </div>
    );
}