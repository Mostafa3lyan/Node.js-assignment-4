const express = require("express");
const { randomUUID } = require("node:crypto");
const fs = require("fs").promises;
const path = require("path");
const port = 3000;
const app = express();

app.listen(port, () => {
    console.log(`server is running at ${port}`);
});
app.get("/", (req, res, next) => {
    return res.send("hello");
});

app.use(express.json());

const usersFile = path.join(__dirname, "users.json");

async function readUsers() {
    const data = await fs.readFile(usersFile, "utf-8");
    return JSON.parse(data);
}

async function writeUser(users) {
    await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
}
// 1
app.post("/user", async (req, res, next) => {
    try {
        const { username, age, email } = req.body;
        if (!username || !email) {
            return res.status(400).json({ message: "username and email required" });
        }
        const users = await readUsers();
        const checkUser = users.find((user) => user.email === email);
        if (checkUser) {
            return res.status(409).json({ message: "email already exist" });
        }
        const newUser = {
            id: randomUUID(),
            username,
            age,
            email,
        };
        users.push(newUser);
        await writeUser(users);
        return res
            .status(201)
            .json({ message: "user created successfully", user: newUser });
    } catch (error) {
    console.error(error);
        res.status(500).json({ message: "internal server error" });
    }
});
// 2
app.patch("/user/:id", async (req, res,next) => {
  try {
    const { id } = req.params;
    const { username, age, email } = req.body;

    const users = await readUsers();
    const user = users.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email !== undefined) {
      const emailExists = users.find((u) => u.email === email && u.id !== id);
      if (emailExists) {
        return res.status(409).json({ message: "Email already exists" });
      }
      user.email = email;
    }

    if (username !== undefined) user.username = username;
    if (age !== undefined) user.age = age;

    await writeUser(users);

    res.json({ message: "User updated", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// 3
app.delete("/user{/:id}", async (req, res,next) => {
  try {
    const id = req.params.id || req.body.id;

    if (!id) {
      return res.status(400).json({ message: "user iD is required" });
    }

    const users = await readUsers();

    const newUsers = users.filter((u) => u.id !== id);

    if (users.length === newUsers.length) {
      return res.status(404).json({ message: "User not found" });
    }

    await writeUser(newUsers);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});
// 4
app.get("/user/getByName", async (req, res,next) => {
  try {
    const { name } = req.query;
    if (!name)
      return res
        .status(400)
        .json({ message: "Name query parameter is required" });

    const users = await readUsers();
    const user = users.find(
      (u) => u.username.toLowerCase() === name.toLowerCase()
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});
// 5
app.get("/user", async (req, res,next) => {
  try {
    const users = await readUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});
// 6
app.get("/user/filter", async (req, res,next) => {
  try {
    const minAge = parseInt(req.query.minAge);
    if (isNaN(minAge))
      return res
        .status(400)
        .json({ message: "minAge query parameter must be a number" });

    const users = await readUsers();
    const filteredUsers = users.filter(
      (u) => u.age !== undefined && u.age >= minAge
    );

    res.json(filteredUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});
// 7
app.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const users = await readUsers();
    const user = users.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// part 2 > note "i didnt know exatly what i was supposed to do so i used Ai and did this, however im fully understand it" 

// Relationships:

// Musician ↔ Instrument → Many-to-Many

// Musician ↔ Song → Many-to-Many

// Album → Song → One-to-Many

// Musician (Producer) → Album → One-to-Many


// Musician
const musicians = [
{
    musician_id: "m1",  // primary key
    name: "Alice",
    address: { street: "123 Main St", city: "New York" },
    phone: "123-456-7890",
    instruments: ["Piano", "Guitar"], // Many-to-Many via Instrument
    songs: ["s1", "s2"],              // Many-to-Many via Song
    produced_albums: ["a1"]           // One-to-Many as producer
},
];

// Instrument
const instruments = [
  {
    instrument_name: "Piano",
    key: "C",
    musicians: ["m1", "m2"]           // Many-to-Many via MusicianInstrument
  },
  {
    instrument_name: "Guitar",
    key: "E",
    musicians: ["m1"]
  }
  // more instruments...
];

// Album
const albums = [
  {
    album_id: "a1",
    title: "Summer Vibes",
    copyright_date: "2025-06-01",
    producer_id: "m1",                // One musician
    songs: ["s1", "s2"]               // One-to-Many with Song
  },
  // more albums...
];

// Song
const songs = [
  {
    song_id: "s1",
    title: "Sunshine",
    author: "Alice",
    album_id: "a1",
    performers: ["m1", "m2"]           // Many-to-Many via MusicianSong
  },
  {
    song_id: "s2",
    title: "Moonlight",
    author: "Bob",
    album_id: "a1",
    performers: ["m1"]
  }
];

