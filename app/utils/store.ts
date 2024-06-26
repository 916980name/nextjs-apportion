import { create } from "zustand";
import { createJSONStorage, persist } from 'zustand/middleware';
import { isNonEmptyString } from "./calcu";

export type ActivityRequest = {
  sum: ActivitySummerize;
  item: Activity;
}

export type ActivityItemRequest = {
  code: string;
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
  contributor: string;
  people: ActivityItem[];
}

export type ActivitySummerize = {
  code: string;
  createTime: Date;
  creater: string;
  list: Activity[];
}

interface ActivityStoreState {
  secret: string, // have authority to 
  username: string,
  activities: ActivitySummerize[],
  setSecret: (newSecret: string) => void,
  setUsername: (newUsername: string) => void,
  getActivitySum: (code: string) => ActivitySummerize,
  setActivitySum: (act: ActivitySummerize) => void,
  removeActivitySum: (code: string) => void,
  addActivity: (req: ActivityRequest) => void,
  removeActivity: (req: ActivityRequest) => void,
  addItem: (req: ActivityItemRequest) => void,
  removeItem: (req: ActivityItemRequest) => void,
  removeAll: () => void,
}

export const useActivityStore = create<ActivityStoreState>()(
  persist(
    (set, get) => ({
      secret: '', 
      username: '',
      activities: [],
      setSecret: (newSecret: string) => set((state) => ({ ...state, secret: newSecret })),
      setUsername: (newUsername: string) => set((state) => ({ ...state, username: newUsername })),
      getActivitySum: (code: string) => getActivitySum(get().activities, get().username, code),
      setActivitySum: (act: ActivitySummerize) => set((state) => ({ ...state, activities: setActivitySum(state.activities, act) })),
      removeActivitySum: (code: string) => set((state) => ({ ...state, activities: removeActivitySum(state.activities, code) })),
      addActivity: (req: ActivityRequest) => set((state) => ({ ...state, activities: addActivity(state.activities, req) })),
      removeActivity: (req: ActivityRequest) => set((state) => ({ ...state, activities: removeActivity(state.activities, req) })),
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

function removeActivity(activities: ActivitySummerize[], req: ActivityRequest): ActivitySummerize[] {
  if (activities.length === 0) {
    return [];
  }
  const foundActivitySum = activities.find(activity => activity.code === req.sum.code);
  if (!foundActivitySum) {
    return activities;
  }
  const acts = foundActivitySum.list.filter(p => p.name !== req.item.name);
  foundActivitySum.list = acts;
  return activities;
}
function addActivity(activities: ActivitySummerize[], req: ActivityRequest): ActivitySummerize[] {
  if (activities.length === 0) {
    req.sum.list = [req.item];
    return [req.sum];
  }
  if (!isNonEmptyString(req.item.name)) {
    console.log('add null name for act');
    return activities;
  }
  const foundActivitySum = activities.find(activity => activity.code === req.sum.code);
  if (foundActivitySum) {
    foundActivitySum.list.push(req.item);
    return activities;
  }
  req.sum.list = [req.item];
  activities.push(req.sum);
  return activities;
}

function initActivitySummerize(code: string, username: string): ActivitySummerize {
  return {
    code: code,
    createTime: new Date(),
    creater: username,
    list: [],
  };
}
export function emptyActivitySummerize(): ActivitySummerize {
  return {
    code: '',
    createTime: new Date(),
    creater: '',
    list: []
  };
}
export function emptyActivity(): Activity {
  return {
    name: '',
    money: 0,
    contributor: '',
    people: [],
  };
}
export function emptyActivityItem(): ActivityItem {
  return {
    user: '',
    count: 1,
    money: 0,
  };
}

function getActivitySum(activities: ActivitySummerize[], username: string, code: string): ActivitySummerize {
  if (activities.length === 0) {
    return initActivitySummerize(code, username);
  }
  const foundActivitySum = activities.find(activity => activity.code === code);
  if (!foundActivitySum) {
    return initActivitySummerize(code, username);
  }
  return foundActivitySum;
}

function setActivitySum(activities: ActivitySummerize[], act: ActivitySummerize): ActivitySummerize[] {
  if (activities.length === 0) {
    return [act];
  }
  const foundActivitySum = activities.find(activity => activity.code === act.code);
  if (!foundActivitySum) {
    activities.push(act);
    return activities;
  }
  Object.assign(foundActivitySum, act);
  return activities;
}

function removeActivitySum(activities: ActivitySummerize[], code: string): ActivitySummerize[] {
  if (activities.length === 0) {
    return activities;
  }
  return activities.filter(activity => activity.code !== code);
}

function requestAddItem(activities: ActivitySummerize[], req: ActivityItemRequest) {
  if (activities.length === 0) {
    return [];
  }
  if (!isNonEmptyString(req.item.user)) {
    console.log('add null user for act item');
    return activities;
  }
  const foundActivitySum = activities.find(activity => activity.code === req.code);
  if (!foundActivitySum) {
    return activities;
  }
  const foundActivity = foundActivitySum.list.find(activity => activity.name === req.name);
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

function requestRemoveItem(activities: ActivitySummerize[], req: ActivityItemRequest) {
  if (activities.length === 0) {
    return activities;
  }
  const foundActivitySum = activities.find(activity => activity.code === req.code);
  if (!foundActivitySum) {
    return activities;
  }
  const foundActivity = foundActivitySum.list.find(activity => activity.name === req.name);
  if (!foundActivity) {
    return activities;
  }
  const acts = foundActivity.people.filter(p => p.user !== req.item.user);
  foundActivity.people = acts;
  return activities;
}
