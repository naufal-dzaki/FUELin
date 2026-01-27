import crypto from "crypto";

function generateJWTSecret(length = 64) {
  return crypto.randomBytes(length).toString("hex");
}

const secret = generateJWTSecret(32);

console.log("\n✅ Generated JWT Secret:\n");
console.log(secret);

console.log("\n✅ Copy this into your .env file:\n");
console.log(`JWT_SECRET=${secret}\n`);
