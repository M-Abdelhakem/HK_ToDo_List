// Type definitions for Hollow Knight Quest Journal

export interface User {
  id: string
  username: string
  name: string
}

export interface Quest {
  id: string
  content: string
  isCompleted: boolean
  depth: number // 0, 1, or 2
  listId: string
  parentId: string | null
  children: Quest[]
}

export interface QuestList {
  id: string
  title: string
  userId: string
  quests: Quest[]
}
