import React from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, FileText, Calendar, Bell, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { Todo, DocTask } from '../api/supabase';

// Re-export Todo type with optional fields for local use
interface TodoItemProps {
    todo?: Omit<Todo, 'user_id' | 'created_at'> & { user_id?: string; created_at?: string };
    docTask?: DocTask;
    index?: number;
    onToggle?: (id: number, currentStatus: boolean) => void;
    onDocTaskToggle?: (docId: number, lineIndex: number, completed: boolean) => void;
    onDelete: (id: number) => void;
    onOpenNotes?: (todo: Omit<Todo, 'user_id' | 'created_at'> & { user_id?: string; created_at?: string }) => void;
    onOpenDatePicker?: (todo: Omit<Todo, 'user_id' | 'created_at'> & { user_id?: string; created_at?: string }) => void;
    onJumpToDoc?: (docId: number, lineIndex: number) => void;
}

const TodoItem = React.forwardRef<HTMLDivElement, TodoItemProps>(({
    todo,
    docTask,
    index = 0,
    onToggle,
    onDocTaskToggle,
    onDelete,
    onOpenNotes,
    onOpenDatePicker,
    onJumpToDoc
}, ref) => {
    const { t } = useLanguage();
    // Stagger delay: each item delays by 0.05s, max 0.3s
    const staggerDelay = Math.min(index * 0.05, 0.3);

    // Determine if this is a document task or regular todo
    const isDocTask = !!docTask;
    const title = isDocTask ? docTask!.text : todo!.title;
    const isCompleted = isDocTask ? docTask!.isCompleted : todo!.is_completed;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDocTask && onDocTaskToggle) {
            onDocTaskToggle(docTask!.docId, docTask!.lineIndex, !docTask!.isCompleted);
        } else if (!isDocTask && onToggle) {
            onToggle(todo!.id, todo!.is_completed);
        }
    };

    const handleClick = () => {
        if (isDocTask && onJumpToDoc) {
            onJumpToDoc(docTask!.docId, docTask!.lineIndex);
        } else if (!isDocTask && onOpenNotes) {
            onOpenNotes(todo!);
        }
    };

    return (
        <motion.div
            ref={ref}
            layout="position"
            initial={{ opacity: 0, y: 12 }}
            animate={{
                opacity: 1,
                y: 0,
                transition: {
                    type: "spring",
                    stiffness: 350,
                    damping: 28,
                    mass: 0.8,
                    delay: staggerDelay
                }
            }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } }}
            whileHover={{
                y: -2,
                transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            whileTap={{
                scale: 0.98,
                transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            onClick={handleClick}
            className={`glass-card p-4 rounded-xl group cursor-pointer ${isCompleted ? 'opacity-60 grayscale-[0.5]' : ''}`}
        >
            <div className="flex items-center gap-4">
                <button
                    onClick={handleToggle}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isCompleted
                        ? 'bg-indigo-500 border-indigo-500 text-white shadow-sm scale-110'
                        : 'border-gray-300 dark:border-gray-500 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                        }`}
                >
                    {isCompleted && <Check size={14} strokeWidth={3} />}
                </button>

                <div className="flex-1 min-w-0">
                    <h3 className={`font-medium text-gray-800 dark:text-gray-100 truncate transition-all ${isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                        {title}
                    </h3>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {/* Source document link for document tasks */}
                        {isDocTask && (
                            <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-colors cursor-pointer group/link">
                                <ExternalLink size={10} className="mr-1 opacity-70 group-hover/link:opacity-100 transition-opacity" />
                                <span className="truncate max-w-[120px] group-hover/link:underline">{docTask!.docTitle}</span>
                            </span>
                        )}

                        {/* Due date for regular todos */}
                        {!isDocTask && todo?.due_date && (
                            <span className={`flex items-center text-xs px-2 py-0.5 rounded-full border ${new Date(todo.due_date) < new Date() && !todo.is_completed
                                ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/30 border-rose-100 dark:border-rose-800'
                                : 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-600'
                                }`}>
                                <Calendar size={12} className="mr-1" />
                                {format(new Date(todo.due_date), 'MMM d, H:mm')}
                            </span>
                        )}
                        {!isDocTask && todo?.content && (
                            <span className="flex items-center justify-center w-6 h-6 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 rounded-full" title={t('notes.hasNotes')}>
                                <FileText size={12} />
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions - only for regular todos */}
                {!isDocTask && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onOpenNotes?.(todo!); }}
                            className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Edit Notes"
                        >
                            <FileText size={18} />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); onOpenDatePicker?.(todo!); }}
                            className="p-2 text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Set Reminder"
                        >
                            <Bell size={18} />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(todo!.id); }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                )}

                {/* Jump to doc icon for document tasks */}
                {isDocTask && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onJumpToDoc?.(docTask!.docId, docTask!.lineIndex); }}
                            className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title="Jump to Document"
                        >
                            <ExternalLink size={18} />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
});

TodoItem.displayName = 'TodoItem';

export default TodoItem;

