"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = __importDefault(require("knex"));
const knexFile_1 = __importDefault(require("../../knexFile"));
const environment = process.env.NODE_ENV || 'development';
const db = (0, knex_1.default)(knexFile_1.default[environment]);
// Test database connection
db.raw('SELECT 1')
    .then(() => {
    console.log('✅ PostgreSQL connected successfully');
})
    .catch((err) => {
    console.error('❌ PostgreSQL connection failed:', err);
    process.exit(1);
});
exports.default = db;
//# sourceMappingURL=database.js.map