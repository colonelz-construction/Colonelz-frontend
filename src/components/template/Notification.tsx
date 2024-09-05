import React, { useState, useEffect } from 'react';
import { HiOutlineBell, HiOutlineMailOpen } from 'react-icons/hi';
import Dropdown from '@/components/ui/Dropdown';
import useResponsive from '@/utils/hooks/useResponsive';
import { Badge, Button, Tooltip } from '../ui';
import { apiGetNotification, apiPutNotificationUpdate } from '@/services/CrmService';
import type   FilterFn from '@tanstack/react-table';
import Notification from '@/components/template/Notification';

export type NotificationResponse={
  data:NotificatioData
}

type NotificatioData={
  NotificationData:Notification[]
}

interface Notification {
  _id: string;
  status: boolean;
  message: string;
  notification_id:string;
}
const userId=localStorage.getItem('userId');
console.log(userId);

const userDetailData = await apiGetNotification(userId);
console.log(userDetailData.data.NotificationData);

const Notification1 = () => {
  const [notificationData, setNotificationData] = useState<Notification[] | []>([]);

  useEffect(() => {
    const fetchData = async () => {
      setNotificationData(userDetailData.data.NotificationData|| []);
    };
    fetchData();
  }, []);


  const { larger } = useResponsive();
  const handleUpdate = async (notification: Notification,type:string) => {
    await apiPutNotificationUpdate(notification.notification_id,type);
    if (type === 'All') {
      setNotificationData((prevData) =>
          prevData.map((item) => ({ ...item, status: true }))
      );}
    setNotificationData((prevData) =>
      prevData.map((item) =>
        item.notification_id === notification.notification_id ? { ...item, status: true } : item
      )
    );
  };

  
  const unreadNotifications = (notificationData || []).filter((notification:Notification) => !notification.status);

  

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
                onClick={()=>handleUpdate( notificationData[0],'All')}
              />
            </Tooltip>
          </div>
        </Dropdown.Item>
        <div className="ltr: rtl: text-sm overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="overflow-y-auto h-[250px] pb-8" style={{ scrollbarWidth: 'none' }}>
            {notificationData.slice().map((notification) => (
              <div
                key={notification._id}
                className={`px-6 py-3 border-b border-gray-200 cursor-pointer ${notification.status ? 'read' : 'unread'}`}
                onClick={() => handleUpdate(notification,'One')}
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
            ))}
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
