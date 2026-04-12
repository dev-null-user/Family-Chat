'use client'

import { useState } from 'react'
import { useSidebarColumnWideEnoughForFullRow } from '@/lib/sidebar-column-layout'
import { SectionCard } from './section-card'
import { CreateSectionDialog } from './create-section-dialog'
import { EditSectionDialog } from './edit-section-dialog'
import { EditGroupDialog } from '@/components/groups/edit-group-dialog'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { useAppStore } from '@/lib/store'
import { Plus, FolderOpen, ChevronLeft, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionsListProps {
  onSectionSelect?: (sectionId: string) => void
  onBack?: () => void
  /** lg+: узкая колонка — заголовок «Разделы» + плюс, строки — только иконка */
  desktopIconOnlyRows?: boolean
}

export function SectionsList({
  onSectionSelect,
  onBack,
  desktopIconOnlyRows = false,
}: SectionsListProps) {
  const { rootRef, wideEnoughForFullDesktopRow } = useSidebarColumnWideEnoughForFullRow()
  const { selectedGroupId, selectedSectionId, selectSection, getSelectedGroup } = useAppStore()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingGroupOpen, setEditingGroupOpen] = useState(false)
  
  const group = getSelectedGroup()
  const sections = group?.sections || []
  const editingSection = editingSectionId ? sections.find(s => s.id === editingSectionId) : null

  const handleSectionClick = (sectionId: string) => {
    selectSection(sectionId)
    onSectionSelect?.(sectionId)
  }

  const useFullDesktopSectionRow = !desktopIconOnlyRows && wideEnoughForFullDesktopRow
  const useCompactDesktopSectionRow = !useFullDesktopSectionRow

  if (!group) {
    return (
      <div
        ref={rootRef}
        className="flex h-full min-h-0 w-full min-w-0 flex-col max-lg:bg-transparent lg:bg-background"
      >
        <div className="flex flex-1 items-center justify-center p-4">
          <Empty
            icon={<FolderOpen className="h-10 w-10" />}
            title="Выберите группу"
            description="Выберите группу для просмотра секций"
          />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className="flex h-full min-h-0 w-full min-w-0 flex-col max-lg:bg-transparent lg:bg-background"
    >
      <div
        className={cn(
          'flex shrink-0 border-b border-border/40 bg-background/40 backdrop-blur-md max-lg:border-border/30 lg:border-border lg:bg-card lg:backdrop-blur-none',
          useCompactDesktopSectionRow
            ? 'flex-col items-center gap-2 px-2 py-2.5 max-lg:flex-row max-lg:items-center max-lg:gap-2 max-lg:px-2 max-lg:py-2.5 lg:gap-2 2xl:gap-3'
            : 'items-center gap-2 px-2 py-2.5 lg:gap-2.5 lg:px-2.5 lg:py-3 2xl:gap-3 2xl:px-4',
        )}
      >
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8 shrink-0 max-lg:order-first lg:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <div
          className={cn(
            'flex min-w-0 flex-1 items-start gap-1',
            useCompactDesktopSectionRow && 'lg:hidden',
            onBack && 'max-lg:min-w-0',
          )}
        >
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1">
              <h2 className="truncate text-sm font-semibold text-foreground">{group.name}</h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                title="Переименовать группу"
                aria-label="Переименовать группу"
                onClick={() => setEditingGroupOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {sections.length} {sections.length === 1 ? 'секция' : 'секций'}
            </p>
          </div>
        </div>
        {useCompactDesktopSectionRow && (
          <h2 className="hidden text-center text-[13px] font-semibold leading-tight tracking-tight text-foreground lg:block">
            Разделы
          </h2>
        )}
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            'shrink-0',
            useCompactDesktopSectionRow
              ? 'h-7 w-7 max-lg:h-8 max-lg:w-8 lg:rounded-md'
              : 'h-8 w-8',
          )}
          onClick={() => setShowCreateDialog(true)}
          aria-label="Создать раздел"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
        {sections.length === 0 ? (
          <div className="p-4">
            <Empty
              icon={<FolderOpen className="h-10 w-10" />}
              title="Нет секций"
              description="Создайте первую секцию"
              action={
                <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Создать
                </Button>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sections.map(section => (
              <SectionCard
                key={section.id}
                section={section}
                desktopIconOnly={useCompactDesktopSectionRow}
                onClick={() => handleSectionClick(section.id)}
                onEdit={() => setEditingSectionId(section.id)}
                isSelected={selectedSectionId === section.id}
              />
            ))}
          </div>
        )}
      </div>

      {selectedGroupId && (
        <CreateSectionDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          groupId={selectedGroupId}
        />
      )}

      <EditSectionDialog
        open={editingSectionId !== null}
        onOpenChange={open => {
          if (!open) setEditingSectionId(null)
        }}
        sectionId={editingSectionId}
        initialName={editingSection?.name ?? ''}
      />

      <EditGroupDialog
        open={editingGroupOpen}
        onOpenChange={setEditingGroupOpen}
        groupId={group.id}
        initialName={group.name}
      />
    </div>
  )
}
