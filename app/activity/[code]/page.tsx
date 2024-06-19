'use client'

import ClipboardCopy from "@/components/ClipboardCopy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GET_activity, SET_activity } from "@/lib/dbkv";
import Loading from "app/loading";
import { checkObjectIsEmpty, divideWithScale, numberWithScale, stringToFloat2 } from "app/utils/calcu";
import { Activity, ActivityItemRequest, ActivityRequest, ActivitySummerize, emptyActivity, emptyActivitySummerize, useActivityStore } from "app/utils/store";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Locale from "../../locales";

interface ActivityShadow extends Activity {
    shadow: {
        show: boolean,
        count: number,
        user: string,
    }
}

const initActivityList = (activitySum: ActivitySummerize): ActivityShadow[] => {
    const updatedList = [...activitySum.list];
    return updatedList.map((item: Activity): ActivityShadow => {
        return {
            ...item,
            shadow: { show: false, count: 1, user: '' }
        }
    })
}

function ActivityCodePage({ params }
    : { params: { code: string } }) {
    const getActivitySum: (code: string) => ActivitySummerize = useActivityStore((state) => state.getActivitySum);
    const setStoreActivitySum: (act: ActivitySummerize) => void = useActivityStore((state) => state.setActivitySum);
    const addActivity: (req: ActivityRequest) => void = useActivityStore((state) => state.addActivity);
    const removeActivity: (req: ActivityRequest) => void = useActivityStore((state) => state.removeActivity);
    const addItem: (req: ActivityItemRequest) => void = useActivityStore((state) => state.addItem);
    const removeItem: (req: ActivityItemRequest) => void = useActivityStore((state) => state.removeItem);
    const username = useActivityStore((state) => state.username);

    const shouldPayRef = useRef<HTMLDivElement>(null);
    const addActRef = useRef<HTMLDivElement>(null);
    const [activitySum, setActivitySum] = useState<ActivitySummerize>(emptyActivitySummerize);
    const [activityList, setActivityList] = useState<ActivityShadow[]>(() => initActivityList(activitySum));
    const [activity, setActivity] = useState<Activity>(emptyActivity());
    const [activityShow, setActivityShow] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [shouldPayMap, setShouldPayMap] = useState(new Map());
    let fullUrl = '';

    const refreshData = () => {
        const data = getActivitySum(params.code);
        if (data) {
            setActivitySum(data);
            setActivityList(initActivityList(data));
        }
    }

    useEffect(() => {
        doSync();
        fullUrl = window.location.hostname + usePathname();
    }, [])

    useEffect(() => {
        refreshData()
    }, [params.code, removeItem, addItem, removeActivity, addActivity])

    const handleRemoveAct = (item: Activity) => {
        if (window.confirm(Locale.UI.Confirm + ' ' + Locale.UI.Remove + ' ' + Locale.Activity.Title)) {
            removeActivity({
                sum: activitySum,
                item: item,
            })
            refreshData();
        }
    };

    const handleAddAct = () => {
        setActivity(emptyActivity());
        setActivityShow(true);
        if (addActRef.current) {
            addActRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const confirmAddAct = () => {
        addActivity({
            sum: activitySum,
            item: activity
        })
        setActivityShow(false);
        refreshData();
    }

    const cancelAddAct = () => {
        setActivityShow(false);
    }

    const handleAddItem = (activity: ActivityShadow) => {
        const updatedList = [...activityList];
        const foundActivity = updatedList.find(a => a.name === activity.name);
        if (!foundActivity) return;
        foundActivity.shadow = { show: true, count: 1, user: username }
        setActivityList(updatedList);
    }

    const setItem = (activity: ActivityShadow, count: number, user: string) => {
        if (count <= 0) return;
        const updatedList = [...activityList];
        const foundActivity = updatedList.find(a => a.name === activity.name);
        if (!foundActivity) return;
        foundActivity.shadow = { show: true, count: count, user: user }
        setActivityList(updatedList);
    }

    const confirmAddItem = (activity: ActivityShadow) => {
        addItem({
            code: params.code,
            name: activity.name,
            item: {
                user: activity.shadow.user,
                count: activity.shadow.count,
                money: 0
            }
        })
        refreshData();
    }

    const cancelAddItem = (activity: ActivityShadow) => {
        const updatedList = [...activityList];
        const foundActivity = updatedList.find(a => a.name === activity.name);
        if (!foundActivity) return;
        foundActivity.shadow = { ...foundActivity.shadow, show: false }
        setActivityList(updatedList);
    }

    const handleRemoveItem = (item: ActivityShadow) => {
        if (window.confirm(Locale.UI.Confirm + ' ' + Locale.UI.Remove + ' ' + Locale.Activity.Participant)) {
            removeItem({
                code: params.code,
                name: item.name,
                item: {
                    user: username,
                    count: item.shadow.count,
                    money: 0
                }
            })
            refreshData();
        }
    };

    const doUpload = () => {
        setLoading(true);
        SET_activity(activitySum)
            .then((r) => {
                console.log('Activity Upload:' + params.code + ', ' + r);

            }).catch(e => {
                console.log('Activity Upload:' + params.code + ', ' + e);
            })
            .finally(() => {
                setLoading(false);
            })
    }

    const doSync = () => {
        setLoading(true);
        console.log('Activity Sync:' + params.code);
        GET_activity(params.code)
            .then((response) => {
                if (!checkObjectIsEmpty(response)) {
                    setStoreActivitySum(response);
                }
                refreshData();
            }).catch((e) => {
                console.log('Activity Sync:' + params.code + ', ' + e);
            })
            .finally(() => {
                setLoading(false);
            })
    }

    const doCalculate = () => {
        setCalculating(true)
        const data = { ...activitySum };
        const resultMap: Map<string, number> = new Map();

        data.list.map((activity) => {
            const sum: number = activity.people.reduce((acc, obj) => acc + obj.count, 0);
            const eachPay: number = divideWithScale(activity.money, sum, 2);
            activity.people.map((people) => {
                people.money = numberWithScale(eachPay * people.count, 2);
                if (resultMap.has(people.user)) {
                    resultMap.set(people.user, numberWithScale(resultMap.get(people.user)! + people.money, 2));
                } else {
                    resultMap.set(people.user, people.money);
                }
            })
        })
        setShouldPayMap(resultMap);
        setStoreActivitySum(data);
        refreshData();
        setCalculating(false)
        if (shouldPayRef.current) {
            shouldPayRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    return (
        <div className="container mx-auto px-2 pb-10">
            <div>
                <div>
                    <div>
                        <div>
                            {Locale.Activity.Code}: {params.code}
                        </div>
                        <div>
                            {Locale.Activity.Creater}: {activitySum.creater}
                        </div>
                        <div>
                            {Locale.Activity.CreateTime}: {activitySum?.createTime.toLocaleString('en-US')}
                        </div>
                    </div>
                    <div>
                    </div>
                </div>
                <div className="columns-2">
                    <Button onClick={doUpload} className="mx-1 my-1">{Locale.Activity.Upload}</Button>
                    <Button onClick={doSync} className="mx-1 my-1">{Locale.Activity.Sync}</Button>
                    <Button onClick={doCalculate} className="mx-1 my-1">{Locale.Activity.Calculate}</Button>
                    <ClipboardCopy copyText={fullUrl} className="mx-1 my-1"/>
                </div>
            </div>
            <div>
                {loading && <Loading />}
                {!loading && activityList.map((shadow, index) => (
                    <div className="border border-solid border-slate-300 rounded-md my-3 py-2 px-2">
                        {/* <div key={shadow.name} className="flex justify-between items-center pb-2 border-b-2 border-b-sky-200"> */}
                        {/** ERROR here */}
                        <div key={shadow.name}>
                            <div className="columns-3">
                                <div>{Locale.Activity.Title} {index + 1}</div>
                                <div>{shadow.name}</div>
                                <div>{Locale.Activity.Cost} {shadow.money}</div>
                            </div>
                            <div className="columns-2">
                                <Button onClick={() => handleAddItem(shadow)} className="bg-cblue">{Locale.Activity.AddOne + Locale.Activity.Participant}</Button>
                                <Button onClick={() => handleRemoveAct(shadow)} variant={"destructive"}>{Locale.UI.Remove}{Locale.Activity.Title}</Button>
                            </div>
                        </div>
                        {shadow.people.map((people, index) => (
                            <div key={people.user} className="flex justify-between items-center p-1">
                                <div>{Locale.Activity.Participant} {people.user}</div>
                                <div>{Locale.Activity.ParticipantCount}: {people.count}</div>
                                <div>{Locale.Activity.Apportion}: {people.money}</div>
                                <Button onClick={() => handleRemoveItem(shadow)} variant={"destructive"} size={"sm"}>{Locale.UI.Remove}</Button>
                            </div>
                        ))}
                        {shadow.shadow.show &&
                            <div className="border-solid rounded-md shadow-md my-3 mx-1 py-3 px-1">
                                <div className="mb-1.5">
                                    <Input type="text" placeholder={Locale.Activity.Participant} value={shadow.shadow.user}
                                        onChange={(e) => setItem(shadow, shadow.shadow.count, e.currentTarget.value.trim())} />
                                </div>
                                <div className="mb-1.5">
                                    <Input type="number" placeholder={Locale.Activity.ParticipantCount} value={shadow.shadow.count}
                                        onChange={(e) => setItem(shadow, parseInt(e.currentTarget.value.trim()), shadow.shadow.user)} />
                                </div>
                                <div className="flex justify-between items-right">
                                    <Button onClick={() => confirmAddItem(shadow)} variant={"secondary"}>&#9989;{Locale.UI.Confirm}</Button>
                                    <Button onClick={() => cancelAddItem(shadow)} variant={"secondary"}>&#10060;{Locale.UI.Cancel}</Button>
                                </div>
                            </div>
                        }
                    </div>
                ))}
                
                {!loading && activityShow &&
                    <div className="rounded-md shadow-md my-3 mx-1 py-3 px-1">
                        <div>{Locale.Activity.AddOne} {Locale.Activity.Title}</div>
                        <div className="mb-1.5">
                            <Input type="text" placeholder={Locale.Activity.Name} value={activity.name}
                                onChange={(e) => setActivity({ ...activity, name: e.currentTarget.value.trim() })} />
                        </div>
                        <div className="mb-1.5">
                            <Input type="number" placeholder={Locale.Activity.Cost} value={activity.money}
                                onChange={(e) => setActivity({ ...activity, money: stringToFloat2(e.currentTarget.value.trim()) })} />
                        </div>
                        <div className="flex justify-between items-right">
                            <Button onClick={confirmAddAct} variant={"secondary"}>&#9989;{Locale.UI.Confirm}</Button>
                            <Button onClick={cancelAddAct} variant={"secondary"}>&#10060;{Locale.UI.Cancel}</Button>
                        </div>
                    </div>
                }
                <div ref={addActRef}></div>

                {!loading &&
                    <div className="fixed bottom-0 left-0 right-0 flex justify-center mb-1">
                        <Button onClick={handleAddAct} className={"bg-cblue"}
                        >{Locale.Activity.AddOne} {Locale.Activity.Title}</Button>
                    </div>
                }

                {!loading && !calculating &&
                    <div ref={shouldPayRef}>
                        <div className="p-2 m-3 rounded-lg border-4 border-sky-600 shadow-2xl">
                            <UserMapComponent userMap={shouldPayMap} />
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}

const UserMapComponent = ({ userMap }: { userMap: Map<string, number> }) => (
    <div className="flex items-center justify-center">
        <div className="w-screen">
            <h1>{Locale.Activity.ShouldPay}</h1>
        </div>
        <div className="w-screen">
            <ul>
                {Array.from(userMap).map(([username, money]) => (
                    <li key={username}>
                        <strong>{username}</strong> : <strong>{money}</strong>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);
export default ActivityCodePage;