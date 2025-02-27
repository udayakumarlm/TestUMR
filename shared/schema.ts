import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const todos = sqliteTable("todos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
});

export const insertTodoSchema = createInsertSchema(todos)
  .pick({
    title: true,
    description: true,
    completed: true,
  })
  .extend({
    title: z.string().min(1, "Title is required").max(100),
    description: z.string().max(500).optional(),
  });

export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type Todo = typeof todos.$inferSelect;