import React from 'react';
import {useDroppable} from '@dnd-kit/core';

interface DroppableProps {
  children?: React.ReactNode;
  id: string;
  style?: React.CSSProperties;
}

function Droppable(props: DroppableProps) {
  const {isOver, setNodeRef} = useDroppable({
    id: 'droppable-' + props.id,
  });
  const style: React.CSSProperties = {
    backgroundColor: isOver ? 'lightgray' : undefined,
    display: "flex",
    flexDirection: "column",
    minHeight: 0, 
    height: "100%",
    ...props.style
  };
  
  
  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
}

export {Droppable};