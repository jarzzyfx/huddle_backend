import Task from '../models/taskSchema.js';

// Get all tasks for the authenticated user
export async function getAllTasks(req, res) {
  try {
    const userId = req.user.id; // Get the user ID from the authenticated token

    // Fetch tasks only for the authenticated user
    const tasks = await Task.find({ createdBy: userId });

    if (!tasks.length) {
      return res.status(204).json({ message: 'No tasks found' });
    }

    res.status(200).json(tasks);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching tasks', error: error.message });
  }
}

// Create a new task
export async function createTask(req, res) {
  try {
    // Log the request body for debugging
    console.log('Request body:', req.body);

    // Extract task details from the request body
    const { title, points, status, deadline, dueBy, tools, inWorkroom } =
      req.body;

    // Ensure all required fields are provided
    if (!title || !deadline || !dueBy) {
      return res
        .status(400)
        .json({ message: 'Title, deadline, and dueBy are required' });
    }

    // Check if the user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: 'User not authenticated' });
    }

    // Create the new task
    const newTask = await Task.create({
      title,
      points: points || 10, // Default to 10 if points not provided
      status: status || 'pending', // Default status
      deadline,
      dueBy,
      tools: tools || [], // Default to an empty array if not provided
      inWorkroom: inWorkroom || false, // Default to false if not provided
      createdBy: req.user.id, // Associate task with authenticated user ID
    });
    console.log('Authenticated User ID:', req.user.id);
    // Respond with success message and new task data
    res.status(201).json({ message: 'Task has been created', data: newTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      message: 'An error occurred while creating the task',
      error: error.message,
    });
  }
}

// Update an existing task by ID
export async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { title, points, status, deadline, dueBy, tools, inWorkroom } =
      req.body;

    console.log(req.body); // Log the request body

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title, points, status, deadline, dueBy, tools, inWorkroom },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      message: 'An error occurred while updating the task',
      error: error.message,
    });
  }
}

// Delete a task by ID
export async function deleteTask(req, res) {
  try {
    const { id } = req.params; // Get the task ID from the request params

    // Find the task by ID and delete it
    const deletedTask = await Task.findByIdAndDelete(id);

    // Check if the task was found and deleted
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({
      message: 'Task deleted successfully',
      data: deletedTask, // You can choose to return the deleted task data if needed
    });
  } catch (error) {
    res.status(500).json({
      message: 'An error occurred while deleting the task',
      error: error.message,
    });
  }
}
