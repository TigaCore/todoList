import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import TiptapEditor from './TiptapEditor';

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

    // Update content when note changes
    useEffect(() => {
        if (note) {
            setContent(note.content || '');
        }
    }, [note]);

    const handleSave = () => {
        onSave(content);
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

                <div className="flex-1 text-center font-medium text-gray-700 mx-4 truncate">
                    {note.title}
                </div>

                <button
                    onClick={handleSave}
                    className="px-4 py-1.5 bg-indigo-500 text-white text-sm font-medium rounded-full hover:bg-indigo-600 transition-colors shadow-sm"
                >
                    Done
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden bg-white">
                <TiptapEditor
                    initialContent={content}
                    onUpdate={setContent}
                />
            </div>
        </div>
    );
};

export default NoteEditor;

