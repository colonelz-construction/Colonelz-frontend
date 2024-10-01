import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HiOutlineBell, HiOutlineMailOpen } from 'react-icons/hi';
import Dropdown from '@/components/ui/Dropdown';
import useResponsive from '@/utils/hooks/useResponsive';
import { Badge, Button, Tooltip, Spinner } from '../ui'; // Import Spinner component
import { apiGetNotification, apiPutNotificationUpdate } from '@/services/CrmService';
import type FilterFn from '@tanstack/react-table';
import Notification from '@/components/template/Notification';

export type NotificationResponse = {
  data: NotificatioData;
};

type NotificatioData = {
  NotificationData: Notification[];
};

interface Notification {
  _id: string;
  status: boolean;
  message: string;
  notification_id: string;
}

const userId = localStorage.getItem('userId');

const Notification1 = () => {
  const [notificationData, setNotificationData] = useState<Notification[] | []>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false); // Add loading state
  const [error, setError] = useState(false); // Add error state
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchData = useCallback(async (page: number) => {
    setLoading(true); // Set loading to true when fetching data
    setError(false); // Reset error state before fetching data
    try {
      const userDetailData = await apiGetNotification(userId, page);
      const newNotifications = userDetailData.data.NotificationData || [];
      setNotificationData((prevData) => [...prevData, ...newNotifications]);
      setHasMore(newNotifications.length > 0);
      setLoading(false); // Set loading to false when data is fetched
    } catch (err) {
      setError(true); // Set error state if API call fails
      setLoading(false); // Set loading to false even if there is an error
    }
  }, []);

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  const { larger } = useResponsive();

  const handleUpdate = async (notification: Notification, type: string) => {
    await apiPutNotificationUpdate(notification.notification_id, type);
    if (type === 'All') {
      setNotificationData((prevData) =>
        prevData.map((item) => ({ ...item, status: true }))
      );
    } else {
      setNotificationData((prevData) =>
        prevData.map((item) =>
          item.notification_id === notification.notification_id ? { ...item, status: true } : item
        )
      );
    }
  };

  const lastNotificationElementRef = useCallback(
    (node:any) => {
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

  const unreadNotifications = (notificationData || []).filter((notification: Notification) => !notification.status);

  return (
    <div>
      <Dropdown
        renderTitle={
          <>
            <Badge className="mr-4 text-2xl rounded-md cursor-pointer" content={unreadNotifications.length}>
              <HiOutlineBell />
            </Badge>
          </>
        }
        className="mr-2"
        menuClass="p-0 w-[200px] min-w-[250px] md:min-w-[350px] max-h-85 "
        placement={larger.md ? 'bottom-end' : 'bottom-center'}
        style={{ scrollbarWidth: 'none' }}
      >
        <Dropdown.Item variant="header">
          <div className="border-b border-gray-200 dark:border-gray-600 px-6 py-4 flex items-center justify-between mb-4 ">
            <h6>Notifications</h6>
            <Tooltip title="Mark all as read">
              <Button
                variant="plain"
                shape="circle"
                size="sm"
                icon={<HiOutlineMailOpen className="text-xl" />}
                onClick={() => handleUpdate(notificationData[0], 'All')}
              />
            </Tooltip>
          </div>
        </Dropdown.Item>
        <div className="ltr: rtl: text-sm overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="overflow-y-auto h-[250px] pb-8" style={{ scrollbarWidth: 'none' }}>
            {notificationData.map((notification, index) => {
              if (notificationData.length === index + 1) {
                return (
                  <div
                    ref={lastNotificationElementRef}
                    key={notification._id}
                    className={`px-6 py-3 border-b border-gray-200 cursor-pointer ${notification.status ? 'read' : 'unread'}`}
                    onClick={() => handleUpdate(notification, 'One')}
                  >
                    <p
                      style={{
                        color: notification.status ? 'gray' : 'black',
                        fontWeight: notification.status ? 'normal' : 'bold',
                      }}
                    >
                      {notification.message}
                    </p>
                  </div>
                );
              } else {
                return (
                  <div
                    key={notification._id}
                    className={`px-6 py-3 border-b border-gray-200 cursor-pointer ${notification.status ? 'read' : 'unread'}`}
                    onClick={() => handleUpdate(notification, 'One')}
                  >
                    <p
                      style={{
                        color: notification.status ? 'gray' : 'black',
                        fontWeight: notification.status ? 'normal' : 'bold',
                      }}
                    >
                      {notification.message}
                    </p>
                  </div>
                );
              }
            })}
            {loading && (
              <div className="flex justify-center py-4">
                <Spinner /> 
              </div>
            )}
            {error && (
              <div className="flex justify-center py-4 text-red-500 cursor-pointer" onClick={() => fetchData(page)}>
                Failed to load notifications. Please try again.
              </div>
            )}
          </div>
        </div>
        <Dropdown.Item variant="header">
          <div className="flex justify-center px-4 py-2"></div>
        </Dropdown.Item>
      </Dropdown>
      <div></div>
    </div>
  );
};

export default Notification1;