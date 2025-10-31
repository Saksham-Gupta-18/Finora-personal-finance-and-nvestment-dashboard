import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, findUserById, updateUserById } from '../models/userModel.js';
import { isNonEmptyString, isValidEmail } from '../utils/validate.js';

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

export async function signUp(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!isNonEmptyString(name) || !isValidEmail(email) || !isNonEmptyString(password)) {
      res.status(400);
      throw new Error('Invalid name, email, or password');
    }
    const existing = await findUserByEmail(email.toLowerCase());
    if (existing) {
      res.status(409);
      throw new Error('Email already in use');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email: email.toLowerCase(), passwordHash });
    const token = signToken(user.id);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
}

export async function signIn(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!isValidEmail(email) || !isNonEmptyString(password)) {
      res.status(400);
      throw new Error('Invalid email or password');
    }
    const user = await findUserByEmail(email.toLowerCase());
    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      res.status(401);
      throw new Error('Invalid credentials');
    }
    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at, updated_at: user.updated_at } });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req, res, next) {
  try {
    const me = await findUserById(req.user.id);
    res.json({ user: me });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name } = req.body;
    const updated = await updateUserById(req.user.id, { name });
    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req, res) {
  // With stateless JWT, logout is handled client-side by deleting the token
  res.json({ success: true });
}


