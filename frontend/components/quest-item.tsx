"use client"

import { useState } from "react"
import type { Quest } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronRight, Pencil, Trash2, Plus, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuestItemProps {
  quest: Quest
  onToggleComplete: (questId: string) => void
  onEdit: (questId: string) => void
  onDelete: (questId: string) => void
  onAddChild: (parentId: string) => void
  onMove?: (questId: string) => void
}

export function QuestItem({ quest, onToggleComplete, onEdit, onDelete, onAddChild, onMove }: QuestItemProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const hasChildren = quest.children && quest.children.length > 0
  const canHaveChildren = true
  const canMove = true

  const visualDepth = Math.max(0, quest.depth)
  const indentPx = Math.min(visualDepth, 5) * 32 // cap visual indent at 5 levels
  const depthLabel = visualDepth >= 5 ? `L${visualDepth + 1}` : null
  const fontSizeClass = visualDepth >= 8 ? "text-xs" : visualDepth >= 5 ? "text-sm" : "text-base"

  return (
    <div className={cn("space-y-2")} style={{ marginLeft: `${indentPx}px` }}>
      <div
        className={cn(
          "group relative bg-card/50 border border-border rounded-lg p-4 transition-all duration-300 hover:border-primary/40",
          quest.isCompleted ? "border-l-success opacity-60" : "border-l-primary",
          quest.isCompleted && "bg-success/5",
        )}
        style={{
          borderLeftWidth: Math.max(1, 4 - Math.min(visualDepth, 3)),
        }}
      >
        {depthLabel && (
          <div className="absolute -top-2 -left-2 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground border border-border shadow-sm">
            {depthLabel}
          </div>
        )}
        <div className="flex items-start gap-3">
          {/* Collapse/Expand Button */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-6 w-6 mt-0.5 hover:bg-primary/10"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}

          {/* Checkbox */}
          <Checkbox
            checked={quest.isCompleted}
            onCheckedChange={() => onToggleComplete(quest.id)}
            className="mt-1 h-5 w-5 border-2 border-primary/60 data-[state=checked]:bg-success data-[state=checked]:border-success data-[state=unchecked]:border-primary/60"
          />

          {/* Quest Content */}
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-foreground transition-all duration-300 break-words",
                fontSizeClass,
                quest.isCompleted && "line-through text-muted-foreground",
              )}
            >
              {quest.content}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {canHaveChildren && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onAddChild(quest.id)}
                className="h-8 w-8 hover:bg-primary/20 hover:text-primary"
                title="Mark Sub-Quest"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(quest.id)}
              className="h-8 w-8 hover:bg-primary/20 hover:text-primary"
              title="Refine"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {canMove && onMove && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMove(quest.id)}
                className="h-8 w-8 hover:bg-primary/20 hover:text-primary"
                title="Redirect Path"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(quest.id)}
              className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
              title="Abandon"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Render Children */}
      {hasChildren && !isCollapsed && (
        <div className="space-y-2">
          {quest.children.map((child) => (
            <QuestItem
              key={child.id}
              quest={child}
              onToggleComplete={onToggleComplete}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </div>
  )
}
