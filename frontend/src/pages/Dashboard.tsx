import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Plus, Search, Menu, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TodoItem from '../components/TodoItem';
import NoteEditor from '../components/NoteEditor';
import Sidebar from '../components/Sidebar';
import { LocalNotifications } from '@capacitor/local-notifications';
import { isToday, parseISO } from 'date-fns';

interface Todo {
    id: number;
    title: string;
    description?: string;
    content?: string;
    is_completed: boolean;
    due_date?: string;
    reminder_at?: string;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [title, setTitle] = useState('');
    const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isInputOpen, setIsInputOpen] = useState(false);

    // Notes Editor State
    const [editingNote, setEditingNote] = useState<Todo | null>(null);

    useEffect(() => {
        fetchTodos();
        requestNotificationPermission();
    }, []);

    const requestNotificationPermission = async () => {
        try {
            await LocalNotifications.requestPermissions();
        } catch (e) {
            console.log('Notifications not supported on this platform');
        }
    };

    const fetchTodos = async () => {
        try {
            const response = await api.get<Todo[]>('/todos/');
            setTodos(response.data);
        } catch (error) {
            console.error('Error fetching todos:', error);
            if ((error as any).response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        try {
            const response = await api.post<Todo>('/todos/', {
                title,
                is_completed: false
            });
            setTodos([response.data, ...todos]);
            setTitle('');
            setIsInputOpen(false); // Close input on mobile after add
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    };

    const handleToggle = async (id: number, currentStatus: boolean) => {
        try {
            const response = await api.put<Todo>(`/todos/${id}`, {
                is_completed: !currentStatus
            });
            setTodos(todos.map(t => t.id === id ? response.data : t));
        } catch (error) {
            console.error('Error toggling todo:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/todos/${id}`);
            setTodos(todos.filter(t => t.id !== id));
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    const handleSaveNote = async (content: string) => {
        if (!editingNote) return;
        try {
            const response = await api.put<Todo>(`/todos/${editingNote.id}`, {
                content
            });
            setTodos(todos.map(t => t.id === editingNote.id ? response.data : t));
            setEditingNote(null);
        } catch (error) {
            console.error('Error saving note:', error);
        }
    };

    const handleUpdateDate = async (id: number, dateStr: string) => {
        try {
            const response = await api.put<Todo>(`/todos/${id}`, {
                due_date: dateStr,
                reminder_at: dateStr
            });
            setTodos(todos.map(t => t.id === id ? response.data : t));

            const date = new Date(dateStr);
            if (date > new Date()) {
                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: "Task Reminder",
                            body: response.data.title,
                            id: id,
                            schedule: { at: date },
                        }
                    ]
                });
            }
        } catch (error) {
            console.error('Error updating date:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const filteredTodos = todos.filter(todo => {
        if (filter === 'completed') return todo.is_completed;
        if (!todo.is_completed) {
            if (filter === 'today') {
                return todo.due_date && isToday(parseISO(todo.due_date));
            }
            if (filter === 'upcoming') {
                return todo.due_date && !isToday(parseISO(todo.due_date)) && new Date(todo.due_date) > new Date();
            }
        }
        return filter === 'all' || (filter === 'active' && !todo.is_completed); // Default to showing all non-completed for 'all' or 'active' logic if mixed
    }).sort((a, b) => {
        // Sort: Non-completed first, then by date
        if (a.is_completed === b.is_completed) return 0;
        return a.is_completed ? 1 : -1;
    });

    const getFilterTitle = () => {
        switch (filter) {
            case 'today': return 'Today';
            case 'upcoming': return 'Upcoming';
            case 'completed': return 'Completed';
            default: return 'All Tasks';
        }
    };

    return (
        <div className="min-h-screen bg-indigo-50/50 flex flex-col">
            {/* Mobile Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 px-4 py-3 flex items-center justify-between shadow-sm md:hidden">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-600">
                    <Menu size={24} />
                </button>
                <h1 className="font-bold text-lg text-gray-800">{getFilterTitle()}</h1>
                <div className="w-10"></div> {/* Spacer for center alignment */}
            </header>

            {/* Desktop Header (Hidden on Mobile) */}
            <div className="hidden md:flex max-w-5xl mx-auto w-full pt-8 px-8 items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600">
                        <Menu size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">{getFilterTitle()}</h1>
                </div>
            </div>

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 pb-24 md:pb-8">
                <div className="space-y-3">
                    <AnimatePresence mode='popLayout'>
                        {filteredTodos.map(todo => (
                            <TodoItem
                                key={todo.id}
                                todo={todo}
                                onToggle={handleToggle}
                                onDelete={handleDelete}
                                onOpenNotes={(t) => setEditingNote(t)}
                                onUpdateDate={handleUpdateDate}
                            />
                        ))}
                    </AnimatePresence>

                    {filteredTodos.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                                <Search size={40} className="text-indigo-300" />
                            </div>
                            <p>No tasks found in "{getFilterTitle()}"</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onLogout={handleLogout}
                activeFilter={filter}
                onFilterChange={setFilter}
            />

            {/* Floating Action Button (FAB) */}
            <motion.div
                className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-20"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <button
                    onClick={() => setIsInputOpen(true)}
                    className="w-14 h-14 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/40 flex items-center justify-center text-white"
                >
                    <Plus size={28} />
                </button>
            </motion.div>

            {/* Quick Add Bottom Sheet / Overlay */}
            <AnimatePresence>
                {isInputOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsInputOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 z-40 shadow-2xl glass-panel"
                        >
                            <form onSubmit={handleAddTodo} className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    autoFocus
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="What would you like to do?"
                                    className="w-full text-lg bg-transparent border-none focus:ring-0 p-2 placeholder:text-gray-400"
                                />
                                <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                                    <div className="flex gap-2">
                                        <button type="button" className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                                            <Menu size={20} />
                                        </button>
                                        <button type="button" className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                                            <Calendar size={20} />
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!title.trim()}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Add Task
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Notes Editor Overlay */}
            {editingNote && (
                <NoteEditor
                    initialContent={editingNote.content || ''}
                    onSave={handleSaveNote}
                    onClose={() => setEditingNote(null)}
                />
            )}
        </div>
    );
};

export default Dashboard;
