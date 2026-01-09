import React, { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, Code, Eye, Columns } from 'lucide-react';
import TiptapEditor from './TiptapEditor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

// Initialize mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Inter, system-ui, sans-serif',
});

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

type ViewMode = 'editor' | 'preview' | 'split';

// Mermaid renderer component
const MermaidDiagram: React.FC<{ code: string }> = ({ code }) => {
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const renderDiagram = async () => {
            try {
                const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
                const { svg: renderedSvg } = await mermaid.render(id, code.trim());
                setSvg(renderedSvg);
                setError('');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to render diagram');
                setSvg('');
            }
        };

        if (code.trim()) {
            renderDiagram();
        }
    }, [code]);

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
                <div className="text-red-600 text-sm font-medium mb-1">Mermaid Error</div>
                <div className="text-red-500 text-xs font-mono">{error}</div>
            </div>
        );
    }

    if (svg) {
        return (
            <div
                className="my-4 flex justify-center bg-white rounded-lg p-4 border border-gray-200"
                dangerouslySetInnerHTML={{ __html: svg }}
            />
        );
    }

    return null;
};

const NoteEditor: React.FC<NoteEditorProps> = ({ isOpen, note, onSave, onClose }) => {
    const [content, setContent] = useState(note?.content || '');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('editor');

    // Update content when note changes
    useEffect(() => {
        if (note) {
            setContent(note.content || '');
        }
    }, [note]);

    // Handle ESC key to exit fullscreen
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    const handleSave = () => {
        onSave(content);
        onClose();
    };

    if (!isOpen || !note) return null;

    // Markdown Preview Component with Mermaid support
    const MarkdownPreview = ({ className = '' }: { className?: string }) => (
        <div className={`prose prose-indigo prose-sm sm:prose-base max-w-none overflow-y-auto p-4 ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    pre: ({ children, ...props }) => {
                        // Check if this pre contains a mermaid code block
                        const child = React.Children.toArray(children)[0] as React.ReactElement;
                        if (child?.props?.className?.includes('language-mermaid')) {
                            // Return children without pre wrapper for mermaid
                            return <>{children}</>;
                        }
                        return (
                            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto" {...props}>
                                {children}
                            </pre>
                        );
                    },
                    code: ({ className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const lang = match ? match[1] : '';
                        const codeContent = String(children).replace(/\n$/, '');

                        // Render mermaid diagrams
                        if (lang === 'mermaid') {
                            return <MermaidDiagram code={codeContent} />;
                        }

                        const isInline = !className;
                        return isInline ? (
                            <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm" {...props}>
                                {children}
                            </code>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {content || '*No content yet*'}
            </ReactMarkdown>
        </div>
    );

    // View mode toggle button component
    const ViewModeToggle = () => (
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
                onClick={() => setViewMode('editor')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'editor'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                title="Editor"
            >
                <Code size={14} />
                <span className="hidden sm:inline">Editor</span>
            </button>
            <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'split'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                title="Split View"
            >
                <Columns size={14} />
                <span className="hidden sm:inline">Split</span>
            </button>
            <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'preview'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                title="Preview"
            >
                <Eye size={14} />
                <span className="hidden sm:inline">Preview</span>
            </button>
        </div>
    );

    // Fullscreen mode
    if (isFullscreen) {
        return (
            <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col">
                {/* Centered container with max width */}
                <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full bg-white shadow-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsFullscreen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Exit Fullscreen (ESC)"
                            >
                                <Minimize2 size={20} />
                            </button>
                            <h1 className="font-semibold text-gray-800 truncate max-w-md">
                                {note.title}
                            </h1>
                        </div>

                        <ViewModeToggle />

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleSave}
                                className="px-4 py-1.5 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors shadow-sm"
                            >
                                Save
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden flex">
                        {/* Editor Mode - Raw Textarea */}
                        {viewMode === 'editor' && (
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="flex-1 w-full resize-none bg-gray-50 font-mono text-sm p-4 focus:outline-none focus:bg-white transition-colors"
                                placeholder="Write your markdown here..."
                                spellCheck={false}
                            />
                        )}

                        {/* Preview Mode */}
                        {viewMode === 'preview' && (
                            <div className="flex-1 overflow-y-auto bg-white">
                                <MarkdownPreview />
                            </div>
                        )}

                        {/* Split Mode */}
                        {viewMode === 'split' && (
                            <>
                                <div className="w-1/2 border-r border-gray-200 flex flex-col overflow-hidden">
                                    <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 shrink-0">
                                        Editor
                                    </div>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="flex-1 w-full resize-none bg-gray-50 font-mono text-sm p-4 focus:outline-none focus:bg-white transition-colors"
                                        placeholder="Write your markdown here..."
                                        spellCheck={false}
                                    />
                                </div>
                                <div className="w-1/2 flex flex-col overflow-hidden">
                                    <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 shrink-0">
                                        Preview
                                    </div>
                                    <div className="flex-1 overflow-y-auto bg-white">
                                        <MarkdownPreview />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Normal mode (non-fullscreen)
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

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsFullscreen(true)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        title="Fullscreen"
                    >
                        <Maximize2 size={20} />
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-1.5 bg-indigo-500 text-white text-sm font-medium rounded-full hover:bg-indigo-600 transition-colors shadow-sm"
                    >
                        Done
                    </button>
                </div>
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
