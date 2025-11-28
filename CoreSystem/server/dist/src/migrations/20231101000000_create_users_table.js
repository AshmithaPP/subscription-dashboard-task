"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    return knex.schema.createTable('users', (table) => {
        table.uuid('user_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.string('name', 100).notNullable();
        table.string('email', 255).unique().notNullable();
        table.string('password', 255).notNullable();
        table.enum('role', ['user', 'admin']).defaultTo('user');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
}
async function down(knex) {
    return knex.schema.dropTable('users');
}
//# sourceMappingURL=20231101000000_create_users_table.js.map