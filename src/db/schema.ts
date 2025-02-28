import { relations } from 'drizzle-orm';
import { account, user } from './auth-schema';
export * from './auth-schema';

// relations

export const userRelation = relations(user, ({ many }) => ({
  accounts: many(account)
}));

export const accountRelation = relations(account, ({ one, many }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] })
}));
