import express from 'express';
import {
  getAllRooms,
  createRoom,
  addTaskToRoom,
  getRoomTasks,
  addUserToRoom,
  getRoomUsers,
  acceptInvitation,
  declineInvitation,
} from '../controllers/workroomController.js'; // Adjust the path as necessary

const router = express.Router();

// Middleware to authenticate the user (assuming you have an auth middleware)
import { authenticateToken } from '../middlewares/authentication.js';

router.use(authenticateToken); // Apply authentication middleware to all routes

// get all rooms
router.get('/rooms', getAllRooms);

// Route to create a new room
router.post('/room/create', createRoom);

// Route to add a task to a specific room
router.post('/room/add-task', addTaskToRoom);

// Route to get all tasks in a specific room
router.get('/room/tasks/:roomId', getRoomTasks);

// Route to add a user to a specific room by email
router.post('/room/add-user', addUserToRoom);

// Route to get all users in a specific room
router.get('/room/users/:roomId', getRoomUsers);

router.post('/acceptInvitation', acceptInvitation); // Registered user accepts invite
router.post('/declineInvitation', declineInvitation);

export default router;
