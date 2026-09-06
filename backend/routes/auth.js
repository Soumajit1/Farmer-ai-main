const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const db = require("../db");

const JWT_SECRET =
  process.env.JWT_SECRET || "agrilink_super_secret_key_change_this";

/*
==================================================
LOGIN
POST /api/auth/login
==================================================
*/
router.post("/login", async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    console.log("Login request:", {
      identifier,
      role,
      passwordProvided: !!password
    });

    if (!identifier || !password || !role) {
      return res.status(400).json({
        message: "Email/mobile, password and role are required."
      });
    }

    const sql = `
      SELECT *
      FROM users
      WHERE (email = ? OR mobile = ?)
      AND role = ?
      LIMIT 1
    `;

    db.query(
      sql,
      [identifier, identifier, role],
      async (err, results) => {
       if (err) {
  console.error("Login DB error:", err);

  return res.status(500).json({
    message: "Database error."
  });
}
        if (results.length === 0) {
          return res.status(401).json({
            message: "Invalid credentials or role."
          });
        }

        const user = results[0];

        try {
          const passwordMatch = await bcrypt.compare(
            password,
            user.password
          );

          if (!passwordMatch) {
            return res.status(401).json({
              message: "Invalid credentials."
            });
          }

          const token = jwt.sign(
            {
              id: user.id,
              email: user.email,
              role: user.role
            },
            JWT_SECRET,
            {
              expiresIn: "7d"
            }
          );

          return res.json({
            message: "Login successful.",

            token,

            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              mobile: user.mobile,
              role: user.role,
              location: user.location
            }
          });

        } catch (passwordError) {
          console.error(
            "Password verification error:",
            passwordError
          );

          return res.status(500).json({
            message: "Unable to verify password."
          });
        }
      }
    );

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error."
    });
  }
});


/*
==================================================
REGISTER
POST /api/auth/register
==================================================
*/
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      role,
      location,
      crop,
      company,
      farmersCount
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message:
          "Name, email, password and role are required."
      });
    }

    const allowedRoles = [
      "farmer",
      "buyer",
      "fpo"
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid registration role."
      });
    }

    db.query(
      `
      SELECT id
      FROM users
      WHERE email = ? OR mobile = ?
      LIMIT 1
      `,
      [email, mobile || null],
      async (err, results) => {

        if (err) {
          console.error(
            "Registration DB error:",
            err
          );

          return res.status(500).json({
            message: "Database error."
          });
        }

        if (results.length > 0) {
          return res.status(409).json({
            message:
              "Email or mobile number already registered."
          });
        }

        try {
          const hashedPassword =
            await bcrypt.hash(password, 10);

          const sql = `
            INSERT INTO users
            (
              name,
              email,
              mobile,
              password,
              role,
              location
            )
            VALUES (?, ?, ?, ?, ?, ?)
          `;

          db.query(
            sql,
            [
              name,
              email,
              mobile || null,
              hashedPassword,
              role,
              location || null
            ],
            (err, result) => {

              if (err) {
                console.error(
                  "User insert error:",
                  err
                );

                return res.status(500).json({
                  message:
                    "Unable to create account."
                });
              }

              return res.status(201).json({
                message:
                  "Registration successful.",

                userId: result.insertId
              });
            }
          );

        } catch (hashError) {
          console.error(
            "Password hashing error:",
            hashError
          );

          return res.status(500).json({
            message:
              "Unable to secure password."
          });
        }
      }
    );

  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return res.status(500).json({
      message: "Server error."
    });
  }
});


module.exports = router;