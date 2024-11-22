// Room schema
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  name: {
    type: String,
  },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
});

// Helper function to get the latest `dueBy` date
roomSchema.methods.getLatestDueBy = async function () {
  const tasks = await mongoose.model('Task').find({ _id: { $in: this.tasks } });
  const latestDueBy = tasks.reduce((latest, task) => {
    return task.dueBy > latest ? task.dueBy : latest;
  }, new Date(0)); // Set the initial date to the Unix epoch for comparison

  return latestDueBy;
};

export default mongoose.model('Room', roomSchema);
