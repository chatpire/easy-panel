import { generateId } from "lucia";
import { Argon2id } from "oslo/password";
import { env } from "@/env";

const argon2id = new Argon2id();

export const hashPassword = async (password: string) => await argon2id.hash(password);

export const verifyPassword = async (password: string, hash: string) => await argon2id.verify(hash, password);
