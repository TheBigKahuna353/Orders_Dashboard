


// --------Version 0 -> 0.1--------
function changeDateFormat(oldDay: string): string {
    // old format is dd/mm/yyyy, new format is dd-mm-yyyy
    // this is a one time function to change the date format of all orders in the store
    const [day, month, year] = oldDay.split("/");
    return `${day}-${month}-${year}`;
}

function ChangeFormat(orders: Order[]): Order[] {

    const newOrders: Order[] = orders.map(order => ({
        ...order,
        deliverdate: changeDateFormat(order.deliverDate)
    }))
    return newOrders
}

export default ChangeFormat