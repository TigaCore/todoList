import React from 'react';
import { motion } from 'framer-motion';
import { Check, Trash2, FileText, Calendar, Bell } from 'lucide-react';
import { format } from 'date-fns';

interface Todo {
    id: number;
    title: string;
    description?: string;
    content?: string;
    is_completed: boolean;
    due_date?: string;
    reminder_at?: string;
}

interface TodoItemProps {
    todo: Todo;
    index?: number;
    onToggle: (id: number, currentStatus: boolean) => void;
    onDelete: (id: number) => void;
    onOpenNotes: (todo: Todo) => void;
    onOpenDatePicker: (todo: Todo) => void;
}

const TodoItem = React.forwardRef<HTMLDivElement, TodoItemProps>(({ todo, index = 0, onToggle, onDelete, onOpenNotes, onOpenDatePicker }, ref) => {
    // Stagger delay: each item delays by 0.05s, max 0.3s
    const staggerDelay = Math.min(index * 0.05, 0.3);

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
            onClick={() => onOpenNotes(todo)}
            className={`glass-card p-4 rounded-xl group cursor-pointer ${todo.is_completed ? 'opacity-60 grayscale-[0.5]' : ''}`}
        >
            <div className="flex items-center gap-4">
                <button
                    onClick={(e) => { e.stopPropagation(); onToggle(todo.id, todo.is_completed); }}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${todo.is_completed
                        ? 'bg-indigo-500 border-indigo-500 text-white shadow-sm scale-110'
                        : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                        }`}
                >
                    {todo.is_completed && <Check size={14} strokeWidth={3} />}
                </button>

                <div className="flex-1 min-w-0">
                    <h3 className={`font-medium text-gray-800 truncate transition-all ${todo.is_completed ? 'line-through text-gray-400' : ''}`}>
                        {todo.title}
                    </h3>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {todo.due_date && (
                            <span className={`flex items-center text-xs px-2 py-0.5 rounded-full border ${new Date(todo.due_date) < new Date() && !todo.is_completed
                                ? 'text-rose-600 bg-rose-50 border-rose-100'
                                : 'text-gray-500 bg-gray-50 border-gray-100'
                                }`}>
                                <Calendar size={12} className="mr-1" />
                                {format(new Date(todo.due_date), 'MMM d, H:mm')}
                            </span>
                        )}
                        {todo.content && (
                            <span className="flex items-center text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                                <FileText size={12} className="mr-1" />
                                has notes
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onOpenNotes(todo); }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Notes"
                    >
                        <FileText size={18} />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); onOpenDatePicker(todo); }}
                        className="p-2 text-gray-400 hover:text-orange-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Set Reminder"
                    >
                        <Bell size={18} />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
});

TodoItem.displayName = 'TodoItem';

export default TodoItem;
