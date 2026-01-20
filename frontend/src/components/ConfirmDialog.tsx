import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ConfirmDialogProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    type = 'danger'
}) => {
    const { t } = useLanguage();

    const buttonColors = {
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        warning: 'bg-amber-500 hover:bg-amber-600 text-white',
        info: 'bg-indigo-500 hover:bg-indigo-600 text-white'
    };

    const iconColors = {
        danger: 'text-red-500 bg-red-100',
        warning: 'text-amber-500 bg-amber-100',
        info: 'text-indigo-500 bg-indigo-100'
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
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm"
                        onClick={onCancel}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="fixed inset-0 z-[111] flex items-center justify-center p-4"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6">
                            <div className="flex flex-col items-center text-center">
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${iconColors[type]}`}>
                                    <AlertTriangle size={24} />
                                </div>

                                {/* Title */}
                                {title && (
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        {title}
                                    </h3>
                                )}

                                {/* Message */}
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {message}
                                </p>

                                {/* Buttons */}
                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={onCancel}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                                    >
                                        {cancelText || t('common.cancel') || '取消'}
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors ${buttonColors[type]}`}
                                    >
                                        {confirmText || t('common.confirm') || '确定'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ConfirmDialog;
