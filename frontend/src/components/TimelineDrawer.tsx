import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { X, CheckCircle2, Circle, PenLine, Trash2, PlusCircle, StickyNote, Loader2, Sun, Moon } from 'lucide-react';
import api from '../api/client';

interface ActivityLog {
    id: number;
    action_type: 'CREATE' | 'COMPLETE' | 'UNCOMPLETE' | 'UPDATE_CONTENT' | 'DELETE';
    todo_id: number | null;
    metadata_Snapshot?: {
        title?: string;
        [key: string]: any;
    };
    timestamp: string;
}

interface Todo {
    id: number;
    title: string;
    description?: string;
    content?: string;
    is_completed: boolean;
    due_date?: string;
    reminder_at?: string;
}

interface TimelineDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    todos: Todo[];
    onOpenTodo: (todo: Todo) => void;
}

interface DayGroup {
    date: string;
    displayDate: string;
    logs: ActivityLog[];
    summary: {
        completed: number;
        created: number;
        updated: number;
    };
}

// Helper function to parse timestamp and convert to local time
const parseTimestamp = (timestamp: string): Date => {
    // If timestamp ends with 'Z' or has no timezone, treat as UTC and convert to local
    // If it already has timezone info, JavaScript Date will handle it
    const date = new Date(timestamp);
    return date;
};

// Format time in local timezone
const formatLocalTime = (timestamp: string): string => {
    const date = parseTimestamp(timestamp);
    return format(date, 'h:mm a');
};

