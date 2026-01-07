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
    onToggle: (id: number, currentStatus: boolean) => void;
    onDelete: (id: number) => void;
    onOpenNotes: (todo: Todo) => void;
    onUpdateDate: (id: number, date: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onOpenNotes, onUpdateDate }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className={`glass-card p-4 rounded-xl flex items-center gap-4 group ${todo.is_completed ? 'opacity-60' : ''
                }`}
        >
            <button
                onClick={() => onToggle(todo.id, todo.is_completed)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${todo.is_completed
                        ? 'bg-indigo-500 border-indigo-500 text-white'
                        : 'border-indigo-200 hover:border-indigo-400'
                    }`}
            >
                {todo.is_completed && <Check size={14} strokeWidth={3} />}
            </button>

            <div className="flex-1 min-w-0">
                <h3 className={`font-medium text-gray-800 truncate transition-all ${todo.is_completed ? 'line-through text-gray-400' : ''
                    }`}>
                    {todo.title}
                </h3>
                {todo.description && (
                    <p className="text-sm text-gray-500 truncate">{todo.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                    {todo.due_date && (
                        <span className="flex items-center text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                            <Calendar size={12} className="mr-1" />
                            {format(new Date(todo.due_date), 'MMM d, HH:mm')}
                        </span>
                    )}
                    {todo.content && (
                        <span className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            <FileText size={12} className="mr-1" />
                            Notes
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onOpenNotes(todo)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white/50 rounded-lg transition-colors tooltip"
                    title="Open Notes"
                >
                    <FileText size={18} />
                </button>

                <div className="relative">
                    <input
                        type="datetime-local"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full"
                        onChange={(e) => onUpdateDate(todo.id, e.target.value)}
                    />
                    <button className="p-2 text-gray-400 hover:text-orange-500 hover:bg-white/50 rounded-lg transition-colors">
                        <Bell size={18} />
                    </button>
                </div>

                <button
                    onClick={() => onDelete(todo.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-white/50 rounded-lg transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </motion.div>
    );
};

export default TodoItem;
