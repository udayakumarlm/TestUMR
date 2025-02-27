import TodoForm from "@/components/todo-form";
import TodoList from "@/components/todo-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Todo } from "@shared/schema";
import { useState } from "react";

export default function Home() {
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {selectedTodo ? "Edit Todo" : "New Todo"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TodoForm
              todo={selectedTodo}
              onSuccess={() => setSelectedTodo(null)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Todo List</CardTitle>
          </CardHeader>
          <CardContent>
            <TodoList onSelect={setSelectedTodo} selectedId={selectedTodo?.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
