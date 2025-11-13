import { Router } from 'express';
import { getPlans } from '../controllers/planController';

const router = Router();

router.get('/', getPlans);

export default router;