import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getUserOrganizations, addUserOrganization, deleteUserOrganization } from '../utils/userOrganizations';
import { useSupabaseAuth } from '../integrations/supabase/auth';
import { Navigate } from 'react-router-dom';

const ManageOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [newOrg, setNewOrg] = useState('');
  const [error, setError] = useState(null);
  const { session } = useSupabaseAuth();

  useEffect(() => {
    setOrganizations(getUserOrganizations());
  }, []);

  const handleAddOrg = () => {
    if (newOrg.trim() !== '') {
      addUserOrganization(newOrg.trim());
      setOrganizations(getUserOrganizations());
      setNewOrg('');
    }
  };

  const handleDeleteOrg = (org) => {
    deleteUserOrganization(org);
    setOrganizations(getUserOrganizations());
  };

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (session.user.user_type !== 'admin') {
    return <Alert><AlertDescription>You must be an admin to access this page.</AlertDescription></Alert>;
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
          <ul className="space-y-2">
            {organizations.map((org) => (
              <li key={org} className="flex justify-between items-center">
                <span>{org}</span>
                <Button variant="destructive" onClick={() => handleDeleteOrg(org)}>Delete</Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManageOrganizations;
