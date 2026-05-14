"use client"

import { CircleMinus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CustomSkillItemProps {
  id: number
  name: string
  category: string
  difficulty: number
  onDelete: (id: number) => void
}

export function CustomSkillItem({
  id,
  name,
  category,
  difficulty,
  onDelete,
}: CustomSkillItemProps) {
  return (
    <Card className="w-full transition-all hover:shadow-md">
      <CardHeader className="flex items-center justify-center p-1">
        <CardTitle className="flex-1 truncate text-center text-xs leading-none">{name}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0 p-0 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(id)}
        >
          <CircleMinus className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="flex justify-center p-1 pt-0">
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
          {category} · {difficulty.toFixed(1)}
        </span>
      </CardContent>
    </Card>
  )
}
