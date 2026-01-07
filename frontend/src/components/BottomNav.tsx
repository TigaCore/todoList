import React from 'react';
import { CheckCircle2, StickyNote } from 'lucide-react';
import { motion } from 'framer-motion';

export type Tab = 'tasks' | 'notes' | 'settings';

interface BottomNavProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none flex justify-center pb-4">
            {/* Glass Panel */}
            <div className="bg-white/80 backdrop-blur-md border border-white/40 shadow-xl shadow-indigo-100/40 rounded-full px-6 py-2 flex items-center gap-12 pointer-events-auto mx-4 mb-2">
                <NavButton
                    isActive={activeTab === 'tasks'}
                    onClick={() => onTabChange('tasks')}
                    icon={<CheckCircle2 strokeWidth={2.5} size={24} />}
                    label="Tasks"
                />

                {/* Spacer for FAB */}
                <div className="w-12"></div>

                <NavButton
                    isActive={activeTab === 'notes'}
                    onClick={() => onTabChange('notes')}
                    icon={<StickyNote strokeWidth={2.5} size={24} />}
                    label="Notes"
                />
            </div>
        </div>
    );
};

const NavButton = ({ isActive, onClick, icon }: { isActive: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button
        onClick={onClick}
        className={`relative p-2 rounded-xl transition-all duration-300 flex flex-col items-center gap-0.5 ${isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
    >
        {icon}
        {isActive && (
            <motion.div
                layoutId="nav-indicator"
                className="absolute -bottom-1 w-1 h-1 bg-indigo-600 rounded-full"
            />
        )}
    </button>
);

export default BottomNav;
