import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TextareaAutosize from 'react-textarea-autosize';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Eye, Edit2, Bold, List, CheckSquare, Image as ImageIcon } from 'lucide-react';

interface NoteEditorProps {
    initialContent?: string;
    onSave: (content: string) => void;
    onClose: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ initialContent = '', onSave, onClose }) => {
    const [content, setContent] = useState(initialContent);
    const [isEditing, setIsEditing] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-focus when entering edit mode
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isEditing]);

    const insertText = (before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const previousText = textarea.value;
        const selectedText = previousText.substring(start, end);

        const newText = previousText.substring(0, start) +
            before + selectedText + after +
            previousText.substring(end);

        setContent(newText);

        // Restore cursor/selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    const handleSave = () => {
        onSave(content);
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden sm:inset-4 sm:rounded-2xl sm:shadow-2xl sm:border sm:border-gray-100"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0">
                    <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-full">
                        <X size={24} />
                    </button>

                    <div className="flex bg-gray-100 rounded-full p-1">
                        <button
                            onClick={() => setIsEditing(true)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isEditing ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!isEditing ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
                        >
                            Preview
                        </button>
                    </div>

                    <button onClick={handleSave} className="p-2 -mr-2 text-indigo-600 font-semibold rounded-full">
                        Done
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-gray-50/30">
                    {isEditing ? (
                        <div className="min-h-full p-4">
                            <TextareaAutosize
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Start writing..."
                                minRows={10}
                                className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-gray-800 text-lg leading-relaxed placeholder:text-gray-300"
                            />
                        </div>
                    ) : (
                        <div className="prose prose-indigo prose-lg max-w-none p-6">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {content || '*No content yet*'}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Mobile Toolbar (Only visible when editing) */}
                {isEditing && (
                    <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-center gap-6 shrink-0 pb-safe">
                        <button onClick={() => insertText('**', '**')} className="p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 rounded-lg transition-colors">
                            <Bold size={22} strokeWidth={2.5} />
                        </button>
                        <button onClick={() => insertText('- ')} className="p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 rounded-lg transition-colors">
                            <List size={22} strokeWidth={2.5} />
                        </button>
                        <button onClick={() => insertText('- [ ] ')} className="p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 rounded-lg transition-colors">
                            <CheckSquare size={22} strokeWidth={2.5} />
                        </button>
                        <button onClick={() => insertText('![Image](', ')')} className="p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 rounded-lg transition-colors">
                            <ImageIcon size={22} strokeWidth={2.5} />
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Backdrop for Desktop Mode context */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 sm:block hidden"
                onClick={onClose}
            />
        </AnimatePresence>
    );
};

export default NoteEditor;

