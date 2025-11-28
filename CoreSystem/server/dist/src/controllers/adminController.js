"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSubscriptions = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAllSubscriptions = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        console.log(`Admin fetching subscriptions - Page: ${page}, Limit: ${limit}, Status: ${status}`);
        // Build main query for subscriptions
        let query = (0, database_1.default)('subscriptions as s')
            .join('users as u', 's.user_id', 'u.user_id') // Updated to u.user_id
            .join('plans as p', 's.plan_id', 'p.plan_id') // Updated to p.plan_id
            .select('s.subscription_id', // Updated to subscription_id
        's.user_id', 's.plan_id', 's.start_date', 's.end_date', 's.status', 's.created_at', 's.updated_at', 'u.name as user_name', 'u.email as user_email', 'p.name as plan_name', 'p.price as plan_price')
            .orderBy('s.created_at', 'desc');
        // Filter by status if provided
        if (status && status !== 'all') {
            query = query.where('s.status', status);
        }
        // Get total count with a separate query
        const countQuery = (0, database_1.default)('subscriptions as s');
        if (status && status !== 'all') {
            countQuery.where('s.status', status);
        }
        const totalResult = await countQuery.count('* as total').first();
        const total = parseInt(totalResult?.total) || 0;
        console.log(` Total subscriptions found: ${total}`);
        // Apply pagination to main query
        const subscriptions = await query
            .limit(Number(limit))
            .offset(offset);
        console.log(` Fetched ${subscriptions.length} subscriptions`);
        const response = {
            success: true,
            message: 'Subscriptions fetched successfully',
            data: {
                subscriptions,
                pagination: {
                    current: Number(page),
                    total: Math.ceil(total / Number(limit)),
                    pageSize: Number(limit),
                    totalRecords: total
                }
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error(' Get all subscriptions error:', error);
        const response = {
            success: false,
            message: 'Error fetching subscriptions from database'
        };
        res.status(500).json(response);
    }
};
exports.getAllSubscriptions = getAllSubscriptions;
//# sourceMappingURL=adminController.js.map