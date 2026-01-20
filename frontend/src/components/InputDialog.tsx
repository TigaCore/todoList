import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface InputDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
    title: string;
    placeholder?: string;
    defaultValue?: string;
    confirmText?: string;
    validate?: (value: string) => string | null;
}

const InputDialog: React.FC<InputDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    placeholder = '',
    defaultValue = '',
    confirmText,
    validate,
}) => {
    const [inputValue, setInputValue] = useState(defaultValue);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Reset value when dialog opens
    useEffect(() => {
        if (isOpen) {
            setInputValue(defaultValue);
            setError(null);
        }
    }, [isOpen, defaultValue]);

    // Focus input when dialog opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            // Select all text for easy editing
            inputRef.current.select();
        }
    }, [isOpen]);

    // Handle ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
            if (e.key === 'Enter' && isOpen) {
                handleConfirm();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, inputValue]);

    const handleConfirm = () => {
        if (validate) {
            const validationError = validate(inputValue);
            if (validationError) {
                setError(validationError);
                return;
            }
        }
        if (inputValue.trim()) {
            onConfirm(inputValue.trim());
            onClose();
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center"
            onClick={handleBackdropClick}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-indigo-950/20 backdrop-blur-sm" />

            {/* Dialog */}
            <div
                className="relative glass-modal rounded-2xl p-5 w-full max-w-md mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Title */}
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 pr-8">
                    {title}
                </h2>

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        if (error) setError(null);
                    }}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 glass-input rounded-xl text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleConfirm();
                        }
                    }}
                />

                {/* Error message */}
                {error && (
                    <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                        {error}
                    </p>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!inputValue.trim()}
                        className="px-4 py-2 text-sm font-medium btn-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default InputDialog;
