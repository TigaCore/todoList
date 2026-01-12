import React, { useEffect } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { Markdown } from 'tiptap-markdown';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Bold, Italic, List, ListOrdered, CheckSquare, Heading1, Heading2, Quote, Code, GitBranch } from 'lucide-react';
import CodeBlockComponent from './CodeBlockComponent';

// Create a lowlight instance with common languages
// Includes: javascript, typescript, python, css, html, xml, json, bash, c, cpp, java, etc.
const lowlight = createLowlight(common);

// Extend CodeBlockLowlight with custom NodeView for Mermaid rendering
const CustomCodeBlock = CodeBlockLowlight.extend({
    addNodeView() {
        return ReactNodeViewRenderer(CodeBlockComponent);
    },
});

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
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false, // Disable default code block, we use CustomCodeBlock instead
            }),
            CustomCodeBlock.configure({
                lowlight,
                defaultLanguage: 'javascript',
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
    const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
    const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
    const toggleTaskList = () => editor.chain().focus().toggleTaskList().run();
    const toggleH1 = () => editor.chain().focus().toggleHeading({ level: 1 }).run();
    const toggleH2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
    const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run();
    const toggleCodeBlock = () => editor.chain().focus().toggleCodeBlock().run();
    const insertMermaid = () => editor.chain().focus().insertContent('```mermaid\ngraph TD\n    A[Start] --> B[End]\n```\n').run();

    const Toolbar = (
        <div className={`relative shrink-0 ${toolbarPosition === 'top'
            ? 'border-b border-gray-100 dark:border-gray-700'
            : 'border-t border-gray-100 dark:border-gray-700'
            }`}>
            <div className={`px-4 py-3 bg-white dark:bg-gray-800 flex items-center gap-2 overflow-x-auto noscrollbar ${toolbarPosition === 'bottom' ? 'pb-safe' : ''
                }`}>
                <ToolbarButton onClick={toggleH1} isActive={editor.isActive('heading', { level: 1 })} icon={<Heading1 size={18} />} />
                <ToolbarButton onClick={toggleH2} isActive={editor.isActive('heading', { level: 2 })} icon={<Heading2 size={18} />} />
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1 shrink-0" />
                <ToolbarButton onClick={toggleBold} isActive={editor.isActive('bold')} icon={<Bold size={18} />} />
                <ToolbarButton onClick={toggleItalic} isActive={editor.isActive('italic')} icon={<Italic size={18} />} />
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1 shrink-0" />
                <ToolbarButton onClick={toggleBulletList} isActive={editor.isActive('bulletList')} icon={<List size={18} />} />
                <ToolbarButton onClick={toggleOrderedList} isActive={editor.isActive('orderedList')} icon={<ListOrdered size={18} />} />
                <ToolbarButton onClick={toggleTaskList} isActive={editor.isActive('taskList')} icon={<CheckSquare size={18} />} />
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1 shrink-0" />
                <ToolbarButton onClick={toggleBlockquote} isActive={editor.isActive('blockquote')} icon={<Quote size={18} />} />
                <ToolbarButton onClick={toggleCodeBlock} isActive={editor.isActive('codeBlock')} icon={<Code size={18} />} />
                <ToolbarButton onClick={insertMermaid} isActive={editor.isActive('mermaidCodeBlock')} icon={<GitBranch size={18} />} />
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-gray-800 relative">
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
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, isActive, icon }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isActive
            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
            : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
    >
        {icon}
    </button>
);

export default TiptapEditor;
