import { Avatar, AvatarProps, Card, Spinner, Timeline } from '@/components/ui'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Customer, ProjectUpdate } from '../store'
import { apiGetCrmProjectActivity } from '@/services/CrmService'

type CustomerProfileProps = {
    Data: Customer
}
type TimelineAvatarProps = AvatarProps

const TimelineAvatar = ({ children, ...rest }: TimelineAvatarProps) => {
    return (
        <Avatar {...rest} size={25} shape="circle">
            {children}
        </Avatar>
    )
}
const Activity = ({ Data }: CustomerProfileProps) => {
    const queryParams = new URLSearchParams(location.search);
    const projectId = queryParams.get('project_id')
    const [loading, setLoading] = useState<any>(false)
    const [error, setError] = useState<any>(false)
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const observer = useRef<IntersectionObserver | null>(null);
    // console.log(Data)

    const [activityData, setActivityData] = useState<any[]>([]);
    // console.log(activityData)

    const fetchData = useCallback(async (page: number) => {
        setLoading(true); // Set loading to true when fetching data
        setError(false); // Reset error state before fetching data
        try {
            const act = await apiGetCrmProjectActivity(projectId, page);
            const newAct = act.data.activities || [];
            setActivityData((prevData) => [...prevData, ...newAct]);
            setHasMore(newAct.length > 0);
            setLoading(false); // Set loading to false when data is fetched
        } catch (err) {
            setError(true); // Set error state if API call fails
            setLoading(false); // Set loading to false even if there is an error
        }
    }, []);

    useEffect(() => {
        fetchData(page);
    }, [page, fetchData]);

    const lastActivityElementRef = useCallback(
        (node: any) => {
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && !error) {
                    setPage((prevPage) => prevPage + 1);
                }
            });
            if (node) observer.current.observe(node);
        },
        [hasMore, loading, error]
    );


    return (
        <Card className=''>
            <h4 className='font-bold capitalize py-3'>Project Activity</h4>
            <Timeline className='mt-4'>
                <div className="ltr: rtl: text-sm overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                    <div className="overflow-y-auto h-[250px] pb-8" style={{ scrollbarWidth: 'none' }}>
                        {activityData?.map((item, index) => {

                            if (activityData.length === index + 1) {

                                return <Timeline.Item
                                    ref={lastActivityElementRef}
                                    media={
                                        <TimelineAvatar className="bg-amber-500">
                                            {item.username[0]}
                                        </TimelineAvatar>
                                    }>
                                    <p className="my-1 flex items-center">
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                                            {item.username}{' '}
                                        </span>
                                        <span className="mx-2">{item.message} </span>
                                        <span className="ml-3 rtl:mr-3">
                                            {new Date(item.updated_date)?.toLocaleString('en-GB', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            }).replace(/[/,]/g, '-').replace(/,/, '')}
                                        </span>
                                    </p>

                                </Timeline.Item>

                            } else {

                                return <Timeline.Item
                                    media={
                                        <TimelineAvatar className="bg-amber-500">
                                            {item.username[0]}
                                        </TimelineAvatar>
                                    }>
                                    <p className="my-1 flex items-center">
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                                            {item.username}{' '}
                                        </span>
                                        <span className="mx-2">{item.message} </span>
                                        <span className="ml-3 rtl:mr-3">
                                            {new Date(item.updated_date)?.toLocaleString('en-GB', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            }).replace(/[/,]/g, '-').replace(/,/, '')}
                                        </span>
                                    </p>

                                </Timeline.Item>

                            }




                        })}

                        {loading && (
                            <div className="flex justify-center py-4">
                                <Spinner />
                            </div>
                        )}
                        {error && (
                            <div className="flex justify-center py-4 text-red-500 cursor-pointer" onClick={() => fetchData(page)}>
                                Failed to load Activity. Please try again.
                            </div>
                        )}
                    </div>
                </div>
            </Timeline>
        </Card>
    )
}

export default Activity
