import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  title: { type: String, required: true },
  points: {
    type: Number,
    default: 10,
  },
  reoccuring: {
    type: String,
    enum: ['yes', 'no'], // Only allows "yes" or "no"
  },
  Task_category: {
    type: String,
  },
  tools: [],
  status: String,
  deadline: {
    type: Date,
    required: true,
  },
  dueBy: {
    type: Date,
    required: true,
  },
  inWorkroom: { type: Boolean, default: false }, // Set default to false if not specified
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Reference to User
});

// Convert the deadline to a readable string format
taskSchema.methods.getFormattedDeadline = function () {
  return this.deadline.toLocaleDateString('en-US', {
    weekday: 'long', // Full name of the day
    year: 'numeric', // Full year
    month: 'long', // Full name of the month
    day: 'numeric', // Day of the month
  });
};

export default mongoose.model('Task', taskSchema); // Ensure model name here is 'Task'
