"use client";

import { type Todo } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodoListProps {
  onSelect?: (todo: Todo) => void;
  selectedId?: number;
}

async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch("/api/todos");
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
}

export default function TodoList({ onSelect, selectedId }: TodoListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todos, isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete todo");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast({ title: "Todo deleted successfully" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      if (!res.ok) throw new Error("Failed to update todo");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  if (isLoading) {
    return <div className="text-center">Loading todos...</div>;
  }

  if (!todos?.length) {
    return <div className="text-center text-muted-foreground">No todos yet</div>;
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className={cn(
            "flex items-center gap-4 rounded-lg border p-4 hover:bg-accent/50",
            selectedId === todo.id && "bg-accent"
          )}
        >
          <Checkbox
            checked={todo.completed}
            onCheckedChange={(checked) =>
              toggleMutation.mutate({ id: todo.id, completed: !!checked })
            }
            disabled={toggleMutation.isPending}
          />
          <div
            className="flex-1 cursor-pointer"
            onClick={() => onSelect?.(todo)}
          >
            <h3 className={cn("font-medium", todo.completed && "line-through")}>
              {todo.title}
            </h3>
            {todo.description && (
              <p className="text-sm text-muted-foreground">{todo.description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteMutation.mutate(todo.id)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}