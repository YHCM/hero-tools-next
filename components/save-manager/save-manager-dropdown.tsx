"use client"

import { useState, useRef } from "react"
import { useSavesStore, generateSaveColor } from "@/lib/stores/saves-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ChevronDown, Plus, Trash2, Download, Upload, FolderArchive, Pencil } from "lucide-react"

interface SaveManagerDropdownProps {
  className?: string
}

export function SaveManagerDropdown({ className }: SaveManagerDropdownProps) {
  const {
    saves,
    currentSaveId,
    createSave,
    deleteSave,
    setCurrentSave,
    exportAllData,
    importAllData,
    updateSaveName,
  } = useSavesStore()
  const currentSave = currentSaveId ? saves[currentSaveId] : null

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [newSaveName, setNewSaveName] = useState("")
  const [renameValue, setRenameValue] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCreate = () => {
    if (newSaveName.trim()) {
      const newId = createSave(newSaveName.trim())
      setCurrentSave(newId)
      setNewSaveName("")
      setIsCreateOpen(false)
    }
  }

  const handleDelete = () => {
    if (currentSaveId) {
      deleteSave(currentSaveId)
      setIsDeleteOpen(false)
    }
  }

  const handleRename = () => {
    if (currentSaveId && renameValue.trim()) {
      updateSaveName(currentSaveId, renameValue.trim())
      setIsRenameOpen(false)
      setRenameValue("")
    }
  }

  const openRename = () => {
    if (currentSave) {
      setRenameValue(currentSave.name)
      setIsRenameOpen(true)
    }
  }

  const handleExport = () => {
    const data = exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hero-tools-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (data?.saves && data?.customSkills) {
          importAllData(data)
        }
      } catch {
        console.error("Invalid backup file")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`flex w-full items-center justify-start gap-2 px-2 ${className}`}
          >
            <FolderArchive className="h-4 w-4" />
            <span className="flex flex-1 items-center gap-1.5 truncate text-sm font-normal">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{
                  backgroundColor: currentSave ? generateSaveColor(currentSave.id) : "#888",
                }}
              />
              <span className="truncate">{currentSave?.name || "无存档"}</span>
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>存档列表</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.values(saves).map((save) => (
            <DropdownMenuItem
              key={save.id}
              onClick={() => setCurrentSave(save.id)}
              className="flex items-center gap-2"
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: generateSaveColor(save.id) }}
                />
                <span className="truncate">{save.name}</span>
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新建存档
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            导出数据
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            导入数据
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openRename} disabled={!currentSave}>
            <Pencil className="mr-2 h-4 w-4" />
            重命名存档
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteOpen(true)}
            variant="destructive"
            disabled={Object.keys(saves).length <= 1}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除当前存档
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>新建存档</AlertDialogTitle>
            <AlertDialogDescription>输入存档名称</AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={newSaveName}
            onChange={(e) => setNewSaveName(e.target.value)}
            placeholder="存档名称"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsCreateOpen(false)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreate}>创建</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除存档</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除存档 &quot;{currentSave?.name}&quot; 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteOpen(false)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} variant="destructive">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>重命名存档</AlertDialogTitle>
            <AlertDialogDescription>输入新的存档名称</AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="存档名称"
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsRenameOpen(false)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleRename}>保存</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
    </>
  )
}
