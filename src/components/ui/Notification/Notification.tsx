import { forwardRef, useCallback, useState } from 'react'
import classNames from 'classnames'
import useTimeout from '../hooks/useTimeout'
import CloseButton from '../CloseButton'
import StatusIcon from '../StatusIcon'
import type { CommonProps, TypeAttributes } from '../@types/common'
import type { ReactNode, MouseEvent } from 'react'

export interface NotificationProps extends CommonProps {
    closable?: boolean
    customIcon?: ReactNode | string
    duration?: number
    onClose?: (e: MouseEvent<HTMLSpanElement>) => void
    onClick?: (e: MouseEvent<HTMLDivElement>) => void
    title?: string
    triggerByToast?: boolean
    type?: TypeAttributes.Status
    width?: number | string
    read?: boolean
    persistent?: boolean
}

const Notification = forwardRef<HTMLDivElement, NotificationProps>(
    (props, ref) => {
        const {
            className,
            children,
            closable = false,
            customIcon,
            duration,
            onClose,
            onClick,
            style,
            title,
            triggerByToast,
            type,
            width = 350,
            read = false,
            persistent = false,
            ...rest
        } = props

        const [display, setDisplay] = useState('show')
        const [isRead, setIsRead] = useState(read)

        // Only use timeout for non-persistent notifications
        const { clear } = useTimeout(
            onClose as () => void,
            duration,
            duration > 0 && !persistent
        )

        const handleClose = useCallback(
            (e: MouseEvent<HTMLSpanElement>) => {
                e.stopPropagation() // Prevent click event from bubbling
                setDisplay('hiding')
                onClose?.(e)
                clear()
                if (!triggerByToast) {
                    setTimeout(() => {
                        setDisplay('hide')
                    }, 400)
                }
            },
            [onClose, clear, triggerByToast]
        )

        const handleClick = useCallback(
            (e: MouseEvent<HTMLDivElement>) => {
                if (!isRead) {
                    setIsRead(true)
                }
                onClick?.(e)
            },
            [isRead, onClick]
        )

        const notificationClass = classNames(
            'notification',
            {
                'notification-read': isRead,
                'notification-unread': !isRead,
                'notification-persistent': persistent,
                'cursor-pointer': onClick || !isRead
            },
            className
        )

        if (display === 'hide') {
            return null
        }

        return (
            <div
                ref={ref}
                {...rest}
                className={notificationClass}
                style={{ width: width, ...style }}
                onClick={handleClick}
            >
                <div
                    className={classNames(
                        'notification-content',
                        !children && 'no-child'
                    )}
                >
                    {type && !customIcon ? (
                        <div className="mr-3">
                            <StatusIcon type={type} />
                        </div>
                    ) : null}
                    {customIcon && <div className="mr-3">{customIcon}</div>}
                    <div className="mr-4">
                        {title && (
                            <div
                                className={classNames(
                                    'notification-title',
                                    children && 'mb-1',
                                    {
                                        'font-semibold': !isRead,
                                        'font-normal': isRead
                                    }
                                )}
                            >
                                {title}
                            </div>
                        )}
                        <div 
                            className={classNames(
                                'notification-description',
                                {
                                    'font-medium': !isRead,
                                    'font-normal': isRead
                                }
                            )}
                        >
                            {children}
                        </div>
                    </div>
                </div>
                {closable && (
                    <CloseButton
                        className="notification-close"
                        defaultStyle={false}
                        absolute={true}
                        onClick={handleClose}
                    />
                )}
            </div>
        )
    }
)

Notification.displayName = 'Notification'

export default Notification
