import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(
  process.env.MONGODB_URI|| "mongodb://localhost:27017/mentorlagbe"
);
const db = client.db(process.env.DB_NAME || "mentorlagbe");

export const auth = betterAuth({

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [process.env.FRONTEND_URL || "http://localhost:3000"],

  emailAndPassword: { 
    enabled: true, 
  }, 
  socialProviders: {
  google: {
    clientId: process.env.GOOGLE_URI as string,
    clientSecret: process.env.GOOGLE_SECRET as string,
  },
},
  database: mongodbAdapter(db, {
    client,
  }),
});