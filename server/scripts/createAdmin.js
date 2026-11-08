// Creates an Admin account. There is no sign-up page, so this is how the
// first (or any additional) administrator gets into the system.
//
// Usage (from the repo root):
//   npm --prefix server run create-admin -- <email> <password> "<Full Name>"
//
// The password must be at least 8 characters. Wrap the name in quotes if it
// contains spaces.
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/user.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const [email, password, ...nameParts] = process.argv.slice(2);
const name = nameParts.join(" ").trim() || "Administrator";

if (!email || !password) {
  console.error('Usage: npm --prefix server run create-admin -- <email> <password> "<Full Name>"');
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

try {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.error(`An account with ${email} already exists (role: ${existing.role}).`);
    process.exitCode = 1;
  } else {
    await User.create({ name, email, password, role: "Admin" });
    console.log(`Admin account created for ${email}. Log in with role "Admin".`);
  }
} catch (error) {
  console.error(`Could not create admin: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
