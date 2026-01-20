import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Maximize2, Minimize2, Code, Edit3, Keyboard, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TiptapEditor from './TiptapEditor';
import { useLanguage } from '../contexts/LanguageContext';
import { PartialTodo, EmbeddedTask } from '../api/supabase';

interface NoteEditorProps {
    isOpen: boolean;
    note: PartialTodo | null;
    onSave: (content: string, title?: string) => void;
    onClose: () => void;
    // Embedded task props
    embeddedTasks?: EmbeddedTask[] | null;
    onToggleEmbeddedTask?: (lineIndex: number, completed: boolean) => void;
    onJumpToLine?: (lineIndex: number) => void;
}

type ViewMode = 'edit' | 'source';

const NoteEditor: React.FC<NoteEditorProps> = ({
    isOpen,
    note,
    onSave,
    onClose,
    embeddedTasks,
    onToggleEmbeddedTask,
    onJumpToLine
}) => {
    const { t, language } = useLanguage();
    const [content, setContent] = useState(note?.content || '');
    const [title, setTitle] = useState(note?.title || '');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('edit');
    const [showShortcuts, setShowShortcuts] = useState(false);
    const shortcutsRef = useRef<HTMLDivElement>(null);
    // Key to force TipTap re-render when switching modes
    const [tiptapKey, setTiptapKey] = useState(0);
    // Embedded tasks panel state
    const [isEmbeddedTasksExpanded, setIsEmbeddedTasksExpanded] = useState(true);

    // Extract first H1 heading from markdown content
    const extractH1FromContent = (md: string): string | null => {
        const match = md.match(/^#\s+(.+)$/m);
        return match ? match[1].trim() : null;
    };

    // Keyboard shortcuts data with i18n
    const shortcuts = useMemo(() => {
        const isZh = language === 'zh';
        return [
            {
                category: isZh ? '文本格式' : 'Text Format', items: [
                    { keys: ['⌘', 'B'], desc: isZh ? '粗体' : 'Bold' },
                    { keys: ['⌘', 'I'], desc: isZh ? '斜体' : 'Italic' },
                    { keys: ['⌘', 'U'], desc: isZh ? '下划线' : 'Underline' },
                    { keys: ['⌘', 'E'], desc: isZh ? '行内代码' : 'Inline Code' },
                    { keys: ['⌘', '⇧', 'X'], desc: isZh ? '删除线' : 'Strikethrough' },
                ]
            },
            {
                category: isZh ? '段落' : 'Paragraph', items: [
                    { keys: ['⌘', '⌥', '1-6'], desc: isZh ? '标题级别' : 'Heading Level' },
                    { keys: ['⌘', '⇧', '7'], desc: isZh ? '有序列表' : 'Ordered List' },
                    { keys: ['⌘', '⇧', '8'], desc: isZh ? '无序列表' : 'Unordered List' },
                    { keys: ['⌘', '⇧', '9'], desc: isZh ? '引用块' : 'Blockquote' },
                    { keys: ['⌘', '⌥', 'C'], desc: isZh ? '代码块' : 'Code Block' },
                ]
            },
            {
                category: isZh ? '编辑' : 'Editing', items: [
                    { keys: ['⌘', 'Z'], desc: isZh ? '撤销' : 'Undo' },
                    { keys: ['⌘', '⇧', 'Z'], desc: isZh ? '重做' : 'Redo' },
                    { keys: ['⌘', 'A'], desc: isZh ? '全选' : 'Select All' },
                ]
            },
        ];
    }, [language]);

    // Close shortcuts popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (shortcutsRef.current && !shortcutsRef.current.contains(e.target as Node)) {
                setShowShortcuts(false);
            }
        };
        if (showShortcuts) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showShortcuts]);

    // Update content and title when note changes
    useEffect(() => {
        if (note) {
            setContent(note.content || '');
            setTitle(note.title || '');
            setTiptapKey(prev => prev + 1); // Force TipTap to reinitialize
        }
    }, [note]);

    // Handle ESC key to exit fullscreen or close shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showShortcuts) {
                    setShowShortcuts(false);
                } else if (isFullscreen) {
                    setIsFullscreen(false);
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen, showShortcuts]);

    // When switching from source to edit mode, force TipTap to reinitialize with new content
    const handleViewModeChange = (newMode: ViewMode) => {
        if (viewMode === 'source' && newMode === 'edit') {
            setTiptapKey(prev => prev + 1);
        }
        setViewMode(newMode);
    };

    const handleSave = () => {
        // Determine final title: custom title > H1 from content > default
        let finalTitle = title.trim();
        if (!finalTitle) {
            finalTitle = extractH1FromContent(content) || 'Untitled';
        }
        onSave(content, finalTitle);
        onClose();
    };

    if (!isOpen || !note) return null;

    // View mode toggle button component
    const ViewModeToggle = () => (
        <div className="flex items-center bg-white/40 backdrop-blur-sm rounded-xl p-0.5 border border-white/50">
            <button
                onClick={() => handleViewModeChange('edit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${viewMode === 'edit'
                    ? 'bg-white/80 dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-700/50'
                    }`}
                title={t('editor.edit')}
            >
                <Edit3 size={14} />
                <span className="hidden sm:inline">{t('editor.edit')}</span>
            </button>
            <button
                onClick={() => handleViewModeChange('source')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${viewMode === 'source'
                    ? 'bg-white/80 dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/30 dark:hover:bg-gray-700/50'
                    }`}
                title={t('editor.source')}
            >
                <Code size={14} />
                <span className="hidden sm:inline">{t('editor.source')}</span>
            </button>
        </div>
    );

    // Embedded Tasks Panel Component
    const EmbeddedTasksPanel = () => {
        if (!embeddedTasks || embeddedTasks.length === 0) return null;

        const completedCount = embeddedTasks.filter(t => t.is_completed).length;
        const totalCount = embeddedTasks.length;

        return (
            <div className="border-t border-gray-100 dark:border-gray-700/50">
                <button
                    onClick={() => setIsEmbeddedTasksExpanded(!isEmbeddedTasksExpanded)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {t('embeddedTask.title')}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                            {completedCount}/{totalCount}
                        </span>
                    </div>
                    {isEmbeddedTasksExpanded ? (
                        <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                    )}
                </button>

                <AnimatePresence>
                    {isEmbeddedTasksExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                                {embeddedTasks.map((task) => (
                                    <div
                                        key={task.line_index}
                                        onClick={() => onJumpToLine?.(task.line_index)}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer group transition-colors"
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleEmbeddedTask?.(task.line_index, !task.is_completed);
                                            }}
                                            className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                                                task.is_completed
                                                    ? 'bg-indigo-500 border-indigo-500 text-white'
                                                    : 'border-gray-300 dark:border-gray-500 group-hover:border-indigo-400'
                                            }`}
                                        >
                                            {task.is_completed && <Check size={10} strokeWidth={3} />}
                                        </button>
                                        <span className={`flex-1 text-sm truncate transition-all ${
                                            task.is_completed
                                                ? 'text-gray-400 dark:text-gray-500 line-through'
                                                : 'text-gray-700 dark:text-gray-200'
                                        }`}>
                                            {task.text || `Task at line ${task.line_index + 1}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    // Render both normal mode and fullscreen overlay
    return (
        <>
            {/* Normal mode (non-fullscreen) */}
            <div className={`flex flex-col max-h-full h-full glass-modal sm:rounded-2xl overflow-hidden ${isFullscreen ? 'invisible' : ''}`}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-white/50 dark:bg-gray-900/70 border-b border-white/30 dark:border-gray-700/50 shrink-0">
                    <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors">
                        <X size={24} />
                    </button>

                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={extractH1FromContent(content) || t('notes.untitled')}
                        className="flex-1 text-center font-medium text-gray-700 dark:text-gray-200 mx-4 bg-transparent border-none outline-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500"
                    />

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFullscreen(true)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                            title="Fullscreen"
                        >
                            <Maximize2 size={20} />
                        </button>
                        <button
                            onClick={handleSave}
                            className="btn-primary px-4 py-1.5 text-sm font-medium rounded-full"
                        >
                            {t('editor.done')}
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden bg-white/30 dark:bg-gray-800/30">
                    <TiptapEditor
                        key={`normal-${tiptapKey}`}
                        initialContent={content}
                        onUpdate={setContent}
                    />
                </div>

                {/* Embedded Tasks Panel */}
                <EmbeddedTasksPanel />
            </div>

            {/* Fullscreen overlay */}
            <AnimatePresence>
                {isFullscreen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="fullscreen-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[60]"
                            style={{
                                background: 'var(--fullscreen-bg, linear-gradient(135deg, #e0e7ff 0%, #f0f5ff 25%, #faf5ff 50%, #f0f5ff 75%, #e0e7ff 100%))'
                            }}
                        />
                        {/* Fullscreen content */}
                        <motion.div
                            key="fullscreen-content"
                            initial={{ opacity: 0, y: '30%', scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: '20%', scale: 0.95 }}
                            transition={{
                                type: "spring",
                                stiffness: 350,
                                damping: 30,
                                mass: 0.8,
                            }}
                            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
                        >
                            <div className="flex flex-col w-full max-w-5xl h-full max-h-[calc(100vh-2rem)] glass-modal rounded-2xl overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 py-3 bg-white/50 dark:bg-gray-800/50 border-b border-white/30 dark:border-gray-700/30 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setIsFullscreen(false)}
                                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                                            title="Exit Fullscreen (ESC)"
                                        >
                                            <Minimize2 size={20} />
                                        </button>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder={extractH1FromContent(content) || t('notes.untitled')}
                                            className="font-semibold text-gray-800 dark:text-gray-100 max-w-md bg-transparent border-none outline-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <ViewModeToggle />

                                        {/* Keyboard Shortcuts Button */}
                                        <div className="relative" ref={shortcutsRef}>
                                            <button
                                                onClick={() => setShowShortcuts(!showShortcuts)}
                                                className={`p-2 rounded-xl transition-colors ${showShortcuts
                                                    ? 'bg-white/60 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400'
                                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                                                    }`}
                                                title="快捷键"
                                            >
                                                <Keyboard size={18} />
                                            </button>

                                            {/* Shortcuts Popover */}
                                            <AnimatePresence>
                                                {showShortcuts && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                        className="absolute top-full right-0 mt-2 w-72 glass-modal rounded-xl p-4 shadow-xl z-10"
                                                    >
                                                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                                                            <Keyboard size={14} />
                                                            键盘快捷键
                                                        </h3>
                                                        <div className="space-y-4">
                                                            {shortcuts.map((group) => (
                                                                <div key={group.category}>
                                                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                                        {group.category}
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        {group.items.map((shortcut, idx) => (
                                                                            <div key={idx} className="flex items-center justify-between text-sm">
                                                                                <span className="text-gray-600 dark:text-gray-300">{shortcut.desc}</span>
                                                                                <div className="flex items-center gap-0.5">
                                                                                    {shortcut.keys.map((key, keyIdx) => (
                                                                                        <kbd
                                                                                            key={keyIdx}
                                                                                            className="px-1.5 py-0.5 bg-gray-100/80 dark:bg-gray-700 rounded text-xs font-mono text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600 min-w-[22px] text-center"
                                                                                        >
                                                                                            {key}
                                                                                        </kbd>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-600/50 text-xs text-gray-400 text-center">
                                                            按 ESC 关闭提示
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleSave}
                                            className="btn-primary px-4 py-1.5 text-sm font-medium rounded-xl"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-hidden flex bg-white/30 dark:bg-gray-800/30 relative">
                                    <AnimatePresence mode="wait" initial={false}>
                                        {/* Edit Mode - TipTap Rich Editor */}
                                        {viewMode === 'edit' && (
                                            <motion.div
                                                key="edit"
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.98 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute inset-0 flex w-full"
                                            >
                                                <TiptapEditor
                                                    key={`fullscreen-${tiptapKey}`}
                                                    initialContent={content}
                                                    onUpdate={setContent}
                                                    toolbarPosition="top"
                                                />
                                            </motion.div>
                                        )}

                                        {/* Source Mode - Raw Markdown */}
                                        {viewMode === 'source' && (
                                            <motion.div
                                                key="source"
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.98 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute inset-0 flex flex-col"
                                            >
                                                <div className="px-3 py-1.5 bg-white/30 dark:bg-gray-800/30 border-b border-white/30 dark:border-gray-700/30 text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0 flex items-center gap-2">
                                                    <Code size={12} />
                                                    Markdown Source
                                                </div>
                                                <textarea
                                                    value={content}
                                                    onChange={(e) => setContent(e.target.value)}
                                                    className="flex-1 w-full resize-none bg-transparent font-mono text-sm p-4 focus:outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                                    placeholder="Write your markdown here..."
                                                    spellCheck={false}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Embedded Tasks Panel - Fullscreen */}
                                <EmbeddedTasksPanel />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default NoteEditor;
