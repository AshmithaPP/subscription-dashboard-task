"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMySubscription = exports.subscribeToPlan = void 0;
const database_1 = __importDefault(require("../config/database"));
const subscribeToPlan = async (req, res) => {
    try {
        const { planId } = req.params;
        const userId = req.user.user_id; // Updated to user_id
        // Check if plan exists
        const plan = await (0, database_1.default)('plans').where({ plan_id: planId }).first(); // Updated to plan_id
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        // Check for existing active subscription
        const existingSubscription = await (0, database_1.default)('subscriptions')
            .where({ user_id: userId, status: 'active' })
            .first();
        if (existingSubscription) {
            return res.status(400).json({ success: false, message: 'You already have an active subscription' });
        }
        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.duration_days);
        // Create subscription
        const [subscription] = await (0, database_1.default)('subscriptions')
            .insert({
            user_id: userId,
            plan_id: planId,
            start_date: startDate,
            end_date: endDate,
            status: 'active'
        })
            .returning('*');
        // Parse features safely
        let features = [];
        try {
            features = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;
        }
        catch {
            features = ['Error loading features'];
        }
        return res.status(201).json({
            success: true,
            message: `Successfully subscribed to ${plan.name} plan`,
            data: {
                subscription: {
                    ...subscription,
                    plan_name: plan.name,
                    plan_price: parseFloat(plan.price),
                    features
                }
            }
        });
    }
    catch (error) {
        console.error('Subscription error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error while creating subscription' });
    }
};
exports.subscribeToPlan = subscribeToPlan;
const getMySubscription = async (req, res) => {
    try {
        const userId = req.user.user_id; // Updated to user_id
        const subscription = await (0, database_1.default)('subscriptions as s')
            .join('plans as p', 's.plan_id', 'p.plan_id') // Updated to p.plan_id
            .select('s.subscription_id', // Updated to subscription_id
        's.user_id', 's.plan_id', 's.start_date', 's.end_date', 's.status', 's.created_at', 's.updated_at', 'p.name as plan_name', 'p.price as plan_price', 'p.features as plan_features', 'p.duration_days')
            .where({ 's.user_id': userId, 's.status': 'active' })
            .first();
        if (!subscription) {
            return res.json({ success: true, message: 'No active subscription found', data: null });
        }
        // Parse features safely
        let features = [];
        try {
            features = typeof subscription.plan_features === 'string' ? JSON.parse(subscription.plan_features) : subscription.plan_features;
        }
        catch {
            features = ['Error loading features'];
        }
        return res.json({
            success: true,
            message: 'Subscription fetched successfully',
            data: {
                ...subscription,
                plan_price: parseFloat(subscription.plan_price),
                plan_features: features
            }
        });
    }
    catch (error) {
        console.error('Get subscription error:', error);
        return res.status(500).json({ success: false, message: 'Error fetching subscription' });
    }
};
exports.getMySubscription = getMySubscription;
//# sourceMappingURL=subscriptionController.js.map