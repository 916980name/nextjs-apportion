import { kv } from '@vercel/kv';
import { getFormattedDate } from 'app/utils/calcu';
import { Activity } from 'app/utils/store';
import { nanoid } from "nanoid";
import { NextResponse } from 'next/server';

const ACTIVITY_KEY_PREFIX = 'act:' 
const ACTIVITY_OWNER_KEY_PREFIX = 'own:'
const DEFAULT_TTL = 60 * 60 * 6; // 6 hour
 
export async function GET_activity(code: string) {
  const obj = await kv.get(ACTIVITY_KEY_PREFIX + code);
  return NextResponse.json(obj);
}

export async function CHECK_owner(code: string, secret: string) {
  const value = await kv.get(ACTIVITY_OWNER_KEY_PREFIX + code);
  return value === secret;
}

export async function SET_new_activity(act: Activity) {
  const code = getFormattedDate() + nanoid(9);
  const ok = await kv.setex(ACTIVITY_KEY_PREFIX + code, DEFAULT_TTL, act);
  if(ok) {
    return code;
  }
  return null;
}

export async function SET_activity(code: string, act: Activity) {
  const remote = GET_activity(code);
  if(!remote) {
    return false;
  }
  const ok = await kv.setex(ACTIVITY_KEY_PREFIX + code, DEFAULT_TTL, act);
  return ok;
}