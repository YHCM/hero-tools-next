"use client"

import { useState, useMemo } from "react"
import skillsData from "@/app/data/skills.json"
import { SkillCard } from "@/components/tools/skill-card"
import { CustomSkillDialog } from "@/components/tools/custom-skill-dialog"
import { CustomSkillManageDialog } from "@/components/tools/custom-skill-manage-dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSavesStore } from "@/lib/stores/saves-store"
import { Plus, Settings } from "lucide-react"

interface Skill {
  id: number
  name: string
  conflict: number[]
  insight: { level: number; difficulty: number; cost: number }[]
}

type SkillsByCategory = Record<string, Skill[]>

export default function SkillsPage() {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false)
  const { customSkills } = useSavesStore()

  const skillsByCategory = skillsData as SkillsByCategory

  const categories = useMemo(() => Object.keys(skillsByCategory), [skillsByCategory])

  const filteredSkills = useMemo(() => {
    if (selectedCategory) {
      const systemSkills = skillsByCategory[selectedCategory] || []
      const customInCategory = customSkills[selectedCategory] || []
      return [...systemSkills, ...customInCategory]
    }
    const systemSkills = Object.values(skillsByCategory).flat()
    const allCustomSkills = Object.values(customSkills).flat()
    return [...systemSkills, ...allCustomSkills]
  }, [skillsByCategory, selectedCategory, customSkills])

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="mb-6 flex w-full max-w-md items-center gap-2">
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="选择技能类别" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setIsAddDialogOpen(true)} size="icon" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
        <Button onClick={() => setIsManageDialogOpen(true)} size="icon" variant="outline">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea
        className="flex-1 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 10rem)", width: "100%" }}
      >
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {filteredSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </ScrollArea>

      <CustomSkillDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      <CustomSkillManageDialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen} />
    </div>
  )
}
