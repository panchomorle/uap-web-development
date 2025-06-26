import { database } from "../../db/connection";
import { User } from "../../types";
import { CreateUserDto } from "./auth.dto";

export class AuthRepository {
  
  async createUser(userData: User): Promise<User> {
    const { id, email, password } = userData;
    
    await database.run(
      `INSERT INTO users (id, email, password) VALUES (?, ?, ?)`,
      [id, email, password]
    );
    
    const user = await database.get<User>(
      `SELECT * FROM users WHERE id = ?`,
      [id]
    );
    
    if (!user) {
      throw new Error("Error creating user");
    }
    
    return user;
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    return await database.get<User>(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
  }

  async findUserById(id: string): Promise<User | undefined> {
    return await database.get<User>(
      `SELECT * FROM users WHERE id = ?`,
      [id]
    );
  }

  async updateUser(id: string, updateData: Partial<CreateUserDto>): Promise<User | null> {
    const existingUser = await this.findUserById(id);
    if (!existingUser) {
      return null;
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (updateData.email) {
      updates.push("email = ?");
      values.push(updateData.email);
    }

    if (updateData.password) {
      updates.push("password = ?");
      values.push(updateData.password);
    }

    values.push(id);

    await database.run(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    const updatedUser = await this.findUserById(id);
    return updatedUser || null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await this.findUserById(id);
    if (!user) {
      return false;
    }

    await database.run(`DELETE FROM users WHERE id = ?`, [id]);
    return true;
  }

  async getAllUsers(): Promise<User[]> {
    return await database.all<User>(`SELECT * FROM users`);
  }
}