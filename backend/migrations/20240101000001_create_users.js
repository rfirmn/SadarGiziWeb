// FILE: backend/migrations/20240101000001_create_users.js

export function up(knex) {
    return knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name', 100).notNullable();
        table.string('email', 150).notNullable().unique();
        table.string('password_hash', 255).notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.index('email', 'idx_email');
    });
}

export function down(knex) {
    return knex.schema.dropTableIfExists('users');
}
