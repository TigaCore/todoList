import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Plus, Search, Menu, PenLine, Maximize2, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TodoItem from '../components/TodoItem';
import NoteEditor from '../components/NoteEditor';
import Sidebar from '../components/Sidebar';
import DateTimePicker from '../components/DateTimePicker';
import BottomNav, { Tab } from '../components/BottomNav';
import NotesView from '../components/NotesView';
import TimelineDrawer from '../components/TimelineDrawer';
import Toast, { ToastMessage, ToastType } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { LocalNotifications } from '@capacitor/local-notifications';
import { isToday, parseISO, format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';

interface EmbeddedTask {
    line_index: number;
    text: string;
    is_completed: boolean;
}

interface Todo {
    id: number;
    title: string;
    description?: string;
    content?: string;
    is_completed: boolean;
    is_document?: boolean;
    due_date?: string;
    reminder_at?: string;
    embedded_tasks?: EmbeddedTask[];
}

interface User {
    id: number;
    email: string;
    nickname: string;
    avatar?: string;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [title, setTitle] = useState('');
    const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isInputOpen, setIsInputOpen] = useState(false);
    const [isTimelineOpen, setIsTimelineOpen] = useState(false);
    const [isAddingTodo, setIsAddingTodo] = useState(false);

    // Bottom Navigation State
    const [activeTab, setActiveTab] = useState<Tab>('tasks');

    // Notes Editor State
    const [editingNote, setEditingNote] = useState<Todo | null>(null);

    // Date Picker State
    const [datePickerTodo, setDatePickerTodo] = useState<Todo | null>(null);

    // Toast State
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // Confirm Dialog State
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, message: '', onConfirm: () => { } });

    // Web Notification Timers
    const notificationTimers = useRef<{ [key: number]: NodeJS.Timeout }>({});

    // Toast Helper Functions
    const showToast = useCallback((type: ToastType, message: string) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, type, message }]);
        // Auto dismiss after 3 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Confirm Dialog Helper
    const showConfirm = useCallback((message: string, onConfirm: () => void) => {
        setConfirmDialog({ isOpen: true, message, onConfirm });
    }, []);

    const closeConfirm = useCallback(() => {
        setConfirmDialog({ isOpen: false, message: '', onConfirm: () => { } });
    }, []);

    useEffect(() => {
        fetchTodos();
        fetchUser();
        requestNotificationPermission();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await api.get<User>('/users/me');
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const requestNotificationPermission = async () => {
        // Request Web Notification permission parallely
        if ('Notification' in window) {
            Notification.requestPermission();
        }

        try {
            await LocalNotifications.requestPermissions();
        } catch (e) {
            console.log('Capacitor Notifications not supported');
        }
    };

    const scheduleWebNotification = async (task: Todo, date: Date) => {
        if (!('Notification' in window)) return;

        if (Notification.permission !== 'granted') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return;
        }

        const now = new Date();
        const delay = date.getTime() - now.getTime();

        if (delay > 0) {
            // Clear existing timer for this task if any
            if (notificationTimers.current[task.id]) {
                clearTimeout(notificationTimers.current[task.id]);
            }

            // Schedule new timer
            // Schedule new timer
            const timerId = setTimeout(() => {
                let body = task.title;

                // If this is a document with embedded tasks, list the incomplete tasks
                if (task.embedded_tasks && task.embedded_tasks.length > 0) {
                    const incompleteTasks = task.embedded_tasks.filter(t => !t.is_completed);
                    if (incompleteTasks.length > 0) {
                        body = incompleteTasks.map(t => t.text).join('\n');
                        // If too many, truncate
                        if (incompleteTasks.length > 3) {
                            const othersCount = incompleteTasks.length - 3;
                            const firstThree = incompleteTasks.slice(0, 3).map(t => t.text).join('\n');
                            body = `${firstThree}\n...and ${othersCount} more`;
                        }
                    }
                }

                new Notification(t('toast.reminder'), {
                    body: body,
                    icon: '/pwa-192x192.png' // Use PWA icon
                });
                // Play a sound if desired, or just notification
            }, delay);

            notificationTimers.current[task.id] = timerId;
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
        if (!title.trim() || isAddingTodo) return;

        const tempTitle = title;
        const tempId = -Date.now(); // Temporary negative ID to avoid conflicts
        const optimisticTodo: Todo = {
            id: tempId,
            title: tempTitle,
            is_completed: false
        };

        // Optimistic update - immediately show the new task
        setTodos([optimisticTodo, ...todos]);
        setTitle('');
        setIsInputOpen(false);
        setIsAddingTodo(true);

        try {
            const response = await api.post<Todo>('/todos/', {
                title: tempTitle,
                is_completed: false
            });
            // Replace the temporary todo with the real one from the server
            setTodos(prev => prev.map(t => t.id === tempId ? response.data : t));
        } catch (error) {
            console.error('Error adding todo:', error);
            // Rollback - remove the optimistic todo
            setTodos(prev => prev.filter(t => t.id !== tempId));
            // Restore the title for the user to retry
            setTitle(tempTitle);
            setIsInputOpen(true);
            showToast('error', t('toast.addTaskFailed'));
        } finally {
            setIsAddingTodo(false);
        }
    };

    const handleToggle = async (id: number, currentStatus: boolean) => {
        // Optimistic update - immediately toggle the status
        const previousTodos = todos;
        setTodos(prev => prev.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));

        try {
            const response = await api.put<Todo>(`/todos/${id}`, {
                is_completed: !currentStatus
            });
            // Update with server response to ensure data consistency
            setTodos(prev => prev.map(t => t.id === id ? response.data : t));
        } catch (error) {
            console.error('Error toggling todo:', error);
            // Rollback on error
            setTodos(previousTodos);
        }
    };

    const handleDelete = async (id: number) => {
        // Don't allow deleting tasks with temporary IDs (still being created)
        if (id < 0) {
            showToast('warning', t('toast.waitForTaskCreation'));
            return;
        }

        showConfirm(t('confirm.deleteTask'), async () => {
            closeConfirm();

            // Optimistic update - immediately remove from list
            const previousTodos = todos;
            setTodos(prev => prev.filter(t => t.id !== id));

            try {
                await api.delete(`/todos/${id}`);
                showToast('success', t('toast.taskDeleted'));
            } catch (error) {
                console.error('Error deleting todo:', error);
                // Rollback on error - restore the deleted todo
                setTodos(previousTodos);
                showToast('error', t('toast.deleteFailed'));
            }
        });
    };

    const handleSaveNote = async (content: string, title?: string) => {
        if (!editingNote) return;

        const previousTodos = todos;
        const noteToSave = editingNote;
        const finalTitle = title || editingNote.title || 'Untitled';

        if (editingNote.id === 0) {
            // Create new Note or Document - optimistic update
            const tempId = -Date.now();
            const optimisticNote: Todo = {
                id: tempId,
                title: finalTitle,
                content: content,
                is_completed: false,
                is_document: editingNote.is_document || false
            };
            setTodos([optimisticNote, ...todos]);
            setEditingNote(null);

            try {
                const response = await api.post<Todo>('/todos/', {
                    title: finalTitle,
                    content: content,
                    is_completed: false,
                    is_document: noteToSave.is_document || false
                });
                // Replace temp note with server response
                setTodos(prev => prev.map(t => t.id === tempId ? response.data : t));
            } catch (error) {
                console.error('Error saving note:', error);
                // Rollback
                setTodos(previousTodos);
                setEditingNote(noteToSave);
                showToast('error', t('toast.saveNoteFailed'));
            }
        } else {
            // Update existing Note - optimistic update
            setTodos(prev => prev.map(t => t.id === editingNote.id ? { ...t, content, title: finalTitle } : t));
            setEditingNote(null);

            try {
                const response = await api.put<Todo>(`/todos/${noteToSave.id}`, {
                    content,
                    title: finalTitle
                });
                // Update with server response
                setTodos(prev => prev.map(t => t.id === noteToSave.id ? response.data : t));
            } catch (error) {
                console.error('Error saving note:', error);
                // Rollback
                setTodos(previousTodos);
                setEditingNote(noteToSave);
                showToast('error', t('toast.saveNoteFailed'));
            }
        }
    };

    const handleUpdateDate = async (id: number, dateStr: string) => {
        // Optimistic update - immediately update the date
        const previousTodos = todos;
        setTodos(prev => prev.map(t => t.id === id ? { ...t, due_date: dateStr, reminder_at: dateStr } : t));

        try {
            const response = await api.put<Todo>(`/todos/${id}`, {
                due_date: dateStr,
                reminder_at: dateStr
            });
            // Update with server response
            setTodos(prev => prev.map(t => t.id === id ? response.data : t));

            const date = new Date(dateStr);
            if (date > new Date()) {
                // Schedule Web Notification (Browser)
                scheduleWebNotification(response.data, date);

                // Schedule Capacitor Notification (Mobile/Native)
                try {
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
                } catch (e) {
                    console.log('Failed to schedule native notification', e);
                }
            }
        } catch (error) {
            console.error('Error updating date:', error);
            // Rollback on error
            setTodos(previousTodos);
            showToast('error', t('toast.updateDateFailed'));
        }
    };

    const handleEmbeddedTaskToggle = async (todoId: number, lineIndex: number, completed: boolean) => {
        // Optimistic update
        const previousTodos = todos;
        setTodos(prev => prev.map(todo => {
            if (todo.id === todoId && todo.embedded_tasks) {
                const updatedTasks = todo.embedded_tasks.map(task =>
                    task.line_index === lineIndex ? { ...task, is_completed: completed } : task
                );
                return { ...todo, embedded_tasks: updatedTasks };
            }
            return todo;
        }));

        try {
            const response = await api.patch<Todo>(`/todos/${todoId}/embedded-task`, {
                line_index: lineIndex,
                is_completed: completed
            });
            // Update with server response
            setTodos(prev => prev.map(t => t.id === todoId ? response.data : t));
        } catch (error) {
            console.error('Error updating embedded task:', error);
            setTodos(previousTodos);
            showToast('error', t('embeddedTask.updateFailed'));
        }
    };

    const handleJumpToDoc = (todoId: number, lineIndex: number) => {
        const todo = todos.find(t => t.id === todoId);
        if (todo) {
            // Store lineIndex for scrolling after editor opens
            console.log(`Jump to line ${lineIndex} in todo ${todoId}`);
            setEditingNote(todo);
            // TODO: implement scroll to lineIndex in editor
        }
    };

    // Collect all embedded tasks and convert to Todo-like objects
    const embeddedTasksAsTodos = todos.flatMap(todo =>
        (todo.embedded_tasks || []).map(task => ({
            // Use negative ID to avoid conflicts: -(todoId * 10000 + lineIndex)
            id: -(todo.id * 10000 + task.line_index),
            title: task.text,
            is_completed: task.is_completed,
            // Include source todo's due_date for reminder indicator
            due_date: todo.due_date,
            reminder_at: todo.reminder_at,
            // Mark as embedded with metadata
            _isEmbedded: true,
            _sourceTodoId: todo.id,
            _sourceLineIndex: task.line_index,
            _sourceDocTitle: todo.title
        }))
    ) as (Todo & { _isEmbedded: boolean; _sourceTodoId: number; _sourceLineIndex: number; _sourceDocTitle: string })[];

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const filteredTodos = todos.filter(todo => {
        // Exclude standalone documents from task list - they only show in Notes tab
        if (todo.is_document) return false;

        if (filter === 'completed') return todo.is_completed;
        if (!todo.is_completed) {
            if (filter === 'today') {
                return todo.due_date && isToday(parseISO(todo.due_date));
            }
            if (filter === 'upcoming') {
                return todo.due_date && !isToday(parseISO(todo.due_date)) && new Date(todo.due_date) > new Date();
            }
        }
        return filter === 'all';
    });

    // Filter embedded tasks similarly (only show in 'all' or 'completed' filters for now)
    const filteredEmbeddedTasks = embeddedTasksAsTodos.filter(task => {
        if (filter === 'completed') return task.is_completed;
        return filter === 'all';
    });

    // Combine regular todos with embedded tasks and sort
    // Sort logic: Uncompleted first, then Completed
    const combinedTasks = [...filteredTodos, ...filteredEmbeddedTasks].sort((a, b) => {
        if (a.is_completed === b.is_completed) return 0;
        return a.is_completed ? 1 : -1;
    });

    const getFilterTitle = () => {
        if (activeTab === 'notes') return t('tabs.notes');

        switch (filter) {
            case 'today': return t('filter.today');
            case 'upcoming': return t('filter.upcoming');
            case 'completed': return t('filter.completed');
            default: return t('filter.all');
        }
    };

    const handleUserUpdate = (updatedUser: User) => {
        setUser(updatedUser);
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Mobile Header */}
            <header className="glass-nav sticky top-0 z-10 px-4 py-3 flex items-center justify-between md:hidden">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-3 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl active:bg-white/70 dark:active:bg-gray-600/70 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                >
                    <Menu size={24} />
                </button>
                <h1 className="font-bold text-lg text-gray-800 dark:text-gray-100">{getFilterTitle()}</h1>
                <button
                    onClick={() => setIsTimelineOpen(true)}
                    className="p-3 -mr-2 text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl active:bg-white/70 dark:active:bg-gray-600/70 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                >
                    <History size={22} />
                </button>
            </header>

            {/* Desktop Header (Hidden on Mobile) */}
            <div className="hidden md:flex max-w-5xl mx-auto w-full pt-8 px-8 items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/60 dark:hover:bg-gray-700/60 rounded-xl transition-colors text-gray-600 dark:text-gray-300">
                        <Menu size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{getFilterTitle()}</h1>
                </div>
                <button
                    onClick={() => setIsTimelineOpen(true)}
                    className="p-2 hover:bg-white/60 dark:hover:bg-gray-700/60 rounded-xl transition-colors text-gray-600 dark:text-gray-300 flex items-center gap-2"
                >
                    <History size={22} />
                    <span className="text-sm font-medium">{t('timeline.title')}</span>
                </button>
            </div>

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-4 md:px-8 md:pt-0 pb-24 md:pb-8">
                <div className="relative min-h-[50vh]">
                    {/* Tasks View */}
                    <motion.div
                        animate={{
                            opacity: activeTab === 'tasks' ? 1 : 0,
                            scale: activeTab === 'tasks' ? 1 : 0.96,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 28,
                            mass: 0.8,
                        }}
                        style={{
                            position: activeTab === 'tasks' ? 'relative' : 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            pointerEvents: activeTab === 'tasks' ? 'auto' : 'none',
                        }}
                        className="space-y-3 pb-20 origin-top"
                    >
                        {combinedTasks.map((task, index) => {
                            const isEmbedded = '_isEmbedded' in task && task._isEmbedded;

                            if (isEmbedded) {
                                const embeddedTask = task as typeof task & { _sourceTodoId: number; _sourceLineIndex: number; _sourceDocTitle: string };
                                return (
                                    <TodoItem
                                        key={task.id}
                                        todo={task}
                                        index={index}
                                        onToggle={() => handleEmbeddedTaskToggle(embeddedTask._sourceTodoId, embeddedTask._sourceLineIndex, !task.is_completed)}
                                        onDelete={() => { }}
                                        onOpenNotes={() => handleJumpToDoc(embeddedTask._sourceTodoId, embeddedTask._sourceLineIndex)}
                                        onOpenDatePicker={() => {
                                            // Find the source todo for setting reminder
                                            const sourceTodo = todos.find(t => t.id === embeddedTask._sourceTodoId);
                                            if (sourceTodo) setDatePickerTodo(sourceTodo);
                                        }}
                                        isEmbedded={true}
                                        sourceDocTitle={embeddedTask._sourceDocTitle}
                                        onJumpToDoc={() => handleJumpToDoc(embeddedTask._sourceTodoId, embeddedTask._sourceLineIndex)}
                                    />
                                );
                            }

                            return (
                                <TodoItem
                                    key={task.id}
                                    todo={task}
                                    index={index}
                                    onToggle={handleToggle}
                                    onDelete={handleDelete}
                                    onOpenNotes={(t) => setEditingNote(t)}
                                    onOpenDatePicker={(t) => setDatePickerTodo(t)}
                                />
                            );
                        })}

                        {combinedTasks.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                    transition: {
                                        duration: 0.5,
                                        ease: [0.34, 1.56, 0.64, 1],
                                        delay: 0.15
                                    }
                                }}
                                className="flex flex-col items-center justify-center py-20 text-gray-400"
                            >
                                <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                                    <Search size={40} className="text-indigo-300" />
                                </div>
                                <p>No tasks found in "{getFilterTitle()}"</p>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Notes View */}
                    <motion.div
                        animate={{
                            opacity: activeTab === 'notes' ? 1 : 0,
                            scale: activeTab === 'notes' ? 1 : 0.96,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 28,
                            mass: 0.8,
                        }}
                        style={{
                            position: activeTab === 'notes' ? 'relative' : 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            pointerEvents: activeTab === 'notes' ? 'auto' : 'none',
                        }}
                        className="pb-20 origin-top"
                    >
                        <NotesView
                            notes={todos}
                            onNoteClick={(t) => setEditingNote(t)}
                        />
                    </motion.div>
                </div>
            </main>

            {/* Floating Action Button (FAB) and Input Container */}
            <div className="fixed bottom-6 w-full px-4 md:bottom-10 md:px-0 z-20 pointer-events-none">
                <div className="max-w-xl mx-auto flex items-end justify-center pointer-events-none relative h-20">
                    {/* Input Form - only show when open */}
                    <AnimatePresence mode="wait">
                        {isInputOpen && activeTab === 'tasks' && (
                            <motion.form
                                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: -80, // Push it up above the nav bar
                                    transition: {
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 25,
                                        mass: 0.8
                                    }
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.92,
                                    y: 16,
                                    transition: {
                                        duration: 0.2,
                                        ease: [0.4, 0, 1, 1]
                                    }
                                }}
                                onSubmit={handleAddTodo}
                                className="absolute bottom-0 w-full px-4 pointer-events-auto"
                            >
                                <div className="glass-modal p-2 rounded-2xl flex items-center">
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="What needs to be done?"
                                        className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-400 text-lg px-4 py-2"
                                        autoFocus
                                        onBlur={(e) => {
                                            // Close if clicking outside (not on submit button)
                                            if (!e.relatedTarget?.closest('button')) {
                                                setTimeout(() => setIsInputOpen(false), 150);
                                            }
                                        }}
                                    />
                                    {/* Expand Button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Open full editor with current title
                                            const newNote = {
                                                id: 0, // Temp ID
                                                title: title,
                                                is_completed: false,
                                                content: ''
                                            };
                                            setEditingNote(newNote as Todo);
                                            setTitle('');
                                            setIsInputOpen(false);
                                        }}
                                        className="p-2 mr-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-colors"
                                        title="Open Full Editor"
                                    >
                                        <Maximize2 size={20} />
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={!title.trim()}
                                        className="glass-fab p-3 text-white rounded-full disabled:opacity-50 transition-all"
                                    >
                                        <Plus size={24} />
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* FAB Button - Centered */}
                    {!isInputOpen && (
                        <motion.button
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                y: -6, // Lift slightly to sit on nav bar
                                transition: {
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 25
                                }
                            }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="glass-fab w-14 h-14 text-white rounded-full active:scale-95 transition-all flex items-center justify-center pointer-events-auto border-2 border-white/20"
                            onClick={() => {
                                if (activeTab === 'notes') {
                                    // Open Note Editor directly for new document
                                    setEditingNote({
                                        id: 0,
                                        title: '',
                                        is_completed: false,
                                        is_document: true,  // This is a standalone document
                                        content: ''
                                    } as Todo);
                                } else {
                                    // Open Quick Input
                                    setIsInputOpen(true);
                                }
                            }}
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                        >
                            {/* Icon changes based on tab */}
                            <AnimatePresence mode="wait">
                                {activeTab === 'notes' ? (
                                    <motion.div
                                        key="pen"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <PenLine size={24} strokeWidth={2.5} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="plus"
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Plus size={28} strokeWidth={2.5} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Bottom Navigation */}
            <BottomNav activeTab={activeTab} onTabChange={(tab) => {
                setActiveTab(tab);
                setIsInputOpen(false); // Reset input state when switching tabs
            }} />

            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onLogout={handleLogout}
                activeFilter={filter}
                onFilterChange={setFilter}
                user={user}
                onUserUpdate={handleUserUpdate}
            />

            {/* Note Editor Overlay */}
            <AnimatePresence>
                {
                    editingNote && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="glass-backdrop fixed inset-0 z-50 pointer-events-auto"
                                onClick={() => setEditingNote(null)}
                            />
                            {/* Drawer - Bottom sheet style, not fullscreen */}
                            <motion.div
                                initial={{ y: '100%', scale: 0.92 }}
                                animate={{ y: 0, scale: 1 }}
                                exit={{ y: '30%', scale: 0.92, opacity: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 28,
                                    mass: 0.8,
                                }}
                                className="fixed bottom-0 left-0 right-0 z-50 flex flex-col pointer-events-none max-h-[85vh] sm:max-h-[80vh] sm:max-w-2xl sm:mx-auto sm:right-4 sm:left-4 sm:bottom-4 origin-bottom"
                            >
                                <div className="h-full pointer-events-auto rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl">
                                    <NoteEditor
                                        isOpen={true}
                                        note={editingNote}
                                        onSave={handleSaveNote}
                                        onClose={() => setEditingNote(null)}
                                    />
                                </div>
                            </motion.div>
                        </>
                    )
                }
            </AnimatePresence >

            {/* Date Time Picker - At root level for proper centering */}
            <DateTimePicker
                isOpen={!!datePickerTodo}
                onClose={() => setDatePickerTodo(null)}
                onSelect={(date) => {
                    if (datePickerTodo) {
                        handleUpdateDate(datePickerTodo.id, format(date, "yyyy-MM-dd'T'HH:mm"));
                        setDatePickerTodo(null);
                    }
                }}
                initialDate={datePickerTodo?.due_date ? new Date(datePickerTodo.due_date) : undefined}
            />

            {/* Timeline Drawer */}
            <TimelineDrawer
                isOpen={isTimelineOpen}
                onClose={() => setIsTimelineOpen(false)}
                todos={todos}
                onOpenTodo={(todo) => setEditingNote(todo)}
            />

            {/* Toast Notifications */}
            <Toast toasts={toasts} onDismiss={dismissToast} />

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={closeConfirm}
                type="danger"
            />
        </div >
    );
};

export default Dashboard;
