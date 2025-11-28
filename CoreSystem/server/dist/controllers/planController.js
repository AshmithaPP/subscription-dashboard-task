"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlans = void 0;
const database_1 = __importDefault(require("../config/database"));
const getPlans = async (req, res) => {
    try {
        console.log('Fetching all plans from database...');
        const plans = await (0, database_1.default)('plans')
            .select('*')
            .orderBy('price', 'asc');
        console.log(` Found ${plans.length} plans`);
        if (plans.length === 0) {
            const response = {
                success: true,
                message: 'No plans found',
                data: []
            };
            res.json(response);
            return;
        }
        // Parse JSON features for each plan
        const plansWithParsedFeatures = plans.map(plan => {
            try {
                return {
                    plan_id: plan.plan_id, // Updated to plan_id
                    name: plan.name,
                    price: parseFloat(plan.price),
                    features: typeof plan.features === 'string'
                        ? JSON.parse(plan.features)
                        : plan.features,
                    duration_days: plan.duration_days,
                    created_at: plan.created_at,
                    updated_at: plan.updated_at
                };
            }
            catch (parseError) {
                console.error(' Error parsing features for plan:', plan.plan_id, parseError);
                return {
                    plan_id: plan.plan_id, // Updated to plan_id
                    name: plan.name,
                    price: parseFloat(plan.price),
                    features: [],
                    duration_days: plan.duration_days,
                    created_at: plan.created_at,
                    updated_at: plan.updated_at
                };
            }
        });
        const response = {
            success: true,
            message: 'Plans fetched successfully',
            data: plansWithParsedFeatures
        };
        res.json(response);
    }
    catch (error) {
        console.error('Get plans error:', error);
        const response = {
            success: false,
            message: 'Error fetching plans from database'
        };
        res.status(500).json(response);
    }
};
exports.getPlans = getPlans;
//# sourceMappingURL=planController.js.map