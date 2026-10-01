import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

export class TpoUserController {
  /**
   * GET /api/tpo/users
   * Retrieves a list of all TPO users
   */
  static async getTpoUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        where: { role: Role.TPO },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(users);
    } catch (error: any) {
      console.error('Error fetching TPO users:', error);
      res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch TPO users.' });
    }
  }

  /**
   * POST /api/tpo/users
   * Creates a new TPO user
   */
  static async createTpoUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, phone } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Validation Error', message: 'Email and password are required.' });
        return;
      }

      // Check for existing user
      const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (existingUser) {
        res.status(409).json({ error: 'Conflict', message: 'A user with this email already exists.' });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create TPO user
      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name?.trim() || null,
          phone: phone?.trim() || null,
          role: Role.TPO,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      });

      res.status(201).json({ message: 'TPO user created successfully', user: newUser });
    } catch (error: any) {
      console.error('Error creating TPO user:', error);
      res.status(500).json({ error: 'Internal Server Error', message: 'Failed to create TPO user.' });
    }
  }

  /**
   * GET /api/tpo/profile
   * Retrieves the logged-in TPO user's profile
   */
  static async getMyProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        res.status(404).json({ error: 'Not Found', message: 'User not found.' });
        return;
      }

      res.status(200).json(user);
    } catch (error: any) {
      console.error('Error fetching TPO profile:', error);
      res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch profile.' });
    }
  }

  /**
   * PUT /api/tpo/profile
   * Updates the logged-in TPO user's profile
   */
  static async updateMyProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
        return;
      }

      const { name, phone } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name !== undefined ? name : undefined,
          phone: phone !== undefined ? phone : undefined,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      });

      res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error: any) {
      console.error('Error updating TPO profile:', error);
      res.status(500).json({ error: 'Internal Server Error', message: 'Failed to update profile.' });
    }
  }
  /**
   * PUT /api/tpo/users/:id
   * Updates a TPO user
   */
  static async updateTpoUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, phone, email, password } = req.body;

      const existingUser = await prisma.user.findUnique({ where: { id } });
      if (!existingUser || existingUser.role !== Role.TPO) {
        res.status(404).json({ error: 'Not Found', message: 'TPO User not found.' });
        return;
      }

      if (email && email.toLowerCase() !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (emailExists) {
          res.status(409).json({ error: 'Conflict', message: 'A user with this email already exists.' });
          return;
        }
      }

      const updateData: any = {
        name: name !== undefined ? name : undefined,
        phone: phone !== undefined ? phone : undefined,
      };

      if (email) updateData.email = email.toLowerCase();
      if (password) updateData.password = await bcrypt.hash(password, 10);

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      });

      res.status(200).json({ message: 'TPO user updated successfully', user: updatedUser });
    } catch (error: any) {
      console.error('Error updating TPO user:', error);
      res.status(500).json({ error: 'Internal Server Error', message: 'Failed to update TPO user.' });
    }
  }

  /**
   * DELETE /api/tpo/users/:id
   * Deletes a TPO user
   */
  static async deleteTpoUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const existingUser = await prisma.user.findUnique({ where: { id } });
      if (!existingUser || existingUser.role !== Role.TPO) {
        res.status(404).json({ error: 'Not Found', message: 'TPO User not found.' });
        return;
      }

      if (id === req.user?.userId) {
        res.status(400).json({ error: 'Bad Request', message: 'You cannot delete your own account.' });
        return;
      }

      await prisma.user.delete({ where: { id } });

      res.status(200).json({ message: 'TPO user deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting TPO user:', error);
      res.status(500).json({ error: 'Internal Server Error', message: 'Failed to delete TPO user.' });
    }
  }
}
