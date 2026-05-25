"use client";

import { useState, useEffect, useRef } from 'react';
import { FiBell, FiCheck } from 'react-icons/fi';
import api from '@/services/api';
import { useSocket } from '@/context/SocketContext';
import Link from 'next/link';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { socket, connected } = useSocket();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data.data.notifications);
        setUnreadCount(response.data.data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket || !connected) return;

    socket.on('new_notification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Optional: use standard browser Notification API here
      if (Notification.permission === 'granted') {
        new window.Notification(notification.title, {
          body: notification.message
        });
      }
    });

    return () => {
      socket.off('new_notification');
    };
  }, [socket, connected]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch(`/notifications/read-all`);
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors relative text-gray-600"
      >
        <FiBell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[400px]">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Bildirimler</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-[#004d40] hover:underline font-semibold"
              >
                Tümünü Okundu İşaretle
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                Hiç bildiriminiz yok.
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 transition-colors ${!notification.is_read ? 'bg-emerald-50/30' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        {notification.link ? (
                          <Link href={notification.link} onClick={() => { if(!notification.is_read) handleMarkAsRead(notification.id); setIsOpen(false); }}>
                            <p className={`text-sm font-semibold truncate ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                              {notification.title}
                            </p>
                          </Link>
                        ) : (
                          <p className={`text-sm font-semibold truncate ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notification.title}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-[10px] font-semibold text-gray-400 mt-2 uppercase tracking-wider">
                          {new Date(notification.created_at).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <button 
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="w-6 h-6 rounded-full hover:bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 transition-colors"
                          title="Okundu İşaretle"
                        >
                          <FiCheck className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
