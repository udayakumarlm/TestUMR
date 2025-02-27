import { type Todo, type InsertTodo } from "@shared/schema";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { todos } from "@shared/schema";
import { eq } from "drizzle-orm";

export class SqliteStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const sqlite = new Database("todo.db");
    this.db = drizzle(sqlite);

    // Create tables if they don't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER NOT NULL DEFAULT 0
      );
    `);
  }

  async getTodos(): Promise<Todo[]> {
    return this.db.select().from(todos).all();
  }

  async getTodo(id: number): Promise<Todo | undefined> {
    const results = await this.db.select()
      .from(todos)
      .where(eq(todos.id, id))
      .all();
    return results[0];
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const result = await this.db.insert(todos)
      .values(insertTodo)
      .returning()
      .all();
    return result[0];
  }

  async updateTodo(id: number, updates: Partial<InsertTodo>): Promise<Todo | undefined> {
    const result = await this.db.update(todos)
      .set(updates)
      .where(eq(todos.id, id))
      .returning()
      .all();
    return result[0];
  }

  async deleteTodo(id: number): Promise<boolean> {
    const result = await this.db.delete(todos)
      .where(eq(todos.id, id))
      .returning()
      .all();
    return result.length > 0;
  }
}

// Create a singleton instance
export const storage = new SqliteStorage();
