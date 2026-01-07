const User = require("../models/auth");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
require("dotenv").config();

//user singup
exports.usersignup = async (req, res) => {
  try {
    const { email, password, confirmPassword, role } = req.body;
    // Check if all fields are provided
    if (!email || !password || !confirmPassword || !role) {
      return res.status(400).json({ success: false, message: "Please fill all the fields" });
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password should be the same",
      });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//login controller
exports.login = async (req, res) => {
    try {
      
      const { email, password,role } = req.body;
      // Check if email and password are provided
      if (!email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }
  
      // Find user by email
      const user = await User.findOne({ email });
  
      // If user does not exist
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User is not registered. Please sign up to continue.",
        });
      }
      //match the role 
       if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Role mismatch. Please select the correct role for this account.",
      });
    }
      // Check if user is blocked
      if (user.isBlocked) {
        return res.status(403).json({ message: 'Your account has been blocked. Contact admin.' });
       }
      // Compare password
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid email or password",
        });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        {
          email: user.email,
          id: user._id,
          role:user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );
  
      // Attach token to user and remove password from response
      user.token = token;
      user.password = undefined;
  
      // Set cookie
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        httpOnly: true,
      };
  
      // Send response
      res.cookie("token", token, options).status(200).json({
        success: true,
        message: "User logged in successfully",
        user,
        token,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  // Change user password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password and update
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


  //logout controller
  
  exports.logout = async (req, res) => {
    try {
      // Check if the user is already logged in
      const token = req.cookies.token;
      if (!token) {
        return res.status(400).json({
          success: false,
          message: `User is not logged in`,
        });
      }
  
      // Clear the token cookie to log the user out
      res.clearCookie('token');
      res.status(200).json({
        success: true,
        message: `User logged out successfully`,
      });
  
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Internal server error", error: err.message });
    }
  };

// forgot password controller
exports.forgotPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmNewPassword } = req.body;

    // Check if all fields are provided
    if (!email || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if passwords match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // If user not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is salt rounds

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error("Error in forgotPassword:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
