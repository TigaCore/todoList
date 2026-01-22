import React from 'react';
import { motion } from 'framer-motion';
import { Folder as FolderIcon, Settings, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Folder } from '../api/supabase';

// Folder color options
const FOLDER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    indigo: {
        bg: 'bg-indigo-500/90',
        text: 'text-white',
        border: 'border-indigo-400/30'
    },
    rose: {
        bg: 'bg-rose-500/90',
        text: 'text-white',
        border: 'border-rose-400/30'
    },
    amber: {
        bg: 'bg-amber-500/90',
        text: 'text-white',
        border: 'border-amber-400/30'
    },
    emerald: {
        bg: 'bg-emerald-500/90',
        text: 'text-white',
        border: 'border-emerald-400/30'
    },
    sky: {
        bg: 'bg-sky-500/90',
        text: 'text-white',
        border: 'border-sky-400/30'
    },
    purple: {
        bg: 'bg-purple-500/90',
        text: 'text-white',
        border: 'border-purple-400/30'
    }
};

interface FolderListProps {
    folders: Folder[];
    selectedFolderId: number | null;
    onFolderSelect: (folderId: number | null) => void;
    onManageClick: () => void;
    onAddClick?: () => void;
    showAddButton?: boolean;
}

const FolderList: React.FC<FolderListProps> = ({
    folders,
    selectedFolderId,
    onFolderSelect,
    onManageClick,
    onAddClick,
    showAddButton = true
}) => {
    const { t } = useLanguage();

    const getFolderStyle = (folder: Folder, isSelected: boolean) => {
        const color = folder.color || 'indigo';
        const colorStyle = FOLDER_COLORS[color] || FOLDER_COLORS.indigo;

        if (isSelected) {
            return `${colorStyle.bg} ${colorStyle.text} ${colorStyle.border}`;
        }
        return 'bg-white/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-white/60 dark:border-gray-600/60';
    };

    return (
        <div className="mb-4 -mx-1">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-1 py-1">
                {/* All Items Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onFolderSelect(null)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-md border ${selectedFolderId === null
                            ? 'bg-indigo-500/90 text-white border-indigo-400/30 shadow-md'
                            : 'bg-white/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-white/60 dark:border-gray-600/60 hover:bg-white/70 dark:hover:bg-gray-600/70'
                        }`}
                >
                    {t('folder.all')}
                </motion.button>

                {/* Folder Buttons */}
                {folders.map((folder, index) => (
                    <motion.button
                        key={folder.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onFolderSelect(folder.id)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-md border ${getFolderStyle(folder, selectedFolderId === folder.id)
                            }`}
                    >
                        <FolderIcon size={14} />
                        <span className="truncate max-w-[100px]">{folder.name}</span>
                    </motion.button>
                ))}

                {/* Add Folder Button */}
                {showAddButton && onAddClick && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onAddClick}
                        className="flex-shrink-0 p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                        title={t('folder.addFolder')}
                    >
                        <Plus size={18} />
                    </motion.button>
                )}

                {/* Manage Folders Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onManageClick}
                    className="flex-shrink-0 p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                    title={t('folder.manageFolder')}
                >
                    <Settings size={18} />
                </motion.button>
            </div>
        </div>
    );
};

export { FOLDER_COLORS };
export default FolderList;
