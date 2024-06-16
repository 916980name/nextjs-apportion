import { create } from "zustand";
import { createJSONStorage, persist } from 'zustand/middleware';


export type ActivityItemRequest = {
  name: string;
  item: ActivityItem;
}

export type ActivityItem = {
  user: string;
  count: number;
  money: number;
}

export type Activity = {
  name: string;
  money: number;
  people: ActivityItem[];
}

export const useActivityStore = create(
  persist(
    (set, get) => ({
      secret: '', // have authority to 
      username: '',
      activityCode: '', // establish connection to KV storage
      activities: [],
      setSecret: (newSecret: string) => set((state) => ({...state, secret: newSecret})),
      setUsername: (newUsername: string) => set((state) => ({...state, username: newUsername})),
      setActivityCode: (newActivityCode: string) => set((state) => ({...state, activityCode: newActivityCode})),
      addItem: (req: ActivityItemRequest) => set((state) => ({ ...state, activities: requestAddItem(state.activities, req) })),
      removeItem: (req: ActivityItemRequest) => set((state) => ({ ...state, activities: requestRemoveItem(state.activities, req) })),
      removeAll: () => set({
        secret: '',
        username: '',
        activities: [],
      }),
    }),
    {
      name: 'nextjs-apportion-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    },
  ),
)

function requestAddItem(activities: Activity[], req: ActivityItemRequest) {
  if (activities.length === 0) {
    return [];
  }
  const foundActivity = activities.find(activity => activity.name === req.name);
  if (!foundActivity) {
    return activities;
  }
  const foundItem = foundActivity.people.find(p => p.user === req.item.user);
  if (!foundItem) {
    foundActivity.people.push(req.item);
    return activities;
  }
  Object.assign(foundItem, req.item);
  return activities;
}

function requestRemoveItem(activities: Activity[], req: ActivityItemRequest) {
  if (activities.length === 0) {
    return [];
  }
  const foundActivity = activities.find(activity => activity.name === req.name);
  if (!foundActivity) {
    return activities;
  }
  const acts = foundActivity.people.filter(p => p.user !== req.item.user);
  return acts;
}
