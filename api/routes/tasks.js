import express from 'express';
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../api/controllers/taskController.js';
import { authenticateToken } from '../middlewares/authentication.js';

const router = express.Router();

router.get('/', authenticateToken, getAllTasks);
router.post('/create', authenticateToken, createTask);
router.put('/:id', authenticateToken, updateTask);
router.delete('/:id', authenticateToken, deleteTask);

export default router;
