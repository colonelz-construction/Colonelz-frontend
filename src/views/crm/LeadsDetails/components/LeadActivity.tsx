import { Avatar, AvatarProps, Card, Spinner, Timeline } from '@/components/ui'
import { apiGetCrmLeadActivity } from '@/services/CrmService'
import useQuery from '@/utils/hooks/useQuery'
import React, { useCallback, useEffect, useRef, useState } from 'react'


export type CustomerProfileProps = {
  data?: Partial<Customer>
}

type Customer = {
  _id: string
  name: string
  lead_id: string
  email: string
  phone: string
  location: string
  status: string
  source: string
  notes?: Note[];
}

interface Note {
  username: string;
  role: string;
  message: string;
  updated_date: string;
}

type TimelineAvatarProps = AvatarProps

const TimelineAvatar = ({ children, ...rest }: TimelineAvatarProps) => {
  return (
    <Avatar {...rest} size={25} shape="circle">
      {children}
    </Avatar>
  )
}

const LeadActivity = ({ details }: any) => {
  const queryParams = new URLSearchParams(location.search);
  const leadId = queryParams.get('id')
  const [loading, setLoading] = useState<any>(false)
  const [error, setError] = useState<any>(false)
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);


  const [activityData, setActivityData] = useState<any[]>([]);
  // console.log(activityData)

  const fetchData = useCallback(async (page: number) => {
    setLoading(true); // Set loading to true when fetching data
    setError(false); // Reset error state before fetching data
    try {
      const act = await apiGetCrmLeadActivity(leadId, page);
      console.log(act)
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

  // console.log(details)

  return (
    <>
      <Timeline>

        <div className="ltr: rtl: text-sm overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="overflow-y-auto h-[250px] pb-8" style={{ scrollbarWidth: 'none' }}>
            {

              activityData?.map((note: Note, index: number) => {

                if (activityData.length === index + 1) {

                  return <Timeline.Item
                    ref={lastActivityElementRef}
                    media={
                      <TimelineAvatar className="bg-amber-500">
                        {note.username[0].toUpperCase()}
                      </TimelineAvatar>
                    }>
                    <p className="my-1 flex">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {note.username}
                      </span>
                      <span className="mx-2">{note.message} </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {note?.updated_date ? new Date(note.updated_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-') : ''}
                      </span>
                    </p>

                  </Timeline.Item>

                } else {

                  return <Timeline.Item
                    media={
                      <TimelineAvatar className="bg-amber-500">
                        {note.username[0].toUpperCase()}
                      </TimelineAvatar>
                    }>
                    <p className="my-1 flex">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {note.username}
                      </span>
                      <span className="mx-2">{note.message} </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {note?.updated_date ? new Date(note.updated_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-') : ''}
                      </span>
                    </p>

                  </Timeline.Item>

                }


              })
            }

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
    </>
  )
}

export default LeadActivity