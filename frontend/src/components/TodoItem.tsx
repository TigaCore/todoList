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
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            whileHover={{
                backgroundColor: 'rgba(0,0,0,0.02)',
                transition: { duration: 0.2 }
            }}
            onClick={handleClick}
            className={`py-4 px-2 border-b border-gray-100 group cursor-pointer ${isCompleted ? 'opacity-50 grayscale' : ''}`}
        >
            <div className="flex items-center gap-5">
                <button
                    onClick={handleToggle}
                    className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 ${isCompleted
                        ? 'bg-[#8B7E74] border-[#8B7E74] text-white scale-100'
                        : 'border-[#8B7E74] hover:bg-[#8B7E74]/10'
                        }`}
                >
                    {isCompleted && <Check size={12} strokeWidth={2.5} />}
                </button>

                <div className="flex-1 min-w-0">
                    <h3 className={`text-[17px] tracking-tight text-[#2D2A26] truncate transition-all ${isCompleted ? 'line-through text-gray-400' : 'font-normal'}`}>
                        {title}
                    </h3>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-4 mt-1">
                        {/* Source document link */}
                        {isDocTask && (
                            <span className="inline-flex items-center text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer group/link">
                                <ExternalLink size={10} className="mr-1" />
                                <span className="truncate max-w-[150px] group-hover/link:underline">{docTask!.docTitle}</span>
                            </span>
                        )}

                        {/* Due date */}
                        {!isDocTask && todo?.due_date && (
                            <span className={`flex items-center text-xs ${new Date(todo.due_date) < new Date() && !todo.is_completed
                                ? 'text-[#B85450]'
                                : 'text-stone-400'
                                }`}>
                                <Calendar size={11} className="mr-1.5" />
                                {format(new Date(todo.due_date), 'MMM d, H:mm')}
                            </span>
                        )}

                        {!isDocTask && todo?.content && (
                            <span className="flex items-center text-stone-400" title={t('notes.hasNotes')}>
                                <FileText size={11} />
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {!isDocTask && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onOpenNotes?.(todo!); }}
                            className="p-1.5 text-gray-300 hover:text-[#2D2A26] transition-colors"
                            title={t('tasks.editNotes')}
                        >
                            <FileText size={16} />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); onOpenDatePicker?.(todo!); }}
                            className="p-1.5 text-gray-300 hover:text-[#2D2A26] transition-colors"
                            title={t('tasks.setReminder')}
                        >
                            <Bell size={16} />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(todo!.id); }}
                            className="p-1.5 text-gray-300 hover:text-[#B85450] transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}

                {/* Jump to doc icon */}
                {isDocTask && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onJumpToDoc?.(docTask!.docId, docTask!.lineIndex); }}
                            className="p-1.5 text-gray-300 hover:text-[#2D2A26] transition-colors"
                        >
                            <ExternalLink size={16} />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
});

TodoItem.displayName = 'TodoItem';

export default TodoItem;

