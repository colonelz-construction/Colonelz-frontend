import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { HiOutlineBell, HiOutlineMailOpen } from 'react-icons/hi';
import Dropdown from '@/components/ui/Dropdown';
import useResponsive from '@/utils/hooks/useResponsive';
import { Badge, Button, Tooltip, Spinner } from '../ui'; // Import Spinner component
import { apiGetNotification, apiPutNotificationUpdate } from '@/services/CrmService';
import type FilterFn from '@tanstack/react-table';
import Notification from '@/components/template/Notification';
import { useLocation, useNavigate } from 'react-router-dom';

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
  type: string;
  itemId: string;
}

const Notification1 = () => {
  const userId = localStorage.getItem('userId');
  
  // Early return if no userId
  if (!userId) {
    return (
      <div className="mr-2">
        <HiOutlineBell className="mt-[0.4rem] text-2xl rounded-md cursor-pointer text-gray-400" />
      </div>
    );
  }
  const [notificationData, setNotificationData] = useState<Notification[] | []>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false); // Add loading state
  const [error, setError] = useState(false); // Add error state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Track dropdown state
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false); // Track mark all as read loading
  const [processingNotification, setProcessingNotification] = useState<string | null>(null); // Track which notification is being processed
  const observer = useRef<IntersectionObserver | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchData = useCallback(async (page: number, unreadOnly: boolean = true, resetData: boolean = false) => {
    setLoading(true); // Set loading to true when fetching data
    setError(false); // Reset error state before fetching data
    try {
      const userDetailData = await apiGetNotification(userId, page, unreadOnly);
      const newNotifications = userDetailData?.data?.NotificationData || [];

      // De-duplicate by notification_id when merging
      const mergeUnique = (existing: Notification[], incoming: Notification[]) => {
        const seen = new Set(existing.map(n => n.notification_id));
        const filteredIncoming = incoming.filter(n => {
          if (seen.has(n.notification_id)) return false;
          seen.add(n.notification_id);
          return true;
        });
        return [...existing, ...filteredIncoming];
      };

      if (resetData) {
        setNotificationData(mergeUnique([], newNotifications));
      } else {
        setNotificationData((prevData) => mergeUnique(prevData as Notification[], newNotifications));
      }
      
      setHasMore(newNotifications.length > 0);
      setLoading(false); // Set loading to false when data is fetched
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(true); // Set error state if API call fails
      setLoading(false); // Set loading to false even if there is an error
    }
  }, [userId]);

  useEffect(() => {
    fetchData(page, true, false);
  }, [page, fetchData]);

  const { larger } = useResponsive();

  // Function to handle notification click and navigation
  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Set processing state
      setProcessingNotification(notification._id);
      
      // Close the dropdown first
      setIsDropdownOpen(false);
      
      // Mark notification as read
      await handleUpdate(notification, 'One');
      
      // Refresh data to remove the read notification from the list
      setPage(1);
      await fetchData(1, true, true); // Fetch only unread notifications and reset data
      
      // Navigate based on notification type and itemId with correct parameters and default types
      if (notification.type === 'project' && notification.itemId) {
        // Use project_id parameter for project details with default 'details' type
        navigate(`/app/crm/project-details?project_id=${notification.itemId}&type=details`);
      } else if (notification.type === 'lead' && notification.itemId) {
        // Use id parameter for lead details with default 'Details' type
        navigate(`/app/crm/lead?id=${notification.itemId}&tab=Details`);
      } else if (notification.type === 'task') {
        // Navigate to task manager with appropriate default tab
        if (notification.itemId) {
          // If we have a project context, go to project tasks
          navigate(`/app/crm/taskManager?project_id=${notification.itemId}&tab=project`);
        } else {
          // Default to leads tab for general task notifications
          navigate(`/app/crm/taskManager?tab=leads`);
        }
      } else if (notification.type === 'file') {
        // Navigate to file manager with appropriate default tab
        if (notification.itemId) {
          // If we have a project context, go to project files
          navigate(`/app/crm/fileManager?project_id=${notification.itemId}&tab=project`);
        } else {
          // Default to leads tab for general file notifications
          navigate(`/app/crm/fileManager?tab=leads`);
        }
      } else {
        // Default navigation to dashboard
        navigate(`/app/crm/dashboard`);
      }
      
      // Clear processing state
      setProcessingNotification(null);
    } catch (error) {
      console.error('Error handling notification click:', error);
      
      // Clear processing state
      setProcessingNotification(null);
      
      // Close dropdown even on error
      setIsDropdownOpen(false);
      
      // Still navigate even if update fails
      if (notification.type === 'project' && notification.itemId) {
        navigate(`/app/crm/project-details?project_id=${notification.itemId}&type=details`);
      } else if (notification.type === 'lead' && notification.itemId) {
        navigate(`/app/crm/lead?id=${notification.itemId}&type=Details`);
      } else if (notification.type === 'task') {
        if (notification.itemId) {
          navigate(`/app/crm/taskManager?project_id=${notification.itemId}&tab=project`);
        } else {
          navigate(`/app/crm/taskManager?tab=leads`);
        }
      } else if (notification.type === 'file') {
        if (notification.itemId) {
          navigate(`/app/crm/fileManager?project_id=${notification.itemId}&tab=project`);
        } else {
          navigate(`/app/crm/fileManager?tab=leads`);
        }
      } else {
        navigate(`/app/crm/dashboard`);
      }
    }
  };

  // Function to handle dropdown open - just open dropdown, don't auto-mark as read
  const handleDropdownOpen = async () => {
    setIsDropdownOpen(true);
    // Only fetch data if we don't have any notifications loaded
    if (notificationData.length === 0) {
      setPage(1);
      await fetchData(1, true, true); // Fetch only unread notifications and reset data
    }
  };

  // Function to handle dropdown close
  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
    // Don't clear data, just close dropdown
  };

  const handleUpdate = async (notification: Notification, type: string) => {
    try {
      if (type === 'All') {
        setIsMarkingAllRead(true);
      }
      
      await apiPutNotificationUpdate(notification.notification_id, type);
      
      if (type === 'All') {
        // Mark all as read and refresh data to only show unread notifications
        setNotificationData([]);
        setPage(1);
        await fetchData(1, true, true); // Fetch only unread notifications and reset data
        setIsMarkingAllRead(false);
      } else {
        // Mark individual notification as read
        setNotificationData((prevData) =>
          prevData.map((item) =>
            item.notification_id === notification.notification_id ? { ...item, status: true } : item
          )
        );
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      setError(true);
      setIsMarkingAllRead(false);
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

  // Memoize unread notifications calculation to prevent unnecessary re-renders
  const unreadNotifications = useMemo(() => {
    return (notificationData || []).filter((notification: Notification) => !notification.status);
  }, [notificationData]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);
  
  // Close dropdown on route changes (ensures modal closes when redirected)
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname, location.search]);
  
  // Always show all notifications in dropdown, but use unread count for badge
  const displayNotifications = notificationData;

  return (
    <div>
      <Dropdown
        key={`${location.pathname}${location.search}${location.key ?? ''}`}
        renderTitle={
          unreadNotifications.length > 0 ? 

          <>
            <Badge className="mr-4 text-2xl rounded-md cursor-pointer" content={unreadNotifications.length}>
              <HiOutlineBell />
            </Badge>
          </>
          :

          <>
            {/* <Badge className="mr-4 text-2xl rounded-md cursor-pointer" content={unreadNotifications.length}> */}
          

              <HiOutlineBell className='mt-[0.4rem] text-2xl rounded-md cursor-pointer' />
           
            {/* </Badge> */}
          </>

        }
        className="mr-2"
        menuClass="p-0 w-[200px] min-w-[250px] md:min-w-[350px] max-h-85 "
        placement={larger.md ? 'bottom-end' : 'bottom-center'}
        style={{ scrollbarWidth: 'none' }}
        onToggle={(isOpen) => {
          if (isOpen) {
            handleDropdownOpen();
          } else {
            handleDropdownClose();
          }
        }}
      >
        <Dropdown.Item variant="header">
          <div className="border-b border-gray-200 dark:border-gray-600 px-6 py-4 flex items-center justify-between mb-4 ">
            <h6>Notifications</h6>
            <Tooltip title="Mark all as read">
              <Button
                variant="plain"
                shape="circle"
                size="sm"
                icon={isMarkingAllRead ? <Spinner size="sm" /> : <HiOutlineMailOpen className="text-xl" />}
                onClick={() => {
                  if (notificationData.length > 0 && !isMarkingAllRead) {
                    handleUpdate(notificationData[0], 'All');
                  }
                }}
                disabled={notificationData.length === 0 || isMarkingAllRead}
              />
            </Tooltip>
          </div>
        </Dropdown.Item>
        <div className="ltr: rtl: text-sm overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="overflow-y-auto h-[250px] pb-8" style={{ scrollbarWidth: 'none' }}>
            {displayNotifications.length === 0 ? (
              <div className="flex justify-center items-center h-32 text-gray-500">
                No notifications
              </div>
            ) : (
              displayNotifications.map((notification, index) => {
                if (displayNotifications.length === index + 1) {
                  return (
                    <div
                      ref={lastNotificationElementRef}
                      key={notification._id}
                      className={`px-6 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ${
                        notification.status 
                          ? 'opacity-75 bg-gray-50 dark:bg-gray-800' 
                          : 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                      } ${processingNotification === notification._id ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start">
                        {!notification.status && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        )}
                        <div className="flex-1">
                          <p
                            className={`${
                              notification.status 
                                ? 'text-gray-600 dark:text-gray-400 font-normal' 
                                : 'text-gray-900 dark:text-white font-semibold'
                            }`}
                          >
                            {notification.message}
                          </p>
                          {processingNotification === notification._id && (
                            <div className="flex items-center mt-1">
                              <Spinner size="sm" />
                              <span className="ml-2 text-xs text-gray-500">Processing...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={notification._id}
                      className={`px-6 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ${
                        notification.status 
                          ? 'opacity-75 bg-gray-50 dark:bg-gray-800' 
                          : 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                      } ${processingNotification === notification._id ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start">
                        {!notification.status && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        )}
                        <div className="flex-1">
                          <p
                            className={`${
                              notification.status 
                                ? 'text-gray-600 dark:text-gray-400 font-normal' 
                                : 'text-gray-900 dark:text-white font-semibold'
                            }`}
                          >
                            {notification.message}
                          </p>
                          {processingNotification === notification._id && (
                            <div className="flex items-center mt-1">
                              <Spinner size="sm" />
                              <span className="ml-2 text-xs text-gray-500">Processing...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              })
            )}
            {loading && (
              <div className="flex justify-center py-4">
                <Spinner /> 
              </div>
            )}
            {error && (
              <div className="flex justify-center py-4 text-red-500 cursor-pointer" onClick={() => fetchData(page, true, true)}>
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