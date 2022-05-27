const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  const token = await user.generateAuthToken();
  try {
    await user.save();
    res.status(201).json({
      success: true,
      data: user,
      token: token,
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res
      .status(200)
      .json({ message: "Logged in successfully", data: user, token: token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res
      .status(200)
      .json({ message: "Logged out successfully", data: req.user });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res
      .status(200)
      .json({
        status: "success",
        message: "successfully logged out from all sessions.",
      });
  } catch (error) {
    res.status(500).send();
  }
});

// router.get("/users", auth, async (req, res) => {
//   try {
//     const users = await User.find({});
//     res.status(200).json({
//       success: true,
//       Number_of_Users: users.length,
//       data: users,
//     });
//   } catch (error) {
//     res.status(400).send({ error: error.message });
//   }
// });

router.get("/users/profile", auth, async (req, res) => {
  res.status(200).json({ message: "View Profile", data: req.user });
});

router.patch("/users/profile/update", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["username", "password", "age", "email"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({
      success: false,
      error: "Invalid update attempted.",
    });
  }

  try {
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    //const user = await User.findById(req.params.id);

    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();

    // if (!user) {
    //   res.status(404).json({ success: false, error: "User Not Found." });
    // }

    res.status(200).json({
      success: true,
      messsage: "Profile updated successfully.",
      data: req.user,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error });
  }
});

router.delete("/users/profile/delete", auth, async (req, res) => {
  try {
    await req.user.remove();

    res.status(200).json({
      success: true,
      message: "User Profile deleted successfully",
      data: req.user,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
