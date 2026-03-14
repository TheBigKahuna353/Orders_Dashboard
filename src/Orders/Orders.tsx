import Header from "../Bars/Header";
import {onCSVUpload} from "../Data/import_ecargo";
import OrdersTable from '../OrdersTable/OrdersTable';


import './Orders.css';

export default function Orders() {

    const import_data = async (file: File, importOption: 'clear' | 'overwrite' | 'add') => {
        if ( !file ) return;
        await onCSVUpload(file, importOption);
    }

    return (
        <div className="orders-page">
            <div className="main-content">
                <Header onImportClick={import_data} showFilters={{layout: false, filter: true, date: true}}/>
                <div className="content">
                    <OrdersTable widget={false}/>
                </div>
            </div>
        </div>
    )
}  