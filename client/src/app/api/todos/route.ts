import { storage } from "@/lib/storage";
import { insertTodoSchema } from "@shared/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const todos = await storage.getTodos();
    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = insertTodoSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid todo data" },
        { status: 400 }
      );
    }

    const todo = await storage.createTodo(result.data);
    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}
