"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
const register = async (req, res) => {
    try {
        const { name, email, password, role = 'user', adminKey } = req.body;
        // Check if user already exists
        const existingUser = await (0, database_1.default)('users')
            .where({ email })
            .first();
        if (existingUser) {
            const response = {
                success: false,
                message: 'User already exists with this email'
            };
            res.status(409).json(response);
            return;
        }
        // Validate admin registration
        let finalRole = 'user';
        if (role === 'admin') {
            if (!adminKey || adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
                const response = {
                    success: false,
                    message: 'Invalid admin registration key'
                };
                res.status(403).json(response);
                return;
            }
            finalRole = 'admin';
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create user ONLY - NO tokens, NO subscription
        const user = await database_1.default.transaction(async (trx) => {
            const [newUser] = await trx('users')
                .insert({
                name,
                email,
                password: hashedPassword,
                role: finalRole
            })
                .returning(['user_id', 'name', 'email', 'role', 'created_at']); // Updated to return user_id
            return newUser;
        });
        const response = {
            success: true,
            message: `User registered successfully as ${finalRole}. Please login to get access token.`,
            data: {
                user: user
            }
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error(' Registration error:', error);
        const response = {
            success: false,
            message: 'Internal server error during registration'
        };
        res.status(500).json(response);
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user with password
        const user = await (0, database_1.default)('users')
            .where({ email })
            .first();
        if (!user) {
            const response = {
                success: false,
                message: 'Invalid email or password'
            };
            res.status(401).json(response);
            return;
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            const response = {
                success: false,
                message: 'Invalid email or password'
            };
            res.status(401).json(response);
            return;
        }
        // Generate tokens ONLY during login
        const { accessToken, refreshToken } = generateTokens(user.user_id); // Updated to user.user_id
        // Store refresh token and clean old ones
        await database_1.default.transaction(async (trx) => {
            // Remove old refresh tokens for this user
            await trx('refresh_tokens')
                .where({ user_id: user.user_id }) // Updated to user.user_id
                .delete();
            // Store new refresh token
            await trx('refresh_tokens').insert({
                user_id: user.user_id, // Updated to user.user_id
                token: refreshToken,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
        });
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        const response = {
            success: true,
            message: 'Login successful',
            data: {
                user: userWithoutPassword,
                accessToken,
                refreshToken
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error(' Login error:', error);
        const response = {
            success: false,
            message: 'Internal server error during login'
        };
        res.status(500).json(response);
    }
};
exports.login = login;
//# sourceMappingURL=authController.js.map