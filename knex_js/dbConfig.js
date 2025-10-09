import knex from "knex";
import config from "./knexfile.js";

// Determine which configuration to load
const enviroment = process.env.NODE_ENV === 'production' ? 'production' : 'development';

// Select the 'development' configuration from knexfile.js
const db = knex(config[enviroment]);

// Export the single, reusable connection instance
export default db;