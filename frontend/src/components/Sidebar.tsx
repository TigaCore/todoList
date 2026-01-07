import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, User, Settings, Calendar, List, Star, Sun } from 'lucide-react';

interface User {
    id: number;
    email: string;
    nickname: string;
    avatar?: string;
}

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    activeFilter: string;
    onFilterChange: (filter: 'all' | 'today' | 'upcoming' | 'completed') => void;
    user?: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogout, activeFilter, onFilterChange, user }) => {
    const menuItems = [
        { id: 'all', label: 'All Tasks', icon: List, color: 'text-indigo-600' },
        { id: 'today', label: 'Today', icon: Sun, color: 'text-amber-500' },
        { id: 'upcoming', label: 'Upcoming', icon: Calendar, color: 'text-purple-500' },
        { id: 'completed', label: 'Completed', icon: Star, color: 'text-green-500' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
                    />

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
                        className="fixed top-0 left-0 h-full w-[280px] bg-white z-50 shadow-2xl flex flex-col"
                    >
                        {/* Profile Header - with iOS safe area padding */}
                        <div className="p-6 pt-safe bg-indigo-50 border-b border-indigo-100">
                            <div className="flex items-center gap-4 mt-2">
                                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xl ring-4 ring-indigo-100">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user.nickname} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <span>{user?.nickname?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-800 truncate">{user?.nickname || 'User'}</h3>
                                    <p className="text-xs text-gray-500 truncate">{user?.email || 'guest@example.com'}</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
                                >
                                    <X size={20} />
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
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeFilter === item.id
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <item.icon size={20} className={item.color} />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 space-y-2">
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                                <Settings size={20} />
                                <span className="font-medium">Settings</span>
                            </button>
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={20} />
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
