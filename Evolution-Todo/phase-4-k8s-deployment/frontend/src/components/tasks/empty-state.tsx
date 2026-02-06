import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon } from "@radix-ui/react-icons"

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction
}: EmptyStateProps) {
  return (
    <Card className="text-center">
      <CardHeader className="items-center">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <p className="text-muted-foreground">
          {description}
        </p>
        {actionText && onAction && (
          <Button onClick={onAction}>
            <PlusIcon className="h-4 w-4 mr-2" />
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}