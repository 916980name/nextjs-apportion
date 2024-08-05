'use client'

import ClipboardCopy from "@/components/ClipboardCopy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GET_activity, SET_activity } from "@/lib/dbkv";
import Loading from "app/loading";
import { checkObjectIsEmpty, divideWithScale, mergeCalResultMaps, numberWithScale, stringToFloat2 } from "app/utils/calcu";
import { Activity, ActivityItem, ActivityItemRequest, ActivityRequest, ActivitySummerize, emptyActivity, emptyActivitySummerize, useActivityStore } from "app/utils/store";
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
    const [fullUrl, setFullUrl] = useState('');
    const [usernameList, setUsernameList] = useState<string[]>([]);
    const pathName = usePathname();

    const refreshData = () => {
        const data = getActivitySum(params.code);
        if (data) {
            setActivitySum(data);
            setActivityList(initActivityList(data));
        }
    }

    useEffect(() => {
        doSync();
        setFullUrl(window.location.hostname + pathName);
    }, [])

    useEffect(() => {
        refreshData()
    }, [params.code, removeItem, addItem, removeActivity, addActivity])

    useEffect(() => {
        const uniqueUsernamesSet: Set<string> = new Set();
        activityList.forEach(activity => {
            activity.people.forEach(person => {
                uniqueUsernamesSet.add(person.user);
            });
        });
        const resultA: string[] = []
        uniqueUsernamesSet.forEach(e => {
            resultA.push(e)
        })
        resultA.sort((a, b) => {
            if (typeof a === 'string' && typeof b === 'string') {
                return a.localeCompare(b); // Sort strings alphabetically
            } else if (typeof a === 'number' && typeof b === 'number') {
                return a - b; // Sort numbers in ascending order
            } else {
                // Handle cases where one element is a string and the other is a number
                // You can decide how you want to order these mixed types
                return typeof a === 'string' ? -1 : 1; // Place strings before numbers
            }
        });

        setUsernameList(resultA)
    }, [activityList])

    const handleRemoveAct = (item: Activity) => {
        if (window.confirm(Locale.UI.Confirm + ' ' + Locale.UI.Remove + ' ' + Locale.Activity.Title + ': ' + item.name)) {
            removeActivity({
                sum: activitySum,
                item: item,
            })
            refreshData();
        }
    };

    const handleAddAct = () => {
        let act = emptyActivity();
        act.contributor = username;
        setActivity(act);
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

    const handleRemoveItem = (act: ActivityShadow, people: ActivityItem) => {
        if (window.confirm(Locale.UI.Confirm + ' ' + Locale.UI.Remove + ' ' + Locale.Activity.Participant + ': ' + people.user)) {
            removeItem({
                code: params.code,
                name: act.name,
                item: people
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
        const resultMap: Map<string, Map<string, number>> = new Map();

        data.list.map((activity) => {
            const sum: number = activity.people.reduce((acc, obj) => acc + obj.count, 0);
            const eachPay: number = divideWithScale(activity.money, sum, 2);
            const contributor = activity.contributor ? activity.contributor : activitySum.creater;
            const actResultMap: Map<string, number> = new Map();
            activity.people.map((people) => {
                people.money = numberWithScale(eachPay * people.count, 2);
                if (actResultMap.has(people.user)) {
                    actResultMap.set(people.user, numberWithScale(actResultMap.get(people.user)! + people.money, 2));
                } else {
                    actResultMap.set(people.user, people.money);
                }
            })
            let record = resultMap.get(contributor);
            if (record) {
                record = mergeCalResultMaps(record, actResultMap);
            } else {
                record = actResultMap;
            }
            resultMap.set(contributor, record);
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
                    <Button onClick={doUpload} disabled={loading} className="mx-1 my-1 bg-cyan-600">{Locale.Activity.Upload}</Button>
                    <Button onClick={doSync} disabled={loading} className="mx-1 my-1 bg-cyan-600">{Locale.Activity.Sync}</Button>
                    <Button onClick={doCalculate} disabled={loading} className="mx-1 my-1 bg-teal-500">{Locale.Activity.Calculate}</Button>
                    <ClipboardCopy copyText={fullUrl} className="mx-1 my-1" />
                </div>
            </div>
            <div>
                {loading && <Loading />}
                {!loading && activityList.map((shadow, index) => (
                    <div className="border border-solid border-slate-300 rounded-md my-3 py-2 px-2">
                        {/* <div key={shadow.name} className="flex justify-between items-center pb-2 border-b-2 border-b-sky-200"> */}
                        {/** ERROR here */}
                        <div key={shadow.name} className="pb-2 border-b-2 border-b-sky-200">
                            <div className="grid grid-flow-row gap-2 md:grid-cols-6 grid-cols-3">
                                <div className="font-semibold text-md">{Locale.Activity.Title} {index + 1}</div>
                                <div className="font-semibold text-md"><span className="text-wrap">{shadow.name}</span></div>
                                <div className="font-semibold text-md">{shadow.contributor} {Locale.Activity.Cost} {shadow.money}</div>
                            </div>
                        </div>
                        {shadow.people.map((people, index) => (
                            <div key={people.user} className="flex justify-between items-center p-1">
                                <div>{Locale.Activity.Participant} {people.user}</div>
                                <div>{Locale.Activity.ParticipantCount}: {people.count}</div>
                                <div>{Locale.Activity.Apportion}: {people.money}</div>
                                <Button onClick={() => handleRemoveItem(shadow, people)} variant={"destructive"} size={"sm"}>{Locale.UI.Remove}</Button>
                            </div>
                        ))}
                        {shadow.shadow.show &&
                            <div className="border-solid rounded-md shadow-md my-3 mx-1 py-3 px-1">
                                <div className="mb-1.5">
                                    <Input type="text" placeholder={Locale.Activity.Participant} value={shadow.shadow.user}
                                        onChange={(e) => setItem(shadow, shadow.shadow.count, e.currentTarget.value.trim())} />
                                </div>
                                <div className="mb-1.5">
                                    <ColorfulUsernameList list={usernameList} removeList={shadow.people.map(p => p.user)}
                                        setFunc={(e) => setItem(shadow, shadow.shadow.count, e)}
                                    ></ColorfulUsernameList>
                                </div>
                                <div className="mb-1.5 flex space-x-4">
                                    <Input className="flex-1" type="number" placeholder={Locale.Activity.ParticipantCount} value={shadow.shadow.count}
                                        onChange={(e) => setItem(shadow, parseInt(e.currentTarget.value.trim()), shadow.shadow.user)} />
                                    <Button className="flex-1" onClick={() => setItem(shadow, shadow.shadow.count - 1, shadow.shadow.user)} variant={"outline"}>-1</Button>
                                    <Button className="flex-1" onClick={() => setItem(shadow, shadow.shadow.count + 1, shadow.shadow.user)} variant={"outline"}>+1</Button>
                                </div>
                                <div className="flex justify-between items-right">
                                    <Button onClick={() => confirmAddItem(shadow)} variant={"secondary"}>&#9989; {Locale.UI.Confirm}</Button>
                                    <Button onClick={() => cancelAddItem(shadow)} variant={"secondary"}>&#10060; {Locale.UI.Cancel}</Button>
                                </div>
                            </div>
                        }
                        <div className="pb-1 border-t-2 border-t-sky-200">
                            <div className="pt-1 flex flex-row-reverse">
                                <Button className="mx-1" onClick={() => handleRemoveAct(shadow)} variant={"destructive"}>{Locale.UI.Remove} {Locale.Activity.Title} {shadow.name}</Button>
                                <Button className="bg-cblue mx-1" onClick={() => handleAddItem(shadow)}>{Locale.Activity.AddOne + Locale.Activity.Participant}</Button>
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && activityShow &&
                    <div className="rounded-md shadow-md my-3 mx-1 py-3 px-1">
                        <div>{Locale.Activity.AddOne} {Locale.Activity.Title}</div>
                        <div className="mb-1.5">
                            <Input type="text" placeholder={Locale.Activity.Contributor} value={activity.contributor}
                                onChange={(e) => setActivity({ ...activity, contributor: e.currentTarget.value.trim() })} />
                        </div>
                        <div className="mb-1.5">
                            <Input type="text" placeholder={Locale.Activity.Name} value={activity.name}
                                onChange={(e) => setActivity({ ...activity, name: e.currentTarget.value.trim() })} />
                        </div>
                        <div className="mb-1.5">
                            <Input type="number" placeholder={Locale.Activity.Cost} value={activity.money}
                                onChange={(e) => setActivity({ ...activity, money: stringToFloat2(e.currentTarget.value.trim()) })} />
                        </div>
                        <div className="flex justify-between items-right">
                            <Button onClick={confirmAddAct} variant={"secondary"}>&#9989; {Locale.UI.Confirm}</Button>
                            <Button onClick={cancelAddAct} variant={"secondary"}>&#10060; {Locale.UI.Cancel}</Button>
                        </div>
                    </div>
                }
                <div ref={addActRef}></div>

                {!loading &&
                    <div className="fixed bottom-0 left-0 right-0 flex justify-center mb-1">
                        <Button onClick={handleAddAct} disabled={loading} className={"bg-cblue"}
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

const UserMapComponent = ({ userMap }: { userMap: Map<string, Map<string, number>> }) => (
    <div className="flex items-center justify-center">
        <div className="w-5/12">
            <h1>{Locale.Activity.ShouldPay}</h1>
        </div>
        <div className="w-screen">
            <ul>
                {Array.from(userMap).map(([username, resultMap]) => (
                    <>
                        <li className="border-4 border-dashed my-2">
                            <strong>{username} {Locale.Activity.Receive}:</strong>
                            <ul className="pl-8">
                                {Array.from(resultMap).map(([username, money]) => (
                                    <li key={username}>
                                        <div>
                                            {username} : {money}
                                        </div>
                                    </li>
                                ))
                                }
                            </ul>
                        </li>
                    </>
                ))}
            </ul>
        </div>
    </div>
);
const ColorfulUsernameList = ({ list, removeList, setFunc }
    : {
        list: string[],
        removeList: string[],
        setFunc: (username: string) => void
    }) => {
    const colors = ['lightblue', 'lightgreen', 'lightcoral', 'lightsalmon', 'lightsteelblue']; // Define a set of colors
    const [filteredList, setFilteredList] = useState<string[]>([]);

    useEffect(() => {
        setFilteredList(list)
        if (removeList && removeList.length > 0) {
            const result = list.filter(itemA => !removeList.includes(itemA));
            setFilteredList(result)
        }
    }, [])

    return (
        <div className="flex flex-wrap">
            {filteredList.map((username, index) => (
                <div className="px-2 py-2 mb-1 mr-2"
                    onClick={() => setFunc(username)}
                    key={index} style={{ backgroundColor: colors[index % colors.length] }}>
                    {username}
                </div>
            ))}
        </div>
    );
};
export default ActivityCodePage;