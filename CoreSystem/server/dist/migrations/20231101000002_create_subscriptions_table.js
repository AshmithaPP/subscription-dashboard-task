"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    return knex.schema.createTable('subscriptions', (table) => {
        table.uuid('subscription_id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('user_id').notNullable();
        table.uuid('plan_id').notNullable();
        table.timestamp('start_date').notNullable();
        table.timestamp('end_date').notNullable();
        table.enum('status', ['active', 'expired', 'cancelled']).defaultTo('active');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        // FIXED: Reference the correct column names
        table.foreign('user_id').references('user_id').inTable('users').onDelete('CASCADE');
        table.foreign('plan_id').references('plan_id').inTable('plans').onDelete('CASCADE');
    })
        .then(() => knex.raw(`CREATE UNIQUE INDEX unique_active_subscription ON subscriptions(user_id) WHERE status = 'active';`));
}
async function down(knex) {
    return knex.schema.dropTable('subscriptions');
}
//# sourceMappingURL=20231101000002_create_subscriptions_table.js.map