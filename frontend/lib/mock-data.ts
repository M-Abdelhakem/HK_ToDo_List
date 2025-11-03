import type { User, QuestList } from "./types"

export const mockUser: User = {
  id: "1",
  username: "Wanderer",
  name: "The Knight",
}

export const mockLists: QuestList[] = [
  {
    id: "list-1",
    title: "Forgotten Crossroads",
    userId: "1",
    quests: [
      {
        id: "quest-1",
        content: "Explore the ancient ruins",
        isCompleted: true,
        depth: 0,
        listId: "list-1",
        parentId: null,
        children: [
          {
            id: "quest-1-1",
            content: "Find the hidden chamber",
            isCompleted: true,
            depth: 1,
            listId: "list-1",
            parentId: "quest-1",
            children: [
              {
                id: "quest-1-1-1",
                content: "Decipher the ancient text",
                isCompleted: false,
                depth: 2,
                listId: "list-1",
                parentId: "quest-1-1",
                children: [],
              },
            ],
          },
          {
            id: "quest-1-2",
            content: "Collect the pale ore",
            isCompleted: false,
            depth: 1,
            listId: "list-1",
            parentId: "quest-1",
            children: [],
          },
        ],
      },
      {
        id: "quest-2",
        content: "Defeat the False Knight",
        isCompleted: false,
        depth: 0,
        listId: "list-1",
        parentId: null,
        children: [],
      },
    ],
  },
  {
    id: "list-2",
    title: "City of Tears",
    userId: "1",
    quests: [
      {
        id: "quest-3",
        content: "Navigate the flooded streets",
        isCompleted: false,
        depth: 0,
        listId: "list-2",
        parentId: null,
        children: [
          {
            id: "quest-3-1",
            content: "Find the Soul Sanctum",
            isCompleted: false,
            depth: 1,
            listId: "list-2",
            parentId: "quest-3",
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: "list-3",
    title: "Deepnest",
    userId: "1",
    quests: [],
  },
]
