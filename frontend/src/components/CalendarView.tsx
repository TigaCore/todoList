import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon,
    Grid3X3, List, CalendarDays, X
} from 'lucide-react';
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, isSameDay, isToday,
    addMonths, subMonths, addWeeks, addDays,
    startOfYear, endOfYear, eachMonthOfInterval, parseISO,
    eachHourOfInterval, startOfDay, endOfDay
} from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { useLanguage } from '../contexts/LanguageContext';
import { Todo } from '../api/supabase';

type CalendarViewType = 'month' | 'week' | 'day' | 'year';

interface CalendarViewProps {
    todos: Todo[];
    onTaskClick: (todo: Todo) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ todos, onTaskClick }) => {
    const { t, language } = useLanguage();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarViewType>('day');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedDayTasks, setSelectedDayTasks] = useState<Todo[] | null>(null);

    // Get locale based on current language
    const locale = language === 'zh' ? zhCN : enUS;

    // Get tasks for a specific date
    const getTasksForDate = (date: Date): Todo[] => {
        return todos.filter(todo => {
            if (!todo.due_date) return false;
            try {
                return isSameDay(parseISO(todo.due_date), date);
            } catch {
                return false;
            }
        });
    };

    // Get tasks without time
    const getTasksWithoutTime = (date: Date): Todo[] => {
        return getTasksForDate(date).filter(todo => !todo.due_date || !todo.due_date.includes('T'));
    };

    // Generate hours for day timeline
    const hours = useMemo(() => {
        return eachHourOfInterval({
            start: startOfDay(currentDate),
            end: endOfDay(currentDate)
        });
    }, [currentDate]);

    // Generate calendar days for month view
    const monthDays = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, [currentDate]);

    // Generate week days for week view
    const weekDays = useMemo(() => {
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }, [currentDate]);

    // Generate months for year view
    const yearMonths = useMemo(() => {
        const yearStart = startOfYear(currentDate);
        const yearEnd = endOfYear(currentDate);
        return eachMonthOfInterval({ start: yearStart, end: yearEnd });
    }, [currentDate]);

    // Get task count badge color based on completion status
    const getTaskBadgeColor = (tasks: Todo[]) => {
        if (tasks.length === 0) return 'bg-gray-100 dark:bg-gray-700';
        const completedCount = tasks.filter(t => t.is_completed).length;
        const total = tasks.length;
        if (completedCount === total) return 'bg-green-100 dark:bg-green-900/50';
        if (completedCount > 0) return 'bg-amber-100 dark:bg-amber-900/50';
        return 'bg-stone-100 dark:bg-stone-900/50';
    };

    // Navigation handlers
    const navigatePrevious = () => {
        switch (view) {
            case 'month': setCurrentDate(subMonths(currentDate, 1)); break;
            case 'week': setCurrentDate(addWeeks(currentDate, -1)); break;
            case 'day': setCurrentDate(addDays(currentDate, -1)); break;
            case 'year': setCurrentDate(addMonths(currentDate, -12)); break;
        }
    };

    const navigateNext = () => {
        switch (view) {
            case 'month': setCurrentDate(addMonths(currentDate, 1)); break;
            case 'week': setCurrentDate(addWeeks(currentDate, 1)); break;
            case 'day': setCurrentDate(addDays(currentDate, 1)); break;
            case 'year': setCurrentDate(addMonths(currentDate, 12)); break;
        }
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    // View switcher buttons
    const viewButtons: { id: CalendarViewType; icon: React.ReactNode; label: string }[] = [
        { id: 'day', icon: <CalendarIcon size={16} />, label: t('calendar.viewDay') },
        { id: 'week', icon: <List size={16} />, label: t('calendar.viewWeek') },
        { id: 'month', icon: <Grid3X3 size={16} />, label: t('calendar.viewMonth') },
        { id: 'year', icon: <CalendarDays size={16} />, label: t('calendar.viewYear') },
    ];

    // Get localized weekday names
    const weekDaysNames = useMemo(() => {
        const baseDate = startOfWeek(new Date(), { weekStartsOn: 0 });
        return Array.from({ length: 7 }, (_, i) => {
            const day = addDays(baseDate, i);
            return format(day, 'EEEE', { locale }).slice(0, 2);
        });
    }, [locale]);

    // Get period display text based on view
    const getPeriodDisplayText = () => {
        switch (view) {
            case 'year':
                return format(currentDate, 'yyyy');
            case 'month':
                return format(currentDate, 'M月', { locale });
            case 'week':
                return `${format(weekDays[0], 'M月d日', { locale })} - ${format(weekDays[weekDays.length - 1], 'M月d日', { locale })}`;
            case 'day':
                return format(currentDate, 'yyyy年M月d日，EEEE', { locale });
            default:
                return '';
        }
    };

    return (
        <div className="space-y-4 pb-20">
            {/* Calendar Header - Navigation with Date */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex-1" />

                {/* Centered date with navigation */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={navigatePrevious}
                        className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
                    >
                        <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>

                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 min-w-[180px] text-center">
                        {getPeriodDisplayText()}
                    </h2>

                    <button
                        onClick={navigateNext}
                        className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
                    >
                        <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                <div className="flex-1 flex justify-end">
                    <button
                        onClick={goToToday}
                        className="px-3 py-1.5 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/30 rounded-lg transition-colors"
                    >
                        {t('calendar.today')}
                    </button>
                </div>
            </div>

            {/* View Switcher */}
            <div className="flex justify-center gap-1 p-1 bg-white/30 dark:bg-gray-800/30 rounded-xl mb-4">
                {viewButtons.map((btn) => (
                    <button
                        key={btn.id}
                        onClick={() => setView(btn.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${view === btn.id
                            ? 'bg-indigo-500 text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        {btn.icon}
                        <span className="hidden sm:inline">{btn.label}</span>
                    </button>
                ))}
            </div>

            {/* Calendar Content */}
            <AnimatePresence mode="wait">
                {/* Month View */}
                {view === 'month' && (
                    <motion.div
                        key="month"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass-card rounded-2xl p-4"
                    >
                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {weekDaysNames.map((day) => (
                                <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {monthDays.map((day, idx) => {
                                const dayTasks = getTasksForDate(day);
                                const isCurrentMonth = isSameMonth(day, currentDate);
                                const isSelected = isSameDay(day, selectedDate);
                                const isDayToday = isToday(day);

                                return (
                                    <motion.button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedDate(day);
                                            setSelectedDayTasks(getTasksForDate(day));
                                        }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`
                                            relative min-h-[60px] sm:min-h-[80px] p-1.5 rounded-xl transition-all
                                            ${isCurrentMonth
                                                ? 'bg-white/60 dark:bg-gray-700/40'
                                                : 'bg-gray-50/60 dark:bg-gray-800/40 opacity-50'
                                            }
                                            ${isSelected
                                                ? 'ring-2 ring-stone-500 bg-stone-50/60 dark:bg-stone-900/30'
                                                : 'hover:bg-stone-50/60 dark:hover:bg-stone-900/20'
                                            }
                                        `}
                                    >
                                        <div className="flex flex-col items-center h-full">
                                            <span className={`
                                                text-sm font-medium mb-1
                                                ${isDayToday
                                                    ? 'w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center'
                                                    : isCurrentMonth
                                                        ? 'text-gray-800 dark:text-gray-100'
                                                        : 'text-gray-400 dark:text-gray-500'
                                                }
                                            `}>
                                                {format(day, 'd')}
                                            </span>

                                            {/* Task indicators */}
                                            {dayTasks.length > 0 && (
                                                <div className="flex flex-wrap justify-center gap-0.5 mt-auto">
                                                    {dayTasks.slice(0, 3).map((_, taskIdx) => (
                                                        <div
                                                            key={taskIdx}
                                                            className={`w-1.5 h-1.5 rounded-full ${getTaskBadgeColor(dayTasks)}`}
                                                        />
                                                    ))}
                                                    {dayTasks.length > 3 && (
                                                        <span className="text-[9px] text-gray-500 dark:text-gray-400">
                                                            +{dayTasks.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Week View */}
                {view === 'week' && (
                    <motion.div
                        key="week"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass-card rounded-2xl p-4 space-y-2"
                    >
                        {weekDays.map((day) => {
                            const dayTasks = getTasksForDate(day);
                            const isSelected = isSameDay(day, selectedDate);
                            const isDayToday = isToday(day);

                            return (
                                <motion.button
                                    key={day.toISOString()}
                                    onClick={() => {
                                        setSelectedDate(day);
                                        setSelectedDayTasks(getTasksForDate(day));
                                    }}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className={`
                                        w-full flex items-center gap-3 p-3 rounded-xl transition-all
                                        ${isSelected
                                            ? 'bg-indigo-50/60 dark:bg-indigo-900/30 ring-1 ring-indigo-300 dark:ring-indigo-700'
                                            : 'bg-white/40 dark:bg-gray-700/40 hover:bg-white/60 dark:hover:bg-gray-600/50'
                                        }
                                    `}
                                >
                                    <div className={`
                                        w-10 h-10 rounded-full flex flex-col items-center justify-center
                                        ${isDayToday ? 'bg-stone-500 text-white' : 'bg-gray-100 dark:bg-gray-600'}
                                    `}>
                                        <span className="text-xs opacity-70">{format(day, 'EEE', { locale })}</span>
                                        <span className="text-sm font-bold">{format(day, 'd')}</span>
                                    </div>

                                    <div className="flex-1 text-left">
                                        {dayTasks.length > 0 ? (
                                            <div className="space-y-1">
                                                {dayTasks.slice(0, 2).map((todo) => (
                                                    <div
                                                        key={todo.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onTaskClick(todo);
                                                        }}
                                                        className="flex items-center gap-2 text-sm"
                                                    >
                                                        <div className={`w-2 h-2 rounded-full ${getTaskBadgeColor([todo])}`} />
                                                        <span className={`
                                                            truncate text-gray-700 dark:text-gray-200
                                                            ${todo.is_completed ? 'line-through opacity-50' : ''}
                                                        `}>
                                                            {todo.title}
                                                        </span>
                                                    </div>
                                                ))}
                                                {dayTasks.length > 2 && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        +{dayTasks.length - 2} {t('calendar.moreTasks')}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400 dark:text-gray-500">
                                                {t('calendar.noTasks')}
                                            </span>
                                        )}
                                    </div>

                                    <div className={`
                                        px-2 py-0.5 rounded-full text-xs font-medium
                                        ${dayTasks.length === 0
                                            ? 'bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-300'
                                            : getTaskBadgeColor(dayTasks)
                                        }
                                    `}>
                                        {dayTasks.length} {t('calendar.tasks')}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                )}

                {/* Day View */}
                {view === 'day' && (
                    <motion.div
                        key="day"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass-card rounded-2xl p-4"
                    >
                        <div className="space-y-2">
                            {getTasksForDate(currentDate).length > 0 ? (
                                getTasksForDate(currentDate).map((todo) => (
                                    <motion.div
                                        key={todo.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`
                                            flex items-center gap-3 p-3 rounded-xl cursor-pointer
                                            ${todo.is_completed
                                                ? 'bg-green-50/60 dark:bg-green-900/20'
                                                : 'bg-white/50 dark:bg-gray-700/50'
                                            }
                                        `}
                                        onClick={() => onTaskClick(todo)}
                                    >
                                        <div className={`
                                            w-5 h-5 rounded-full border-2 flex items-center justify-center
                                            ${todo.is_completed
                                                ? 'bg-green-500 border-green-500'
                                                : 'border-gray-300 dark:border-gray-500'
                                            }
                                        `}>
                                            {todo.is_completed && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-medium ${todo.is_completed ? 'line-through opacity-50' : 'text-gray-800 dark:text-gray-100'}`}>
                                                {todo.title}
                                            </p>
                                            {todo.due_date && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {format(parseISO(todo.due_date), 'HH:mm')}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                    <CalendarIcon size={40} className="mx-auto mb-2 opacity-50" />
                                    <p>{t('calendar.noTasksForDay')}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Year View */}
                {view === 'year' && (
                    <motion.div
                        key="year"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {yearMonths.map((month) => {
                                const monthStart = startOfMonth(month);
                                const monthEnd = endOfMonth(month);
                                const monthTasks = todos.filter(todo => {
                                    if (!todo.due_date) return false;
                                    try {
                                        const taskDate = parseISO(todo.due_date);
                                        return taskDate >= monthStart && taskDate <= monthEnd;
                                    } catch {
                                        return false;
                                    }
                                });

                                const completedCount = monthTasks.filter(t => t.is_completed).length;

                                return (
                                    <motion.button
                                        key={month.toISOString()}
                                        onClick={() => {
                                            setCurrentDate(month);
                                            setView('month');
                                        }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="glass-card rounded-xl p-3 text-left hover:bg-stone-50/50 dark:hover:bg-stone-900/20 transition-colors"
                                    >
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                                            {format(month, 'MMMM', { locale })}
                                        </h4>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {monthTasks.length} {t('calendar.tasks')}
                                            </span>
                                            {monthTasks.length > 0 && (
                                                <div className="flex gap-0.5">
                                                    <div className={`w-2 h-2 rounded-full ${completedCount === monthTasks.length ? 'bg-green-400' : 'bg-stone-400'}`} />
                                                    <div className={`w-2 h-2 rounded-full opacity-50 ${completedCount > 0 ? 'bg-green-400' : 'bg-indigo-400'}`} />
                                                    <div className={`w-2 h-2 rounded-full opacity-25 ${completedCount > monthTasks.length / 2 ? 'bg-green-400' : 'bg-indigo-400'}`} />
                                                </div>
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Footer */}
            <div className="flex justify-center gap-6 py-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-stone-400" />
                    <span className="text-gray-600 dark:text-gray-300">{t('calendar.pending')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="text-gray-600 dark:text-gray-300">{t('calendar.inProgress')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-gray-600 dark:text-gray-300">{t('calendar.completed')}</span>
                </div>
            </div>

            {/* Day Detail Popup */}
            <AnimatePresence>
                {selectedDayTasks !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/50 backdrop-blur-sm"
                        onClick={() => setSelectedDayTasks(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-card rounded-2xl p-4 w-full max-w-md max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                                        {format(selectedDate, 'MMMM d', { locale })}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {selectedDayTasks.length} {t('calendar.tasks')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedDayTasks(null)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X size={20} className="text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            {/* Tasks with time on timeline */}
                            <div className="space-y-4">
                                {hours.map((hour) => {
                                    const hourTasks = selectedDayTasks.filter(todo => {
                                        if (!todo.due_date || !todo.due_date.includes('T')) return false;
                                        const taskHour = parseISO(todo.due_date);
                                        return isSameDay(taskHour, selectedDate) && format(taskHour, 'H') === format(hour, 'H');
                                    });

                                    return (
                                        <div key={hour.toISOString()} className="flex gap-3">
                                            <div className="w-12 text-xs text-gray-500 dark:text-gray-400 text-right pt-1">
                                                {format(hour, 'HH:mm')}
                                            </div>
                                            <div className="flex-1 border-l-2 border-gray-200 dark:border-gray-700 pl-3 pb-3">
                                                {hourTasks.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {hourTasks.map((todo) => (
                                                            <motion.div
                                                                key={todo.id}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                className={`
                                                                    p-2 rounded-lg cursor-pointer
                                                                    ${todo.is_completed
                                                                        ? 'bg-green-50/60 dark:bg-green-900/20'
                                                                        : 'bg-white/60 dark:bg-gray-700/40'
                                                                    }
                                                                `}
                                                                onClick={() => {
                                                                    onTaskClick(todo);
                                                                    setSelectedDayTasks(null);
                                                                }}
                                                            >
                                                                <p className={`text-sm ${todo.is_completed ? 'line-through opacity-50' : 'text-gray-800 dark:text-gray-100'}`}>
                                                                    {todo.title}
                                                                </p>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Tasks without time */}
                                {getTasksWithoutTime(selectedDate).length > 0 && (
                                    <div className="flex gap-3 pt-2">
                                        <div className="w-12 text-xs text-gray-500 dark:text-gray-400 text-right pt-1">
                                            --
                                        </div>
                                        <div className="flex-1 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                {t('calendar.noTimeTasks')}
                                            </div>
                                            <div className="space-y-2">
                                                {getTasksWithoutTime(selectedDate).map((todo) => (
                                                    <motion.div
                                                        key={todo.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className={`
                                                            p-2 rounded-lg cursor-pointer
                                                            ${todo.is_completed
                                                                ? 'bg-green-50/60 dark:bg-green-900/20'
                                                                : 'bg-white/60 dark:bg-gray-700/40'
                                                            }
                                                        `}
                                                        onClick={() => {
                                                            onTaskClick(todo);
                                                            setSelectedDayTasks(null);
                                                        }}
                                                    >
                                                        <p className={`text-sm ${todo.is_completed ? 'line-through opacity-50' : 'text-gray-800 dark:text-gray-100'}`}>
                                                            {todo.title}
                                                        </p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedDayTasks.length === 0 && (
                                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                        <CalendarIcon size={40} className="mx-auto mb-2 opacity-50" />
                                        <p>{t('calendar.noTasks')}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CalendarView;
