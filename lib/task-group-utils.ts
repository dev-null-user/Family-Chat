import type { Task } from './types'

/** Внутренний ключ блока «без подписи» (совпадает с groupTasksByLabel) */
export const DEFAULT_GROUP_KEY = '__default__'

const DEFAULT_KEY = DEFAULT_GROUP_KEY

/** Новые задачи сверху, старые ниже */
export function sortTasksNewestFirst(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

/** Группировка задач по полю groupName внутри одного списка */
export function groupTasksByLabel(tasks: Task[]): { key: string; label: string; tasks: Task[] }[] {
  const keyFor = (t: Task) => (t.groupName ?? '').trim() || DEFAULT_KEY
  const map = new Map<string, Task[]>()
  const insertOrder: string[] = []

  for (const t of tasks) {
    const k = keyFor(t)
    if (!map.has(k)) {
      map.set(k, [])
      insertOrder.push(k)
    }
    map.get(k)!.push(t)
  }

  const sortedKeys = [...insertOrder].sort((a, b) => {
    if (a === DEFAULT_KEY) return 1
    if (b === DEFAULT_KEY) return -1
    return a.localeCompare(b, 'ru')
  })

  return sortedKeys.map(key => ({
    key,
    label: key === DEFAULT_KEY ? 'Общие задачи' : key,
    tasks: sortTasksNewestFirst(map.get(key)!),
  }))
}

export function collectTaskGroupSuggestions(tasks: Task[]): string[] {
  const s = new Set<string>()
  for (const t of tasks) {
    const g = (t.groupName ?? '').trim()
    if (g) s.add(g)
  }
  return [...s].sort((a, b) => a.localeCompare(b, 'ru'))
}
