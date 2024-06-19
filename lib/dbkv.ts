'use server';

import { kv } from '@vercel/kv';
import { checkObjectIsEmpty, generateActivityCode } from 'app/utils/calcu';
import { Activity, ActivitySummerize } from 'app/utils/store';

const ACTIVITY_KEY_PREFIX = 'act:'
const ACTIVITY_OWNER_KEY_PREFIX = 'own:'
const DEFAULT_TTL = 60 * 60 * 6; // 6 hour

export async function GET_activity(code: string): Promise<ActivitySummerize> {
  const obj = await kv.get(ACTIVITY_KEY_PREFIX + code);
  if (checkObjectIsEmpty(obj)) {
    // return NextResponse.json(null, { status: 404 });
    throw new Error("Null Obj");
  } else {
    // return NextResponse.json(JSON.stringify(obj));
    return obj as ActivitySummerize;
  }
}

export async function CHECK_owner(code: string, secret: string) {
  const value = await kv.get(ACTIVITY_OWNER_KEY_PREFIX + code);
  return value === secret;
}

export async function SET_new_activity(act: Activity) {
  const code = generateActivityCode();
  const ok = await kv.setex(ACTIVITY_KEY_PREFIX + code, DEFAULT_TTL, act);
  if (ok) {
    return code;
  }
  return null;
}

export async function SET_activity(act: ActivitySummerize) {
  // const remote = GET_activity(code);
  // if(!remote) {
  //   return false;
  // }
  const ok = await kv.setex(ACTIVITY_KEY_PREFIX + act.code, DEFAULT_TTL, act);
  return ok;
}