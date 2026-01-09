import React, { useEffect, useState, useRef } from 'react';
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import mermaid from 'mermaid';
import { ChevronDown } from 'lucide-react';

// Initialize mermaid with default config
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Inter, system-ui, sans-serif',
});

// Common programming languages for the selector
const LANGUAGES = [
    { value: '', label: 'Plain Text' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'php', label: 'PHP' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'scss', label: 'SCSS' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash/Shell' },
    { value: 'powershell', label: 'PowerShell' },
    { value: 'dockerfile', label: 'Dockerfile' },
    { value: 'mermaid', label: 'Mermaid' },
];

const CodeBlockComponent: React.FC<NodeViewProps> = ({ node, updateAttributes }) => {
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isPreview, setIsPreview] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const language = node.attrs.language || '';
    const content = node.textContent || '';
    const isMermaid = language === 'mermaid';

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isMermaid || !content.trim() || !isPreview) {
            setSvg('');
            setError('');
            return;
        }

        const renderMermaid = async () => {
            try {
                const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
                const { svg: renderedSvg } = await mermaid.render(id, content.trim());
                setSvg(renderedSvg);
                setError('');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to render diagram');
                setSvg('');
            }
        };

        const timeoutId = setTimeout(renderMermaid, 300);
        return () => clearTimeout(timeoutId);
    }, [content, isMermaid, isPreview]);

    const handleLanguageChange = (newLanguage: string) => {
        updateAttributes({ language: newLanguage });
        setShowDropdown(false);
        if (newLanguage === 'mermaid') {
            setIsPreview(true);
        }
    };

    const currentLanguageLabel = LANGUAGES.find(l => l.value === language)?.label || language || 'Plain Text';

    // Language selector - positioned at bottom right, outside code block
    const LanguageLabel = () => (
        <div className="relative flex justify-end mt-1" ref={dropdownRef} contentEditable={false}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                contentEditable={false}
            >
                {currentLanguageLabel}
                <ChevronDown size={12} />
            </button>
            {showDropdown && (
                <div className="absolute bottom-full right-0 mb-1 w-48 max-h-64 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.value}
                            onClick={() => handleLanguageChange(lang.value)}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-700 transition-colors ${language === lang.value ? 'bg-indigo-600 text-white' : 'text-gray-300'
                                }`}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    // For mermaid blocks in preview mode with successful render
    if (isMermaid && isPreview && svg) {
        return (
            <NodeViewWrapper className="mermaid-block relative group my-4">
                <button
                    onClick={() => setIsPreview(false)}
                    className="absolute top-2 right-2 z-10 px-2 py-1 text-xs font-medium rounded bg-white/80 hover:bg-white text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-gray-200"
                    contentEditable={false}
                >
                    Edit
                </button>
                <div
                    className="mermaid-preview bg-white rounded-lg p-4 border border-gray-200 overflow-x-auto flex justify-center min-h-[120px]"
                    dangerouslySetInnerHTML={{ __html: svg }}
                    contentEditable={false}
                />
                <LanguageLabel />
            </NodeViewWrapper>
        );
    }

    // For mermaid blocks with error
    if (isMermaid && isPreview && error) {
        return (
            <NodeViewWrapper className="mermaid-block relative group my-4">
                <button
                    onClick={() => setIsPreview(false)}
                    className="absolute top-2 right-2 z-10 px-2 py-1 text-xs font-medium rounded bg-white/80 hover:bg-white text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-gray-200"
                    contentEditable={false}
                >
                    Edit
                </button>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4" contentEditable={false}>
                    <div className="text-red-600 text-sm font-medium mb-1">Mermaid Syntax Error</div>
                    <div className="text-red-500 text-xs font-mono mb-3">{error}</div>
                    <pre className="bg-gray-900 rounded p-3 overflow-x-auto min-h-[80px]">
                        <code className="text-gray-300 text-sm">{content}</code>
                    </pre>
                </div>
                <LanguageLabel />
            </NodeViewWrapper>
        );
    }

    // For mermaid blocks in edit mode
    if (isMermaid && !isPreview) {
        return (
            <NodeViewWrapper className="code-block-wrapper relative group my-4">
                <button
                    onClick={() => setIsPreview(true)}
                    className="absolute top-2 right-2 z-10 px-2 py-1 text-xs font-medium rounded bg-gray-600 hover:bg-gray-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    contentEditable={false}
                >
                    Preview
                </button>
                <pre className="!my-0 min-h-[120px]">
                    <code>
                        <NodeViewContent />
                    </code>
                </pre>
                <LanguageLabel />
            </NodeViewWrapper>
        );
    }

    // For regular code blocks (non-mermaid)
    return (
        <NodeViewWrapper className="code-block-wrapper relative group my-4">
            <pre className="!my-0 min-h-[80px]">
                <code className={language ? `hljs language-${language}` : ''}>
                    <NodeViewContent />
                </code>
            </pre>
            <LanguageLabel />
        </NodeViewWrapper>
    );
};

export default CodeBlockComponent;
