import { pgTable, serial, real, timestamp } from "drizzle-orm/pg-core";

export const walletTable = pgTable("wallet", {
  id: serial("id").primaryKey(),
  balance: real("balance").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Wallet = typeof walletTable.$inferSelect;
