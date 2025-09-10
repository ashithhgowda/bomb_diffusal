const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const Clue = require("./models/Clue");
const User = require("./models/User");
require("dotenv").config();
// Remove this line since we're handling the connection in server.js
require("./config/db");
const seedClues = require("./seedClues");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB - FIXED FOR ATLAS
// Replace your mongoose.connect with this:
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));
// --------- Routes ---------
// Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });

  if (!user) {
    return res.send("<h3>❌ Invalid credentials. <a href='/'>Try again</a></h3>");
  }

  if (user.role === "admin") {
    return res.redirect("/admin.html");
  } else {
    return res.redirect("/rules.html");
  }
});

// Admin registers a new team
app.post("/register-team", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.send(`
      <html>
        <head>
          <link rel="stylesheet" href="style.css" />
        </head>
        <body>
          <div class="center-content">
            <h2>❌ Team Already Exists</h2>
            <a href="/admin.html"><button>Back to Admin</button></a>
          </div>
        </body>
      </html>
    `);
  }

  const team = new User({ username, password, role: "player" });
  await team.save();

  res.send(`
    <html>
      <head>
        <link rel="stylesheet" href="style.css" />
      </head>
      <body>
        <div class="center-content">
          <h2>✅ Team Created Successfully!</h2>
          <a href="/admin.html"><button>Back to Admin Dashboard</button></a>
        </div>
      </body>
    </html>
  `);
});

// Team submits block clue code
app.post("/verify-clue", async (req, res) => {
  const { blockNumber, enteredCode, username } = req.body;

  const clue = await Clue.findOne({ blockNumber });
  if (!clue) return res.send("<h3>❌ Clue not found.</h3>");

  if (clue.attempts >= 3) {
    return res.send(`
      <html>
        <head>
          <link rel="stylesheet" href="style.css" />
        </head>
        <body>
          <div class="center-content">
            <h2>🚫 Maximum Attempts Reached</h2>
            <p>You've reached the 3-attempt limit for this clue.</p>
            <a href="/game.html"><button>Back to Game</button></a>
          </div>
        </body>
      </html>
    `);
  }

  if (clue.code === enteredCode) {
    return res.redirect(`/map.html?coords=${clue.coordinates}&team=${username}&block=${blockNumber}`);
  } else {
    clue.attempts += 1;
    await clue.save();
    const attemptsLeft = 3 - clue.attempts;

    return res.send(`
      <html>
        <head>
          <link rel="stylesheet" href="style.css" />
        </head>
        <body>
          <div class="center-content">
            <h2>❌ Wrong Code!</h2>
            <p>Attempts left: ${attemptsLeft}</p>
            <a href="/game.html"><button>Try Again</button></a>
          </div>
        </body>
      </html>
    `);
  }
});

// Final code verification near clue location
app.post("/verify-final-code", async (req, res) => {
  const { username, blockNumber, finalCode } = req.body;

  const team = await User.findOne({ username });
  if (!team) return res.send("<h3>❌ Team not found.</h3>");

  const clue = await Clue.findOne({ blockNumber });
  if (!clue) return res.send("<h3>❌ Clue not found.</h3>");

  if (finalCode === clue.verificationCode) {
    team.progress.push({ blockNumber, attempts: 0, solved: true });
    await team.save();
    return res.send("<h3>✅ Success! You passed this block. <a href='/'>Login again</a></h3>");
  } else {
    return res.send("<h3>❌ Incorrect final code. <a href='/map.html'>Try again</a></h3>");
  }
});

// Clue code input page for a block
app.get("/clue-page", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "clue.html"));
});

// Admin dashboard showing all teams and their progress
app.get("/admin-dashboard", async (req, res) => {
  const teams = await User.find({ role: "player" });

  let html = `<h2>Teams Progress</h2><table border="1">
              <link rel="stylesheet" href="style.css" />
              <tr><th>Team</th><th>Block</th><th>Attempts</th><th>Solved</th></tr>`;

  teams.forEach(team => {
    if (team.progress.length === 0) {
      html += `<tr><td>${team.username}</td><td>-</td><td>-</td><td>Not started</td></tr>`;
    } else {
      team.progress.forEach(p => {
        html += `<tr>
                   <td>${team.username}</td>
                   <td>${p.blockNumber}</td>
                   <td>${p.attempts}</td>
                   <td>${p.solved ? "✅ Passed Level 2" : "❌"}</td>
                 </tr>`;
      });
    }
  });

  html += `</table><br><a href="/admin.html">Back</a>`;
  res.send(html);
});

// View all registered teams
app.get("/view-teams", async (req, res) => {
  const teams = await User.find({ role: "player" });

  let html = `<h2>All Registered Teams</h2><table border="1">
              <link rel="stylesheet" href="style.css" />
              <tr><th>Team Username</th><th>Password</th></tr>`;

  teams.forEach(team => {
    html += `<tr>
               <td>${team.username}</td>
               <td>${team.password}</td>
             </tr>`;
  });

  html += `</table><br><a href="/admin.html">Back</a>`;
  res.send(html);
});

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));