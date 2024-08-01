import { createClient } from '@supabase/supabase-js';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';

const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

// Create policy for user_table
const createUserTablePolicy = async () => {
  const { error } = await supabase.rpc('create_policy', {
    table_name: 'user_table',
    policy_name: 'user_own_data',
    policy_definition: `auth.uid() = user_id`
  });
  if (error) console.error('Error creating policy:', error);
};

createUserTablePolicy();

import React from "react";
export const queryClient = new QueryClient();
export function SupabaseProvider({ children }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const fromSupabase = async (query) => {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
};

/* supabase integration types

### user_table

| name       | type                     | format | required |
|------------|--------------------------|--------|----------|
| id         | int8                     | number | true     |
| created_at | timestamp with time zone | string | true     |
| last_upd   | timestamp with time zone | string | true     |
| user_id    | text                     | string | true     |
| password   | text                     | string | true     |
| user_type  | text                     | string | true     |
| user_org   | text                     | string | true     |

### dsr_tracker

| name        | type                     | format | required |
|-------------|--------------------------|--------|----------|
| id          | int8                     | number | true     |
| created_dt  | timestamp with time zone | string | true     |
| po_number   | text                     | string | true     |
| last_upd_dt | timestamp with time zone | string | true     |
| last_upd_by | text                     | string | true     |
| created_by  | text                     | string | true     |
| comments    | json                     | object | true     |

*/

// Hooks for user_table

export const useUserTable = () => useQuery({
    queryKey: ['user_table'],
    queryFn: () => fromSupabase(supabase.from('user_table').select('*')),
});

export const useUserTableById = (id) => useQuery({
    queryKey: ['user_table', id],
    queryFn: () => fromSupabase(supabase.from('user_table').select('*').eq('id', id).single()),
});

export const useAddUserTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newUser) => {
            const { data: session } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');
            return fromSupabase(supabase.from('user_table').insert([{ ...newUser, created_by: session.user.id }]));
        },
        onSuccess: () => {
            queryClient.invalidateQueries('user_table');
        },
    });
};

export const useUpdateUserTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updateData }) => {
            const { data: session } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');
            return fromSupabase(supabase.from('user_table').update({ ...updateData, last_upd_by: session.user.id }).eq('id', id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries('user_table');
        },
    });
};

export const useDeleteUserTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { data: session } = await supabase.auth.getSession();
            if (!session) throw new Error('Not authenticated');
            return fromSupabase(supabase.from('user_table').delete().eq('id', id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries('user_table');
        },
    });
};

// Hooks for dsr_tracker

export const useDsrTracker = () => useQuery({
    queryKey: ['dsr_tracker'],
    queryFn: () => fromSupabase(supabase.from('dsr_tracker').select('*')),
});

export const useDsrTrackerById = (id) => useQuery({
    queryKey: ['dsr_tracker', id],
    queryFn: () => fromSupabase(supabase.from('dsr_tracker').select('*').eq('id', id).single()),
});

export const useAddDsrTracker = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newDsr) => fromSupabase(supabase.from('dsr_tracker').insert([newDsr])),
        onSuccess: () => {
            queryClient.invalidateQueries('dsr_tracker');
        },
    });
};

export const useUpdateDsrTracker = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('dsr_tracker').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('dsr_tracker');
        },
    });
};

export const useDeleteDsrTracker = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('dsr_tracker').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('dsr_tracker');
        },
    });
};
