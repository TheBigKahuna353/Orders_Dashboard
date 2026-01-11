


export function filterOrder(order: GroupedOrder, filter: string): boolean {
    if (filter === 'All') {
        return true;
    } else if (filter === 'All Out of Town') {
        return !['hornby', 'rolleston', 'christchurch'].includes(order.city.toLowerCase());
    } else if (filter === 'Out of town small') {
        return !['hornby', 'rolleston', 'christchurch'].includes(order.city.toLowerCase()) && 
            "Foodstuffs Dunedin" !== order.customer;
    } else if (filter === 'All Locals') {
        return ['hornby', 'rolleston', 'christchurch'].includes(order.city.toLowerCase());
    } else if (filter === 'Locals small') {
        return ['hornby', 'rolleston', 'christchurch'].includes(order.city.toLowerCase()) && 
           !['Woolworths New Zealand Limited', 'Foodstuffs South Island Limited', "Foodstuffs Dunedin"].includes(order.customer);
    } else if (filter === 'Bulk') {
        return ['Woolworths New Zealand Limited', 'Foodstuffs South Island Limited', "Foodstuffs Dunedin"].includes(order.customer);
    }
    return false;
}