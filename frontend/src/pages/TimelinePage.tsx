import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import api from '../api/client';
import TimelineView from '../components/TimelineView';
import { ActivityLog } from '../types/timeline';

const TimelinePage = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            setIsLoading(true);
            const response = await api.get<ActivityLog[]>('/timeline/');
            setActivities(response.data);
        } catch (err) {
            console.error('Failed to fetch timeline', err);
            setError('Failed to load timeline. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="sticky top-0 z-10 glass-nav px-4 py-4 mb-4">
                <div className="max-w-xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Timeline Review</h1>
                </div>
            </div>

            {/* Content */}
            <main className="pb-20">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-indigo-500" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500">
                        {error}
                        <button
                            onClick={fetchActivities}
                            className="block mx-auto mt-4 px-4 py-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-sm"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <TimelineView activities={activities} />
                )}
            </main>
        </div>
    );
};

export default TimelinePage;
