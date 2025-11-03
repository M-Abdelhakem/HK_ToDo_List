"use client"

import type { QuestList, Quest } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, CheckCircle2, Circle } from "lucide-react"

interface ListCardProps {
  list: QuestList
  onEdit: () => void
  onDelete: () => void
  onClick: () => void
}

export function ListCard({ list, onEdit, onDelete, onClick }: ListCardProps) {
  const questCount = countAllQuests(list.quests)
  const topLevelQuests = list.quests // Removed the slice(0, 5) limit to show all quests

  return (
    <div
      className="group relative bg-card border-2 border-primary/30 rounded-lg p-6 cursor-pointer transition-all duration-300 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 flex flex-col"
      onClick={onClick}
    >
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="h-8 w-8 hover:bg-primary/20 hover:text-primary"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-3 pr-20">{list.title}</h3>

      <div className="flex items-center gap-2 mb-4">
        <div className="px-3 py-1 bg-primary/20 border border-primary/40 rounded-full">
          <span className="text-sm text-primary font-semibold">
            {questCount} {questCount === 1 ? "Quest" : "Quests"}
          </span>
        </div>
      </div>

      {topLevelQuests.length > 0 ? (
        <div className="flex flex-col gap-2 flex-1">
          {topLevelQuests.map((quest) => (
            <QuestPreview key={quest.id} quest={quest} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm italic py-4">
          No quests yet...
        </div>
      )}
    </div>
  )
}

function QuestPreview({ quest }: { quest: Quest }) {
  const hasChildren = quest.children && quest.children.length > 0

  return (
    <div className="flex items-start gap-2 text-sm group/quest">
      {quest.isCompleted ? (
        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p
          className={`truncate ${
            quest.isCompleted ? "line-through text-muted-foreground opacity-60" : "text-foreground"
          }`}
        >
          {quest.content}
        </p>
        {hasChildren && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {quest.children.length} sub-{quest.children.length === 1 ? "quest" : "quests"}
          </p>
        )}
      </div>
    </div>
  )
}

function countAllQuests(quests: any[]): number {
  let count = 0
  for (const quest of quests) {
    count++
    if (quest.children && quest.children.length > 0) {
      count += countAllQuests(quest.children)
    }
  }
  return count
}
