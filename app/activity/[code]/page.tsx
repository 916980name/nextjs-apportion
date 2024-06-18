'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GET_activity, SET_activity } from "@/lib/dbkv";
import Loading from "app/loading";
import { stringToFloat2 } from "app/utils/calcu";
import { Activity, ActivityItemRequest, ActivityRequest, ActivitySummerize, emptyActivity, useActivityStore } from "app/utils/store";
import { useEffect, useState } from "react";
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
    const setStoreActivitySum: (act: ActivitySummerize) => ActivitySummerize = useActivityStore((state) => state.setActivitySum);
    const addActivity: (req: ActivityRequest) => void = useActivityStore((state) => state.addActivity);
    const removeActivity: (req: ActivityRequest) => void = useActivityStore((state) => state.removeActivity);
    const addItem: (req: ActivityItemRequest) => void = useActivityStore((state) => state.addItem);
    const removeItem: (req: ActivityItemRequest) => void = useActivityStore((state) => state.removeItem);
    const username = useActivityStore((state) => state.username);

    const [activitySum, setActivitySum] = useState<ActivitySummerize>(getActivitySum(params.code));
    const [activityList, setActivityList] = useState<ActivityShadow[]>(() => initActivityList(activitySum));
    const [activity, setActivity] = useState<Activity>(emptyActivity());
    const [activityShow, setActivityShow] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    const refreshData = () => {
        const data = getActivitySum(params.code);
        if (data) {
            setActivitySum(data);
            setActivityList(initActivityList(data));
        }
    }

    useEffect(() => {
        refreshData()
    }, [params.code, removeItem, addItem, removeActivity, addActivity])

    const handleRemoveAct = (item: Activity) => {
        if (window.confirm('confirm remove!')) {
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
        if (count < - 0) return;
        const updatedList = [...activityList];
        const foundActivity = updatedList.find(a => a.name === activity.name);
        if (!foundActivity) return;
        foundActivity.shadow = { show: true, count: count, user: username }
        setActivityList(updatedList);
    }

    const confirmAddItem = (activity: ActivityShadow) => {
        addItem({
            code: params.code,
            name: activity.name,
            item: {
                user: username,
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
        if (window.confirm('confirm remove!')) {
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
        GET_activity(params.code)
            .then((response) => {
                setStoreActivitySum(response);
                refreshData();
            }).catch((e) => {
                console.log('Activity Sync:' + params.code + ', ' + e);
            })
            .finally(() => {
                setLoading(false);
            })
    }

    return (
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
                        {Locale.Activity.CreateTime}: {activitySum.createTime.toLocaleString('en-US')}
                    </div>
                </div>
                <div>
                    <Button onClick={doUpload}>{Locale.Activity.Upload}</Button>
                    <Button onClick={doSync}>{Locale.Activity.Sync}</Button>
                </div>
            </div>
            <div>
                {loading && <Loading />}
                {!loading && activityList.map((shadow, index) => (
                    <>
                        <div key={shadow.name} className="flex justify-between items-center">
                            <div>{Locale.Activity.Title} {index + 1}</div>
                            <div>{shadow.name}</div>
                            <div>{Locale.Activity.Cost} {shadow.money}</div>
                            <Button onClick={() => handleAddItem(shadow)}>{Locale.Activity.AddOne + Locale.Activity.Participant}</Button>
                            <Button onClick={() => handleRemoveAct(shadow)}>Remove {Locale.Activity.Title}</Button>
                        </div>
                        {shadow.people.map((people, index) => (
                            <div key={people.user} className="flex justify-between items-center">
                                <div>{Locale.Activity.Participant} {people.user}</div>
                                <div>{Locale.Activity.ParticipantCount}: {people.count}</div>
                                <div>{Locale.Activity.Apportion}: {people.money}</div>
                                <Button onClick={() => handleRemoveItem(shadow)}>Remove</Button>
                            </div>
                        ))}
                        {shadow.shadow.show &&
                            <div>
                                <div>{Locale.Activity.Participant}: {username}
                                    <Input type="text" placeholder={Locale.Activity.ParticipantCount} value={shadow.shadow.user}
                                        onChange={(e) => setItem(shadow, shadow.shadow.count, e.currentTarget.value.trim())} />
                                </div>
                                <div>
                                    <Input type="number" placeholder={Locale.Activity.ParticipantCount} value={shadow.shadow.count}
                                        onChange={(e) => setItem(shadow, parseInt(e.currentTarget.value.trim()), shadow.shadow.user)} />
                                </div>
                                <div className="flex justify-between items-right">
                                    <Button onClick={() => confirmAddItem(shadow)}>confirm</Button>
                                    <Button onClick={() => cancelAddItem(shadow)}>cancel</Button>
                                </div>
                            </div>
                        }
                    </>
                ))}

                {!loading && activityShow &&
                    <div>
                        <div>
                            <Input type="text" placeholder={Locale.Activity.Name} value={activity.name}
                                onChange={(e) => setActivity({ ...activity, name: e.currentTarget.value.trim() })} />
                        </div>
                        <div>
                            <Input type="number" placeholder={Locale.Activity.Cost} value={activity.money}
                                onChange={(e) => setActivity({ ...activity, money: stringToFloat2(e.currentTarget.value.trim()) })} />
                        </div>
                        <div className="flex justify-between items-right">
                            <Button onClick={confirmAddAct}>confirm</Button>
                            <Button onClick={cancelAddAct}>cancel</Button>
                        </div>
                    </div>
                }
                {!loading && <Button onClick={handleAddAct}>{Locale.Activity.AddOne} {Locale.Activity.Title}</Button>}
            </div>
        </div>
    );
}
export default ActivityCodePage;