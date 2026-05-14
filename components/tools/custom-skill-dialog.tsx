"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { useSavesStore } from "@/lib/stores/saves-store"

interface CustomSkillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const categoryOrder = ["拳脚", "刀法", "剑法", "棍法", "鞭法", "暗器", "轻功", "内功"]

export function CustomSkillDialog({ open, onOpenChange }: CustomSkillDialogProps) {
  const { customSkillsNextId, addCustomSkill } = useSavesStore()
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [difficulty, setDifficulty] = useState(1.0)

  const isAtLimit = customSkillsNextId > 99999

  const handleSubmit = () => {
    if (!name.trim() || !category) return
    if (isAtLimit) return

    addCustomSkill(name.trim(), category, difficulty)
    setName("")
    setCategory("")
    setDifficulty(1.0)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setName("")
    setCategory("")
    setDifficulty(1.0)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="mx-auto my-4 rounded-lg sm:max-w-[280px] md:max-w-md">
        <DialogHeader>
          <DialogTitle>添加自定义技能</DialogTitle>
          <DialogDescription className="text-sm">
            {isAtLimit ? "已达到最大数量限制（9999个）" : "填写技能信息添加自定义技能"}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">技能名称</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入技能名称"
              disabled={isAtLimit}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">技能分类</label>
            <Select value={category} onValueChange={setCategory} disabled={isAtLimit}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择技能分类" />
              </SelectTrigger>
              <SelectContent>
                {categoryOrder.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">难度：{difficulty.toFixed(1)}</label>
            <Slider
              value={[difficulty]}
              onValueChange={(v) => setDifficulty(v[0])}
              min={1.0}
              max={2.0}
              step={0.1}
              disabled={isAtLimit}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1.0</span>
              <span>2.0</span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 flex flex-row flex-wrap justify-center gap-2 p-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 basis-24 py-2 text-xs sm:w-20 sm:flex-none"
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !category || isAtLimit}
            className="flex-1 basis-24 py-2 text-xs sm:w-20 sm:flex-none"
          >
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
