import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database';
import { RegisterRequest, LoginRequest, ApiResponse, AuthRequest } from '../types';

const generateTokens = (userId: string): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const register = async (req: Request<{}, {}, RegisterRequest>, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'user', adminKey } = req.body;

    // Check if user already exists
    const existingUser = await db('users')
      .where({ email })
      .first();

    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        message: 'User already exists with this email'
      };
      res.status(409).json(response);
      return;
    }

    // Validate admin registration
    let finalRole: 'user' | 'admin' = 'user';
    
    if (role === 'admin') {
      if (!adminKey || adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid admin registration key'
        };
        res.status(403).json(response);
        return;
      }
      finalRole = 'admin';
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user ONLY - NO tokens, NO subscription
    const user = await db.transaction(async (trx) => {
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

    const response: ApiResponse = {
      success: true,
      message: `User registered successfully as ${finalRole}. Please login to get access token.`,
      data: {
        user: user
      }
    };

    res.status(201).json(response);

  } catch (error) {
    console.error(' Registration error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error during registration'
    };
    res.status(500).json(response);
  }
};

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await db('users')
      .where({ email })
      .first();

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid email or password'
      };
      res.status(401).json(response);
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid email or password'
      };
      res.status(401).json(response);
      return;
    }

    // Generate tokens ONLY during login
    const { accessToken, refreshToken } = generateTokens(user.user_id); // Updated to user.user_id

    // Store refresh token and clean old ones
    await db.transaction(async (trx) => {
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

    const response: ApiResponse = {
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    };

    res.json(response);

  } catch (error) {
    console.error(' Login error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error during login'
    };
    res.status(500).json(response);
  }
};