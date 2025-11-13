import { Router } from 'express';
import { 
  subscribeToPlan, 
  getMySubscription
} from '../controllers/subscriptionController'; // Only these two functions
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Subscribe to a plan
router.post('/subscribe/:planId', authenticateToken, subscribeToPlan);

// Get current active subscription
router.get('/my-subscription', authenticateToken, getMySubscription);

export default router;