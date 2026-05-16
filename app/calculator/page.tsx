"use client"

import { useState, useMemo } from "react"
import skillsData from "@/app/data/skills.json"
import { useSavesStore } from "@/lib/stores/saves-store"
import { SkillList } from "@/components/tools/skill-list"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Skill {
  id: number
  name: string
  conflict: number[]
  insight: { level: number; difficulty: number; cost: number }[]
}

interface SkillsByCategory {
  [category: string]: Skill[]
}

interface SavedSkillData {
  id: number
  currentLevel: number
  targetedLevel: number
  insightLevel: number
}

interface MartialArtCategory {
  category: string
  open: boolean
  skills: Array<{
    name: string
    difficulty: number
    currentLevel: number
    targetLevel: number
    currentTrueEssence: number
    targetTrueEssence: number
    id: number
  }>
}

const categoryOrder = ["拳脚", "刀法", "剑法", "棍法", "鞭法", "暗器", "轻功"]

const calculateBaseEssence = (level: number, difficulty: number) => {
  const essence = (3 / 10127) * Math.pow(level, 3) * difficulty
  return Math.round(essence)
}

const processCategoryEssence = (
  skills: Array<{
    id: number
    name: string
    difficulty: number
    currentLevel: number
    targetLevel: number
  }>
) => {
  const skillsWithBaseEssence = skills.map((skill) => ({
    ...skill,
    baseCurrentEssence: calculateBaseEssence(skill.currentLevel, skill.difficulty),
    baseTargetEssence: calculateBaseEssence(skill.targetLevel, skill.difficulty),
  }))

  const maxCurrentEssence = Math.max(...skillsWithBaseEssence.map((s) => s.baseCurrentEssence))
  const maxTargetEssence = Math.max(...skillsWithBaseEssence.map((s) => s.baseTargetEssence))

  const firstMaxCurrentIndex = skillsWithBaseEssence.findIndex(
    (s) => s.baseCurrentEssence === maxCurrentEssence
  )
  const firstMaxTargetIndex = skillsWithBaseEssence.findIndex(
    (s) => s.baseTargetEssence === maxTargetEssence
  )

  return skillsWithBaseEssence.map((skill, index) => {
    let currentEssence =
      index === firstMaxCurrentIndex
        ? skill.baseCurrentEssence
        : Math.round(skill.baseCurrentEssence / 2)
    let targetEssence =
      index === firstMaxTargetIndex
        ? skill.baseTargetEssence
        : Math.round(skill.baseTargetEssence / 2)

    if (skill.currentLevel > 300) {
      currentEssence += 2
    }
    if (skill.targetLevel > 300) {
      targetEssence += 2
    }

    return {
      ...skill,
      currentTrueEssence: currentEssence,
      targetTrueEssence: targetEssence,
    }
  })
}

