export interface ActivityLog {
    id: number;
    action_type: 'CREATE' | 'COMPLETE' | 'UNCOMPLETE' | 'UPDATE_CONTENT' | 'DELETE';
    todo_id: number;
    metadata_Snapshot?: {
        title?: string;
        [key: string]: any;
    };
    timestamp: string;
}
