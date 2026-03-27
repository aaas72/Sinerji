import { Request, Response, NextFunction } from 'express';
import { SkillService } from '../services/skill.service';

const skillService = new SkillService();

export const getAllSkills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const skills = await skillService.getAllSkills();
    res.status(200).json({
      status: 'success',
      data: { skills },
    });
  } catch (error) {
    next(error);
  }
};
