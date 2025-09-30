import '@shopify/shopify-api/adapters/node';
import {shopifyApi, LATEST_API_VERSION} from '@shopify/shopify-api';

// Split the comma-separated string of scopes from the .env file into an array.
const scopeArray = process.env.SHOPIFY_SCOPES
    ? process.env.SHOPIFY_SCOPES.split(',').map(scope => scope.trim())
    : [];

const shopify = shopifyApi({
  // The next 4 values are typically read from environment variables for added security
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY,
  scopes: scopeArray, 
  hostName: process.env.SHOPIFY_NGROK_HOST,
  apiVersion: LATEST_API_VERSION
});

/**
 * A helper function to create a configured Shopify REST client.
 * This centralizes the instantiation logic, making the code cleaner and more efficient.
 * @returns {shopify.clients.Rest} The configured Shopify REST client.
*/
export const getShopifyRestClient = () => {
    return new shopify.clients.Rest({
            session: {
                shop: process.env.SHOPIFY_SHOP_DOMAIN,
                accessToken: process.env.SHOPIFY_API_ACCESS_TOKEN
            }
        });
}

export default shopify;