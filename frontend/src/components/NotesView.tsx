import React from 'react';
import { motion } from 'framer-motion';
import { StickyNote, CheckSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Todo } from '../api/supabase';

interface NotesViewProps {
    notes: Todo[];
    onNoteClick: (note: Todo) => void;
    selectedFolderId?: number | null;
}

const NotesView: React.FC<NotesViewProps> = ({ notes, onNoteClick, selectedFolderId }) => {
    const { t } = useLanguage();

    // Only show standalone documents (is_document=true)
    // Tasks with attached notes are edited by clicking the task, not shown here
    // Apply folder filter if selectedFolderId is provided
    const displayNotes = notes.filter(n => {
        if (n.is_document !== true) return false;
        if (selectedFolderId !== null && selectedFolderId !== undefined && n.folder_id !== selectedFolderId) return false;
        return true;
    });

    if (displayNotes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                    <StickyNote size={40} className="text-gray-300 dark:text-gray-600" />
                </div>
                <p>{t('notes.noNotes')}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pb-24 px-1">
            {displayNotes.map((note, index) => (
                <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 28,
                        mass: 0.8,
                        delay: Math.min(index * 0.05, 0.3)
                    }}
                    onClick={() => onNoteClick(note)}
                    className="glass-card rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col h-48 active:scale-95 group"
                >
                    <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-tight ${note.is_completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                            {note.title}
                        </h3>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-6 leading-relaxed whitespace-pre-line">
                            {note.content ? stripMarkdown(note.content) : t('notes.noContent')}
                        </p>
                    </div>

                    {/* Footer with embedded task stats if present */}
                    <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                        <span>{new Date(note.due_date || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        {note.embedded_tasks && note.embedded_tasks.length > 0 && (
                            <div className="flex items-center gap-1">
                                <CheckSquare size={12} className="text-stone-500" />
                                <span className={note.embedded_tasks.every(t => t.is_completed) ? 'text-stone-500' : ''}>
                                    {note.embedded_tasks.filter(t => t.is_completed).length}/{note.embedded_tasks.length}
                                </span>
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

// Helper: Simple regex to strip basic markdown for preview
function stripMarkdown(md: string) {
    if (!md) return '';
    return md
        .replace(/#+\s/g, '') // Headers
        .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
        .replace(/(\*|_)(.*?)\1/g, '$2') // Italic
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
        .replace(/`{3,}[\s\S]*?`{3,}/g, '[Code]') // Code blocks
        .replace(/`(.+?)`/g, '$1'); // Inline code
}


export default NotesView;
