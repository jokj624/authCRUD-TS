import { Router } from 'express';
import UserRouter from './UserRouter'; 

const router = Router();

router.use('/users', UserRouter);

export default router;