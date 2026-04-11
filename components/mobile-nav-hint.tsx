'use client'

import type { MobileTab } from '@/components/mobile-nav'

export type HomeNavHintView = 'groups' | 'sections' | 'taskLists' | 'taskDetail'

interface MobileNavHintProps {
  mobileTab: MobileTab
  homeView: HomeNavHintView
}

/** Подсказка по уровням: группы → разделы → списки задач (подразделы) — только на вкладке «Главная» */
export function MobileNavHint({ mobileTab, homeView }: MobileNavHintProps) {
  if (mobileTab !== 'home') return null

  const byView: Record<HomeNavHintView, string> = {
    groups: '1. Группы → 2. разделы внутри группы → 3. списки задач (подразделы с группами задач)',
    sections: 'Сейчас: разделы группы. Далее — списки групповых задач в выбранном разделе',
    taskLists: 'Сейчас: списки в разделе (это подразделы). Откройте список — увидите задачи',
    taskDetail: 'Задачи выбранного списка. Назад — к спискам → разделам → группам',
  }

  return (
    <div className="shrink-0 border-t border-border/25 bg-background/30 px-2 py-1.5 text-center backdrop-blur-md md:hidden">
      <p className="text-[10px] leading-snug text-muted-foreground/90">{byView[homeView]}</p>
    </div>
  )
}
