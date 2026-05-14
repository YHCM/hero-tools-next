"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { customAlphabet } from "nanoid"

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
const generateId = customAlphabet(ALPHABET, 7)

export function generateSaveColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `oklch(45% 0.12 ${hue})`
}

interface SkillData {
  id: number
  currentLevel: number
  targetedLevel: number
  insightLevel: number
}

interface CustomSkill {
  id: number
  name: string
  conflict: number[]
  insight: { level: number; difficulty: number; cost: number }[]
}

interface Save {
  id: string
  name: string
  baseData: Record<string, unknown>
  skillsData: SkillData[]
}

interface SavesState {
  saves: Record<string, Save>
  currentSaveId: string | null
  customSkills: Record<string, CustomSkill[]>
  customSkillsNextId: number
  initDefaults: () => void
  createDefaultSave: () => string
  isNameDuplicate: (name: string, excludeId?: string | null) => boolean
  isSaveExisted: (saveId: string) => boolean
  createSave: (name?: string) => string
  getSave: (saveId: string) => Save | undefined
  updateSaveName: (saveId: string, newName: string) => boolean
  updateBaseData: (saveId: string, baseData: Record<string, unknown>) => boolean
  updateSkillsData: (saveId: string, skillsData: SkillData[]) => boolean
  deleteSave: (saveId: string) => boolean
  setCurrentSave: (saveId: string) => boolean
  exportAllData: () => {
    version: number
    exportedAt: string
    saves: Record<string, Save>
    customSkills: Record<string, CustomSkill[]>
    customSkillsNextId: number
  }
  importAllData: (data: {
    version: number
    saves: Record<string, Save>
    customSkills: Record<string, CustomSkill[]>
    customSkillsNextId: number
  }) => boolean
  importSave: (data: { save: Save }) => boolean
  addCustomSkill: (name: string, category: string, difficulty: number) => boolean
  removeCustomSkill: (id: number) => void
}

export const useSavesStore = create<SavesState>()(
  persist(
    (set, get) => ({
      saves: {},
      currentSaveId: null,
      customSkills: {},
      customSkillsNextId: 90001,

      initDefaults: () => {
        if (Object.keys(get().saves).length === 0) {
          const defaultId = get().createDefaultSave()
          set({ currentSaveId: defaultId })
        }
      },

      createDefaultSave: () => {
        const saveId = generateId()
        const newSave: Save = {
          id: saveId,
          name: saveId,
          baseData: {},
          skillsData: [],
        }
        set((state) => ({
          saves: { ...state.saves, [saveId]: newSave },
        }))
        return saveId
      },

      isNameDuplicate: (name: string, excludeId?: string | null) => {
        return Object.values(get().saves).some((save) => {
          if (excludeId && save.id === excludeId) return false
          return save.name === name
        })
      },

      isSaveExisted: (saveId: string) => {
        return !!get().saves[saveId]
      },

      createSave: (name?: string) => {
        const saveId = generateId()
        const newSave: Save = {
          id: saveId,
          name: name || saveId,
          baseData: {},
          skillsData: [],
        }
        set((state) => ({
          saves: { ...state.saves, [saveId]: newSave },
        }))
        return saveId
      },

      getSave: (saveId: string) => {
        return get().saves[saveId]
      },

      updateSaveName: (saveId: string, newName: string) => {
        const trimmedName = newName.trim()
        if (!get().isSaveExisted(saveId)) return false
        if (trimmedName === "") return false
        if (get().isNameDuplicate(trimmedName, saveId)) return false

        set((state) => ({
          saves: {
            ...state.saves,
            [saveId]: { ...state.saves[saveId], name: trimmedName },
          },
        }))
        return true
      },

      updateBaseData: (saveId: string, baseData: Record<string, unknown>) => {
        if (!get().isSaveExisted(saveId)) return false

        set((state) => ({
          saves: {
            ...state.saves,
            [saveId]: {
              ...state.saves[saveId],
              baseData: { ...state.saves[saveId].baseData, ...baseData },
            },
          },
        }))
        return true
      },

      updateSkillsData: (saveId: string, skillsData: SkillData[]) => {
        if (!get().isSaveExisted(saveId)) return false
        if (!Array.isArray(skillsData)) return false

        set((state) => ({
          saves: {
            ...state.saves,
            [saveId]: { ...state.saves[saveId], skillsData: [...skillsData] },
          },
        }))
        return true
      },

      deleteSave: (saveId: string) => {
        if (Object.keys(get().saves).length <= 1) return false

        const remainingIds = Object.keys(get().saves).filter((id) => id !== saveId)
        if (get().currentSaveId === saveId) {
          set({ currentSaveId: remainingIds[0] })
        }

        set((state) => {
          const newSaves = { ...state.saves }
          delete newSaves[saveId]
          return { saves: newSaves }
        })
        return true
      },

      setCurrentSave: (saveId: string) => {
        if (get().isSaveExisted(saveId)) {
          set({ currentSaveId: saveId })
          return true
        }
        return false
      },

      exportAllData: () => {
        const { saves, customSkills, customSkillsNextId } = get()
        return {
          version: 1,
          exportedAt: new Date().toISOString(),
          saves,
          customSkills,
          customSkillsNextId,
        }
      },

      importAllData: (data) => {
        if (!data?.saves || !data?.customSkills) return false
        set({
          saves: data.saves,
          customSkills: data.customSkills,
          customSkillsNextId: data.customSkillsNextId || 90001,
        })
        return true
      },

      importSave: (data: { save: Save }) => {
        if (!data?.save?.id || !data?.save?.name) return false
        const { save } = data
        set((state) => ({
          saves: { ...state.saves, [save.id]: save },
        }))
        return true
      },

      addCustomSkill: (name: string, category: string, difficulty: number) => {
        const { customSkills, customSkillsNextId } = get()
        if (customSkillsNextId > 99999) return false

        const newSkill: CustomSkill = {
          id: customSkillsNextId,
          name,
          conflict: [],
          insight: [{ level: 0, difficulty, cost: 0 }],
        }

        set({
          customSkills: {
            ...customSkills,
            [category]: [...(customSkills[category] || []), newSkill],
          },
          customSkillsNextId: customSkillsNextId + 1,
        })
        return true
      },

      removeCustomSkill: (id: number) => {
        const { customSkills, saves } = get()

        // Remove from customSkills
        const updatedCustomSkills: Record<string, CustomSkill[]> = {}
        Object.entries(customSkills).forEach(([category, skills]) => {
          const filtered = skills.filter((s) => s.id !== id)
          if (filtered.length > 0) {
            updatedCustomSkills[category] = filtered
          }
        })

        // Remove from all saves' skillsData
        const updatedSaves: Record<string, Save> = {}
        Object.entries(saves).forEach(([saveId, save]) => {
          updatedSaves[saveId] = {
            ...save,
            skillsData: save.skillsData.filter((s) => s.id !== id),
          }
        })

        set({
          customSkills: updatedCustomSkills,
          saves: updatedSaves,
        })
      },
    }),
    { name: "hero-tools-saves" }
  )
)
