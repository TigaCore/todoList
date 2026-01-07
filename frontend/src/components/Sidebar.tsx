import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, User, Settings, Calendar, List, Star, Sun } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    activeFilter: string;
    onFilterChange: (filter: 'all' | 'today' | 'upcoming' | 'completed') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogout, activeFilter, onFilterChange }) => {
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
                        transition={{ type: "spring", stiffness: 300, damping: 30 }} // High stiffness, adjusted damping
                        className="fixed top-0 left-0 h-full w-[280px] bg-white z-50 shadow-2xl flex flex-col"
                    >
                        {/* Profile Header */}
                        <div className="p-6 bg-indigo-50 border-b border-indigo-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700">
                                <User size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">My Account</h3>
                                <p className="text-xs text-gray-500">Free Plan</p>
                            </div>
                            <button onClick={onClose} className="ml-auto text-gray-400 hover:text-indigo-600">
                                <X size={20} />
                            </button>
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
