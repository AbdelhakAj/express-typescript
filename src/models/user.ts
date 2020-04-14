import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "../configs/dotenvConfig";

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  generateJWT: () => string;
  comparePassword: (arg0: string) => boolean;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: "email is required",
      trim: true,
    },
    password: {
      type: String,
      required: "password is required",
      min: [6, "password must be at least 6 characters"],
    },
    firstName: String,
    lastName: String,
  },
  { timestamps: true }
);

userSchema.pre<IUser>("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.generateJWT = function () {
  let payload = {
    id: this._id,
    email: this.email,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
  };

  return jwt.sign(payload, `${process.env.JWT_SECRET}`, {
    expiresIn: 600000,
  });
};

mongoose.set("useFindAndModify", false);

export default mongoose.model<IUser>("User", userSchema);
