import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

export class AuthService {
  static async register(name: string, email: string, passwordHashRaw: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }
    const passwordHash = await bcrypt.hash(passwordHashRaw, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    return { token, user };
  }

  static async login(email: string, passwordHashRaw: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const valid = await bcrypt.compare(passwordHashRaw, user.passwordHash);
    if (!valid) {
      throw new Error("Invalid credentials");
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    return { token, user };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    return user;
  }
}