export default function CalculatorPage() {
  const { saves, currentSaveId, updateSkillsData, customSkills } = useSavesStore()
  const [showEssence, setShowEssence] = useState(true)
  const [showCurrentEssence, setShowCurrentEssence] = useState(false)
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(categoryOrder))

  const skillsByCategory = skillsData as SkillsByCategory

  const currentSkillsData = useMemo(() => {
    if (!currentSaveId) return []
    return saves[currentSaveId]?.skillsData || []
  }, [saves, currentSaveId])

  const baseMartialArts = useMemo(() => {
    const getDifficultyByInsightLevel = (insightArray: Skill["insight"], insightLevel: number) => {
      const insight = insightArray.find((item) => item.level === insightLevel)
      if (insight) return insight.difficulty
      if (insightArray.length > 0) return insightArray[insightArray.length - 1].difficulty
      return 1.0
    }

    const categories: Record<
      string,
      {
        category: string
        skills: Array<{
          id: number
          name: string
          difficulty: number
          currentLevel: number
          targetLevel: number
        }>
      }
    > = {}

    Object.entries(skillsByCategory).forEach(([category, skills]) => {
      if (category === "内功") return

      const allSkills = [...skills, ...(customSkills[category] || [])]

      allSkills.forEach((skill) => {
        const savedSkill = currentSkillsData.find((s) => s.id === skill.id)
        if (!savedSkill) return

        if (!categories[category]) {
          categories[category] = { category, skills: [] }
        }

        const difficulty = getDifficultyByInsightLevel(skill.insight, savedSkill?.insightLevel || 0)
        const currentLevel = savedSkill?.currentLevel || 1
        const targetLevel = savedSkill?.targetedLevel || 200

        categories[category].skills.push({
          id: skill.id,
          name: skill.name,
          difficulty,
          currentLevel,
          targetLevel,
        })
      })
    })

    return Object.values(categories)
      .sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category))
      .map((category) => ({
        ...category,
        skills: processCategoryEssence(category.skills),
      }))
  }, [skillsByCategory, currentSkillsData, customSkills])

  const martialArts: MartialArtCategory[] = useMemo(() => {
    return baseMartialArts.map((cat) => ({
      ...cat,
      open: openCategories.has(cat.category),
    }))
  }, [baseMartialArts, openCategories])

  const totalCurrentEssence = useMemo(() => {
    return baseMartialArts.reduce((total, category) => {
      return (
        total + category.skills.reduce((catTotal, skill) => catTotal + skill.currentTrueEssence, 0)
      )
    }, 0)
  }, [baseMartialArts])

  const totalTargetEssence = useMemo(() => {
    return baseMartialArts.reduce((total, category) => {
      return (
        total + category.skills.reduce((catTotal, skill) => catTotal + skill.targetTrueEssence, 0)
      )
    }, 0)
  }, [baseMartialArts])

  const toggleCategory = (categoryName: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryName)) {
        next.delete(categoryName)
      } else {
        next.add(categoryName)
      }
      return next
    })
  }

  const updateSkill = (
    categoryIndex: number,
    skillIndex: number,
    updatedSkill: { id: number; currentLevel: number; targetLevel: number }
  ) => {
    if (!currentSaveId) return

    const category = martialArts[categoryIndex]
    const skill = category.skills[skillIndex]
    const savedSkillIndex = currentSkillsData.findIndex((s) => s.id === skill.id)

    const existingSkill = currentSkillsData[savedSkillIndex]
    const existingInsightLevel = existingSkill ? existingSkill.insightLevel : 0

    const skillDataToSave: SavedSkillData = {
      id: skill.id,
      currentLevel: updatedSkill.currentLevel,
      targetedLevel: updatedSkill.targetLevel,
      insightLevel: existingInsightLevel,
    }

    const updatedSkillsData = [...currentSkillsData]

    if (savedSkillIndex > -1) {
      updatedSkillsData[savedSkillIndex] = skillDataToSave
    } else {
      updatedSkillsData.push(skillDataToSave)
    }

    updateSkillsData(currentSaveId, updatedSkillsData)
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="mb-2 flex w-full flex-wrap items-center justify-between gap-2 px-2 text-sm">
        <div>
          总真元：
          <span className={!showCurrentEssence ? "font-bold" : ""}>
            {" "}
            当前：{totalCurrentEssence}{" "}
          </span>
          <span className="mx-1">/</span>
          <span className={showCurrentEssence ? "font-bold" : ""}>目标：{totalTargetEssence}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span>真元</span>
            <Switch checked={showEssence} onCheckedChange={setShowEssence} />
          </div>

          <div className="flex items-center gap-1">
            <span
              className={!showCurrentEssence ? "cursor-pointer font-bold" : "cursor-pointer"}
              onClick={() => setShowCurrentEssence(false)}
            >
              当前
            </span>
            <Switch checked={showCurrentEssence} onCheckedChange={setShowCurrentEssence} />
            <span
              className={showCurrentEssence ? "cursor-pointer font-bold" : "cursor-pointer"}
              onClick={() => setShowCurrentEssence(true)}
            >
              目标
            </span>
          </div>
        </div>
      </div>

      <ScrollArea
        className="flex-1 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 10rem)", width: "100%" }}
      >
        <div className="w-full">
          {martialArts.map((category, index) => (
            <div key={category.category}>
              {index > 0 && <Separator />}
              <SkillList
                category={category}
                categoryIndex={index}
                showEssence={showEssence}
                showCurrentEssence={showCurrentEssence}
                onToggleCategory={toggleCategory}
                onUpdateSkill={updateSkill}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
