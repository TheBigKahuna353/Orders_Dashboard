import axios from 'axios';
import { useOrdersStore } from '../Stores/OrdersStore';

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
            // returns {Orders: {time, version}, Pickups: {time, version}}
            const { Orders, Pickups } = res.data;
            const localTimeOrders = useOrdersStore.getState().ordersTimestamp;
            const localTimePickups = useOrdersStore.getState().pickupPlansTimestamp;


            if (Orders.time > localTimeOrders) {
                console.log('Newer data available. Fetching orders...');
                await fetchOrders();
            } else if (Pickups.time < localTimeOrders) {
                console.log('Local data is newer. Sending orders to server...');
                await sendOrders(Object.values(useOrdersStore.getState().orders));
            }

            if (Pickups.time > localTimePickups) {
                console.log('Newer pickup data available. Fetching pickups...');
                await fetchPickups();
            }
                else if (Pickups.time < localTimePickups) {
                console.log('Local pickup data is newer. Sending pickups to server...');
                await sendAllPickups(Object.values(useOrdersStore.getState().pickupPlans));
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
        console.log('Orders fetched successfully:', orders);
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
        console.log('Pickups fetched successfully:', pickups);
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