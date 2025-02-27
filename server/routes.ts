import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTodoSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/todos", async (_req, res) => {
    const todos = await storage.getTodos();
    res.json(todos);
  });

  app.post("/api/todos", async (req, res) => {
    const result = insertTodoSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid todo data" });
    }

    const todo = await storage.createTodo(result.data);
    res.status(201).json(todo);
  });

  app.patch("/api/todos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid todo ID" });
    }

    const result = insertTodoSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid todo data" });
    }

    const todo = await storage.updateTodo(id, result.data);
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(todo);
  });

  app.delete("/api/todos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid todo ID" });
    }

    const success = await storage.deleteTodo(id);
    if (!success) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(204).end();
  });

  const httpServer = createServer(app);
  return httpServer;
}
