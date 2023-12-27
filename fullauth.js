const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const jwtPassword = "123456";

mongoose.connect(
  "mongodb+srv://nirmitsaini:Amedo12345@cluster0.sqfndqy.mongodb.net/user_app"
);

const UserProfileSchema = mongoose.model("User", {
  name: String,
  username: String,
  password: String,
});

const app = express();
app.use(express.json());

async function userExists(username, password) {
  try {
    const data = await UserProfileSchema.findOne({ username: username });
    if (data) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(err);
    return false; // Handle errors appropriately
  }
}

app.post("/signup", function (req, res) {
  const { name, username, password } = req.body;

  const userDetails = new UserProfileSchema({
    name: name,
    username: username,
    password: password,
  });

  userDetails
    .save()
    .then((doc) => {
      res.send(doc);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/signin", async function (req, res) {
    const { username, password } = req.body;
  
    try {
      const userExistsResult = await userExists(username, password);
  
      if (!userExistsResult) {
        console.log("from signup: " + userExistsResult);
        return res.status(403).json({
          msg: "User doesn't exist in our in-memory database",
        });
      } else {
        const token = jwt.sign({ username: username }, jwtPassword);
        return res.json({
          token,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Internal server error",
      });
    }
  });
  

app.get("/users", async function (req, res) {
  const token = req.headers.authorization;

  try {
    const decoded = jwt.verify(token, jwtPassword);
    const username = decoded.username;

    const users = await UserProfileSchema.find({ username: { $ne: username } });

    return res.status(200).json(users);
  } catch (err) {
    return res.status(403).json({
      msg: "Invalid token",
    });
  }
});

app.listen(3001);
