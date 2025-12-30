import React from 'react';
import {useDraggable} from '@dnd-kit/core';

interface DraggableProps {
  children?: React.ReactNode;
  id: string;
}

function Draggable(props: DraggableProps) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: props.id,
  });
  const style : React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    padding: '0px',
    display: 'flex',
    backgroundColor: 'black',
    justifyContent: 'center',
    flex: '1 1 0px',
    minWidth: '20vw',
    position: 'relative',
  };

  
  return (
    <div ref={setNodeRef} style={style}>
      <div style={{width: '30%', height: '100%', position: 'absolute', left: 0, cursor: 'grab',}} {...listeners}  {...attributes}/>
      {props.children}
    </div>
  );
}

export {Draggable};