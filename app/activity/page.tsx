'use client';

import { Button } from "@/components/ui/button";
import { generateActivityCode } from "app/utils/calcu";
import { Path } from "app/utils/constant";
import { useRouter } from 'next/navigation';
import Locale from "../locales";
import { ActivitiesTable } from "./activity-table";

function ActivityPage() {
    const router = useRouter();

    const newActivity = () => {
        router.push(Path.Activity + '/' + generateActivityCode());
    }

    return (
        <>
            <div className="flex justify-between items-center">
                <h1 className="font-semibold text-lg md:text-2xl">{Locale.Activity.Table}</h1>
                <div>
                    <Button onClick={newActivity}>{Locale.Activity.New}</Button>
                </div>
            </div>
            <div>
                <ActivitiesTable />
            </div>
        </>
    );
}
export default ActivityPage;