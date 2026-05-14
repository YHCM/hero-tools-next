"use client"

import { useSavesStore } from "@/lib/stores/saves-store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CustomSkillItem } from "./custom-skill-item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

interface CustomSkillManageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomSkillManageDialog({ open, onOpenChange }: CustomSkillManageDialogProps) {
  const { customSkills, removeCustomSkill } = useSavesStore()

  const allCustomSkills = Object.entries(customSkills).flatMap(([category, skills]) =>
    skills.map((skill) => ({
      ...skill,
      category,
      difficulty: skill.insight[0]?.difficulty || 1.0,
    }))
  )

  const handleDelete = (id: number) => {
    removeCustomSkill(id)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="mx-auto my-4 max-w-[90vw] rounded-lg sm:max-w-[500px] md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>管理自定义技能</DialogTitle>
          <DialogDescription className="text-sm">
            共 {allCustomSkills.length} 个自定义技能
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {allCustomSkills.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">暂无自定义技能</div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {allCustomSkills.map((skill) => (
                <CustomSkillItem
                  key={skill.id}
                  id={skill.id}
                  name={skill.name}
                  category={skill.category}
                  difficulty={skill.difficulty}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="mt-4 p-2">
          <Button onClick={handleClose} className="w-full">
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
