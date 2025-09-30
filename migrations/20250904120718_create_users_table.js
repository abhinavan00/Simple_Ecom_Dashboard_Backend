/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

// knex function to apply the changes to the database
export function up(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// knex function to revert the changes applied to the database
export function down(knex) { 
  return knex.schema.dropTable('users');
};
