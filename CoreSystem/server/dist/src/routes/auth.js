"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)();
router.post('/register', (0, validation_1.validate)(validation_1.registerSchema), authController_1.register);
router.post('/login', (0, validation_1.validate)(validation_1.loginSchema), authController_1.login);
exports.default = router;
//# sourceMappingURL=auth.js.map