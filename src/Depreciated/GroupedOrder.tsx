import {Draggable} from '../Dashboard/Draggable.tsx';
import React from 'react';

interface GroupedOrderProps {
    group: GroupedOrder;
    detailed?: boolean;
}

function GroupedOrder(props: GroupedOrderProps) {
    const style: React.CSSProperties = {
        flex: '1 1 0px',
    };

    const style2: React.CSSProperties = {
        padding: '5px',
        display: 'flex',
        gap: '10px',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    }; 

    const expandStyle: React.CSSProperties = {
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        paddingRight: '15px',
    };

    const startItem: React.CSSProperties = {
        justifySelf: 'start',
        width: '30%',
    };

    const middleItems: React.CSSProperties = {
        justifySelf: 'center',
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: "green"
    };

    const onClickExpand = () => {
            setIsExpanded(!isExpanded);
    };

    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <Draggable id={props.group.groupId}>
            <div style={style}>
                <div style={style2}>
                    <h3 style={startItem}>{props.group.customer}</h3>
                    <p style={middleItems}>{props.group.totalPallets}</p>
                    <p style={middleItems}>{props.group.palletsVariance}</p>
                    {props.detailed && (
                        <p style={middleItems}>{props.group.totalWeight} Kg</p>
                    )}
                    {props.detailed && (
                        <p style={middleItems}>{props.group.totalVolume} m<sup>3</sup></p>
                    )}
                    <div style={expandStyle} onClick={onClickExpand}><p> {props.group.orders.length}</p></div>
                </div>
                {isExpanded && (
                    <div style={{padding: '5px', display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', boxSizing: 'border-box'}}>
                        {props.group.orders.map((order) => (
                            <div key={order.deliveryNo} style={{border: '1px solid gray', borderRadius: '5px', lineHeight: '0.6', padding: '5px'}}>
                                <h4>Order {order.deliveryNo}</h4>
                                <p>weight: {order.weight} Kg</p>
                                <p>volume: {order.volume} m<sup>3</sup></p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Draggable>
    );
}

export {GroupedOrder};