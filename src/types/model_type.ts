import type { Request } from "express";

export type tokenType =  { personId: string, role?: AccountType };

export interface AuthRequest extends Request {
  user?: tokenType,
}


export const AccountType = {
  User: "User",
  Teacher: "Teacher",
  Author: "Author",
  Admin: "Admin"
} as const;

export type AccountType = typeof AccountType[keyof typeof AccountType];