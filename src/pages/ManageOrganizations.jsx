import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getUserOrganizations, addUserOrganization, updateUserOrganization, deleteUserOrganization } from '../utils/userOrganizations';
import { useSupabaseAuth } from '../integrations/supabase/auth';
import { Navigate } from 'react-router-dom';

const ManageOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [newOrg, setNewOrg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOrg, setEditingOrg] = useState(null);
  const [error, setError] = useState(null);
  const { session } = useSupabaseAuth();

  useEffect(() => {
    if (session?.user?.user_type === 'admin') {
      setOrganizations(getUserOrganizations());
    }
  }, [session]);

  const handleAddOrg = () => {
    if (newOrg.trim() !== '') {
      addUserOrganization(newOrg.trim());
      setOrganizations(getUserOrganizations());
      setNewOrg('');
    }
  };

  const handleUpdateOrg = (oldOrg, newOrg) => {
    if (newOrg.trim() !== '' && oldOrg !== newOrg) {
      updateUserOrganization(oldOrg, newOrg.trim());
      setOrganizations(getUserOrganizations());
      setEditingOrg(null);
    }
  };

  const handleDeleteOrg = (org) => {
    deleteUserOrganization(org);
    setOrganizations(getUserOrganizations());
  };

  const filteredOrganizations = organizations.filter(org =>
    org.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
