import React, { useState, useEffect } from 'react';
import { Bell, User, Clock, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/context/LocalizationContext';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'new_submission' | 'student_inactive' | 'assignment_due';
  message: string;
  studentId?: string;
  studentName?: string;
  assignmentId?: string;
  assignmentTitle?: string;
  createdAt: string;
  read: boolean;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAllRead: () => void;
}

const STORAGE_KEY = 'teacher_read_notifications';

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  onMarkAllRead,
}) => {
  const { t } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Load read notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setReadIds(new Set(JSON.parse(stored)));
      } catch {
        // Invalid JSON, reset
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const markAsRead = (id: string) => {
    setReadIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...newSet]));
      return newSet;
    });
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(new Set(allIds));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
    onMarkAllRead();
  };

  const actualUnreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_submission':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'student_inactive':
        return <User className="h-4 w-4 text-amber-500" />;
      case 'assignment_due':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: Notification['type']) => {
    switch (type) {
      case 'new_submission':
        return 'Submission';
      case 'student_inactive':
        return 'Inactive';
      case 'assignment_due':
        return 'Due Soon';
      default:
        return 'Notification';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative gap-2 rounded-full border-primary/20 hover:bg-primary/10 hover:scale-105 active:scale-95 transition-all px-4 py-2"
        >
          <Bell className="h-4 w-4" />
          {actualUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-in zoom-in-50">
              {actualUnreadCount > 9 ? '9+' : actualUnreadCount}
            </span>
          )}
          <span className="hidden sm:inline">{t("notifications")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h3 className="font-semibold">{t("notifications")}</h3>
          {actualUnreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-primary hover:text-primary/80"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((notification) => {
                const isRead = readIds.has(notification.id);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer relative ${
                      !isRead ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted">
                            {getTypeLabel(notification.type)}
                          </span>
                          {!isRead && (
                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
