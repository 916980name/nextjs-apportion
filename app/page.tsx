'use client';

import Locale from "app/locales";
import { isNonEmptyString } from "./utils/calcu";
import { useActivityStore } from "./utils/store";
import { WelcomePage } from "./welcome/page";


export default async function IndexPage() {
  const username = useActivityStore((state) => state.username)

  return (
      <div>
        {
        !isNonEmptyString(username) ? (
          <WelcomePage/>
        ) : (
        <main className="flex flex-1 flex-col p-4 md:p-6">
          <div className="flex items-center mb-8">
            <h1 className="font-semibold text-lg md:text-2xl">{Locale.Settings.UserName}: {username}</h1>
          </div>
          <div className="w-full mb-4">
            {/* <Search value={searchParams.q} /> */}
          </div>
          {/* <UsersTable users={users} offset={newOffset} /> */}
        </main>
        )}
      </div>
  );
}
