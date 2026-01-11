import React from 'react';
import {useDroppable} from '@dnd-kit/core';

interface DroppableProps {
  children?: React.ReactNode;
  id: string;
}

function Droppable(props: DroppableProps) {
  const {isOver, setNodeRef} = useDroppable({
    id: 'droppable-' + props.id,
  });
  const style: React.CSSProperties = {
    minHeight: '100px',
    border: '2px dashed',
    borderColor: 'black',
    backgroundColor: isOver ? 'lightgray' : undefined,
    padding: '10px',
    boxSizing: 'border-box',
    display: 'grid',
    gap: '10px',
  };
  
  
  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
}

export {Droppable};