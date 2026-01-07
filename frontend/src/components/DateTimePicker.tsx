import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Picker from 'react-mobile-picker';
import { X, Calendar, Clock } from 'lucide-react';
import { format, addDays, setHours, setMinutes } from 'date-fns';

interface DateTimePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (date: Date) => void;
    initialDate?: Date;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ isOpen, onClose, onSelect, initialDate }) => {
    const now = new Date();
    const initial = initialDate || now;

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
        Array.from({ length: 12 }, (_, i) => ({
            value: String(i * 5),
            label: String(i * 5).padStart(2, '0')
        })), []);

    const [pickerValue, setPickerValue] = useState({
        month: String(initial.getMonth()),
        day: String(initial.getDate()),
        hour: String(initial.getHours()),
        minute: String(Math.floor(initial.getMinutes() / 5) * 5)
    });

    const quickOptions = [
        { label: 'Today', getDate: () => now },
        { label: 'Tomorrow', getDate: () => addDays(now, 1) },
        { label: 'Next Week', getDate: () => addDays(now, 7) },
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
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <button
                                onClick={onClose}
                                className="p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-full"
                            >
                                <X size={24} />
                            </button>
                            <h3 className="font-semibold text-gray-800">Set Due Date</h3>
                            <button
                                onClick={handleConfirm}
                                className="px-4 py-1.5 bg-indigo-500 text-white text-sm font-medium rounded-full hover:bg-indigo-600 transition-colors"
                            >
                                Done
                            </button>
                        </div>

                        {/* Quick Options */}
                        <div className="px-5 py-4 flex gap-2 overflow-x-auto border-b border-gray-100">
                            {quickOptions.map((opt) => (
                                <button
                                    key={opt.label}
                                    onClick={() => handleQuickSelect(opt.getDate)}
                                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium whitespace-nowrap hover:bg-indigo-100 transition-colors"
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Picker Area */}
                        <div className="px-4 py-6">
                            <div className="flex items-center justify-center gap-1 mb-4">
                                <Calendar size={18} className="text-gray-400" />
                                <span className="text-sm text-gray-500">Date</span>
                                <span className="mx-4 text-gray-300">|</span>
                                <Clock size={18} className="text-gray-400" />
                                <span className="text-sm text-gray-500">Time</span>
                            </div>

                            <Picker
                                value={pickerValue}
                                onChange={setPickerValue}
                                wheelMode="natural"
                                height={180}
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

                        {/* Safe area padding for iOS */}
                        <div className="h-safe pb-6" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default DateTimePicker;
