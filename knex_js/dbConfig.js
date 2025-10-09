import knex from "knex";
import config from "./knexfile.js";

// Determine which configuration to load
const enviroment = process.env.NODE_ENV === 'production' ? 'production' : 'developement';

// Select the 'development' configuration from knexfile.js
const db = knex(config.development);

// Export the single, reusable connection instance
export default db;