// backend/server.js

const express = require('express');
const cors = require('cors');
const { db } = require('./firebase.js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// get user information
app.get('/user/:id', async (req, res) => {
  try {
    const uid = req.params.id;
    const userRef = db.collection('users').doc(uid);
    const user = await userRef.get();
    if (user.exists) {
      res.status(200).send(user.data());
    } else {
      res.status(404).send({ message: "This user does not exist" });
    }
  } catch (error) {
    res.status(500).send({ message: "Error getting user" });
  }
});

// create user
app.post('/register', async (req, res) => {
  try {
    const userRef = db.collection('users').doc(req.body.id);
    const newUser = {
      email: req.body.email,
      profile: {
        Summary: "",
        certifications: [],
        education: {},
        personal: {},
        skills: [],
        websites: [],
        work: []
      }
    };
    await userRef.set(newUser);
    res.status(201).send({ message: "Created user" });
  } catch (error) {
    res.status(500).send({ message: "Error creating user" });
  }
});

// update profile
app.put('/profile/:id', async (req, res) => {
  try {
    const newProfile = req.body;
    const uid = req.params.id;
    const userRef = db.collection("users").doc(uid);
    await userRef.update({ profile: newProfile });
    res.status(200).send({ message: "Updated profile" });
  } catch (error) {
    res.status(500).send({ message: "Error updating profile" });
  }
});

// Start server
const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));