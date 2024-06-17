'use client'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useState } from 'react';
import Locale from "../locales";
import { isNonEmptyString } from "../utils/calcu";
import { Path } from "../utils/constant";
import { useActivityStore } from "../utils/store";

export function WelcomePage() {
  const storeUsername =  useActivityStore((state) => state.username);
  const storeSetUsername = useActivityStore((state) => state.setUsername);
  const [jump, setJump] = useState(false);
  const [username, setUsername] = useState('');

  const checkUsername = () => {
    if(isNonEmptyString(storeUsername)) {
      setJump(true);
      return;
    }
    if(!isNonEmptyString(username)) return;
    storeSetUsername(username)
    setJump(true);
  };

  return (
      <div>
        please put an username 
          <Input type="text" placeholder={Locale.Settings.UserName} value={username} 
            onChange={(e) => {
                setUsername(e.currentTarget.value.trim())
            }}/>
          <Button onClick={checkUsername}>{Locale.Auth.SaveUserName}</Button>
          {jump && 
            (<Link href={Path.Home}>Home</Link>)
          }
      </div>
  );
}