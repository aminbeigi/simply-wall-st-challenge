import { Router } from 'express';
import { getCompanies } from '../controllers/companyController.js';

const router = Router();

router.get('/', getCompanies);

export default router;