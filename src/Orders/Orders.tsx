import { useState } from 'react';

import Header from "../Bars/Header";
import {onCSVUpload} from "../Data/import_data";
import OrdersTable from '../OrdersTable/OrdersTable';


import './Orders.css';

export default function Orders() {

    const import_data = async (file: File) => {
        if ( !file ) return;
        await onCSVUpload(file);
    }

    
    const [filter, setFilter] = useState<Filter>('All');

    return (
        <div className="orders-page">
            <div className="main-content">
                <Header onImportClick={import_data} currentFilter={filter} setFilter={setFilter}/>
                <div className="content">
                    <OrdersTable filter={filter} fullScreen={true} />
                </div>
            </div>
        </div>
    )
}  