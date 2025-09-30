import adsSdk, { Ad } from 'facebook-nodejs-business-sdk';

// helper fucntion to get date in YYYY-MM-DD format
function getFormattedDate(daysAgo = 0) {
    const d = new Date();
    if (daysAgo > 0) {
        d.setDate(d.getDate() - daysAgo);
    }
    return d.toISOString().split('T')[0];
}

// function to fectch total ad spends for Meta Ad Account over 7 days
export async function fectchMetaAdSpent(userId) {
    try {
            // getting access token and account Id from .env file
            const accessToken = process.env.META_ACCESS_TOKEN
            const accountId = process.env.MY_META_AD_ACCOUNT_ID

            // initialize the API with access token
            adsSdk.FacebookAdsApi.init(accessToken);

            // using ads insight and ad account obbject for performance run
            const AdAccount = adsSdk.AdAccount;
            const Insights = adsSdk.AdReportRun;

            // calculating dynamic dates for last 7 days
            const sevenDaysAgo = getFormattedDate(7);
            const today = getFormattedDate(0);

            // instantiate ad account
            const account = new AdAccount(accountId);  

            // insights endpoint for time bound data
            const insights = await account.getInsights(
                ['spend'], // Fields to retrieve: only need 'spend' 
                {
                    // This ensures we get the aggregate total for the account
                    level: 'account', 
                    // Define the time window for the MVP dashboard
                    time_range: { 'since': sevenDaysAgo, 'until': today },
                }
            );

            // insights returns an array of reports, for level= account
            if (insights && insights.length > 0 && insights[0].spend) {
                const totalSpend = parseFloat((insights[0].spend.toFixed(2)));

                // return the calculated amount
                console.log(`Meta API successfully fethced the spend of ${totalSpend.toFixed(2)}`)
                return totalSpend;
            }

            // if insights return no report then fcuntion will return 0
            console.warn('Meta API returns no spend data for the given time period');
            return 0;
            
        } catch (error) {
            console.log('Error in Meta Ads Data:', error.message)
            // centeralized 
            return 0; // Return 0 to prevent the combined dashboard route from crashing
        }
}