import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  hashed_password: { type: String, required: true },
  profile_picture: {
    type: String,
  },
  points: {
    type: Number,
  },
  totalDailyTime: {
    hours: { type: Number },
    minutes: { type: Number },
  },
  productivity: {
    hours_per_task: { type: Number },
    total: { type: Number },
  },
  user_bio: {
    type: String,
  },
  active_status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive',
    required: true,
  },
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    logout: {
      type: Boolean,
      default: false,
    },
    rooms: [
      {
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        tools: [
          {
            tool_name: {
              type: String,
              default: '',
            },
            tool_description: {
              type: String,
              default: '',
            },
          },
        ],
      },
    ],
  },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  workroom: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
  invitations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invitation' }], // New field to store invitations
});

export default mongoose.model('User', userSchema);
