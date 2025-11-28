"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const registerSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).required().messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 100 characters'
    }),
    email: joi_1.default.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address'
    }),
    password: joi_1.default.string().min(6).required().messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters long'
    }),
    role: joi_1.default.string().valid('user', 'admin').default('user'),
    adminKey: joi_1.default.string().optional()
});
exports.registerSchema = registerSchema;
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address'
    }),
    password: joi_1.default.string().required().messages({
        'string.empty': 'Password is required'
    })
});
exports.loginSchema = loginSchema;
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            res.status(400).json({
                success: false,
                message: error.details[0].message
            });
            return;
        }
        next();
    };
};
exports.validate = validate;
//# sourceMappingURL=validation.js.map