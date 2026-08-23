const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Appointment = require("./models/Appointment");

const app = express();

app.use(cors());
app.use(express.json());


// ===============================
// MongoDB Connection
// ===============================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) =>
    console.log("MongoDB connection failed:", err.message)
  );


// ===============================
// Home Route
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "Sakthi Dental Clinic API is running",
  });
});


// ===============================
// ADMIN LOGIN
// ===============================

app.post("/api/admin/login", (req, res) => {

  try {

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    // Check admin credentials
    if (
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        username: username,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    res.json({
      message: "Login successful",
      token: token,
    });

  } catch (error) {

    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });

  }

});


// ===============================
// AUTHENTICATION MIDDLEWARE
// ===============================

function verifyAdmin(req, res, next) {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Admin authentication required",
      });
    }

    // Expected:
    // Authorization: Bearer TOKEN

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    req.admin = decoded;

    next();

  } catch (error) {

    return res.status(401).json({
      message: "Invalid or expired token",
    });

  }

}


// ===============================
// Create Appointment
// PUBLIC ROUTE
// ===============================

app.post("/api/appointments", async (req, res) => {

  try {

    const appointment = new Appointment(req.body);

    const savedAppointment = await appointment.save();

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: savedAppointment,
    });

  } catch (error) {

    res.status(400).json({
      message: "Failed to book appointment",
      error: error.message,
    });

  }

});


// ===============================
// Get All Appointments
// ADMIN ONLY
// ===============================

app.get(
  "/api/appointments",
  verifyAdmin,
  async (req, res) => {

    try {

      const appointments = await Appointment
        .find()
        .sort({ createdAt: -1 });

      res.json(appointments);

    } catch (error) {

      res.status(500).json({
        message: "Failed to fetch appointments",
        error: error.message,
      });

    }

  }
);


// ===============================
// Update Appointment Status
// ADMIN ONLY
// ===============================

app.put(
  "/api/appointments/:id",
  verifyAdmin,
  async (req, res) => {

    try {

      const { status } = req.body;

      // Only allow these statuses
      if (
        !["Pending", "Confirmed", "Cancelled"].includes(status)
      ) {

        return res.status(400).json({
          message: "Invalid status",
        });

      }

      const appointment =
        await Appointment.findByIdAndUpdate(
          req.params.id,
          {
            status: status,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!appointment) {

        return res.status(404).json({
          message: "Appointment not found",
        });

      }

      res.json({
        message: "Appointment status updated successfully",
        appointment: appointment,
      });

    } catch (error) {

      res.status(500).json({
        message: "Failed to update appointment",
        error: error.message,
      });

    }

  }
);


// ===============================
// Delete Appointment
// ADMIN ONLY
// ===============================

app.delete(
  "/api/appointments/:id",
  verifyAdmin,
  async (req, res) => {

    try {

      const appointment =
        await Appointment.findByIdAndDelete(
          req.params.id
        );

      if (!appointment) {

        return res.status(404).json({
          message: "Appointment not found",
        });

      }

      res.json({
        message: "Appointment deleted successfully",
      });

    } catch (error) {

      res.status(500).json({
        message: "Failed to delete appointment",
        error: error.message,
      });

    }

  }
);


// ===============================
// Start Server
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on http://localhost:${PORT}`
  );

});