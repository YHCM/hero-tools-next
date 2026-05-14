"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { SkillListItem } from "./skill-list-item"

interface Skill {
  id: number
  name: string
  difficulty: number
  currentLevel: number
  targetLevel: number
  currentTrueEssence: number
  targetTrueEssence: number
}

interface Category {
  category: string
  open: boolean
  skills: Skill[]
}

interface SkillListProps {
  category: Category
  categoryIndex: number
  showEssence: boolean
  showCurrentEssence: boolean
  onToggleCategory: (index: number) => void
  onUpdateSkill: (
    categoryIndex: number,
    skillIndex: number,
    updatedSkill: { id: number; currentLevel: number; targetLevel: number }
  ) => void
}

export function SkillList({
  category,
  categoryIndex,
  showEssence,
  showCurrentEssence,
  onToggleCategory,
  onUpdateSkill,
}: SkillListProps) {
  const handleToggle = () => {
    onToggleCategory(categoryIndex)
  }

  const handleSkillUpdate = (
    skillIndex: number,
    skillId: number,
    updatedSkill: { id: number; currentLevel: number; targetLevel: number }
  ) => {
    onUpdateSkill(categoryIndex, skillIndex, updatedSkill)
  }

  return (
    <Collapsible open={category.open} className="w-full transition-all duration-200">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-auto w-full justify-between p-3 hover:no-underline"
          aria-expanded={category.open}
          onClick={handleToggle}
        >
          <span className="font-semibold">{category.category}</span>
          <ChevronDown
            className="h-4 w-4 transition-transform duration-200"
            style={{ transform: category.open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div>
          {category.skills.map((skill, skillIndex) => (
            <div key={skillIndex}>
              {skillIndex > 0 && <Separator />}
              <SkillListItem
                skillId={skill.id}
                skill={skill}
                showEssence={showEssence}
                showCurrentEssence={showCurrentEssence}
                onUpdate={(skillId, updatedSkill) =>
                  handleSkillUpdate(skillIndex, skillId, updatedSkill)
                }
              />
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
