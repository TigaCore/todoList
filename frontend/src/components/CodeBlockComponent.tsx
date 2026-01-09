import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import { ChevronDown } from 'lucide-react';

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
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const language = node.attrs.language || '';

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

    const handleLanguageChange = (newLanguage: string) => {
        updateAttributes({ language: newLanguage });
        setShowDropdown(false);
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

    // All code blocks shown as code (no mermaid preview in editor mode)
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
