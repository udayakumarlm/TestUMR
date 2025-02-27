"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Todo, insertTodoSchema, type InsertTodo } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

interface TodoFormProps {
  todo: Todo | null;
  onSuccess: () => void;
}

export default function TodoForm({ todo, onSuccess }: TodoFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertTodo>({
    resolver: zodResolver(insertTodoSchema),
    defaultValues: {
      title: "",
      description: "",
      completed: false,
    },
  });

  // Reset form when todo changes
  useEffect(() => {
    if (todo) {
      form.reset({
        title: todo.title,
        description: todo.description ?? "",
        completed: todo.completed,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        completed: false,
      });
    }
  }, [todo, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertTodo) => {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create todo");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      form.reset();
      onSuccess();
      toast({ title: "Todo created successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertTodo) => {
      const res = await fetch(`/api/todos/${todo!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update todo");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      onSuccess();
      toast({ title: "Todo updated successfully" });
    },
  });

  const onSubmit = (data: InsertTodo) => {
    if (todo) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleReset = () => {
    form.reset({
      title: "",
      description: "",
      completed: false,
    });
    onSuccess(); 
    toast({ title: "Form has been reset" });
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter todo title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter todo description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="completed"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0">Completed</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {todo ? "Update" : "Create"} Todo
          </Button>
          {todo && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onSuccess()}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={isPending}
            className="ml-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
}