const TimelineDrawer: React.FC<TimelineDrawerProps> = ({ isOpen, onClose, todos, onOpenTodo }) => {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchActivities();
        }
    }, [isOpen]);

    // Auto-scroll to bottom when activities load (to show most recent)
    useEffect(() => {
        if (!isLoading && activities.length > 0 && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [isLoading, activities]);

    const fetchActivities = async () => {
        try {
            setIsLoading(true);
            const response = await api.get<ActivityLog[]>('/timeline/');
            setActivities(response.data);
        } catch (err) {
            console.error('Failed to fetch timeline', err);
        } finally {
            setIsLoading(false);
        }
    };

    const groupedActivities = useMemo((): DayGroup[] => {
        const groups: { [key: string]: ActivityLog[] } = {};

        activities.forEach(log => {
            // Parse timestamp and get local date for grouping
            const localDate = parseTimestamp(log.timestamp);
            const key = format(localDate, 'yyyy-MM-dd');
            if (!groups[key]) groups[key] = [];
            groups[key].push(log);
        });

        return Object.entries(groups).map(([dateKey, logs]) => {
            // Sort oldest first (top to bottom = oldest to newest)
            const sortedLogs = logs.sort((a, b) =>
                parseTimestamp(a.timestamp).getTime() - parseTimestamp(b.timestamp).getTime()
            );

            const [year, month, day] = dateKey.split('-').map(Number);
            const localDate = new Date(year, month - 1, day);

            const summary = {
                completed: logs.filter(l => l.action_type === 'COMPLETE').length,
                created: logs.filter(l => l.action_type === 'CREATE').length,
                updated: logs.filter(l => l.action_type === 'UPDATE_CONTENT').length,
            };

            let displayDate = format(localDate, 'EEEE, MMM d');
            if (isToday(localDate)) displayDate = 'Today';
            else if (isYesterday(localDate)) displayDate = 'Yesterday';

            return {
                date: dateKey,
                displayDate,
                logs: sortedLogs,
                summary,
            };
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [activities]);

    const getIconWithBg = (type: string) => {
        switch (type) {
            case 'CREATE':
                return (
                    <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50">
                        <PlusCircle size={18} className="text-blue-500" />
                    </div>
                );
            case 'COMPLETE':
                return (
                    <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/50">
                        <CheckCircle2 size={18} className="text-green-500" />
                    </div>
                );
            case 'UNCOMPLETE':
                return (
                    <div className="p-2 rounded-xl bg-yellow-100 dark:bg-yellow-900/50">
                        <Circle size={18} className="text-yellow-500" />
                    </div>
                );
            case 'UPDATE_CONTENT':
                return (
                    <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50">
                        <PenLine size={18} className="text-purple-500" />
                    </div>
                );
            case 'DELETE':
                return (
                    <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/50">
                        <Trash2 size={18} className="text-red-500" />
                    </div>
                );
            default:
                return (
                    <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700/50">
                        <Circle size={18} className="text-gray-400" />
                    </div>
                );
        }
    };

    const getDescription = (log: ActivityLog) => {
        const title = log.metadata_Snapshot?.title || 'Unknown Task';
        switch (log.action_type) {
            case 'CREATE': return `Created "${title}"`;
            case 'COMPLETE': return `Completed "${title}"`;
            case 'UNCOMPLETE': return `Unchecked "${title}"`;
            case 'UPDATE_CONTENT': return `Updated "${title}"`;
            case 'DELETE': return `Deleted "${title}"`;
            default: return `Activity on "${title}"`;
        }
    };

    const handleCardClick = (log: ActivityLog) => {
        if (log.todo_id && log.action_type !== 'DELETE') {
            const todo = todos.find(t => t.id === log.todo_id);
            if (todo) {
                onOpenTodo(todo);
                onClose();
            }
        }
    };

    const getSummaryText = (summary: DayGroup['summary']) => {
        const parts = [];
        if (summary.completed > 0) parts.push(`${summary.completed} Completed`);
        if (summary.created > 0) parts.push(`${summary.created} Created`);
        if (summary.updated > 0) parts.push(`${summary.updated} Updated`);
        return parts.join(' · ') || 'No activities';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="glass-backdrop fixed inset-0 z-40"
                    />

                    {/* Drawer from Right */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{
                            type: "spring",
                            stiffness: 320,
                            damping: 30,
                            mass: 0.85
                        }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[420px] glass-modal z-50 flex flex-col rounded-l-3xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-5 pt-safe border-b border-gray-100/50 dark:border-gray-700/50 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/50 dark:to-purple-950/50">
                            <div>
                                <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100">Timeline</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your activity history</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {isLoading ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 size={28} className="animate-spin text-indigo-500" />
                                </div>
                            ) : activities.length === 0 ? (
                                <div className="text-center py-20 text-gray-400">
                                    <StickyNote size={40} className="mx-auto mb-3 opacity-50" />
                                    <p>No activities yet.</p>
                                    <p className="text-sm mt-1">Start creating tasks to see your timeline!</p>
                                </div>
                            ) : (
                                groupedActivities.map((group) => (
                                    <div key={group.date} className="mb-8">
                                        {/* Day Header */}
                                        <div className="mb-4 px-1">
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{group.displayDate}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {getSummaryText(group.summary)}
                                            </p>
                                        </div>

                                        {/* Timeline Container with Fixed Day Start/End */}
                                        <div className="relative border-l-2 border-dashed border-gray-200 dark:border-gray-700 ml-3">
                                            {/* Day Started Marker (Fixed) */}
                                            <div className="relative pl-6 pb-3">
                                                <div className="absolute -left-[7px] top-2 w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-900/50"></div>
                                                <div className="glass-card p-3 rounded-xl flex items-center gap-3 bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200/50 dark:border-amber-800/50">
                                                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50">
                                                        <Sun size={18} className="text-amber-500" />
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Day Started</p>
                                                </div>
                                            </div>

                                            {/* Scrollable Activity Items */}
                                            <div
                                                ref={scrollContainerRef}
                                                className="max-h-[40vh] overflow-y-auto scroll-smooth space-y-3 py-2"
                                            >
                                                {group.logs.map((log, index) => (
                                                    <motion.div
                                                        key={log.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.03 }}
                                                        onClick={() => handleCardClick(log)}
                                                        className={`relative pl-6 ${log.todo_id && log.action_type !== 'DELETE' ? 'cursor-pointer' : ''}`}
                                                    >
                                                        {/* Dot */}
                                                        <div className="absolute -left-[5px] top-3 w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>

                                                        {/* Card */}
                                                        <div className={`glass-card p-3 rounded-xl flex items-center gap-3 transition-all backdrop-blur-sm ${log.todo_id && log.action_type !== 'DELETE' ? 'hover:bg-white/80 dark:hover:bg-gray-700/80 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]' : ''}`}>
                                                            {getIconWithBg(log.action_type)}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                                                    {getDescription(log)}
                                                                </p>
                                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                                    {formatLocalTime(log.timestamp)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            {/* Day Ended Marker (Fixed) */}
                                            <div className="relative pl-6 pt-3">
                                                <div className="absolute -left-[7px] top-5 w-3 h-3 rounded-full bg-indigo-400 dark:bg-indigo-500 ring-4 ring-indigo-100 dark:ring-indigo-900/50"></div>
                                                <div className="glass-card p-3 rounded-xl flex items-center gap-3 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200/50 dark:border-indigo-800/50">
                                                    <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/50">
                                                        <Moon size={18} className="text-indigo-500" />
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Day Ended</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default TimelineDrawer;
