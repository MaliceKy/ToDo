import User from "../models/user.model.js";

// Sign up (creation of user)
export const createUser = async (req, res) => {
	const user = req.body; // user will send this data

    // Check if all fields are filled
	if (!user.username || !user.password) {
        return res.status(400).json({ success: false, message: "Please enter a username and password." });
    }

	const newUser = new User(user);

    // Attempt to create an instance of the new user in the database
	try {
        // Check if username already exists
        const existingUser = await User.findOne({ username: user.username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Username already exists. Please choose another one." });
        }

        // If username is unique, create the new user
        const newUser = new User(user);
        await newUser.save();
        res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        console.error("Error in creating user:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Sign in (checks user)
export const loginUser = async (req, res) => {
	const { username, password } = req.body;
  
	try {
	  const user = await User.findOne({ username });
  
	  if (user && user.matchPassword(password)) {

		// If user exists and password matches
		res.status(200).json({ success: true, data: user });
	  } 
	  else {
		res.status(401).json({ success: false, message: "Invalid username or password" });
	  }
	} catch (error) {
	  console.error("Error during login:", error);
	  res.status(500).json({ success: false, message: "Server error" });
	}
  };

  // Add a new to-do for a user
export const addTodo = async (req, res) => {
    const { userId, todo } = req.body;

    console.log("Received data:", req.body); // Log the request body

    if (!userId || !todo) {
        return res.status(400).json({ success: false, message: "User ID and to-do item are required." });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        user.todos.push(todo);
        await user.save();

        res.status(200).json({ success: true, todos: user.todos });
    } catch (error) {
        console.error("Error adding to-do:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// Get all to-dos for a user
export const getTodos = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({ success: true, todos: user.todos });
    } catch (error) {
        console.error("Error fetching todos:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Delete a to-do for a user
export const deleteTodo = async (req, res) => {
    const { userId, todo } = req.body;

    if (!userId || !todo) {
        return res.status(400).json({ success: false, message: "User ID and to-do item are required." });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Filter out the specified todo
        user.todos = user.todos.filter(t => t !== todo);
        await user.save();

        res.status(200).json({ success: true, todos: user.todos });
    } catch (error) {
        console.error("Error deleting to-do:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Edit a to-do for a user
export const editTodo = async (req, res) => {
    const { userId, oldTodo, newTodo } = req.body;

    if (!userId || !oldTodo || !newTodo) {
        return res.status(400).json({ success: false, message: "User ID, old to-do, and new to-do are required." });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Find the index of the oldTodo
        const todoIndex = user.todos.indexOf(oldTodo);

        if (todoIndex === -1) {
            return res.status(404).json({ success: false, message: "To-do not found." });
        }

        // Update the todo at the found index
        user.todos[todoIndex] = newTodo;
        await user.save();

        res.status(200).json({ success: true, todos: user.todos });
    } catch (error) {
        console.error("Error editing to-do:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
