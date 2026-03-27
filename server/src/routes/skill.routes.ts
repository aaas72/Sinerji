import express from 'express';
import { getAllSkills } from '../controllers/skill.controller';

const router = express.Router();

router.get('/', getAllSkills);

export default router;
