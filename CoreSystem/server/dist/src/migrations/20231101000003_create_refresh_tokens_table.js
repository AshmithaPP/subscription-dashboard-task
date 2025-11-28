"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    return knex.schema.createTable('refresh_tokens', (table) => {
        table.uuid('refresh_token_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('user_id').notNullable();
        table.string('token', 500).notNullable();
        table.timestamp('expires_at').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        // Updated foreign key reference
        table.foreign('user_id').references('user_id').inTable('users').onDelete('CASCADE');
        table.index(['token']);
    });
}
async function down(knex) {
    return knex.schema.dropTable('refresh_tokens');
}
//# sourceMappingURL=20231101000003_create_refresh_tokens_table.js.map