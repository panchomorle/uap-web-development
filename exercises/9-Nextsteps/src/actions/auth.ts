"use server"

import { connectDB, User } from "../db/mongo";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export async function register({ username, email, password }: { username: string; email: string; password: string }) {
  await connectDB();
  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) throw new Error("Username or email already exists");
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hashed });
  return { id: user._id, username: user.username, email: user.email };
}

export async function login({ username, password }: { username: string; password: string }) {
  await connectDB();
  const user = await User.findOne({ username });
  if (!user) throw new Error("Invalid credentials");
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid credentials");
  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });
  return { token, user: { id: user._id, username: user.username, email: user.email } };
}
