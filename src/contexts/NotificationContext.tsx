import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// Define the structure of a notification
interface Notification {
    type: string;
    id: string;
    message: string;
}

// Define the context type
interface NotificationContextType {
    notifications: Notification[];
    notifiedAlarms: Set<string>;
    addNotification: (notification: Notification) => void;
    clearNotifications: () => void;
    addNotifiedAlarm: (alarmId: string) => void;
    isAlarmNotified: (alarmId: string) => boolean;
}

// Create the Notification context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Define the NotificationProvider component
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notifiedAlarms, setNotifiedAlarms] = useState<Set<string>>(new Set());

    const addNotification = useCallback((notification: Notification) => {
        setNotifications((prev) => {
            if (!prev.find((n) => n.id === notification.id)) {
                return [...prev, notification];
            }
            return prev;
        });
        console.log('Added Notification:', notification);
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
        console.log('Cleared Notifications');
    }, []);

    const addNotifiedAlarm = useCallback((alarmId: string) => {
        setNotifiedAlarms((prev) => {
            const newSet = new Set(prev);
            newSet.add(alarmId);
            console.log(`Alarm ID ${alarmId} added to notified alarms`);
            return newSet;
        });
    }, []);

    const isAlarmNotified = useCallback((alarmId: string) => {
        return notifiedAlarms.has(alarmId);
    }, [notifiedAlarms]);

    return (
        <NotificationContext.Provider value={{ notifications, notifiedAlarms, addNotification, clearNotifications, addNotifiedAlarm, isAlarmNotified }}>
            {children}
        </NotificationContext.Provider>
    );
};

// Custom hook to use the Notification context
export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
