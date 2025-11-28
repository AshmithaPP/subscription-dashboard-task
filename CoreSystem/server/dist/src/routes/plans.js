"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const planController_1 = require("../controllers/planController");
const router = (0, express_1.Router)();
router.get('/', planController_1.getPlans);
exports.default = router;
//# sourceMappingURL=plans.js.map