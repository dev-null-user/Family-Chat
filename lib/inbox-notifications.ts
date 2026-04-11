import type { InboxNotification } from './types'

/** Начальный набор уведомлений (id совпадают с mock-данными групп, новостей и базы знаний) */
export function seedInboxNotifications(): InboxNotification[] {
  const now = Date.now()
  return [
    {
      id: 'in1',
      title: 'Активность в списке задач',
      body: 'В «Продукты на неделю» есть обновления — откройте список в разделе Покупки.',
      createdAt: new Date(now - 45 * 60 * 1000),
      read: false,
      target: {
        kind: 'task_list',
        groupId: 'g1',
        sectionId: 's1',
        taskListId: 'tl1',
      },
    },
    {
      id: 'in2',
      title: 'Раздел «Финансы»',
      body: 'Напоминание: проверьте счета к оплате в этой секции.',
      createdAt: new Date(now - 3 * 60 * 60 * 1000),
      read: false,
      target: { kind: 'section', groupId: 'g1', sectionId: 's2' },
    },
    {
      id: 'in3',
      title: 'Группа «Дача»',
      body: 'Новые задачи на участке ждут внимания.',
      createdAt: new Date(now - 24 * 60 * 60 * 1000),
      read: true,
      target: { kind: 'group', groupId: 'g2' },
    },
    {
      id: 'in4',
      title: 'Новость: обновление 2.0',
      body: 'Мы обновили интерфейс — посмотрите, что изменилось.',
      createdAt: new Date(now - 2 * 60 * 60 * 1000),
      read: false,
      target: { kind: 'news', newsId: '1' },
    },
    {
      id: 'in5',
      title: 'Поддержка',
      body: 'Ответ специалиста в чате техподдержки.',
      createdAt: new Date(now - 30 * 60 * 1000),
      read: false,
      target: { kind: 'support', tab: 'chat' },
    },
    {
      id: 'in6',
      title: 'База знаний',
      body: 'Статья: как создать группу.',
      createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
      read: true,
      target: { kind: 'support', tab: 'knowledge', articleId: '1' },
    },
    {
      id: 'in7',
      title: 'Профиль',
      body: 'Проверьте данные профиля и настройки темы.',
      createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
      read: true,
      target: { kind: 'profile' },
    },
  ]
}
