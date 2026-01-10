import React from 'react';
import { motion } from 'framer-motion';
import { StickyNote } from 'lucide-react';

interface Todo {
    id: number;
    title: string;
    description?: string;
    content?: string;
    is_completed: boolean;
    due_date?: string;
    reminder_at?: string;
}

interface NotesViewProps {
    notes: Todo[];
    onNoteClick: (note: Todo) => void;
}

const NotesView: React.FC<NotesViewProps> = ({ notes, onNoteClick }) => {
    // Filter to show only items that have content effectively acting as "Notes"
    // Or just show all items as cards? Let's show all for now, maybe filter by "has content" later if user desires.
    // Ideally, "Notes" are things that are NOT just checkboxes. 
    // For now, let's treat every task as a potential note.

    // Optional: Filter empty descriptions?
    // const displayNotes = notes.filter(n => n.content && n.content.trim().length > 0);
    const displayNotes = notes;

    if (displayNotes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                    <StickyNote size={40} className="text-gray-300" />
                </div>
                <p>No notes found</p>
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
                        <h3 className={`font-semibold text-gray-800 line-clamp-2 leading-tight ${note.is_completed ? 'line-through text-gray-400' : ''}`}>
                            {note.title}
                        </h3>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs text-gray-500 line-clamp-6 leading-relaxed whitespace-pre-line">
                            {stripMarkdown(note.content || 'No content')}
                        </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                        <span>{new Date(note.due_date || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
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
