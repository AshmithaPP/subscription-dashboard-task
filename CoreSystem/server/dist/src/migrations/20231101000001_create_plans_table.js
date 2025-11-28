"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    return knex.schema.createTable('plans', (table) => {
        table.uuid('plan_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.string('name', 100).notNullable();
        table.decimal('price', 10, 2).notNullable();
        table.jsonb('features').notNullable();
        table.integer('duration_days').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
}
async function down(knex) {
    return knex.schema.dropTable('plans');
}
//# sourceMappingURL=20231101000001_create_plans_table.js.map