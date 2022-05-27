const bcrypt = require("bcryptjs/dist/bcrypt");
const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const Product = require("./product");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(value) {
        if (value.toLowerCase(value).includes("password")) {
          throw new Error("Invalid password");
        }
      },
    },
    age: {
      type: Number,
      required: true,
      validate(value) {
        if (value < 18) {
          throw new Error("You must be at least 18 to register.");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

//Link the users(sellers) to the products they want to sell.
userSchema.virtual("products", {
  ref: Product,
  localField: "_id",
  foreignField: "seller",
});

//5. Delete Products associated with a User when he/she deletes the account.
userSchema.pre("remove", async function (next) {
  const user = this;
  await Product.deleteMany({ seller: user._id });

  next();
});

//4. Hide Important User data.
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

//3. Generate Auth token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "birthday");
  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

//2. Log in Users.
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login!");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login!");
  }

  return user;
};

//1. hash user passsword
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
