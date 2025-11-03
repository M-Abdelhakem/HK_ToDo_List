"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { Header } from "@/components/header"
import { QuestItem } from "@/components/quest-item"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil } from "lucide-react"
import type { Quest } from "@/lib/types"

export default function ListViewPage() {
  const router = useRouter()
  const params = useParams()
  const listId = params.id as string
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { lists, getListById, addQuest, updateQuest, deleteQuest, toggleQuestComplete, moveQuest, updateList } =
    useData()

  const [list, setList] = useState(getListById(listId))
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
  const [isEditTitleDialogOpen, setIsEditTitleDialogOpen] = useState(false)

  const [newQuestContent, setNewQuestContent] = useState("")
  const [newQuestParentId, setNewQuestParentId] = useState<string | null>(null)
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null)
  const [editingQuestContent, setEditingQuestContent] = useState("")
  const [deletingQuestId, setDeletingQuestId] = useState<string | null>(null)
  const [movingQuestId, setMovingQuestId] = useState<string | null>(null)
  const [moveToListId, setMoveToListId] = useState<string>("")
  const [moveToParentId, setMoveToParentId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  useEffect(() => {
    // Only redirect if auth check is complete and user is not authenticated
    // Wait for isLoading to be false before redirecting to prevent premature redirects
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    const updatedList = getListById(listId)
    setList(updatedList)
  }, [lists, listId, getListById])

  // Show loading spinner while checking auth status
  if (authLoading) {
    return null
  }

  // Redirect if not authenticated (handled by useEffect above)
  if (!isAuthenticated || !list) {
    return null
  }

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

  const allQuests = getAllQuestsFlat(list.quests)
  const availableParents = allQuests // no depth limit for creation UI now

  // Move dialog helpers
  const movingQuest = movingQuestId ? allQuests.find((q) => q.id === movingQuestId) : null
  const movingSubtreeIds = movingQuest ? getAllQuestsFlat([movingQuest]).map((q) => q.id) : []
  const destinationQuestsFlat = moveToListId ? getAllQuestsFlat(getListById(moveToListId)?.quests || []) : []

  const handleAddQuest = async () => {
    if (newQuestContent.trim()) {
      await addQuest(listId, newQuestContent.trim(), newQuestParentId)
      setNewQuestContent("")
      setNewQuestParentId(null)
      setIsAddDialogOpen(false)
    }
  }

  const handleEditQuest = async () => {
    if (editingQuestId && editingQuestContent.trim()) {
      await updateQuest(listId, editingQuestId, editingQuestContent.trim())
      setEditingQuestId(null)
      setEditingQuestContent("")
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteQuest = async () => {
    if (deletingQuestId) {
      await deleteQuest(listId, deletingQuestId)
      setDeletingQuestId(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleMoveQuest = async () => {
    if (movingQuestId && moveToListId) {
      await moveQuest(movingQuestId, moveToListId, moveToParentId)
      setMovingQuestId(null)
      setMoveToListId("")
      setMoveToParentId(null)
      setIsMoveDialogOpen(false)
    }
  }

  const handleEditTitle = async () => {
    if (editingTitle.trim()) {
      await updateList(listId, editingTitle.trim())
      setEditingTitle("")
      setIsEditTitleDialogOpen(false)
    }
  }

  const openEditDialog = (questId: string, currentContent: string) => {
    setEditingQuestId(questId)
    setEditingQuestContent(currentContent)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (questId: string) => {
    setDeletingQuestId(questId)
    setIsDeleteDialogOpen(true)
  }

  const openMoveDialog = (questId: string) => {
    setMovingQuestId(questId)
    setMoveToListId(listId) // default to current list to allow reparenting within the same journal
    setMoveToParentId(null)
    setIsMoveDialogOpen(true)
  }

  const openAddChildDialog = (parentId: string) => {
    setNewQuestParentId(parentId)
    setIsAddDialogOpen(true)
  }

  const openEditTitleDialog = () => {
    setEditingTitle(list.title)
    setIsEditTitleDialogOpen(true)
  }

  return (
    <div className="min-h-screen">
      <Header title={list.title} showBackButton onBack={() => router.push("/home")} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">{list.title}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={openEditTitleDialog}
              className="h-8 w-8 hover:bg-primary/20 hover:text-primary"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-primary hover:bg-accent-hover text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Mark Quest
          </Button>
        </div>

        {list.quests.length === 0 ? (
          <EmptyState
            message="No quests recorded on this path... Begin your journey."
            actionLabel="Mark Quest"
            onAction={() => setIsAddDialogOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {list.quests.map((quest) => (
              <QuestItem
                key={quest.id}
                quest={quest}
                onToggleComplete={(questId) => toggleQuestComplete(listId, questId)}
                onEdit={(questId) => {
                  const q = allQuests.find((quest) => quest.id === questId)
                  if (q) openEditDialog(questId, q.content)
                }}
                onDelete={openDeleteDialog}
                onAddChild={openAddChildDialog}
                onMove={openMoveDialog}
              />
            ))}
          </div>
        )}
      </main>


      {/* Add Quest Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-card border-2 border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-primary">Mark New Quest</DialogTitle>
            <DialogDescription className="text-muted-foreground">Record a new quest in your journal.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Quest Details</label>
              <Textarea
                value={newQuestContent}
                onChange={(e) => setNewQuestContent(e.target.value)}
                placeholder="Describe your quest..."
                className="bg-input border-border focus:border-primary min-h-[100px]"
              />
            </div>
            {availableParents.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Parent Quest (Optional)</label>
                <Select
                  value={newQuestParentId || "none"}
                  onValueChange={(value) => setNewQuestParentId(value === "none" ? null : value)}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select parent quest..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-primary/30">
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {availableParents.map((quest) => (
                      <SelectItem key={quest.id} value={quest.id}>
                        {"  ".repeat(quest.depth)}
                        {quest.content.substring(0, 50)}
                        {quest.content.length > 50 ? "..." : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false)
                setNewQuestContent("")
                setNewQuestParentId(null)
              }}
              className="border-border hover:bg-secondary"
            >
              Retreat
            </Button>
            <Button
              onClick={handleAddQuest}
              disabled={!newQuestContent.trim()}
              className="bg-primary hover:bg-accent-hover text-primary-foreground"
            >
              Inscribe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Quest Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card border-2 border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-primary">Refine Quest</DialogTitle>
            <DialogDescription className="text-muted-foreground">Update the details of your quest.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editingQuestContent}
              onChange={(e) => setEditingQuestContent(e.target.value)}
              placeholder="Quest details..."
              className="bg-input border-border focus:border-primary min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setEditingQuestId(null)
                setEditingQuestContent("")
              }}
              className="border-border hover:bg-secondary"
            >
              Retreat
            </Button>
            <Button
              onClick={handleEditQuest}
              disabled={!editingQuestContent.trim()}
              className="bg-primary hover:bg-accent-hover text-primary-foreground"
            >
              Inscribe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Quest Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-2 border-destructive/30">
          <DialogHeader>
            <DialogTitle className="text-destructive">Abandon Quest</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you certain? This quest and all sub-quests will be lost to the void.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setDeletingQuestId(null)
              }}
              className="border-border hover:bg-secondary"
            >
              Retreat
            </Button>
            <Button
              onClick={handleDeleteQuest}
              className="bg-destructive hover:bg-destructive/80 text-destructive-foreground"
            >
              Abandon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Quest Dialog */}
      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent className="bg-card border-2 border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-primary">Redirect Path</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Move this quest to a different journal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Destination Journal</label>
              <Select value={moveToListId} onValueChange={(v) => { setMoveToListId(v); setMoveToParentId(null) }}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select destination..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-primary/30">
                {lists.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.title}{l.id === listId ? " (Current)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Parent Quest</label>
              <Select value={moveToParentId || "none"} onValueChange={(v) => setMoveToParentId(v === "none" ? null : v)} disabled={!moveToListId}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select parent (or Top Level)" />
                </SelectTrigger>
                <SelectContent className="bg-card border-primary/30 max-h-72 overflow-auto">
                  <SelectItem value="none">Top Level</SelectItem>
                  {moveToListId &&
                    destinationQuestsFlat
                      .filter((q) => !movingSubtreeIds.includes(q.id))
                      .map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          {"→ ".repeat(Math.max(0, q.depth))}
                          {q.content.substring(0, 60)}{q.content.length > 60 ? "…" : ""}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsMoveDialogOpen(false)
                setMovingQuestId(null)
                setMoveToListId("")
                setMoveToParentId(null)
              }}
              className="border-border hover:bg-secondary"
            >
              Retreat
            </Button>
            <Button
              onClick={handleMoveQuest}
              disabled={!moveToListId}
              className="bg-primary hover:bg-accent-hover text-primary-foreground"
            >
              Redirect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Title Dialog */}
      <Dialog open={isEditTitleDialogOpen} onOpenChange={setIsEditTitleDialogOpen}>
        <DialogContent className="bg-card border-2 border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-primary">Refine Path Name</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update the name of this quest journal.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              placeholder="Path name..."
              className="bg-input border-border focus:border-primary"
              onKeyDown={(e) => e.key === "Enter" && handleEditTitle()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditTitleDialogOpen(false)
                setEditingTitle("")
              }}
              className="border-border hover:bg-secondary"
            >
              Retreat
            </Button>
            <Button
              onClick={handleEditTitle}
              disabled={!editingTitle.trim()}
              className="bg-primary hover:bg-accent-hover text-primary-foreground"
            >
              Inscribe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
