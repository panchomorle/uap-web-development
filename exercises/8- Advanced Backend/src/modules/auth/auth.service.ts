import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { AuthRepository } from "./auth.repository";
import { User } from "../../types";
import { CreateUserDto, LoginDto } from "./auth.dto";
import jwt from "jsonwebtoken";

export interface LoginServiceResponse {
  userWithoutPassword: Omit<User, 'password'> | null;
  token: string | null;
}

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(userData: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Verificar si el usuario ya existe
    const existingUser = await this.authRepository.findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("El mail ingresado ya está en uso.");
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Crear usuario con ID generado
    const newUser: User = {
      id: uuidv4(),
      email: userData.email,
      password: hashedPassword
    };

    const createdUser = await this.authRepository.createUser(newUser);
    
    // Retornar usuario sin contraseña
    const { password, ...userWithoutPassword } = createdUser;
    return userWithoutPassword;
  }

  async login(loginData: LoginDto): Promise<LoginServiceResponse> {
    const user = await this.authRepository.findUserByEmail(loginData.email);
    
    if (!user) {
      return {userWithoutPassword: null, token: null};
    }
    
    const isValidPassword = await bcrypt.compare(loginData.password, user.password);
    
    if (!isValidPassword) {
      return {userWithoutPassword: null, token: null};
    }
    //generar jwt
    if(!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string)
    // Retornar usuario sin contraseña
    const { password, ...userWithoutPassword } = user;
    return {userWithoutPassword, token};
  }

  async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.authRepository.findUserById(id);
    
    if (!user) {
      return null;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUserPassword(id: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await this.authRepository.updateUser(id, { password: hashedPassword });
    return updatedUser !== null;
  }

  async deleteUser(id: string): Promise<boolean> {
    return await this.authRepository.deleteUser(id);
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const users = await this.authRepository.getAllUsers();
    return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  }
}
