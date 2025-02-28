import { relations } from 'drizzle-orm';
import { account, session, user } from './auth-schema';
export * from './auth-schema';

// relations

export const userRelation = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session)
}));

export const accountRelation = relations(account, ({ one, many }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] })
}));

export const sessionRelation = relations(session, ({ one, many }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] })
}));
