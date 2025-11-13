import { Router } from 'express';
import { getAllSubscriptions } from '../controllers/adminController'; // Import from adminController
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Get all subscriptions (admin only)
router.get('/subscriptions', authenticateToken, requireAdmin, getAllSubscriptions);

export default router;