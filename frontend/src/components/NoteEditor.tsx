import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, Bold, List, CheckSquare, Image as ImageIcon } from 'lucide-react';

interface Todo {
    id: number;
    title: string;
    description?: string;
    content?: string;
    is_completed: boolean;
    due_date?: string;
    reminder_at?: string;
}

interface NoteEditorProps {
    isOpen: boolean;
    note: Todo | null;
    onSave: (content: string) => void;
    onClose: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ isOpen, note, onSave, onClose }) => {
    const [content, setContent] = useState(note?.content || '');
    const [isEditing, setIsEditing] = useState(!note?.content); // Default to edit if empty
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Update content when note changes
    useEffect(() => {
        if (note) {
            setContent(note.content || '');
            setIsEditing(!note.content);
        }
    }, [note]);

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
        // We don't close here automatically to allow 'save and keep editing', 
        // but user expects 'Done' to close usually. Let's close for now.
        // Actually Dashboard handles closing via backdrop click, but 'Done' should probably close too.
        onClose();
    };

    if (!isOpen || !note) return null;

    return (
        <div className="flex flex-col max-h-full h-full bg-white sm:rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0">
                <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                    <X size={24} />
                </button>

                <div className="flex bg-gray-100 rounded-full p-1">
                    <button
                        onClick={() => setIsEditing(true)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isEditing ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!isEditing ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Preview
                    </button>
                </div>

                <button
                    onClick={handleSave}
                    className="px-4 py-1.5 bg-indigo-500 text-white text-sm font-medium rounded-full hover:bg-indigo-600 transition-colors shadow-sm"
                >
                    Done
                </button>
            </div>

            {/* Content Area - Fixed height for consistency */}
            <div className="h-[320px] overflow-y-auto bg-gray-50/30">
                {isEditing ? (
                    <div className="h-full p-4">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Start writing your notes here... Markdown is supported."
                            className="w-full h-full bg-transparent border-none resize-none focus:ring-0 outline-none focus:outline-none text-gray-800 text-base leading-relaxed placeholder:text-gray-400"
                        />
                    </div>
                ) : (
                    <div className="prose prose-indigo prose-sm max-w-none p-6 h-full overflow-y-auto">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content || '*No content yet*'}
                        </ReactMarkdown>
                    </div>
                )}
            </div>

            {/* Toolbar - Always render for consistent height */}
            <div className={`px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-center gap-6 shrink-0 pb-safe transition-opacity ${isEditing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button onClick={() => insertText('**', '**')} className="p-2 text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 rounded-lg transition-colors" title="Bold">
                    <Bold size={20} strokeWidth={2.5} />
                </button>
                <button onClick={() => insertText('- ')} className="p-2 text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 rounded-lg transition-colors" title="Bullet List">
                    <List size={20} strokeWidth={2.5} />
                </button>
                <button onClick={() => insertText('- [ ] ')} className="p-2 text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 rounded-lg transition-colors" title="Checklist">
                    <CheckSquare size={20} strokeWidth={2.5} />
                </button>
                <button onClick={() => insertText('![Image](', ')')} className="p-2 text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 rounded-lg transition-colors" title="Insert Image">
                    <ImageIcon size={20} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
};

export default NoteEditor;
