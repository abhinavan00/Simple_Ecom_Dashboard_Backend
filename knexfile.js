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
  }

};

export default config;
