import dynamic from "next/dynamic";
import {
  Route,
  HashRouter as Router,
  Routes
} from "react-router-dom";
import { AuthPage } from "./AuthPage";
import { Search } from './search';
import { UsersTable } from './users-table';
import { isNonEmptyString } from "./utils/calcu";
import { Path } from './utils/constant';
import { useActivityStore } from "./utils/store";

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div>
      loading...
    </div>
  );
}
const SettingPage = dynamic(async () => (await import("./settingPage")).SettingPage, {
  loading: () => <Loading noLogo />,
});

const ActivityPage = dynamic(async () => (await import("./activityPage")).ActivityPage, {
  loading: () => <Loading noLogo />,
});

export default async function IndexPage() {
  const username = useActivityStore((state) => state.username)

  return (
    <Router>
      <div>
        {
        !isNonEmptyString(username) ? (
          <AuthPage/>
        ) : (
        <main className="flex flex-1 flex-col p-4 md:p-6">
          <div>
            <Routes>
              <Route path={Path.Home} element={<SettingPage/>} />
              <Route path={Path.Settings} element={<SettingPage/>} />
              <Route path={Path.Activity} element={<ActivityPage/>} />
            </Routes>
          </div>
          <div className="flex items-center mb-8">
            <h1 className="font-semibold text-lg md:text-2xl">Users</h1>
          </div>
          <div className="w-full mb-4">
            <Search value={searchParams.q} />
          </div>
          <UsersTable users={users} offset={newOffset} />
        </main>
        )}
      </div>
    </Router>
  );
}
