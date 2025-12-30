import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AnimatedInput } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Cross2Icon, PlusCircledIcon } from "@radix-ui/react-icons"

interface TaskFilterProps {
  filters: {
    status: string;
    priority: string;
    search: string;
    tags: string[];
  };
  onFilterChange: (filters: {
    status: string;
    priority: string;
    search: string;
    tags: string[];
  }) => void;
}

export function TaskFilter({ filters, onFilterChange }: TaskFilterProps) {
  const [newTag, setNewTag] = React.useState("");

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value });
  };

  const handlePriorityChange = (value: string) => {
    onFilterChange({ ...filters, priority: value });
  };

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value });
  };

  const addTag = () => {
    if (newTag.trim() && !filters.tags.includes(newTag.trim())) {
      onFilterChange({
        ...filters,
        tags: [...filters.tags, newTag.trim()]
      });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onFilterChange({
      ...filters,
      tags: filters.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      addTag();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <AnimatedInput
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.priority} onValueChange={handlePriorityChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AnimatedInput
          placeholder="Add tag..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-w-xs"
        />
        <Button type="button" variant="secondary" size="sm" onClick={addTag}>
          <PlusCircledIcon className="h-4 w-4 mr-1" />
          Add Tag
        </Button>

        {filters.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 rounded-full hover:bg-secondary-foreground/20"
              aria-label={`Remove ${tag} tag`}
            >
              <Cross2Icon className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  )
}