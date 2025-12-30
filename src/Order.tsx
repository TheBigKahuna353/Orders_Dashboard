import {Draggable} from './Draggable.tsx';
import React from 'react';

interface OrderProps {
    order: Order;
}

function Order(props: OrderProps) {

    const style: React.CSSProperties = {
        border: '1px solid black',
        borderRadius: '5px',
        padding: '10px',
        width: '250px',
    };

    return (
        <Draggable id={props.order.deliveryNo}>
            <div style={style}>
                <h3>Order {props.order.deliveryNo}</h3>
                <p>Customer: {props.order.customer}</p>
                <p>Pallets: {props.order.pallets}</p>
            </div>
        </Draggable>
    );
}

export {Order};