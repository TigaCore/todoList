import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ActivityLog } from '../types/timeline';
import { CheckCircle2, Circle, PenLine, Trash2, PlusCircle, StickyNote } from 'lucide-react';

interface TimelineViewProps {
    activities: ActivityLog[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ activities }) => {

    const groupedActivities = useMemo(() => {
        const groups: { [key: string]: ActivityLog[] } = {};

        activities.forEach(log => {
            const date = parseISO(log.timestamp);
            let key = format(date, 'yyyy-MM-dd');

            if (isToday(date)) key = 'Today';
            else if (isYesterday(date)) key = 'Yesterday';

            if (!groups[key]) groups[key] = [];
            groups[key].push(log);
        });

        return Object.entries(groups).map(([date, logs]) => ({
            date,
            logs: logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        }));
    }, [activities]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'CREATE': return <PlusCircle size={20} className="text-blue-500" />;
            case 'COMPLETE': return <CheckCircle2 size={20} className="text-green-500" />;
            case 'UNCOMPLETE': return <Circle size={20} className="text-yellow-500" />;
            case 'UPDATE_CONTENT': return <PenLine size={20} className="text-purple-500" />;
            case 'UPDATE_NOTE': return <StickyNote size={20} className="text-indigo-500" />;
            case 'DELETE': return <Trash2 size={20} className="text-red-500" />;
            default: return <Circle size={20} className="text-gray-400" />;
        }
    };

    const getDescription = (log: ActivityLog) => {
        const title = log.metadata_Snapshot?.title || 'Unknown Task';
        switch (log.action_type) {
            case 'CREATE': return <span>Created task <span className="font-medium">"{title}"</span></span>;
            case 'COMPLETE': return <span>Completed <span className="font-medium">"{title}"</span></span>;
            case 'UNCOMPLETE': return <span>Unchecked <span className="font-medium">"{title}"</span></span>;
            case 'UPDATE_CONTENT': return <span>Updated <span className="font-medium">"{title}"</span></span>;
            case 'DELETE': return <span>Deleted <span className="font-medium">"{title}"</span></span>;
            default: return <span>Activity on <span className="font-medium">"{title}"</span></span>;
        }
    };

    return (
        <div className="max-w-xl mx-auto py-8 px-4">
            {groupedActivities.map((group, groupIndex) => (
                <div key={group.date} className="mb-8">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 pl-2">{group.date}</h3>
                    <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-4 space-y-8">
                        {group.logs.map((log, index) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative pl-8"
                            >
                                {/* Dot on timeline */}
                                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                                </div>

                                {/* Content Card */}
                                <div className="glass-card p-4 rounded-xl flex items-start gap-4">
                                    <div className="bg-white/50 dark:bg-gray-700/50 p-2 rounded-lg backdrop-blur-sm shadow-sm">
                                        {getIcon(log.action_type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-1">
                                                {format(parseISO(log.timestamp), 'h:mm a')}
                                            </p>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300">
                                            {getDescription(log)}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}

            {activities.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <p>No activities found yet.</p>
                </div>
            )}
        </div>
    );
};

export default TimelineView;
