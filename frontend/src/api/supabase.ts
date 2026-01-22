import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Initialize session recovery
// Listen for auth state changes and sync with localStorage
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        localStorage.setItem('supabase-token', session.access_token);
        localStorage.setItem('supabase-refresh-token', session.refresh_token);
    } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('supabase-token');
        localStorage.removeItem('supabase-refresh-token');
    }
});

// Export types matching the database schema
// Some fields are optional for optimistic updates
export type Todo = {
    id: number
    user_id: string
    title: string
    content?: string | null
    is_completed: boolean
    is_document?: boolean
    due_date?: string | null
    reminder_at?: string | null
    embedded_tasks?: EmbeddedTask[] | null
    folder_id?: number | null
    created_at: string
}

// For optimistic updates, we can create partial todos
export type PartialTodo = Partial<Todo> & { id: number }

export type EmbeddedTask = {
    line_index: number
    text: string
    is_completed: boolean
}

// Folder type for organizing tasks and documents
export type Folder = {
    id: number
    user_id: string
    name: string
    color?: string
    is_for_document?: boolean  // true = document folder, false/undefined = task folder
    created_at: string
}

export type User = {
    id: string
    email: string
    user_metadata: {
        nickname?: string
        avatar_url?: string
    }
}

// Document task - parsed from markdown task lists in documents
export interface DocTask {
    docId: number
    docTitle: string
    lineIndex: number
    text: string
    isCompleted: boolean
}
