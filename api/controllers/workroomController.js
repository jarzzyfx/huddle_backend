import User from '../models/userSchema.js';
import Task from '../models/taskSchema.js';
import Room from '../models/room.js';
import Invitation from '../models/inviteShema.js';
import sendInvitationEmail from '../services/sendInvite.js';

// Create a new room for the authenticated user
export const createRoom = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body; // Get the room name from the request body

    // Validate input
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Room name is required' });
    }

    // Create a new room
    const newRoom = new Room({
      name: name.trim(), // Set the name of the room
      users: [userId], // Add the creator to the room's user list
      tasks: [],
      createdBy: userId,
    });
    await newRoom.save();

    // Add the room ID to the user's workroom array
    const user = await User.findById(userId);
    user.workroom.push(newRoom._id);
    await user.save();

    res.status(201).json({
      message: 'Room created successfully',
      data: newRoom,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating room',
      error: error.message,
    });
  }
};

// Add a task to a specific room
export const addTaskToRoom = async (req, res) => {
  try {
    const { roomId, taskId } = req.body;

    // Ensure the task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Find the room and check task limit
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    if (room.tasks.length >= 3) {
      return res.status(400).json({ message: 'Room task limit reached' });
    }

    // Add task to room if not already present
    if (!room.tasks.includes(taskId)) {
      room.tasks.push(taskId);
      await room.save();
    }
    // getting the due date
    const latestDueBy = await room.getLatestDueBy();
    console.log('Latest dueBy date:', latestDueBy);
    res.status(200).json({ message: 'Task added to room', data: room });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error adding task to room', error: error.message });
  }
};

// Get all tasks in a specific room
export const getRoomTasks = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId).populate('tasks');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({
      message: 'Tasks in room fetched successfully',
      data: room.tasks,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching tasks in room', error: error.message });
  }
};

// Add user to a specific room by email
export const addUserToRoom = async (req, res) => {
  try {
    const { roomId, email } = req.body;
    const inviterId = req.user.id;

    // Find the inviter and the room
    const inviter = await User.findById(inviterId);
    const room = await Room.findById(roomId);
    if (!inviter || !room) {
      return res.status(404).json({ message: 'Inviter or room not found' });
    }

    // Check if the user already exists
    let userToAdd = await User.findOne({ email });

    // Access the Socket.IO instance
    const io = req.app.get('io'); // Retrieve the `io` instance set in `startServer`

    if (userToAdd) {
      // Existing user must accept invite to be added to the room
      if (!room.users.includes(userToAdd._id)) {
        const invitation = await Invitation.create({
          email,
          inviter: inviter._id,
          roomId: room._id,
          status: 'pending', // New field to track invitation status
        });

        await sendInvitationEmail(
          email,
          inviter.email,
          inviter.fullname,
          roomId
        );

        // Emit invitation notification to the specific user
        io.emit('receiveInvitation', {
          email, // Target user's email
          inviterName: inviter.fullname,
          roomId,
          message: `${inviter.fullname} has invited you to join room ${room.name}`,
        });

        return res.status(201).json({
          message: 'Invitation sent to registered user for acceptance',
        });
      }
      return res.status(200).json({ message: 'User already in room' });
    } else {
      // New user: Send invite and add to room automatically upon registration
      const invitation = await Invitation.create({
        email,
        inviter: inviter._id,
        roomId: room._id,
      });

      await sendInvitationEmail(email, inviter.email, inviter.fullname, roomId);

      // Emit invitation notification to inform admin/inviter of the invite sent
      io.emit('receiveInvitation', {
        email,
        inviterName: inviter.fullname,
        roomId,
        message: `${email} (new user) has been invited to join room ${room.name}`,
      });

      return res
        .status(201)
        .json({ message: 'Invitation sent to new user for registration' });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error adding user to room',
      error: error.message,
    });
  }
};
// Get all users in a specific room
export const getRoomUsers = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId).populate('users');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({
      message: 'Users in room fetched successfully',
      data: room.users,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching users in room', error: error.message });
  }
};

// get all rooms
export const getAllRooms = async (req, res) => {
  try {
    const userId = req.user.id; // Get the authenticated user's ID

    // Find all rooms where the user is part of the 'users' field
    const rooms = await Room.find({ users: userId })
      .populate('users', 'fullname email') // Populate users with selected fields
      .populate('tasks'); // Populate tasks

    res.status(200).json({
      message: 'Rooms fetched successfully',
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching rooms',
      error: error.message,
    });
  }
};

// accept workroom invite
export const acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.body; // ID of the invitation to accept
    const userId = req.user.id;

    // Find the invitation and validate
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    if (invitation.status !== 'pending') {
      return res
        .status(400)
        .json({ message: 'Invitation already accepted or declined' });
    }

    // Ensure that the accepting user’s email matches the invitation email
    const user = await User.findById(userId);
    if (user.email !== invitation.email) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to accept this invitation' });
    }

    // Add the user to the room and update invitation status
    const room = await Room.findById(invitation.roomId);
    if (!room.users.includes(userId)) {
      room.users.push(userId);
      await room.save();
    }

    invitation.status = 'accepted';
    await invitation.save();

    res
      .status(200)
      .json({ message: 'Invitation accepted and added to room', room });
  } catch (error) {
    res.status(500).json({
      message: 'Error accepting invitation',
      error: error.message,
    });
  }
};

// decline workroom invite
export const declineInvitation = async (req, res) => {
  try {
    const { invitationId } = req.body;
    const userId = req.user.id;

    // Find the invitation and validate
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    if (invitation.status !== 'pending') {
      return res
        .status(400)
        .json({ message: 'Invitation already accepted or declined' });
    }

    // Ensure the declining user’s email matches the invitation email
    const user = await User.findById(userId);
    if (user.email !== invitation.email) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to decline this invitation' });
    }

    // Update invitation status
    invitation.status = 'declined';
    await invitation.save();

    res.status(200).json({ message: 'Invitation declined' });
  } catch (error) {
    res.status(500).json({
      message: 'Error declining invitation',
      error: error.message,
    });
  }
};
