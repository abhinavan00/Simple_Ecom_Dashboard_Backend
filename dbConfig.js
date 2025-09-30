import knex from "knex";
import config from "./knexfile.js";

// Select the 'development' configuration from knexfile.js
const devDb = knex(config.development);

// Export the single, reusable connection instance
export default devDb;