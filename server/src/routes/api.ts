import express from 'express';
import { analyzeUrl } from '../controllers/AnalysisController.js';

const router = express.Router();

router.post('/analyze', analyzeUrl);

export default router;
