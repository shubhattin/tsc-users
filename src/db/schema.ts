import { relations } from 'drizzle-orm';
import { account, user } from './auth-schema';
import { boolean, pgTable, text, serial, integer, primaryKey } from 'drizzle-orm/pg-core';
export * from './auth-schema';

export const user_info = pgTable('user_info', {
  id: text()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })
    .primaryKey(),
  is_approved: boolean().notNull().default(false)
});

export const project = pgTable('project', {
  id: serial().primaryKey(),
  name: text().notNull(),
  description: text()
});

export const language = pgTable('language', {
  id: serial().primaryKey(),
  name: text().notNull()
});

// join tables

export const user_project_join = pgTable(
  'user_project_join',
  {
    user_id: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    project_id: integer()
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' })
  },
  (table) => [primaryKey({ columns: [table.user_id, table.project_id] })]
);

export const user_project_language_join = pgTable(
  'user_project_language_join',
  {
    user_id: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    project_id: integer()
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    language_id: integer()
      .notNull()
      .references(() => language.id, { onDelete: 'cascade' })
  },
  (table) => [primaryKey({ columns: [table.user_id, table.project_id, table.language_id] })]
);

// relations

export const userRelation = relations(user, ({ one, many }) => ({
  accounts: many(account),
  user_info: one(user_info),
  projects: many(user_project_join)
}));

export const accountRelation = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] })
}));

export const user_infoRelation = relations(user_info, ({ one }) => ({
  user: one(user, { fields: [user_info.id], references: [user.id] })
}));

export const projectRelation = relations(project, ({ many }) => ({
  users: many(user_project_join),
  langs: many(user_project_language_join)
}));

export const userProjectJoinRelation = relations(user_project_join, ({ one }) => ({
  user: one(user, { fields: [user_project_join.user_id], references: [user.id] }),
  project_info: one(project, { fields: [user_project_join.project_id], references: [project.id] })
}));

export const languageRelation = relations(language, ({ many }) => ({
  projects: many(user_project_language_join)
}));

export const userProjectLanguageJoinRelation = relations(user_project_language_join, ({ one }) => ({
  user: one(user, { fields: [user_project_language_join.user_id], references: [user.id] }),
  project: one(project, {
    fields: [user_project_language_join.project_id],
    references: [project.id]
  }),
  lang_info: one(language, {
    fields: [user_project_language_join.language_id],
    references: [language.id]
  })
}));
