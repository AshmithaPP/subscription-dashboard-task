"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscriptionController_1 = require("../controllers/subscriptionController"); // Only these two functions
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Subscribe to a plan
router.post('/subscribe/:planId', auth_1.authenticateToken, subscriptionController_1.subscribeToPlan);
// Get current active subscription
router.get('/my-subscription', auth_1.authenticateToken, subscriptionController_1.getMySubscription);
exports.default = router;
//# sourceMappingURL=subscriptions.js.map