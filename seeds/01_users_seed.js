/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  // delete all the existing users in the database
  await knex('users').del();

  // insert seeds information into databse
  await knex('users').insert([
    {id: '', name: '', email: '', password: ''}
  ])
};
