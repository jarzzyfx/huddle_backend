import e from 'express';

const router = e.Router();
import {
  registerUser,
  loginUser,
  resetPassword,
  logoutUser,
} from '../api/controllers/userController.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);
router.post('/logout', logoutUser);

export default router;
