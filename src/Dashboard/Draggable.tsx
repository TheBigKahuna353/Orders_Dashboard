import React from 'react';
import {useDraggable} from '@dnd-kit/core';

import { MdDragIndicator } from "react-icons/md"; 

interface DraggableProps {
  children?: React.ReactNode;
  id: string;
  setIsDragging?: (dragging: boolean) => void;
}

function Draggable(props: DraggableProps) {
  const {attributes, listeners, setNodeRef, isDragging} = useDraggable({
    id: props.id,
  });


  const style : React.CSSProperties = {
    opacity: isDragging ? 0.5 : 1,
  };

  const style2 : React.CSSProperties = {
     cursor: isDragging ? 'grabbing' : 'grab', 
     width: '10px', 
     padding: '0'
  }
  
  if (props.setIsDragging) {
    props.setIsDragging(isDragging);
  }

  return (
    <tr ref={setNodeRef} style={style} data-dnd-id={props.id}>
      <td style={style2} {...listeners}  {...attributes}>
        <MdDragIndicator />
      </td>
      {props.children}
    </tr>
  );
}

export {Draggable};