"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useData } from "@/contexts/data-context"
import { Header } from "@/components/header"
import { ListCard } from "@/components/list-card"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { lists, addList, updateList, deleteList, loading, error } = useData()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newListTitle, setNewListTitle] = useState("")
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [editingListTitle, setEditingListTitle] = useState("")
  const [deletingListId, setDeletingListId] = useState<string | null>(null)

  useEffect(() => {
    // Only redirect if auth check is complete and user is not authenticated
    // Wait for isLoading to be false before redirecting to prevent premature redirects
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

  const handleAddList = async () => {
    if (newListTitle.trim()) {
      await addList(newListTitle.trim())
      setNewListTitle("")
      setIsAddDialogOpen(false)
    }
  }

  const handleEditList = async () => {
    if (editingListId && editingListTitle.trim()) {
      await updateList(editingListId, editingListTitle.trim())
      setEditingListId(null)
      setEditingListTitle("")
      setIsEditDialogOpen(false)
    }
  }

  const handleDeleteList = async () => {
    if (deletingListId) {
      await deleteList(deletingListId)
      setDeletingListId(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const openEditDialog = (listId: string, currentTitle: string) => {
    setEditingListId(listId)
    setEditingListTitle(currentTitle)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (listId: string) => {
    setDeletingListId(listId)
    setIsDeleteDialogOpen(true)
  }

  // Show loading spinner while checking auth status
  if (authLoading) {
    return null
  }

  // Redirect if not authenticated (handled by useEffect above)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header title="Hallownest Quest Journal" showLogout />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Your Paths</h2>
            <p className="text-muted-foreground">Navigate the depths and conquer your quests</p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-primary hover:bg-accent-hover text-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-primary/50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Open New Path
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : lists.length === 0 ? (
          <EmptyState
            message="No paths recorded yet... The journey awaits."
            actionLabel="Open New Path"
            onAction={() => setIsAddDialogOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onClick={() => router.push(`/lists/${list.id}`)}
                onEdit={() => openEditDialog(list.id, list.title)}
                onDelete={() => openDeleteDialog(list.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add List Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-card border-2 border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-primary">Open New Path</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Name your new quest journal to begin your journey.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder="Path name..."
              className="bg-input border-border focus:border-primary"
              onKeyDown={(e) => e.key === "Enter" && handleAddList()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false)
                setNewListTitle("")
              }}
              className="border-border hover:bg-secondary"
            >
              Retreat
            </Button>
            <Button
              onClick={handleAddList}
              disabled={!newListTitle.trim()}
              className="bg-primary hover:bg-accent-hover text-primary-foreground"
            >
              Inscribe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit List Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card border-2 border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-primary">Refine Path</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update the name of your quest journal.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editingListTitle}
              onChange={(e) => setEditingListTitle(e.target.value)}
              placeholder="Path name..."
              className="bg-input border-border focus:border-primary"
              onKeyDown={(e) => e.key === "Enter" && handleEditList()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setEditingListId(null)
                setEditingListTitle("")
              }}
              className="border-border hover:bg-secondary"
            >
              Retreat
            </Button>
            <Button
              onClick={handleEditList}
              disabled={!editingListTitle.trim()}
              className="bg-primary hover:bg-accent-hover text-primary-foreground"
            >
              Inscribe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete List Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-2 border-destructive/30">
          <DialogHeader>
            <DialogTitle className="text-destructive">Abandon Path</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you certain? This path and all its quests will be lost to the void.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setDeletingListId(null)
              }}
              className="border-border hover:bg-secondary"
            >
              Retreat
            </Button>
            <Button
              onClick={handleDeleteList}
              className="bg-destructive hover:bg-destructive/80 text-destructive-foreground"
            >
              Abandon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
