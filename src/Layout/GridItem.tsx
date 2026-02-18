


interface GridItemProps {
  children?: React.ReactNode;
  layout: WidgetLayout;
}

export default function GridItem({children, layout}: GridItemProps) {
  const style: React.CSSProperties = {
    gridColumn: `${layout.col} / span ${layout.colSpan}`,
    gridRow: `${layout.row} / span ${layout.rowSpan}`,
    height: '100%',
  };

    return (
        <div style={style}>
            {children}
        </div>
    );
}