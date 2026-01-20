import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { Markdown } from 'tiptap-markdown';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import Strike from '@tiptap/extension-strike';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Mathematics from '@tiptap/extension-mathematics';
import 'katex/dist/katex.min.css';
import { Bold, Italic, Strikethrough, List, ListOrdered, CheckSquare, Heading1, Heading2, Heading3, Quote, Code, GitBranch, Link2, Table as TableIcon, Sigma, Subscript as SubscriptIcon, Superscript as SuperscriptIcon } from 'lucide-react';
import CodeBlockComponent from './CodeBlockComponent';
import InputDialog from './InputDialog';
import { useLanguage } from '../contexts/LanguageContext';

// Create a lowlight instance with common languages
// Includes: javascript, typescript, python, css, html, xml, json, bash, c, cpp, java, etc.
const lowlight = createLowlight(common);

// Extend CodeBlockLowlight with custom NodeView for Mermaid rendering
const CustomCodeBlock = CodeBlockLowlight.extend({
    addNodeView() {
        return ReactNodeViewRenderer(CodeBlockComponent);
    },
});

// Table Selector Component
interface TableSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (rows: number, cols: number) => void;
}

const TableSelector: React.FC<TableSelectorProps> = ({ isOpen, onClose, onSelect }) => {
    const { t } = useLanguage();
    const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
    const maxRows = 10;
    const maxCols = 10;

    const handleCellClick = () => {
        if (hoveredCell) {
            onSelect(hoveredCell.row + 1, hoveredCell.col + 1);
            onClose();
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10000]" onClick={onClose}>
            <div
                className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-700"
                style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
                onClick={e => e.stopPropagation()}
            >
                <div className="mb-3 text-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {hoveredCell
                            ? `${hoveredCell.row + 1} × ${hoveredCell.col + 1}`
                            : t('editor.tableDialog.selectSize')
                        }
                    </span>
                </div>
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${maxCols}, minmax(0, 1fr))` }}>
                    {Array.from({ length: maxRows }).map((_, rowIndex) => (
                        Array.from({ length: maxCols }).map((_, colIndex) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`w-6 h-6 border border-gray-300 dark:border-gray-600 cursor-pointer transition-colors ${hoveredCell && rowIndex <= hoveredCell.row && colIndex <= hoveredCell.col
                                    ? 'bg-indigo-500'
                                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                    }`}
                                onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                                onClick={handleCellClick}
                            />
                        ))
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
};

interface TiptapEditorProps {
    initialContent: string;
    onUpdate: (content: string) => void;
    placeholder?: string;
    toolbarPosition?: 'top' | 'bottom'; // Toolbar position
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
    initialContent,
    onUpdate,
    placeholder = "Start writing...",
    toolbarPosition = 'bottom'
}) => {
    const { t } = useLanguage();
    const [isTableSelectorOpen, setIsTableSelectorOpen] = useState(false);
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [isMathDialogOpen, setIsMathDialogOpen] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false, // Disable default code block, we use CustomCodeBlock instead
            }),
            CustomCodeBlock.configure({
                lowlight,
                defaultLanguage: 'javascript',
            }),
            Strike,
            Link.configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
                HTMLAttributes: {
                    class: 'text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-800 dark:hover:text-indigo-200 cursor-pointer',
                    target: '_blank',
                    rel: 'noopener noreferrer',
                },
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full my-4',
                },
            }),
            TableRow.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300 dark:border-gray-600',
                },
            }),
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-3 py-2 text-left font-semibold',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300 dark:border-gray-600 px-3 py-2',
                },
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Placeholder.configure({
                placeholder,
            }),
            Typography,
            Markdown,
            // Math and text formatting extensions
            Subscript,
            Superscript,
            Mathematics,
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                class: `prose prose-indigo dark:prose-invert prose-sm sm:prose-base focus:outline-none min-h-[200px] px-4 py-3 w-full max-w-none`,
                spellcheck: 'false',
            },
        },
        onUpdate: ({ editor }) => {
            // We can get Markdown directly if we use the extension properly, 
            // but `editor.storage.markdown.getMarkdown()` is the usual way with tiptap-markdown
            // Type assertion to avoid TS error as local types might not be perfect
            const markdown = (editor.storage as any).markdown.getMarkdown();
            onUpdate(markdown);
        },
    });

    // Update content if initialContent changes externally (and editor is empty or different)
    // Note: Be careful with loops here. Usually we only set initial content once or if it's vastly different.
    useEffect(() => {
        if (editor && initialContent && editor.getText() === '' && initialContent !== '') {
            editor.commands.setContent(initialContent);
        }
    }, [initialContent, editor]);


    if (!editor) {
        return null; // or a skeleton loader
    }

    const toggleBold = () => editor.chain().focus().toggleBold().run();
    const toggleItalic = () => editor.chain().focus().toggleItalic().run();
    const toggleStrike = () => editor.chain().focus().toggleStrike().run();
    const toggleSubscript = () => editor.chain().focus().toggleSubscript().run();
    const toggleSuperscript = () => editor.chain().focus().toggleSuperscript().run();
    const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
    const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
    const toggleTaskList = () => editor.chain().focus().toggleTaskList().run();
    const toggleH1 = () => editor.chain().focus().toggleHeading({ level: 1 }).run();
    const toggleH2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
    const toggleH3 = () => editor.chain().focus().toggleHeading({ level: 3 }).run();
    const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run();
    const toggleCodeBlock = () => editor.chain().focus().toggleCodeBlock().run();
    const insertMermaid = () => editor.chain().focus().insertContent('```mermaid\ngraph TD\n    A[Start] --> B[End]\n```\n').run();

    const handleMathConfirm = (math: string) => {
        if (math) {
            editor.chain().focus().insertContent(`$${math}$$`).run();
        }
    };

    const handleLinkConfirm = (url: string) => {
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const handleMathClick = () => {
        if (!editor) return;
        setIsMathDialogOpen(true);
    };

    const handleLinkClick = () => {
        if (!editor) return;
        // Check if already has link, then unset it
        if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
            return;
        }
        setIsLinkDialogOpen(true);
    };

    const handleTableSelect = (rows: number, cols: number) => {
        if (!editor) return;
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    };

    const tooltipPlacement = toolbarPosition === 'top' ? 'bottom' : 'top';

    const Toolbar = (
        <div className={`relative shrink-0 ${toolbarPosition === 'top'
            ? 'border-b border-gray-100 dark:border-gray-700'
            : 'border-t border-gray-100 dark:border-gray-700'
            }`}>
            <div className={`px-4 py-3 bg-white dark:bg-gray-800 flex items-center gap-2 overflow-x-auto noscrollbar ${toolbarPosition === 'bottom' ? 'pb-safe' : ''
                }`}>
                <ToolbarButton onClick={toggleH1} isActive={editor.isActive('heading', { level: 1 })} icon={<Heading1 size={18} />} tooltip={t('editor.toolbar.heading1')} placement={tooltipPlacement} />
                <ToolbarButton onClick={toggleH2} isActive={editor.isActive('heading', { level: 2 })} icon={<Heading2 size={18} />} tooltip={t('editor.toolbar.heading2')} placement={tooltipPlacement} />
                <ToolbarButton onClick={toggleH3} isActive={editor.isActive('heading', { level: 3 })} icon={<Heading3 size={18} />} tooltip={t('editor.toolbar.heading3')} placement={tooltipPlacement} />
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1 shrink-0" />
                <ToolbarButton onClick={toggleBold} isActive={editor.isActive('bold')} icon={<Bold size={18} />} tooltip={t('editor.toolbar.bold')} placement={tooltipPlacement} />
                <ToolbarButton onClick={toggleItalic} isActive={editor.isActive('italic')} icon={<Italic size={18} />} tooltip={t('editor.toolbar.italic')} placement={tooltipPlacement} />
                <ToolbarButton onClick={toggleStrike} isActive={editor.isActive('strike')} icon={<Strikethrough size={18} />} tooltip={t('editor.toolbar.strikethrough')} placement={tooltipPlacement} />
                <ToolbarButton onClick={toggleSubscript} isActive={editor.isActive('subscript')} icon={<SubscriptIcon size={18} />} tooltip={t('editor.toolbar.subscript')} placement={tooltipPlacement} />
                <ToolbarButton onClick={toggleSuperscript} isActive={editor.isActive('superscript')} icon={<SuperscriptIcon size={18} />} tooltip={t('editor.toolbar.superscript')} placement={tooltipPlacement} />
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1 shrink-0" />
                <ToolbarButton onClick={handleMathClick} icon={<Sigma size={18} />} tooltip={t('editor.toolbar.math')} placement={tooltipPlacement} />
                <ToolbarButton onClick={handleLinkClick} isActive={editor.isActive('link')} icon={<Link2 size={18} />} tooltip={t('editor.toolbar.link')} placement={tooltipPlacement} />
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1 shrink-0" />
                <ToolbarButton onClick={toggleBulletList} isActive={editor.isActive('bulletList')} icon={<List size={18} />} tooltip={t('editor.toolbar.bulletList')} placement={tooltipPlacement} />
                <ToolbarButton onClick={toggleOrderedList} isActive={editor.isActive('orderedList')} icon={<ListOrdered size={18} />} tooltip={t('editor.toolbar.orderedList')} placement={tooltipPlacement} />
                <ToolbarButton onClick={toggleTaskList} isActive={editor.isActive('taskList')} icon={<CheckSquare size={18} />} tooltip={t('editor.toolbar.taskList')} placement={tooltipPlacement} />
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1 shrink-0" />
                <ToolbarButton onClick={() => setIsTableSelectorOpen(true)} isActive={editor.isActive('table')} icon={<TableIcon size={18} />} tooltip={t('editor.toolbar.table')} placement={tooltipPlacement} />
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1 shrink-0" />
                <ToolbarButton onClick={toggleBlockquote} isActive={editor.isActive('blockquote')} icon={<Quote size={18} />} tooltip={t('editor.toolbar.blockquote')} placement={tooltipPlacement} />
                <ToolbarButton onClick={toggleCodeBlock} isActive={editor.isActive('codeBlock')} icon={<Code size={18} />} tooltip={t('editor.toolbar.codeBlock')} placement={tooltipPlacement} />
                <ToolbarButton onClick={insertMermaid} isActive={editor.isActive('mermaidCodeBlock')} icon={<GitBranch size={18} />} tooltip={t('editor.toolbar.mermaid')} placement={tooltipPlacement} />
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-gray-800 relative">
            <TableSelector
                isOpen={isTableSelectorOpen}
                onClose={() => setIsTableSelectorOpen(false)}
                onSelect={handleTableSelect}
            />
            <InputDialog
                isOpen={isMathDialogOpen}
                onClose={() => setIsMathDialogOpen(false)}
                onConfirm={handleMathConfirm}
                title={t('editor.dialog.mathTitle')}
                placeholder={t('editor.dialog.mathPlaceholder')}
                confirmText={t('common.insert')}
            />
            <InputDialog
                isOpen={isLinkDialogOpen}
                onClose={() => setIsLinkDialogOpen(false)}
                onConfirm={handleLinkConfirm}
                title={t('editor.dialog.linkTitle')}
                placeholder={t('editor.dialog.linkPlaceholder')}
                confirmText={t('common.insert')}
                validate={(value) => {
                    try {
                        new URL(value);
                        return null;
                    } catch {
                        return t('editor.dialog.invalidUrl');
                    }
                }}
            />

            {toolbarPosition === 'top' && Toolbar}

            <div className="flex-1 overflow-y-auto w-full">
                <EditorContent editor={editor} className="h-full w-full" />
            </div>

            {toolbarPosition === 'bottom' && Toolbar}
        </div>
    );
};

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    icon: React.ReactNode;
    tooltip?: string;
    placement?: 'top' | 'bottom';
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, isActive, icon, tooltip, placement = 'top' }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleMouseEnter = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Calculate center of button
            const centerX = rect.left + rect.width / 2;

            // Calculate top based on placement
            let topY = 0;
            if (placement === 'top') {
                topY = rect.top - 10; // 10px above
            } else {
                topY = rect.bottom + 10; // 10px below
            }

            setCoords({ top: topY, left: centerX });
            setShowTooltip(true);
        }
    };

    return (
        <>
            <button
                ref={buttonRef}
                onClick={onClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setShowTooltip(false)}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isActive
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
            >
                {icon}
            </button>
            {showTooltip && tooltip && createPortal(
                <div
                    className="fixed z-[9999] px-2 py-1 text-xs font-medium text-white bg-gray-800 dark:bg-gray-700 rounded-md whitespace-nowrap pointer-events-none transform -translate-x-1/2"
                    style={{
                        top: coords.top,
                        left: coords.left,
                        transform: `translate(-50%, ${placement === 'top' ? '-100%' : '0'})`
                    }}
                >
                    {tooltip}
                    <div
                        className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${placement === 'top'
                            ? 'top-full border-t-gray-800 dark:border-t-gray-700'
                            : 'bottom-full border-b-gray-800 dark:border-b-gray-700'
                            }`}
                    />
                </div>,
                document.body
            )}
        </>
    );
};

export default TiptapEditor;
