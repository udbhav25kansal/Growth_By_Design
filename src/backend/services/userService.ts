import { queries } from '../database/connection';

export interface User {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  password_hash?: string;
}

export interface UpdateUserData {
  name: string;
}

export class UserService {
  static async createUser(userData: CreateUserData): Promise<User> {
    try {
      const { db } = await import('../database/connection');
      const passwordHash = userData.password_hash ?? '';
      const result = db.prepare('INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?) RETURNING *').get(userData.email, userData.name, passwordHash) as User;
      return result;
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('User with this email already exists');
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  static async getUserById(id: number): Promise<User | null> {
    try {
      const { db } = await import('../database/connection');
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
      return user || null;
    } catch (error: any) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { db } = await import('../database/connection');
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
      return user || null;
    } catch (error: any) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  static async updateUser(id: number, userData: UpdateUserData): Promise<User | null> {
    try {
      const { db } = await import('../database/connection');
      const user = db.prepare('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *').get(userData.name, id) as User | undefined;
      return user || null;
    } catch (error: any) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      const { db } = await import('../database/connection');
      const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as User[];
      return users;
    } catch (error: any) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }
} 