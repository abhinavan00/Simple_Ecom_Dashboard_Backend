import { getShopifyRestClient } from "./shopify.js";
import devDb from "../dbConfig.js";

// calculate the date 7 days ago and fortmats it as an ISO string
function getLast7Days() {
    const d = new Date();
    // Set date back 7 days
    d.setDate(d.getDate() - 7);
    // Return ISO format string (Shopify's preferred date query format)
    return d.toISOString();
}

// a function to calculate the total sales and them return it, so we can use it any where we want
export async function fetchAndStoreShopifyData(userId) {
    try {
        // Calling configured Shopify API rest client
        const client = getShopifyRestClient(userId);

        // calculate the start date for the query
        const sevenDaysAgo = getLast7Days();

        // Calling shopify api to fetch orders with the maximum limit of 250
        const response = await client.get({
            path: 'orders',
            query: {
                status: 'any', 
                limit: 250,
                // filter the order created after this date
                created_at_min: sevenDaysAgo
            }
        });

        // Accessing the array of orders
        const orders = response.body.orders;

        // if shopify api returns 0 orders
        if (!orders || orders.length === 0) {
            return {totalOrders: 0, totalSales: 0}
        }

        // initialize variables for calcualtion
        let totalSales = 0;
        const totalOrders = orders.length;

        // Iterate through each order and sum up the sales
        orders.forEach(order => {
            // Converting the price into a number for calculation
            totalSales += parseFloat(order.total_price);
        });

        // formatting the received value into 2 point decimals
        const formattedTotalSales = parseFloat(totalSales.toFixed(2));

        try {
            // inserting the data into database
            await devDb('sales_data').insert({
                total_sales: formattedTotalSales,
                number_of_orders: totalOrders,
                date: new Date(),
                user_id: userId
            })
            console.log('Successfully inserted sales data into Database');
        } catch (dbError) {
            console.error('Error inserting data into database (Non-blocking for dashboard)', dbError);
        }

        return {
            totalOrders: totalOrders,
            totalSales: formattedTotalSales,
            // a context to display to frontend
            timePeriod: 'Last 7 days'
        }

    } catch (error) {
        console.error('Error fetching sales data from Shopify API:', error);
        // On API failure, return 0 to prevent the application from crashing
        return {totalSales: 0, totalOrders: 0}; 
    }
}