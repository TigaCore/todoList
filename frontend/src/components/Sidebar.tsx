import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, LogOut, Settings, Calendar, List, Star, Sun,
    ChevronLeft, ChevronRight, User, Mail, Lock, Camera,
    Moon, Monitor, Globe, Download, Info, Check, Loader2,
    Folder as FolderIcon, Plus, Pencil, Trash2, Pin, CalendarDays
} from 'lucide-react';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { supabase, Folder } from '../api/supabase';

interface UserData {
    id: string;
    email: string;
    nickname?: string;
    avatar?: string;
}

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    activeFilter: string;
    onFilterChange: (filter: 'all' | 'today' | 'upcoming' | 'completed' | 'folder' | 'calendar') => void;
    user?: UserData | null;
    onUserUpdate?: (user: UserData) => void;
    // Folder props
    folders: Folder[];
    selectedFolderId: number | null;
    onFolderSelect: (folderId: number | null, isForDocument: boolean) => void;
    onAddFolder: (name: string, color: string, isForDocument: boolean) => Promise<void>;
    onEditFolder: (id: number, name: string, color: string) => Promise<void>;
    onDeleteFolder: (id: number) => Promise<void>;
    activeTab: 'tasks' | 'notes';
    // Pin props
    isPinned: boolean;
    onTogglePin: () => void;
}

type View = 'menu' | 'settings';

