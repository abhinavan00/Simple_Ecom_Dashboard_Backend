/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('sales_data', function(table) {
    table.increments('id').primary();
    table.decimal('total_sales', 10, 2).notNullable();
    table.integer('number_of_orders').notNullable();
    table.date('date').notNullable();
    table.integer('user_id').unsigned().notNullable();

    // Set up the foreign key constraint
    table.foreign('user_id')
         .references('id')
         .inTable('users')
         .onDelete('CASCADE');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  
};
