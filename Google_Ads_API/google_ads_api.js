import { GoogleAdsApi } from "google-ads-api";

// Initialize the core client object using developer token and OAuth client credentials
const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN
});

// Initialize the customer object with the specific account details for queries
// NOTE: This uses TEST credentials for now.
const customer = client.Customer({
    customer_id: process.env.GOOGLE_AD_ACCOUNT_CUSTOMER_ID,
    login_customer_id: process.env.GOOGLE_ADS_MANAGER_ACCOUNT_ID,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN
})

// supporting function to get date in YYYY-MM-DD format
// helper fucntion to get date in YYYY-MM-DD format
function getFormattedDate(daysAgo = 0) {
    const d = new Date();
    if (daysAgo > 0) {
        d.setDate(d.getDate() - daysAgo);
    }
    return d.toISOString().split('T')[0]; // format date as YYYY-MM-DD
}

// function to fetch google ad spend
export const fetchGoogleAdSpend = async(userId) => {
    // calculate dynamic date for last 7 days
    const sevenDaysAgo = getFormattedDate(7);
    const today = getFormattedDate(0);

    try {
        const query = `
        SELECT
            customer.id,
            metrics.cost_micros
        FROM
            customer
        WHERE
            segments.date BETWEEN '${sevenDaysAgo}' AND '${today}'

    `;

    // execute the query
    const response = await customer.query(query);

    // getiing 1st item of the array of results
    const resultRow = response[0];

    // if we don't receive any result from Google Ads API
    if (!resultRow || !resultRow.metrics || !resultRow.metrics.cost_micros) {
            console.warn('Google Ads API returned no cost data for the period.');
            return 0;
    }
    
    const totalCostMicros = parseInt(resultRow.metrics.cost_micros, 10);

    // convert from micros to standard currency
    const totalCost = totalCostMicros / 1000000;

    console.log(`Google Ads Api successfully calculated account-level spend of ${totalCost.toFixed(2)}`);

    return parseFloat(totalCost.toFixed(2));

    } catch (error) {
        console.log('Error while fetching data from Google Ads API:', error.message);
        // returning 0 if api fails, So that dashboard route will not crash
        return 0;
    }
}
