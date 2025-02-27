import { storage } from "@/lib/storage";
import { insertTodoSchema } from "@shared/schema";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid todo ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = insertTodoSchema.partial().safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid todo data" },
        { status: 400 }
      );
    }

    const todo = await storage.updateTodo(id, result.data);
    if (!todo) {
      return NextResponse.json(
        { error: "Todo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(todo);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid todo ID" },
        { status: 400 }
      );
    }

    const success = await storage.deleteTodo(id);
    if (!success) {
      return NextResponse.json(
        { error: "Todo not found" },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}
