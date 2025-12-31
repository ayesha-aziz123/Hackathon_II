'use client';
import * as React from "react"
import { Task } from "@/lib/types"
import { TaskCard } from "./task-card"
import { TaskFilter } from "./task-filter"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon } from "@radix-ui/react-icons"
import { EmptyState } from "./empty-state"
import { motion, AnimatePresence, LayoutGroup, useDragControls } from 'framer-motion'

interface TaskListProps {
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onReorderTasks?: (tasks: Task[]) => void;
}

interface DragTaskItemProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (task: Task) => void;
  onDragEnd: (fromIndex: number, toIndex: number) => void;
}

const DragTaskItem = ({ task, index, onEdit, onDelete, onComplete, onDragEnd }: DragTaskItemProps) => {
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragStart = (event:  React.PointerEvent<HTMLDivElement>) => {
    dragControls.start(event, { snapToCursor: true });
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
      drag="y"
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.03, zIndex: 10 }}
      style={{ cursor: 'grab', opacity: isDragging ? 0.5 : 1 }}
    >
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onComplete={onComplete}
        className={isDragging ? "cursor-grabbing" : "cursor-grab"}
      />
    </motion.div>
  );
};

export function TaskList({
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onReorderTasks,
}: TaskListProps) {
  const [filters, setFilters] = React.useState({
    status: "all",
    priority: "all",
    search: "",
    tags: [] as string[],
  })

  const [filteredTasks, setFilteredTasks] = React.useState<Task[]>(tasks)

  React.useEffect(() => {
    let result = tasks

    // Apply priority filter
    if (filters.priority !== "all") {
      result = result.filter(task => task.priority === filters.priority)
    }

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      )
    }

    // Apply tags filter
    if (filters.tags.length > 0) {
      result = result.filter(task => {
        if (!task.tags) return false
        const taskTags = task.tags.split(',').map(tag => tag.trim().toLowerCase())
        return filters.tags.some(tag =>
          taskTags.includes(tag.toLowerCase())
        )
      })
    }

    setFilteredTasks(result)
  }, [tasks, filters])

  const handleDragEnd = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || !onReorderTasks) return;

    const newTasks = [...filteredTasks];
    const [movedTask] = newTasks.splice(fromIndex, 1);
    newTasks.splice(toIndex, 0, movedTask);

    onReorderTasks(newTasks);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle>Tasks</CardTitle>
          <p className="text-sm text-muted-foreground">
            {filteredTasks.length} of {tasks.length} tasks
          </p>
        </div>
        <Button onClick={onAddTask}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </CardHeader>
      <CardContent>
        <TaskFilter
          filters={filters}
          onFilterChange={setFilters}
        />

        <div className="mt-6 space-y-4">
          {filteredTasks.length > 0 ? (
            <LayoutGroup>
              <AnimatePresence>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.map((task, index) => (
                    <DragTaskItem
                      key={task.id}
                      task={task}
                      index={index}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onComplete={(task) => onToggleComplete(task.id, !task.completed)}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                </div>
              </AnimatePresence>
            </LayoutGroup>
          ) : (
            <EmptyState
              title="No tasks found"
              description="Try changing your filters or add a new task"
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}