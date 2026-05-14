"use client"

import { Input } from "@/components/ui/input"

interface SkillListItemProps {
  skillId: number
  skill: {
    name: string
    difficulty: number
    currentLevel: number
    targetLevel: number
    currentTrueEssence: number
    targetTrueEssence: number
  }
  showEssence: boolean
  showCurrentEssence: boolean
  onUpdate: (
    skillId: number,
    updatedSkill: { id: number; currentLevel: number; targetLevel: number }
  ) => void
}

export function SkillListItem({
  skillId,
  skill,
  showEssence,
  showCurrentEssence,
  onUpdate,
}: SkillListItemProps) {
  const handleLevelChange = (field: "currentLevel" | "targetLevel", value: number) => {
    onUpdate(skillId, {
      ...skill,
      id: skillId,
      [field]: value,
    })
  }

  return (
    <div className="flex items-center gap-1 p-3 text-sm transition-colors hover:bg-muted/50 sm:gap-2">
      <span className="flex-1 truncate font-medium">
        {skill.name}
        <span className="text-muted-foreground"> [{skill.difficulty}] </span>
      </span>

      {showEssence && (
        <span className="w-14 text-right text-muted-foreground sm:w-16">
          {!showCurrentEssence ? skill.currentTrueEssence : skill.targetTrueEssence}
        </span>
      )}

      <Input
        type="number"
        min={1}
        max={621}
        value={skill.currentLevel}
        onChange={(e) => handleLevelChange("currentLevel", Number(e.target.value))}
        className="h-8 w-16 [appearance:textfield] text-center text-xs sm:w-20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      <Input
        type="number"
        min={1}
        max={621}
        value={skill.targetLevel}
        onChange={(e) => handleLevelChange("targetLevel", Number(e.target.value))}
        className="h-8 w-16 [appearance:textfield] text-center text-xs sm:w-20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
    </div>
  )
}
