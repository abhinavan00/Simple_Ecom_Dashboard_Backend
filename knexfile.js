import dotenv from 'dotenv';

// Load enviroment variables from .env file
dotenv.config();
// Update with your config settings.

/**
 * @type { import("knex").Knex.Config }
 */
const config = {

  development: {
    client: process.env.db_client,
    connection: {
      host: process.env.db_host,
      port: process.env.db_port,
      user: '',
      password: '',
      database: process.env.db_name,
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    
    // 1. MUST BE AN OBJECT to allow custom properties
    connection: { 
        // 2. The URL string goes into this property
        connectionString: process.env.DATABASE_URL, 
        
        // 3. SSL MUST be included inside the connection object
        ssl: {
            rejectUnauthorized: false
        },
        
        // 4. CRITICAL FIX: The networking option for IPv4
        client: {
            family: 4 
        }
    },
    
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};

export default config;
