"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController"); // Import from adminController
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all subscriptions (admin only)
router.get('/subscriptions', auth_1.authenticateToken, auth_1.requireAdmin, adminController_1.getAllSubscriptions);
exports.default = router;
//# sourceMappingURL=admin.js.map