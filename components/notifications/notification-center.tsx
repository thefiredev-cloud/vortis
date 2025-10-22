'use client';

import { useState } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { designTokens } from '@/lib/design-tokens';
import { formatRelativeTime } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationCenterProps {
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
}

export function NotificationCenter({
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-emerald-500 bg-emerald-500/5';
      case 'warning':
        return 'border-l-orange-500 bg-orange-500/5';
      case 'error':
        return 'border-l-red-500 bg-red-500/5';
      default:
        return 'border-l-cyan-500 bg-cyan-500/5';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
      >
        {unreadCount > 0 ? (
          <Bell className="h-6 w-6 text-emerald-400 animate-bounce" aria-hidden="true" />
        ) : (
          <BellOff className="h-6 w-6 text-slate-400" aria-hidden="true" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[600px] overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50">
          {/* Header */}
          <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="success" size="sm" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAllAsRead}
                  aria-label="Mark all as read"
                >
                  <Check className="h-4 w-4 mr-1" aria-hidden="true" />
                  Mark all
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-white/5">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <BellOff className="h-12 w-12 text-slate-600 mx-auto mb-4" aria-hidden="true" />
                <p className={designTokens.text.small}>No notifications yet</p>
                <p className="text-sm text-slate-500 mt-2">
                  We'll notify you when something important happens
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 ${getTypeColor(notification.type)} ${
                    !notification.read ? 'bg-white/5' : ''
                  } hover:bg-white/10 transition-colors cursor-pointer`}
                  onClick={() => onMarkAsRead?.(notification.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onMarkAsRead?.(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-medium text-sm">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="h-2 w-2 bg-emerald-500 rounded-full" aria-label="Unread" />
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatRelativeTime(notification.timestamp)}
                      </p>
                      {notification.actionUrl && notification.actionLabel && (
                        <a
                          href={notification.actionUrl}
                          className="text-sm text-emerald-400 hover:text-emerald-300 mt-2 inline-block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {notification.actionLabel} →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-4">
              <Button
                variant="ghost"
                fullWidth
                onClick={onClearAll}
                size="sm"
              >
                Clear all notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
