'use client'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import Locale from "../locales";
import { isNonEmptyString } from "../utils/calcu";
import { useActivityStore } from "../utils/store";

export type handleChangeSuc<T> = (obj: T) => void;

export function UserNameComponent({handleChangeSuc}: {handleChangeSuc: handleChangeSuc<string>}) {
  const storeUsername =  useActivityStore((state) => state.username);
  const storeSetUsername = useActivityStore((state) => state.setUsername);
  const [username, setUsername] = useState(storeUsername);

  const checkUsername = () => {
    if(!isNonEmptyString(username)) return;
    storeSetUsername(username);
    if(handleChangeSuc) {
        handleChangeSuc(username);
    }
  };

  return (
      <div>
        please input an username 
          <Input type="text" placeholder={Locale.Settings.UserName} value={username} 
            onChange={(e) => { setUsername(e.currentTarget.value.trim()) }}/>
          <Button onClick={checkUsername}>{Locale.Auth.SaveUserName}</Button>
      </div>
  );
}