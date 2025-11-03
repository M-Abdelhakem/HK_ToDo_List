"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { QuestList, Quest } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import {
  getLists as apiGetLists,
  createList as apiCreateList,
  updateList as apiUpdateList,
  deleteList as apiDeleteList,
  getListItems,
  createItem,
  updateItem,
  deleteItem,
} from "@/lib/api"

interface DataContextType {
  lists: QuestList[]
  addList: (title: string) => Promise<void>
  updateList: (id: string, title: string) => Promise<void>
  deleteList: (id: string) => Promise<void>
  addQuest: (listId: string, content: string, parentId: string | null) => Promise<void>
  updateQuest: (listId: string, questId: string, content: string) => Promise<void>
  deleteQuest: (listId: string, questId: string) => Promise<void>
  toggleQuestComplete: (listId: string, questId: string) => Promise<void>
  moveQuest: (questId: string, toListId: string, newParentId: string | null) => Promise<void>
  getListById: (id: string) => QuestList | undefined
  loading: boolean
  error: string | null
  refreshLists: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Transform backend item to frontend quest
function transformItemToQuest(item: any): Quest {
  return {
    id: item.id.toString(),
    content: item.title,
    isCompleted: item.completed,
    depth: item.level - 1, // Backend uses 1-based, frontend uses 0-based
    listId: item.list_id.toString(),
    parentId: item.parent_id ? item.parent_id.toString() : null,
    children: item.children ? item.children.map(transformItemToQuest) : [],
  }
}

// Transform backend list to frontend quest list
function transformListToQuestList(list: any): QuestList {
  return {
    id: list.id.toString(),
    title: list.title,
    userId: "", // Not used in frontend, but kept for compatibility
    quests: [], // Will be loaded separately
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [lists, setLists] = useState<QuestList[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshLists = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiGetLists()
      if (response.success && response.data?.lists) {
        // Transform backend lists to frontend format
        const transformedLists = response.data.lists.map(transformListToQuestList)
        
        // Load items for each list
        const listsWithItems = await Promise.all(
          transformedLists.map(async (list) => {
            const itemsResponse = await getListItems(parseInt(list.id))
            if (itemsResponse.success && itemsResponse.data?.items) {
              const quests = itemsResponse.data.items.map(transformItemToQuest)
              return { ...list, quests }
            }
            return list
          })
        )
        
        setLists(listsWithItems)
      } else {
        setError(response.error || "Failed to fetch lists")
      }
    } catch (err) {
      setError("Failed to fetch lists")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch lists when auth loading is complete and user is authenticated
    if (!authLoading && isAuthenticated) {
      refreshLists()
    } else if (!authLoading && !isAuthenticated) {
      // Clear lists if user becomes unauthenticated
      setLists([])
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated])

  const addList = async (title: string) => {
    try {
      const response = await apiCreateList(title)
      if (response.success) {
        await refreshLists()
      } else {
        setError(response.error || "Failed to create list")
      }
    } catch (err) {
      setError("Failed to create list")
    }
  }

  const updateList = async (id: string, title: string) => {
    try {
      const response = await apiUpdateList(parseInt(id), title)
      if (response.success) {
        await refreshLists()
      } else {
        setError(response.error || "Failed to update list")
      }
    } catch (err) {
      setError("Failed to update list")
    }
  }

  const deleteList = async (id: string) => {
    try {
      const response = await apiDeleteList(parseInt(id))
      if (response.success) {
        await refreshLists()
      } else {
        setError(response.error || "Failed to delete list")
      }
    } catch (err) {
      setError("Failed to delete list")
    }
  }

  const addQuest = async (listId: string, content: string, parentId: string | null) => {
    try {
      const response = await createItem(
        parseInt(listId),
        content,
        parentId ? parseInt(parentId) : undefined
      )
      if (response.success) {
        await refreshLists()
      } else {
        setError(response.error || "Failed to create quest")
      }
    } catch (err) {
      setError("Failed to create quest")
    }
  }

  const updateQuest = async (listId: string, questId: string, content: string) => {
    try {
      const response = await updateItem(parseInt(questId), { title: content })
      if (response.success) {
        await refreshLists()
      } else {
        setError(response.error || "Failed to update quest")
      }
    } catch (err) {
      setError("Failed to update quest")
    }
  }

  const deleteQuest = async (listId: string, questId: string) => {
    try {
      const response = await deleteItem(parseInt(questId))
      if (response.success) {
        await refreshLists()
      } else {
        setError(response.error || "Failed to delete quest")
      }
    } catch (err) {
      setError("Failed to delete quest")
    }
  }

  const toggleQuestComplete = async (listId: string, questId: string) => {
    // Find current quest to get completion status
    const allQuests = lists.flatMap((l) => getAllQuestsFlat(l.quests))
    const quest = allQuests.find((q) => q.id === questId)
    
    if (!quest) return

    try {
      const response = await updateItem(parseInt(questId), { completed: !quest.isCompleted })
      if (response.success) {
        await refreshLists()
      } else {
        setError(response.error || "Failed to toggle quest completion")
      }
    } catch (err) {
      setError("Failed to toggle quest completion")
    }
  }

  const moveQuest = async (questId: string, toListId: string, newParentId: string | null) => {
    try {
      const response = await updateItem(parseInt(questId), {
        list_id: parseInt(toListId),
        parent_id: newParentId ? parseInt(newParentId) : null,
      })
      if (response.success) {
        await refreshLists()
      } else {
        setError(response.error || "Failed to move quest")
      }
    } catch (err) {
      setError("Failed to move quest")
    }
  }

  // Helper function to flatten quest tree
  const getAllQuestsFlat = (quests: Quest[]): Quest[] => {
    let result: Quest[] = []
    for (const quest of quests) {
      result.push(quest)
      if (quest.children.length > 0) {
        result = result.concat(getAllQuestsFlat(quest.children))
      }
    }
    return result
  }

  const getListById = (id: string) => {
    return lists.find((list) => list.id === id)
  }

  return (
    <DataContext.Provider
      value={{
        lists,
        addList,
        updateList,
        deleteList,
        addQuest,
        updateQuest,
        deleteQuest,
        toggleQuestComplete,
        moveQuest,
        getListById,
        loading,
        error,
        refreshLists,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
