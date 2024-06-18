'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Path } from 'app/utils/constant';
import { ActivitySummerize, useActivityStore } from 'app/utils/store';
import { useRouter } from 'next/navigation';
import Locale from "../locales";

export function ActivitiesTable() {
  // const router = useRouter();
  // function onClick() {
  //   router.replace(`/?offset=${offset}`);
  // }
  const activities: ActivitySummerize[] = useActivityStore((state) => state.activities);

  return (
    <>
      <form className="border shadow-sm rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[150px]">{Locale.Activity.Code}</TableHead>
              <TableHead className="hidden sm:table-cell">{Locale.Activity.Count}</TableHead>
              <TableHead className="hidden sm:table-cell">{Locale.Activity.CreateTime}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((act: ActivitySummerize) => (
              <ActivityRow key={act.code} acs={act} />
            ))}
          </TableBody>
        </Table>
      </form>
      {/* {offset !== null && (
        <Button
          className="mt-4 w-40"
          variant="secondary"
          onClick={() => onClick()}
        >
          Next Page
        </Button>
      )} */}
    </>
  );
}

function ActivityRow({ acs }: { acs: ActivitySummerize}) {
  const router = useRouter();

  const goActivity = (code: string) => {
    router.push(Path.Activity + '/' + code);
  }

  return (
    <TableRow onClick={() => goActivity(acs.code)}>
      <TableCell className="font-medium">{acs.code}</TableCell>
      <TableCell className="hidden sm:table-cell">{acs.list.length} {Locale.Activity.Title}</TableCell>
      <TableCell className="hidden sm:table-cell">{acs.createTime.toLocaleString()}
      </TableCell>
      {/* <TableCell>{user.username}</TableCell>
      <TableCell>
        <Button
          className="w-full"
          size="sm"
          variant="outline"
          formAction={deleteUserWithId}
          disabled
        >
          Delete
        </Button>
      </TableCell> */}
    </TableRow>
  );
}
