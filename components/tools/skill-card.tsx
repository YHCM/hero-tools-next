"use client"

import { useState, useEffect } from "react"
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
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

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

const getBorderColor = (skillId: number): string => {
  if (skillId >= 90000) return "border-cyan-500/60 dark:border-cyan-400/60 bg-cyan-500/5"
  const second = Math.floor(skillId / 1000) % 10
  switch (second) {
    case 1:
      return "border-emerald-500/50 dark:border-emerald-400/50 bg-emerald-500/5"
    case 2:
      return "border-violet-500/50 dark:border-violet-400/50 bg-violet-500/5"
    case 3:
      return "border-blue-500/50 dark:border-blue-400/50 bg-blue-500/5"
    case 4:
      return "border-rose-500/50 dark:border-rose-400/50 bg-rose-500/5"
    case 5:
      return "border-amber-500/50 dark:border-amber-400/50 bg-amber-500/5"
    default:
      return "border-border"
  }
}

export function SkillCard({ skill }: SkillCardProps) {
  const { saves, currentSaveId, updateSkillsData } = useSavesStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState(0)

  const currentSave = currentSaveId ? saves[currentSaveId] : null
  const currentSkillData = currentSave?.skillsData?.find((s) => s.id === skill.id)
  const isLearned = !!currentSkillData
  const currentLevel = currentSkillData?.insightLevel ?? null

  // Sync selectedLevel with current skill's insight level
  useEffect(() => {
    const newLevel = currentSkillData?.insightLevel ?? 0
    const timeout = setTimeout(() => {
      setSelectedLevel((prev) => (prev !== newLevel ? newLevel : prev))
    }, 0)
    return () => clearTimeout(timeout)
  }, [currentSkillData?.insightLevel])

  const openDialog = () => setIsDialogOpen(true)

  const learnSkill = () => {
    if (!currentSave || !currentSaveId) return

    setIsDialogOpen(false)

    setTimeout(() => {
      let updatedSkills = currentSave.skillsData
      if (skill.conflict && skill.conflict.length > 0) {
        updatedSkills = updatedSkills.filter((s) => !skill.conflict.includes(s.id))
      }

      const skillData = {
        id: skill.id,
        insightLevel: selectedLevel,
        currentLevel: currentSkillData ? currentSkillData.currentLevel : 1,
        targetedLevel: currentSkillData ? currentSkillData.targetedLevel : 299,
      }

      const skillIndex = updatedSkills.findIndex((s) => s.id === skill.id)
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
        className={cn(
          "w-full cursor-pointer border-2 transition-shadow hover:shadow-md",
          getBorderColor(skill.id)
        )}
      >
        <CardHeader className="p-1">
          <CardTitle className="truncate text-center text-sm">{skill.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-1 pt-0">
          {isLearned ? (
            <Badge variant="secondary" className="text-xs">
              已学会
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              未学会
            </Badge>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="mx-auto my-4 rounded-lg sm:max-w-[280px] md:max-w-md">
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
