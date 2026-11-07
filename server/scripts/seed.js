// Creates local test accounts so the app can be tried out.
// Run from the repo root or server/:  npm --prefix server run seed
// Safe to re-run: existing accounts (matched by email) are left untouched.
//
// Test logins (local development only):
//   Admin    admin@example.com    / Admin@12345
//   Teacher  teacher@example.com  / Teacher@12345
//   Student  student@example.com  / Student@12345
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/user.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env") });

const accounts = [
  { name: "Admin User", email: "admin@example.com", password: "Admin@12345", role: "Admin" },
  {
    name: "Dr. Test Teacher",
    email: "teacher@example.com",
    password: "Teacher@12345",
    role: "Teacher",
    department: "Computer Science",
    expertise: ["Web Development"],
    maxStudents: 5,
  },
  {
    name: "Test Student",
    email: "student@example.com",
    password: "Student@12345",
    role: "Student",
    department: "Computer Science",
  },
];

await mongoose.connect(process.env.MONGO_URI);

for (const account of accounts) {
  const exists = await User.findOne({ email: account.email });
  if (exists) {
    console.log(`exists   ${account.role.padEnd(7)} ${account.email}`);
    continue;
  }
  await User.create(account); // password is hashed by the model's save hook
  console.log(`created  ${account.role.padEnd(7)} ${account.email}`);
}

await mongoose.disconnect();
