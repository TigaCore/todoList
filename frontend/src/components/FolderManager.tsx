import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder as FolderIcon, Plus, Pencil, Trash2, Check, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Folder } from '../api/supabase';
import { FOLDER_COLORS } from './FolderList';

interface FolderManagerProps {
    isOpen: boolean;
    onClose: () => void;
    folders: Folder[];
    onAddFolder: (name: string, color: string) => Promise<void>;
    onEditFolder: (id: number, name: string, color: string) => Promise<void>;
    onDeleteFolder: (id: number) => Promise<void>;
}

const AVAILABLE_COLORS = ['indigo', 'rose', 'amber', 'emerald', 'sky', 'purple'];

const FolderManager: React.FC<FolderManagerProps> = ({
    isOpen,
    onClose,
    folders,
    onAddFolder,
    onEditFolder,
    onDeleteFolder
}) => {
    const { t } = useLanguage();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderColor, setNewFolderColor] = useState('indigo');
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('indigo');
    const [isLoading, setIsLoading] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const handleAddSubmit = async () => {
        if (!newFolderName.trim() || isLoading) return;
        setIsLoading(true);
        try {
            await onAddFolder(newFolderName.trim(), newFolderColor);
            setNewFolderName('');
            setNewFolderColor('indigo');
            setIsAdding(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditSubmit = async () => {
        if (!editName.trim() || !editingId || isLoading) return;
        setIsLoading(true);
        try {
            await onEditFolder(editingId, editName.trim(), editColor);
            setEditingId(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            await onDeleteFolder(id);
            setDeleteConfirmId(null);
        } finally {
            setIsLoading(false);
        }
    };

    const startEditing = (folder: Folder) => {
        setEditingId(folder.id);
        setEditName(folder.name);
        setEditColor(folder.color || 'indigo');
        setIsAdding(false);
    };

    const cancelAll = () => {
        setIsAdding(false);
        setEditingId(null);
        setDeleteConfirmId(null);
        setNewFolderName('');
        setNewFolderColor('indigo');
    };

    const ColorPicker = ({ selected, onChange }: { selected: string; onChange: (color: string) => void }) => (
        <div className="flex gap-2 mt-2">
            {AVAILABLE_COLORS.map(color => {
                const colorStyle = FOLDER_COLORS[color];
                return (
                    <button
                        key={color}
                        type="button"
                        onClick={() => onChange(color)}
                        className={`w-6 h-6 rounded-full ${colorStyle.bg} ${colorStyle.border} border-2 transition-transform ${selected === color ? 'scale-125 ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800' : ''
                            }`}
                    />
                );
            })}
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { cancelAll(); onClose(); }}
                        className="fixed inset-0 z-40 glass-backdrop"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-50"
                    >
                        <div className="glass-modal rounded-2xl p-6 max-h-[80vh] overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    {t('folder.manageFolder')}
                                </h2>
                                <button
                                    onClick={() => { cancelAll(); onClose(); }}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Folder List */}
                            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                                {folders.length === 0 && !isAdding && (
                                    <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                        <FolderIcon size={40} className="mx-auto mb-2 opacity-50" />
                                        <p>{t('folder.noFolders')}</p>
                                    </div>
                                )}

                                {folders.map(folder => (
                                    <div key={folder.id}>
                                        {editingId === folder.id ? (
                                            /* Edit Mode */
                                            <div className="glass-card p-3 rounded-xl">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                    className="w-full glass-input px-3 py-2 rounded-lg text-sm text-gray-800 dark:text-gray-100"
                                                    placeholder={t('folder.folderName')}
                                                    autoFocus
                                                />
                                                <ColorPicker selected={editColor} onChange={setEditColor} />
                                                <div className="flex gap-2 mt-3">
                                                    <button
                                                        onClick={handleEditSubmit}
                                                        disabled={isLoading || !editName.trim()}
                                                        className="flex-1 btn-primary py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-50"
                                                    >
                                                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                        {t('common.save')}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="px-4 py-2 glass-button rounded-lg text-sm"
                                                    >
                                                        {t('common.cancel')}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : deleteConfirmId === folder.id ? (
                                            /* Delete Confirmation */
                                            <div className="glass-card p-3 rounded-xl border-2 border-rose-300 dark:border-rose-700">
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                                    {t('folder.confirmDelete')}
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleDelete(folder.id)}
                                                        disabled={isLoading}
                                                        className="flex-1 bg-rose-500/90 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-50"
                                                    >
                                                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                        {t('common.delete')}
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(null)}
                                                        className="px-4 py-2 glass-button rounded-lg text-sm"
                                                    >
                                                        {t('common.cancel')}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Normal Display */
                                            <div className="glass-card p-3 rounded-xl flex items-center gap-3 group">
                                                <div className={`p-2 rounded-lg ${FOLDER_COLORS[folder.color || 'indigo'].bg}`}>
                                                    <FolderIcon size={16} className="text-white" />
                                                </div>
                                                <span className="flex-1 text-gray-800 dark:text-gray-100 font-medium truncate">
                                                    {folder.name}
                                                </span>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => startEditing(folder)}
                                                        className="p-1.5 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(folder.id)}
                                                        className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Add New Folder Form */}
                                {isAdding && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="glass-card p-3 rounded-xl border-2 border-indigo-300 dark:border-indigo-700"
                                    >
                                        <input
                                            type="text"
                                            value={newFolderName}
                                            onChange={e => setNewFolderName(e.target.value)}
                                            className="w-full glass-input px-3 py-2 rounded-lg text-sm text-gray-800 dark:text-gray-100"
                                            placeholder={t('folder.folderName')}
                                            autoFocus
                                            onKeyDown={e => e.key === 'Enter' && handleAddSubmit()}
                                        />
                                        <ColorPicker selected={newFolderColor} onChange={setNewFolderColor} />
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={handleAddSubmit}
                                                disabled={isLoading || !newFolderName.trim()}
                                                className="flex-1 btn-primary py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-50"
                                            >
                                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                {t('folder.addFolder')}
                                            </button>
                                            <button
                                                onClick={() => { setIsAdding(false); setNewFolderName(''); }}
                                                className="px-4 py-2 glass-button rounded-lg text-sm"
                                            >
                                                {t('common.cancel')}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Add Button */}
                            {!isAdding && !editingId && (
                                <button
                                    onClick={() => { setIsAdding(true); setEditingId(null); }}
                                    className="w-full glass-button py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                                >
                                    <Plus size={18} />
                                    {t('folder.addFolder')}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default FolderManager;
