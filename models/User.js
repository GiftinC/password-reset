import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String, // Token for password resets
  resetTokenExpiration: Date, // Expiration time for the token
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const saltRounds = 5;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

const User = mongoose.model('users', userSchema);

export default User;
