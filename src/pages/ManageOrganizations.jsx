import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabaseAuth } from '../integrations/supabase/auth';
import { Navigate } from 'react-router-dom';
import { useUserOrg, useAddUserOrg, useUpdateUserOrg, useDeleteUserOrg } from '../integrations/supabase';
import { format } from 'date-fns';
import { toast } from 'sonner';

const ManageOrganizations = () => {
  const [newOrg, setNewOrg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrg, setEditingOrg] = useState(null);
  const [error, setError] = useState(null);
  const { session } = useSupabaseAuth();
  const { data: organizations, isLoading, isError } = useUserOrg();
  const addOrgMutation = useAddUserOrg();
  const updateOrgMutation = useUpdateUserOrg();
  const deleteOrgMutation = useDeleteUserOrg();

  const handleAddOrg = async () => {
    if (newOrg.trim() !== '') {
      const currentTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      const newOrgData = {
        org_name: newOrg.trim(),
        created_at: currentTime,
        created_by: session.user.user_id,
        last_upd: currentTime,
        last_upd_by: session.user.user_id
      };
      try {
        await addOrgMutation.mutateAsync(newOrgData);
        setNewOrg('');
        toast.success('Organization added successfully');
      } catch (error) {
        console.error('Error adding organization:', error);
        toast.error(`Failed to add organization: ${error.message}`);
        setError(`Failed to add organization: ${error.message}`);
      }
    }
  };

  const handleUpdateOrg = (oldOrg, newOrg) => {
    if (newOrg.trim() !== '' && oldOrg !== newOrg) {
      const currentTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      updateOrgMutation.mutate({
        org_name: oldOrg,
        new_org_name: newOrg.trim(),
        last_upd: currentTime,
        last_upd_by: session.user.user_id
      });
      setEditingOrg(null);
    }
  };

  const handleDeleteOrg = (org) => {
    deleteOrgMutation.mutate(org);
  };

  const filteredOrganizations = organizations?.filter(org =>
    org.org_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading organizations</div>;

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (session.user.user_type !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-center">Manage Organizations</h1>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={newOrg}
              onChange={(e) => setNewOrg(e.target.value)}
              placeholder="New organization"
            />
            <Button onClick={handleAddOrg}>Add</Button>
          </div>
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search organizations"
          />
          <ul className="space-y-2">
            {filteredOrganizations.map((org) => (
              <li key={org} className="flex justify-between items-center">
                {editingOrg === org ? (
                  <Input
                    value={editingOrg}
                    onChange={(e) => setEditingOrg(e.target.value)}
                    onBlur={() => handleUpdateOrg(org, editingOrg)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUpdateOrg(org, editingOrg)}
                  />
                ) : (
                  <span>{org}</span>
                )}
                <div>
                  <Button variant="outline" onClick={() => setEditingOrg(org)} className="mr-2">Edit</Button>
                  <Button variant="destructive" onClick={() => handleDeleteOrg(org)}>Delete</Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManageOrganizations;
