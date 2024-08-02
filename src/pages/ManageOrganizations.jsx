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
  const [editingOrg, setEditingOrg] = useState({ id: null, name: '' });
  const [error, setError] = useState(null);
  const { session } = useSupabaseAuth();
  const { data: organizations, isLoading, isError } = useUserOrg();
  const addOrgMutation = useAddUserOrg();
  const updateOrgMutation = useUpdateUserOrg();
  const deleteOrgMutation = useDeleteUserOrg();

  const handleAddOrg = async () => {
    if (newOrg.trim() !== '') {
      const currentTime = new Date().toISOString();
      const newOrgData = {
        org_name: newOrg.trim(),
        created_by: session.user.email,
        last_upd_by: session.user.email
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

  const handleUpdateOrg = async () => {
    if (editingOrg.name.trim() !== '') {
      const currentTime = new Date().toISOString();
      try {
        await updateOrgMutation.mutateAsync({
          id: editingOrg.id,
          org_name: editingOrg.name.trim(),
          last_upd: currentTime,
          last_upd_by: session.user.email
        });
        setEditingOrg({ id: null, name: '' });
        toast.success('Organization updated successfully');
      } catch (error) {
        console.error('Error updating organization:', error);
        toast.error(`Failed to update organization: ${error.message}`);
        setError(`Failed to update organization: ${error.message}`);
      }
    }
  };

  const handleEditClick = (org) => {
    setEditingOrg({ id: org.id, name: org.org_name });
  };

  const handleDeleteOrg = (id) => {
    deleteOrgMutation.mutate(id);
  };

  const filteredOrganizations = organizations?.filter(org =>
    org.org_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading organizations</div>;

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (session.user.user_type !== 'TSV-Admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Organizations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Add New Organization</h2>
          <div className="flex space-x-2">
            <Input
              value={newOrg}
              onChange={(e) => setNewOrg(e.target.value)}
              placeholder="New organization"
            />
            <Button onClick={handleAddOrg}>Add</Button>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Organization List</h2>
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search organizations"
          />
          <ul className="space-y-2 bg-white p-4 rounded-lg shadow">
            {filteredOrganizations.map((org) => (
              <li key={org.id} className="flex justify-between items-center">
                {editingOrg.id === org.id ? (
                  <>
                    <Input
                      value={editingOrg.name}
                      onChange={(e) => setEditingOrg({ ...editingOrg, name: e.target.value })}
                    />
                    <div>
                      <Button variant="outline" onClick={handleUpdateOrg} className="mr-2">Save</Button>
                      <Button variant="outline" onClick={() => setEditingOrg({ id: null, name: '' })} className="mr-2">Cancel</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>{org.org_name}</span>
                    <div>
                      <Button variant="outline" onClick={() => handleEditClick(org)} className="mr-2">Edit</Button>
                      <Button variant="destructive" onClick={() => handleDeleteOrg(org.id)}>Delete</Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManageOrganizations;
