import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  house: text("house").notNull().default(""),
  status: text("status").notNull().default("available"), // "available" | "request"
  notes: text("notes").notNull().default(""),
  price: text("price").notNull().default("On Request"),
  description: text("description").notNull().default(""),
  hidden: boolean("hidden").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sourcingRequests = pgTable("sourcing_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Anonymous Client"),
  contact: text("contact").notNull().default(""),
  city: text("city").notNull().default("Lagos"),
  productName: text("product_name").notNull(),
  message: text("message").notNull().default(""),
  status: text("status").notNull().default("pending"), // "pending" | "in_progress" | "fulfilled" | "archived"
  priority: text("priority").notNull().default("normal"), // "high" | "normal" | "low"
  replyNotes: text("reply_notes").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const kioskInteractions = pgTable("kiosk_interactions", {
  id: serial("id").primaryKey(),
  userQuery: text("user_query").notNull(),
  suggestedProducts: text("suggested_products").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
});
