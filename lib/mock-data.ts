import type { User, Group, Activity } from './types'

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Анна',
    email: 'anna@example.com',
    gender: 'female',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
  },
  {
    id: '2',
    name: 'Иван',
    email: 'ivan@example.com',
    gender: 'male',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan',
  },
  {
    id: '3',
    name: 'Мария',
    email: 'maria@example.com',
    gender: 'female',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
  },
  {
    id: '4',
    name: 'Сергей',
    email: 'sergey@example.com',
    gender: 'male',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sergey',
  },
]

export const currentUser = mockUsers[0]

const createActivity = (
  id: string,
  userId: string,
  action: Activity['action'],
  targetName: string,
  taskListId: string,
  minutesAgo: number
): Activity => ({
  id,
  userId,
  user: mockUsers.find(u => u.id === userId)!,
  action,
  targetName,
  timestamp: new Date(Date.now() - minutesAgo * 60 * 1000),
  taskListId,
})

export const mockGroups: Group[] = [
  {
    id: 'g1',
    name: 'Семья Ивановых',
    members: [mockUsers[0], mockUsers[1], mockUsers[2]],
    unreadCount: 5,
    lastActivity: createActivity('a1', '2', 'completed', 'Купить молоко', 'tl1', 5),
    sections: [
      {
        id: 's1',
        name: 'Покупки',
        groupId: 'g1',
        unreadCount: 3,
        lastActivity: createActivity('a2', '2', 'completed', 'Купить молоко', 'tl1', 5),
        taskLists: [
          {
            id: 'tl1',
            title: 'Продукты на неделю',
            sectionId: 's1',
            unreadCount: 2,
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            createdBy: mockUsers[1],
            tasks: [
              {
                id: 't1',
                title: 'Купить молоко',
                groupName: 'Молочные продукты',
                completed: true,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                completedAt: new Date(Date.now() - 5 * 60 * 1000),
                createdBy: mockUsers[0],
                completedBy: mockUsers[1],
              },
              {
                id: 't2',
                title: 'Купить хлеб',
                groupName: 'Бакалея',
                completed: false,
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                createdBy: mockUsers[0],
              },
              {
                id: 't3',
                title: 'Купить овощи',
                groupName: 'Овощи',
                completed: false,
                createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
                createdBy: mockUsers[2],
              },
              {
                id: 't4',
                title: 'Купить фрукты',
                groupName: 'Фрукты',
                completed: true,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                createdBy: mockUsers[1],
                completedBy: mockUsers[0],
              },
            ],
            activities: [
              createActivity('a1', '2', 'completed', 'Купить молоко', 'tl1', 5),
              createActivity('a3', '1', 'added', 'Купить хлеб', 'tl1', 60),
              createActivity('a4', '3', 'added', 'Купить овощи', 'tl1', 720),
            ],
          },
          {
            id: 'tl2',
            title: 'Бытовая химия',
            sectionId: 's1',
            unreadCount: 1,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            createdBy: mockUsers[2],
            tasks: [
              {
                id: 't5',
                title: 'Средство для мытья посуды',
                groupName: 'Для кухни',
                completed: false,
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                createdBy: mockUsers[2],
              },
              {
                id: 't6',
                title: 'Стиральный порошок',
                groupName: 'Стирка',
                completed: true,
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                createdBy: mockUsers[0],
                completedBy: mockUsers[1],
              },
            ],
            activities: [
              createActivity('a5', '2', 'completed', 'Стиральный порошок', 'tl2', 2880),
            ],
          },
        ],
      },
      {
        id: 's2',
        name: 'Финансы',
        groupId: 'g1',
        unreadCount: 2,
        lastActivity: createActivity('a6', '1', 'added', 'Оплатить интернет', 'tl3', 120),
        taskLists: [
          {
            id: 'tl3',
            title: 'Счета к оплате',
            sectionId: 's2',
            unreadCount: 2,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            createdBy: mockUsers[0],
            tasks: [
              {
                id: 't7',
                title: 'Оплатить коммунальные',
                completed: false,
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                createdBy: mockUsers[0],
              },
              {
                id: 't8',
                title: 'Оплатить интернет',
                completed: false,
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                createdBy: mockUsers[0],
              },
            ],
            activities: [
              createActivity('a6', '1', 'added', 'Оплатить интернет', 'tl3', 120),
              createActivity('a7', '1', 'added', 'Оплатить коммунальные', 'tl3', 14400),
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'g2',
    name: 'Дача',
    members: [mockUsers[0], mockUsers[3]],
    unreadCount: 2,
    lastActivity: createActivity('a8', '4', 'completed', 'Скосить газон', 'tl4', 180),
    sections: [
      {
        id: 's3',
        name: 'Сад и огород',
        groupId: 'g2',
        unreadCount: 2,
        lastActivity: createActivity('a8', '4', 'completed', 'Скосить газон', 'tl4', 180),
        taskLists: [
          {
            id: 'tl4',
            title: 'Работы на участке',
            sectionId: 's3',
            unreadCount: 2,
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            createdBy: mockUsers[3],
            tasks: [
              {
                id: 't9',
                title: 'Скосить газон',
                completed: true,
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
                createdBy: mockUsers[0],
                completedBy: mockUsers[3],
              },
              {
                id: 't10',
                title: 'Полить грядки',
                completed: false,
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                createdBy: mockUsers[3],
              },
            ],
            activities: [
              createActivity('a8', '4', 'completed', 'Скосить газон', 'tl4', 180),
              createActivity('a9', '4', 'added', 'Полить грядки', 'tl4', 1440),
            ],
          },
        ],
      },
    ],
  },
]
