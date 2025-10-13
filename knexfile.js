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
      
      connection: { 
          host: process.env.PROD_DB_HOST, // Use a separate variable for the hostname only
          
          port: process.env.PROD_DB_PORT || 5432, 
          
          database: process.env.PROD_DB_NAME, 
          
          user: process.env.PROD_DB_USER, 
          
          password: process.env.PROD_DB_PASSWORD, 

          // 6. The CRITICAL FIX for IPv6/ENETUNREACH
          // This is the networking option for IPv4
          client: {
              family: 4 
          },
          
          // 7. Required for secure connection to Supabase
          ssl: {
              rejectUnauthorized: false
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
