"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSavesStore } from "@/lib/stores/saves-store"

interface Skill {
  id: number
  name: string
  conflict: number[]
  insight: { level: number; difficulty: number; cost: number }[]
}

interface SkillCardProps {
  skill: Skill
}

const levelMap: Record<number, string> = {
  0: "基础",
  1: "普通",
  2: "进阶",
  3: "精通",
}

export function SkillCard({ skill }: SkillCardProps) {
  const { saves, currentSaveId, updateSkillsData } = useSavesStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState(0)

  const currentSave = currentSaveId ? saves[currentSaveId] : null
  const currentSkillData = currentSave?.skillsData?.find((s) => s.id === skill.id)
  const isLearned = !!currentSkillData
  const currentLevel = currentSkillData?.insightLevel ?? null

  useEffect(() => {
    if (isLearned && currentLevel !== null) {
      setSelectedLevel(currentLevel)
    } else {
      setSelectedLevel(0)
    }
  }, [isLearned, currentLevel])

  const openDialog = () => setIsDialogOpen(true)

  const removeConflictingSkills = () => {
    if (skill.conflict && skill.conflict.length > 0 && currentSave) {
      const updatedSkills = currentSave.skillsData.filter((s) => !skill.conflict.includes(s.id))
      if (currentSaveId) {
        updateSkillsData(currentSaveId, updatedSkills)
      }
    }
  }

  const learnSkill = () => {
    if (!currentSave || !currentSaveId) return

    const skillData = {
      id: skill.id,
      insightLevel: selectedLevel,
      currentLevel: currentSkillData ? currentSkillData.currentLevel : 1,
      targetedLevel: currentSkillData ? currentSkillData.targetedLevel : 299,
    }

    setIsDialogOpen(false)

    setTimeout(() => {
      removeConflictingSkills()

      const skillIndex = currentSave.skillsData.findIndex((s) => s.id === skill.id)
      let updatedSkills = [...currentSave.skillsData]

      if (skillIndex > -1) {
        updatedSkills[skillIndex] = skillData
      } else {
        updatedSkills.push(skillData)
      }

      updateSkillsData(currentSaveId, updatedSkills)
    }, 100)
  }

  const unlearnSkill = () => {
    if (!currentSave || !currentSaveId) return

    setIsDialogOpen(false)

    setTimeout(() => {
      const updatedSkills = currentSave.skillsData.filter((s) => s.id !== skill.id)
      updateSkillsData(currentSaveId, updatedSkills)
    }, 100)
  }

  const getLevelInfo = (level: number) => {
    return skill.insight.find((item) => item.level === level)
  }

  return (
    <>
      <Card
        onClick={openDialog}
        className="w-full cursor-pointer transition-all hover:shadow-md active:scale-95"
      >
        <CardHeader className="p-1">
          <CardTitle className="truncate text-center text-xs">{skill.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-1 pt-0">
          {isLearned ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/50 dark:text-green-200">
              已学会
            </span>
          ) : (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/50 dark:text-red-200">
              未学会
            </span>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="mx-auto my-4 max-w-[80vw] rounded-lg sm:max-w-[280px] md:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">{skill.name}</DialogTitle>
            <DialogDescription className="text-sm">
              {isLearned && currentLevel !== null ? (
                <>
                  状态：{levelMap[currentLevel]}，难度：
                  {getLevelInfo(currentLevel)?.difficulty}
                </>
              ) : (
                <>状态：未学会</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <Select
              value={selectedLevel.toString()}
              onValueChange={(v) => setSelectedLevel(Number(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择学习等级" />
              </SelectTrigger>
              <SelectContent>
                {skill.insight.map((levelInfo) => (
                  <SelectItem
                    key={levelInfo.level}
                    value={levelInfo.level.toString()}
                    className="text-sm"
                  >
                    <div className="font-medium">{levelMap[levelInfo.level]}</div>
                    <div className="text-xs text-muted-foreground">
                      残章：{levelInfo.cost} | 难度：{levelInfo.difficulty}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-2 flex flex-row flex-wrap justify-center gap-2 p-2">
            {isLearned && (
              <Button
                variant="destructive"
                onClick={unlearnSkill}
                className="flex-1 basis-24 py-2 text-xs sm:w-20 sm:flex-none"
              >
                删除
              </Button>
            )}
            <Button
              onClick={learnSkill}
              className="flex-1 basis-24 py-2 text-xs sm:w-20 sm:flex-none"
            >
              {isLearned ? "更新" : "学习"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