const Sidebar: React.FC<SidebarProps> = ({
    isOpen, onClose, onLogout, activeFilter, onFilterChange, user, onUserUpdate,
    folders, selectedFolderId, onFolderSelect, onAddFolder, onEditFolder, onDeleteFolder, activeTab,
    isPinned, onTogglePin
}) => {
    const { t, language, setLanguage } = useLanguage();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [view, setView] = useState<View>('menu');
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [nickname, setNickname] = useState(user?.nickname || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Folder UI state
    const [isAddingFolder, setIsAddingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderColor, setNewFolderColor] = useState('stone');
    const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
    const [editFolderName, setEditFolderName] = useState('');
    const [editFolderColor, setEditFolderColor] = useState('stone');
    const [isFolderLoading, setIsFolderLoading] = useState(false);
    const [deletingFolderId, setDeletingFolderId] = useState<number | null>(null);

    // Folder color options - muted, premium tones
    const folderColors: Record<string, { bg: string; text: string; ring: string }> = {
        stone: { bg: 'bg-stone-400', text: 'text-stone-500', ring: 'ring-stone-300' },
        warmGray: { bg: 'bg-neutral-400', text: 'text-neutral-500', ring: 'ring-neutral-300' },
        taupe: { bg: 'bg-amber-700/60', text: 'text-amber-700/70', ring: 'ring-amber-300' },
        sage: { bg: 'bg-emerald-700/50', text: 'text-emerald-700/60', ring: 'ring-emerald-300' },
        slate: { bg: 'bg-slate-400', text: 'text-slate-500', ring: 'ring-slate-300' },
        mauve: { bg: 'bg-purple-300/70', text: 'text-purple-400/80', ring: 'ring-purple-200' },
    };

    // Filter folders by type based on active tab
    const filteredFolders = folders.filter(f =>
        activeTab === 'notes' ? f.is_for_document === true : f.is_for_document !== true
    );

    // Reset view when sidebar closes
    useEffect(() => {
        if (!isOpen) {
            // Delay reset to allow close animation
            const timer = setTimeout(() => setView('menu'), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Update nickname when user changes
    useEffect(() => {
        setNickname(user?.nickname || '');
    }, [user?.nickname]);

    const menuItems = [
        { id: 'all', label: t('filter.all'), icon: List, color: 'text-stone-600 dark:text-stone-400' },
        { id: 'today', label: t('filter.today'), icon: Sun, color: 'text-stone-600 dark:text-stone-400' },
        { id: 'upcoming', label: t('filter.upcoming'), icon: Calendar, color: 'text-stone-600 dark:text-stone-400' },
        { id: 'completed', label: t('filter.completed'), icon: Star, color: 'text-stone-600 dark:text-stone-400' },
        { id: 'calendar', label: t('filter.calendar'), icon: CalendarDays, color: 'text-stone-600 dark:text-stone-400' },
    ];

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    // Folder CRUD handlers
    const handleAddFolderSubmit = async () => {
        if (!newFolderName.trim() || isFolderLoading) return;
        setIsFolderLoading(true);
        try {
            await onAddFolder(newFolderName.trim(), newFolderColor, activeTab === 'notes');
            setNewFolderName('');
            setNewFolderColor('stone');
            setIsAddingFolder(false);
        } finally {
            setIsFolderLoading(false);
        }
    };

    const handleEditFolderSubmit = async () => {
        if (!editFolderName.trim() || !editingFolderId || isFolderLoading) return;
        setIsFolderLoading(true);
        try {
            await onEditFolder(editingFolderId, editFolderName.trim(), editFolderColor);
            setEditingFolderId(null);
        } finally {
            setIsFolderLoading(false);
        }
    };

    const handleDeleteFolderConfirm = async () => {
        if (!deletingFolderId || isFolderLoading) return;
        setIsFolderLoading(true);
        try {
            await onDeleteFolder(deletingFolderId);
            setDeletingFolderId(null);
        } finally {
            setIsFolderLoading(false);
        }
    };

    const startEditFolder = (folder: Folder) => {
        setEditingFolderId(folder.id);
        setEditFolderName(folder.name);
        setEditFolderColor(folder.color || 'stone');
        setIsAddingFolder(false);
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsSaving(true);

            // Upload avatar to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update user metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) {
                throw updateError;
            }

            // Notify parent
            onUserUpdate?.({ ...user!, avatar: publicUrl });
            showMessage('success', t('common.success'));
        } catch (error) {
            console.error('Error uploading avatar:', error);
            showMessage('error', t('common.error'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleNicknameSave = async () => {
        if (!nickname.trim() || nickname === user?.nickname) {
            setIsEditingNickname(false);
            return;
        }

        try {
            setIsSaving(true);
            const { error } = await supabase.auth.updateUser({
                data: { nickname: nickname.trim() }
            });

            if (error) {
                throw error;
            }

            onUserUpdate?.({ ...user!, nickname: nickname.trim() });
            setIsEditingNickname(false);
            showMessage('success', t('common.success'));
        } catch (error) {
            console.error('Error updating nickname:', error);
            showMessage('error', t('common.error'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = async () => {
        try {
            setIsExporting(true);

            // Fetch all todos for export
            const { data: todos, error } = await supabase
                .from('todos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            const data = JSON.stringify(todos, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tiga-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showMessage('success', t('settings.exported'));
        } catch (error) {
            console.error('Error exporting data:', error);
            showMessage('error', t('common.error'));
        } finally {
            setIsExporting(false);
        }
    };

    const themeOptions: { value: Theme; icon: React.ReactNode; label: string }[] = [
        { value: 'light', icon: <Sun size={16} />, label: t('theme.light') },
        { value: 'dark', icon: <Moon size={16} />, label: t('theme.dark') },
        { value: 'system', icon: <Monitor size={16} />, label: t('theme.system') },
    ];

    const languageOptions: { value: Language; label: string }[] = [
        { value: 'zh', label: t('language.zh') },
        { value: 'en', label: t('language.en') },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop - only show when not pinned */}
                    {!isPinned && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="glass-backdrop fixed inset-0 z-40 transition-opacity"
                        />
                    )}

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{
                            type: "spring",
                            stiffness: 320,
                            damping: 30,
                            mass: 0.85
                        }}
                        className={`fixed top-0 left-0 h-full w-[300px] glass-modal flex flex-col overflow-hidden ${isPinned
                            ? 'z-30 rounded-none border-r border-gray-200/50 dark:border-gray-700/50'
                            : 'z-50 rounded-r-3xl'
                            }`}
                    >
                        {/* Message Toast */}
                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-medium ${message.type === 'success'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-red-500 text-white'
                                        }`}
                                >
                                    {message.text}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* View Container with Animation */}
                        <div className="flex-1 flex flex-col overflow-hidden relative">
                            {/* Menu View */}
                            <motion.div
                                animate={{
                                    x: view === 'menu' ? 0 : '-100%',
                                    opacity: view === 'menu' ? 1 : 0,
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="absolute inset-0 flex flex-col"
                                style={{ pointerEvents: view === 'menu' ? 'auto' : 'none' }}
                            >
                                {/* Profile Header - Minimalist */}
                                <div className="p-6 pt-safe mb-2">
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="w-12 h-12 rounded-full bg-[#E7E5E4] text-[#2D2A26] flex items-center justify-center font-bold text-xl overflow-hidden">
                                            {user?.avatar ? (
                                                <img src={user.avatar} alt={user.nickname} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <span>{user?.nickname?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-800 dark:text-gray-100 truncate">{user?.nickname || 'User'}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'guest@example.com'}</p>
                                        </div>
                                        <button
                                            onClick={onTogglePin}
                                            className={`p-2 rounded-lg flex items-center justify-center transition-colors ${isPinned ? 'text-[#2D2A26] bg-[#E7E5E4]' : 'text-gray-400 hover:text-[#2D2A26]'}`}
                                            title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
                                        >
                                            <Pin size={18} className={isPinned ? 'rotate-45' : ''} />
                                        </button>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                                    {menuItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                onFilterChange(item.id as any);
                                                onClose();
                                            }}
                                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeFilter === item.id
                                                ? 'bg-[#E7E5E4] text-[#2D2A26] font-medium'
                                                : 'text-gray-500 hover:text-stone-800'
                                                }`}
                                        >
                                            <item.icon size={20} className={item.color} />
                                            <span className="font-medium">{item.label}</span>
                                        </button>
                                    ))}

                                    {/* Folder Section - show for both tabs */}
                                    <div className="mt-4 pt-4 border-t border-gray-100/50 dark:border-gray-700/50">
                                        <div className="flex items-center justify-between px-2 mb-2">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                                {activeTab === 'notes' ? t('folder.docFolders') : t('folder.taskFolders')}
                                            </span>
                                            <button
                                                onClick={() => setIsAddingFolder(!isAddingFolder)}
                                                className="p-1 text-gray-400 hover:text-stone-600 dark:hover:text-stone-400 rounded-lg transition-colors"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        {/* Add folder form */}
                                        {isAddingFolder && (
                                            <div className="mx-2 mb-2 p-2 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-stone-200 dark:border-stone-700">
                                                <input
                                                    type="text"
                                                    value={newFolderName}
                                                    onChange={(e) => setNewFolderName(e.target.value)}
                                                    placeholder={t('folder.folderName')}
                                                    className="w-full px-2 py-1.5 text-sm rounded-lg glass-input dark:text-gray-100 mb-2"
                                                    autoFocus
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddFolderSubmit()}
                                                />
                                                <div className="flex items-center gap-1 mb-2">
                                                    {Object.keys(folderColors).map(color => (
                                                        <button
                                                            key={color}
                                                            type="button"
                                                            onClick={() => setNewFolderColor(color)}
                                                            className={`w-5 h-5 rounded-full ${folderColors[color].bg} ${newFolderColor === color ? 'ring-2 ring-offset-1 ' + folderColors[color].ring : ''} transition-transform`}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={handleAddFolderSubmit}
                                                        disabled={!newFolderName.trim() || isFolderLoading}
                                                        className="flex-1 py-1.5 text-xs font-medium text-white bg-stone-500 hover:bg-stone-600 rounded-lg disabled:opacity-50"
                                                    >
                                                        {isFolderLoading ? <Loader2 size={12} className="animate-spin mx-auto" /> : t('common.save')}
                                                    </button>
                                                    <button
                                                        onClick={() => { setIsAddingFolder(false); setNewFolderName(''); }}
                                                        className="px-3 py-1.5 text-xs glass-button rounded-lg"
                                                    >
                                                        {t('common.cancel')}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Folder list */}
                                        {filteredFolders.map(folder => (
                                            <div key={folder.id}>
                                                {editingFolderId === folder.id ? (
                                                    /* Edit form */
                                                    <div className="mx-2 mb-2 p-2 rounded-xl bg-white/50 dark:bg-gray-700/50 border border-stone-200 dark:border-stone-700">
                                                        <input
                                                            type="text"
                                                            value={editFolderName}
                                                            onChange={(e) => setEditFolderName(e.target.value)}
                                                            className="w-full px-2 py-1.5 text-sm rounded-lg glass-input dark:text-gray-100 mb-2"
                                                            autoFocus
                                                        />
                                                        <div className="flex items-center gap-1 mb-2">
                                                            {Object.keys(folderColors).map(color => (
                                                                <button
                                                                    key={color}
                                                                    type="button"
                                                                    onClick={() => setEditFolderColor(color)}
                                                                    className={`w-5 h-5 rounded-full ${folderColors[color].bg} ${editFolderColor === color ? 'ring-2 ring-offset-1 ' + folderColors[color].ring : ''}`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button onClick={handleEditFolderSubmit} disabled={isFolderLoading} className="flex-1 py-1.5 text-xs font-medium text-white bg-stone-500 hover:bg-stone-600 rounded-lg disabled:opacity-50">
                                                                {isFolderLoading ? <Loader2 size={12} className="animate-spin mx-auto" /> : t('common.save')}
                                                            </button>
                                                            <button onClick={() => setEditingFolderId(null)} className="px-3 py-1.5 text-xs glass-button rounded-lg">{t('common.cancel')}</button>
                                                        </div>
                                                    </div>
                                                ) : deletingFolderId === folder.id ? (
                                                    /* Delete confirmation */
                                                    <div className="mx-2 mb-2 p-2 rounded-xl bg-rose-50/50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                                                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{t('folder.confirmDelete')}</p>
                                                        <div className="flex gap-1">
                                                            <button onClick={handleDeleteFolderConfirm} disabled={isFolderLoading} className="flex-1 py-1.5 text-xs font-medium text-white bg-rose-500 rounded-lg disabled:opacity-50">
                                                                {isFolderLoading ? <Loader2 size={12} className="animate-spin mx-auto" /> : t('common.delete')}
                                                            </button>
                                                            <button onClick={() => setDeletingFolderId(null)} className="px-3 py-1.5 text-xs glass-button rounded-lg">{t('common.cancel')}</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Normal folder item */
                                                    <button
                                                        onClick={() => {
                                                            onFolderSelect(folder.id, activeTab === 'notes');
                                                            onFilterChange('folder');
                                                            onClose();
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group ${activeFilter === 'folder' && selectedFolderId === folder.id
                                                            ? 'bg-[#E7E5E4] text-[#2D2A26] font-medium'
                                                            : 'text-gray-500 hover:text-stone-800'
                                                            }`}
                                                    >
                                                        <FolderIcon size={18} className={folderColors[folder.color || 'stone']?.text || 'text-stone-500'} />
                                                        <span className="flex-1 text-left font-medium truncate">{folder.name}</span>
                                                        {/* Edit/Delete buttons on hover */}
                                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); startEditFolder(folder); }}
                                                                className="p-1 text-gray-400 hover:text-stone-600 rounded"
                                                            >
                                                                <Pencil size={12} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setDeletingFolderId(folder.id); }}
                                                                className="p-1 text-gray-400 hover:text-rose-500 rounded"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        {filteredFolders.length === 0 && !isAddingFolder && (
                                            <p className="px-4 py-2 text-xs text-gray-400 dark:text-gray-500">{t('folder.noFolders')}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-4 border-t border-gray-100/50 dark:border-gray-700/50 space-y-2">
                                    <button
                                        onClick={() => setView('settings')}
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Settings size={20} />
                                            <span className="font-medium">{t('settings.title')}</span>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-400" />
                                    </button>
                                    <button
                                        onClick={onLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <LogOut size={20} />
                                        <span className="font-medium">{t('settings.logout')}</span>
                                    </button>
                                </div>
                            </motion.div>

                            {/* Settings View */}
                            <motion.div
                                animate={{
                                    x: view === 'settings' ? 0 : '100%',
                                    opacity: view === 'settings' ? 1 : 0,
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="absolute inset-0 flex flex-col"
                                style={{ pointerEvents: view === 'settings' ? 'auto' : 'none' }}
                            >
                                {/* Settings Header */}
                                <div className="p-4 pt-safe border-b border-gray-100/50 dark:border-gray-700/50 flex items-center gap-3">
                                    <button
                                        onClick={() => setView('menu')}
                                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">{t('settings.title')}</h2>
                                </div>

                                {/* Settings Content */}
                                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
                                    {/* Account Section */}
                                    <section className="space-y-2">
                                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-2">{t('settings.account')}</h3>

                                        {/* Avatar */}
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isSaving}
                                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800/50 flex items-center justify-center text-stone-600 dark:text-stone-400">
                                                    <Camera size={16} />
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300 text-sm">{t('settings.avatar')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {user?.avatar ? (
                                                    <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-stone-500 flex items-center justify-center text-white text-xs font-bold">
                                                        {user?.nickname?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                <ChevronRight size={16} className="text-gray-400" />
                                            </div>
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarChange}
                                        />

                                        {/* Nickname */}
                                        <div className="px-3 py-2.5 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800/50 flex items-center justify-center text-stone-600 dark:text-stone-400">
                                                        <User size={16} />
                                                    </div>
                                                    <span className="text-gray-700 dark:text-gray-300 text-sm">{t('settings.nickname')}</span>
                                                </div>
                                                {isEditingNickname ? (
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="text"
                                                            value={nickname}
                                                            onChange={(e) => setNickname(e.target.value)}
                                                            className="w-20 px-2 py-1 text-xs rounded-lg glass-input dark:text-gray-100"
                                                            autoFocus
                                                            onKeyDown={(e) => e.key === 'Enter' && handleNicknameSave()}
                                                        />
                                                        <button
                                                            onClick={handleNicknameSave}
                                                            disabled={isSaving}
                                                            className="p-1 rounded-lg bg-stone-500 text-white"
                                                        >
                                                            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setIsEditingNickname(false);
                                                                setNickname(user?.nickname || '');
                                                            }}
                                                            className="p-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setIsEditingNickname(true)}
                                                        className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm"
                                                    >
                                                        <span>{user?.nickname}</span>
                                                        <ChevronRight size={16} className="text-gray-400" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="px-3 py-2.5 rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800/50 flex items-center justify-center text-stone-600 dark:text-stone-400">
                                                    <Mail size={16} />
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300 text-sm">{t('settings.email')}</span>
                                            </div>
                                            <span className="text-gray-400 text-xs truncate max-w-[100px]">{user?.email}</span>
                                        </div>

                                        {/* Change Password */}
                                        <button
                                            onClick={() => setIsPasswordModalOpen(true)}
                                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800/50 flex items-center justify-center text-stone-600 dark:text-stone-400">
                                                    <Lock size={16} />
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300 text-sm">{t('settings.changePassword')}</span>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-400" />
                                        </button>
                                    </section>

                                    {/* Appearance Section */}
                                    <section className="space-y-2">
                                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-2">{t('settings.appearance')}</h3>

                                        {/* Theme */}
                                        <div className="px-3 py-2.5 rounded-xl space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800/50 flex items-center justify-center text-stone-600 dark:text-stone-400">
                                                    {resolvedTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300 text-sm">{t('settings.theme')}</span>
                                            </div>
                                            <div className="flex gap-1 ml-11">
                                                {themeOptions.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => setTheme(option.value)}
                                                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${theme === option.value
                                                            ? 'bg-stone-500 text-white'
                                                            : 'bg-white/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300'
                                                            }`}
                                                    >
                                                        {option.icon}
                                                        <span className="hidden sm:inline">{option.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Language */}
                                        <div className="px-3 py-2.5 rounded-xl space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800/50 flex items-center justify-center text-stone-600 dark:text-stone-400">
                                                    <Globe size={16} />
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300 text-sm">{t('settings.language')}</span>
                                            </div>
                                            <div className="flex gap-1 ml-11">
                                                {languageOptions.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => setLanguage(option.value)}
                                                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${language === option.value
                                                            ? 'bg-stone-500 text-white'
                                                            : 'bg-white/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300'
                                                            }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </section>

                                    {/* Data Section */}
                                    <section className="space-y-2">
                                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-2">{t('settings.data')}</h3>
                                        <button
                                            onClick={handleExport}
                                            disabled={isExporting}
                                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800/50 flex items-center justify-center text-stone-600 dark:text-stone-400">
                                                    {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                                </div>
                                                <div className="text-left">
                                                    <span className="text-gray-700 dark:text-gray-300 text-sm block">{t('settings.exportData')}</span>
                                                    <span className="text-gray-400 text-xs">{t('settings.exportDesc')}</span>
                                                </div>
                                            </div>
                                        </button>
                                    </section>

                                    {/* About Section */}
                                    <section className="space-y-2">
                                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-2">{t('settings.about')}</h3>
                                        <div className="px-3 py-2.5 rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center text-gray-600 dark:text-gray-400">
                                                    <Info size={16} />
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300 text-sm">{t('settings.version')}</span>
                                            </div>
                                            <span className="text-gray-400 text-xs">1.0.0</span>
                                        </div>
                                    </section>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Password Modal */}
                    <PasswordModal
                        isOpen={isPasswordModalOpen}
                        onClose={() => setIsPasswordModalOpen(false)}
                        onSuccess={() => {
                            setIsPasswordModalOpen(false);
                            showMessage('success', t('settings.passwordChanged'));
                        }}
                        t={t}
                    />
                </>
            )}
        </AnimatePresence>
    );
};

// Password Change Modal Component
interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    t: (key: string) => string;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSuccess, t }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError(t('settings.passwordMismatch'));
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setIsLoading(true);

            // Get current user email
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) {
                throw new Error('No email found for user');
            }

            // Note: Supabase requires email verification or special flow for password changes
            // For now, we'll use the reset password flow
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(
                user.email,
                {
                    redirectTo: `${window.location.origin}/update-password`,
                }
            );

            if (resetError) {
                throw resetError;
            }

            setNewPassword('');
            setConfirmPassword('');
            showMessage('success', 'Password reset email sent. Please check your email.');
            onSuccess();
        } catch (err: any) {
            console.error('Error changing password:', err);
            setError(err.message || t('common.error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        onClose();
    };

    // Get current user email
    const [userEmail, setUserEmail] = useState('');
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUserEmail(user?.email || '');
        });
    }, []);

    const showMessage = (type: 'success' | 'error', text: string) => {
        // Use a toast or alert - for now just set error/success
        if (type === 'error') {
            setError(text);
        } else {
            alert(text);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/30"
                        onClick={handleClose}
                    />
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm glass-modal rounded-2xl p-6 pointer-events-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    {t('settings.changePassword')}
                                </h2>
                                <button
                                    onClick={handleClose}
                                    className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                A password reset link will be sent to your email ({userEmail}).
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <p className="text-red-500 text-sm">{error}</p>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 py-3 rounded-xl glass-button font-medium text-gray-600 dark:text-gray-300"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 py-3 rounded-xl btn-primary font-medium flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            t('common.confirm')
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
