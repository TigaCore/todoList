import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Picker from 'react-mobile-picker';
import { X, Calendar, Clock } from 'lucide-react';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';

interface DateTimePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (date: Date) => void;
    initialDate?: Date;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ isOpen, onClose, onSelect, initialDate }) => {
    const { t } = useLanguage();
    const now = new Date();
    const initial = initialDate || now;
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Generate options
    const months = useMemo(() =>
        Array.from({ length: 12 }, (_, i) => ({
            value: String(i),
            label: format(new Date(2024, i, 1), 'MMM')
        })), []);

    const days = useMemo(() =>
        Array.from({ length: 31 }, (_, i) => ({
            value: String(i + 1),
            label: String(i + 1)
        })), []);

    const hours = useMemo(() =>
        Array.from({ length: 24 }, (_, i) => ({
            value: String(i),
            label: String(i).padStart(2, '0')
        })), []);

    const minutes = useMemo(() =>
        Array.from({ length: 60 }, (_, i) => ({
            value: String(i),
            label: String(i).padStart(2, '0')
        })), []);

    const [pickerValue, setPickerValue] = useState({
        month: String(initial.getMonth()),
        day: String(initial.getDate()),
        hour: String(initial.getHours()),
        minute: String(initial.getMinutes())
    });

    const quickOptions = [
        { label: t('datePicker.today'), getDate: () => now },
        { label: t('datePicker.tomorrow'), getDate: () => addDays(now, 1) },
        { label: t('datePicker.nextWeek'), getDate: () => addDays(now, 7) },
    ];

    const handleQuickSelect = (getDate: () => Date) => {
        const date = getDate();
        const result = setMinutes(setHours(date, 9), 0); // Default to 9:00 AM
        onSelect(result);
        onClose();
    };

    const handleConfirm = () => {
        const year = now.getFullYear();
        const month = parseInt(pickerValue.month);
        const day = parseInt(pickerValue.day);
        const hour = parseInt(pickerValue.hour);
        const minute = parseInt(pickerValue.minute);

        const result = new Date(year, month, day, hour, minute);
        onSelect(result);
        onClose();
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
                        className="glass-backdrop fixed inset-0 z-50"
                        onClick={onClose}
                    />

                    {/* Wrapper for positioning - solves transform conflict with framer-motion */}
                    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none md:items-center">
                        <motion.div
                            initial={isDesktop ? { opacity: 0, scale: 0.95 } : { y: '100%' }}
                            animate={isDesktop ? { opacity: 1, scale: 1 } : { y: 0 }}
                            exit={isDesktop ? { opacity: 0, scale: 0.95 } : { y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="glass-modal w-full pointer-events-auto overflow-hidden
                                rounded-t-3xl max-h-[80vh]
                                md:rounded-2xl md:max-w-md md:max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/30 bg-white/30">
                                <button
                                    onClick={onClose}
                                    className="p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white/50 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">{t('datePicker.setDueDate')}</h3>
                                <button
                                    onClick={handleConfirm}
                                    className="btn-primary px-4 py-1.5 text-sm font-medium rounded-full"
                                >
                                    {t('datePicker.done')}
                                </button>
                            </div>

                            {/* Quick Options */}
                            <div className="px-5 py-4 flex gap-2 overflow-x-auto border-b border-white/30">
                                {quickOptions.map((opt) => (
                                    <button
                                        key={opt.label}
                                        onClick={() => handleQuickSelect(opt.getDate)}
                                        className="px-4 py-2 bg-indigo-100/60 text-indigo-600 rounded-full text-sm font-medium whitespace-nowrap hover:bg-indigo-100 transition-colors"
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            {/* Picker Area */}
                            <div className="px-4 py-6 bg-white/30">
                                {/* Section Labels */}
                                <div className="flex items-center justify-center mb-4">
                                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-l-full border-r border-indigo-100 dark:border-indigo-800">
                                        <Calendar size={16} className="text-indigo-500" />
                                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{t('datePicker.date')}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-50 dark:bg-orange-900/30 rounded-r-full">
                                        <Clock size={16} className="text-orange-500" />
                                        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{t('datePicker.time')}</span>
                                    </div>
                                </div>

                                {/* Picker with visual separator */}
                                <div className="relative">
                                    {/* Vertical divider between date and time */}
                                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent z-10" style={{ transform: 'translateX(-50%)' }} />

                                    <Picker
                                        value={pickerValue}
                                        onChange={setPickerValue}
                                        wheelMode="natural"
                                        height={160}
                                    >
                                        <Picker.Column name="month">
                                            {months.map(m => (
                                                <Picker.Item key={m.value} value={m.value}>
                                                    {m.label}
                                                </Picker.Item>
                                            ))}
                                        </Picker.Column>
                                        <Picker.Column name="day">
                                            {days.map(d => (
                                                <Picker.Item key={d.value} value={d.value}>
                                                    {d.label}
                                                </Picker.Item>
                                            ))}
                                        </Picker.Column>
                                        <Picker.Column name="hour">
                                            {hours.map(h => (
                                                <Picker.Item key={h.value} value={h.value}>
                                                    {h.label}
                                                </Picker.Item>
                                            ))}
                                        </Picker.Column>
                                        <Picker.Column name="minute">
                                            {minutes.map(m => (
                                                <Picker.Item key={m.value} value={m.value}>
                                                    {m.label}
                                                </Picker.Item>
                                            ))}
                                        </Picker.Column>
                                    </Picker>
                                </div>
                            </div>

                            {/* Safe area padding for iOS - only on mobile */}
                            {!isDesktop && <div className="h-safe pb-6" />}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default DateTimePicker;
