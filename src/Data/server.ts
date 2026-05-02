import axios from 'axios';
import { useOrdersStore } from '../Stores/OrdersStore';
import { useInboundStore } from '../Stores/InboundStore';

const DEBUG_SERVER = false;
const API_URL = (import.meta.env.DEV && !DEBUG_SERVER) ? 'http://localhost:4941/api/v1/dashboard' : 'https://webserver-aekg.onrender.com/api/v1/dashboard';

let pageLoadSync: Promise<void> | null = null;
let pageLoadSyncCompleted = false;

export const onPageLoad = async () => {
    if (pageLoadSyncCompleted) {
        return;
    }

    if (pageLoadSync) {
        return pageLoadSync;
    }

    pageLoadSync = (async () => {
        console.log('Page loaded. Fetching metadata...');

        try {
            const res = await axios.get(`${API_URL}/metadata`);
            console.log('Metadata fetched successfully:', res.data);
            // returns {Orders: {time, version}, Pickups: {time, version}, Inbound: {time, version}}
            const { Orders, Pickups, Inbound } = res.data;
            const localTimeOrders = useOrdersStore.getState().ordersTimestamp;
            const localTimePickups = useOrdersStore.getState().pickupPlansTimestamp;
            const localTimeInbound = useInboundStore.getState().timestamp;



            if (Orders.time > localTimeOrders) {
                console.log('Newer data available. Fetching orders...', Orders.time, localTimeOrders);
                await fetchOrders();
            } else if (Orders.time < localTimeOrders && !DEBUG_SERVER) { // only send data if we're not using production server
                console.log('Local data is newer. Sending orders to server...', Orders.time, localTimeOrders);
                await sendOrders(Object.values(useOrdersStore.getState().orders));
            }

            if (Pickups.time > localTimePickups) {
                console.log('Newer pickup data available. Fetching pickups...', Pickups.time, localTimePickups);
                await fetchPickups();
            } else if (Pickups.time < localTimePickups && !DEBUG_SERVER) {
                console.log('Local pickup data is newer. Sending pickups to server...', Pickups.time, localTimePickups);
                await sendAllPickups(Object.values(useOrdersStore.getState().pickupPlans));
            }

            if (Inbound.time > localTimeInbound) {
                console.log('Newer inbound data available. Fetching inbound deliveries...', Inbound.time, localTimeInbound);
                await fetchInbound();
            } else if (Inbound.time < localTimeInbound && !DEBUG_SERVER) {
                console.log('Local inbound data is newer. Sending inbound deliveries to server...', Inbound.time, localTimeInbound);
                await sendInbound(useInboundStore.getState().deliveries);
            }


            pageLoadSyncCompleted = true;
        } catch (err) {
            console.error('Error fetching metadata:', err);
        } finally {
            pageLoadSync = null;
        }
    })();

    return pageLoadSync;

};

export const fetchOrders = async () => {
    try {
        const response = await axios.get(`${API_URL}/orders`);
        const { orders, time } = response.data;
        useOrdersStore.getState().setOrders(orders, time);
        console.log('Orders fetched successfully:', time);
        return true;
    } catch (error) {
        console.error('Error fetching orders:', error);
        return false;
    }
};

export const sendOrders = async (orders: Order[]): Promise<number> => {
    try {
        const response = await axios.post(`${API_URL}/orders`, { orders });
        console.log('Orders sent successfully:', response.data);
        return response.data.time;
    } catch (error) {
        console.error('Error sending orders:', error);
        return 0;
    }
};

export const sendNewOrders = async (orders: Order[]): Promise<number> => {
    try {
        console.log('Sending new/updated orders to server:', orders);
        const response = await axios.put(`${API_URL}/orders`, { orders });
        console.log('New orders sent successfully:', response.data);
        return response.data.time;

    } catch (error) {
        console.error('Error sending new orders:', error);
        return 0;
    }
};

export const fetchPickups = async () => {
    try {
        const response = await axios.get(`${API_URL}/pickups`);
        const { pickups, time } = response.data;
        useOrdersStore.getState().setPickups(pickups, time);
        console.log('Pickups fetched successfully:', time);
        return true;
    } catch (error) {
        console.error('Error fetching pickups:', error);
        return false;
    }
}

export const sendAllPickups = async (pickups: PickupPlan[]): Promise<number> => {
    try {
        const response = await axios.post(`${API_URL}/pickups`, { pickups });
        console.log('Pickups sent successfully:', response.data);
        return response.data.time;
    } catch (error) {
        console.error('Error sending pickups:', error);
        return 0;
    }
};

export const updateSinglePickup = async (pickup: PickupPlan): Promise<number> => {
    try {
        const response = await axios.put(`${API_URL}/pickups`, { pickup });
        console.log('Pickup updated successfully:', response.data);
        return response.data.time;
    } catch (error) {
        console.error('Error updating pickup:', error);
        return 0;
    }
};

export const sendInbound = async (deliveries: InboundDelivery[]): Promise<number> => {
    try {
        const response = await axios.post(`${API_URL}/inbound`, { deliveries });
        console.log('Inbound deliveries sent successfully:', response.data);
        return response.data.time;
    } catch (error) {
        console.error('Error sending inbound deliveries:', error);
        return 0;
    }  
};

export const updateInbound = async (deliveries: InboundDelivery[]): Promise<number> => {
    try {
        const response = await axios.put(`${API_URL}/inbound`, { deliveries });
        console.log('Inbound deliveries updated successfully:', response.data);
        return response.data.time;
    } catch (error) {
        console.error('Error updating inbound deliveries:', error);
        return 0;
    }
};

export const fetchInbound = async () => {
    try {
        const response = await axios.get(`${API_URL}/inbound`);
        const { deliveries, time } = response.data;
        useInboundStore.getState().setInboundDeliveries(deliveries, time);
        console.log('Inbound deliveries fetched successfully:', deliveries);
        return true;
    } catch (error) {
        console.error('Error fetching inbound deliveries:', error);
        return false;
    }
};