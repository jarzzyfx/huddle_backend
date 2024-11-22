import User from '../models/userSchema.js';
import Invitation from '../models/inviteShema.js';
import Room from '../models/room.js';
import logger from '../middlewares/logger.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    // Hash the password and create the new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullname,
      email,
      hashed_password: hashedPassword,
      workroom: [],
    });

    // Find all invitations for this email
    const invitations = await Invitation.find({ email });

    for (const invite of invitations) {
      // Add the room to the user's workroom if invited
      const room = await Room.findById(invite.roomId);

      if (room) {
        // Add the room ID to the new user's workroom array
        newUser.workroom.push(room._id);
        await newUser.save();

        // Add the new user to the room's user list if not already there
        if (!room.users.includes(newUser._id)) {
          room.users.push(newUser._id);
          await room.save();
        }
      }

      // Optionally delete the invitation after processing
      await Invitation.findByIdAndDelete(invite._id);
    }

    res
      .status(201)
      .json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({
      message: 'Error registering user',
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).lean();

    if (!user) {
      return res.status(400).json({ message: 'This user does not exist' });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.hashed_password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user._id, fullname: user.fullname },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set JWT as an httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: 'Strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // Include user_token in the JSON response for the frontend to access
    return res
      .status(200)
      .json({ message: 'User found', data: user, user_token: token });
  } catch (error) {
    logger.error(`Error: ${error}`);
    return res.status(500).json({ message: 'Could not log in the user' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { user_token, new_password } = req.body;
    const verified_user = jwt.verify(user_token, JWT_SECRET);

    const _id = verified_user.id;

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await User.updateOne(
      { _id },
      {
        $set: { hashed_password: hashedPassword },
      }
    );

    res.status(201).json({ message: 'New password has been created' });
  } catch (error) {
    logger.error(`Error: ${error}`);
    return res.status(500).json({ message: 'Account breach identified' });
  }
};

// New logout functionality
export const logoutUser = (req, res) => {
  try {
    // Clear the JWT cookie by setting it with an expired date
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    logger.error(`Logout error: ${error}`);
    res.status(500).json({ message: 'Logout failed' });
  }
};
