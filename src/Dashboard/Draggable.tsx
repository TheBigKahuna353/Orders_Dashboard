import React from 'react';
import {useDraggable} from '@dnd-kit/core';

import { MdDragIndicator } from "react-icons/md"; 
import "./Draggable.css"

interface DraggableProps {
  children?: React.ReactNode;
  id: string;
  isMergeTarget?: boolean| null;
  table?: boolean;
  onClick?: () => void;
  className?: string;
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
     padding: '0',
     alignContent: 'center',
  }
  
  if (props.table) {
    return (
      <tr ref={setNodeRef} style={style} data-dnd-id={props.id} className={props.isMergeTarget ? "merge-target" : ""} onClick={props.isMergeTarget ? props.onClick : undefined}>
        <td style={style2} {...listeners}  {...attributes}>
          <MdDragIndicator />
        </td>
        {props.children}
      </tr>
    );
  }

  return (
    <div ref={setNodeRef} style={style} data-dnd-id={props.id} className={`${props.className || ""} ${props.isMergeTarget ? "merge-target" : ""}`} onClick={props.isMergeTarget ? props.onClick : undefined}>
      <div style={style2} {...listeners}  {...attributes}>
        <MdDragIndicator />
      </div>
      {props.children}
    </div>
  );
}

export {Draggable};