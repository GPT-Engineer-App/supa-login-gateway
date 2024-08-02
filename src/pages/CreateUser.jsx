import { useState, useEffect } from 'react';
import { useAddUserTable, useUserTable, useUpdateUserTable, useDeleteUserTable } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseAuth } from '../integrations/supabase/auth';
import { Navigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUserOrg } from '../integrations/supabase';

const CreateUser = () => {
  const { session } = useSupabaseAuth();

  if (!session || session.user.user_type !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const [userData, setUserData] = useState({
    user_id: '',
    password: '',
    user_type: '',
    user_org: '',
    last_upd: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: userOrganizations = [] } = useUserOrg();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const addUserMutation = useAddUserTable();
  const updateUserMutation = useUpdateUserTable();
  const deleteUserMutation = useDeleteUserTable();
  const { data: existingUsers } = useUserTable();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Check for duplicate user
    const isDuplicate = existingUsers?.some(user => 
      user.user_id === userData.user_id && 
      user.user_type === userData.user_type && 
      user.user_org === userData.user_org &&
      (!selectedUser || user.id !== selectedUser.id)
    );

    if (isDuplicate) {
      setError("A user with this ID, type, and organization already exists.");
      return;
    }

    try {
      const currentTime = new Date().toISOString();
      if (selectedUser) {
        const updateData = { 
          id: selectedUser.id, 
          ...userData, 
          last_upd: currentTime,
          last_upd_by: session.user.email
        };
        // Only include password in update if it's not empty
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateUserMutation.mutateAsync(updateData);
        setSuccess(true);
        setSelectedUser(null);
      } else {
        if (!userData.password) {
          setError("Password is required for new users.");
          return;
        }
        await addUserMutation.mutateAsync({ 
          ...userData, 
          created_at: currentTime,
          created_by: session.user.email,
          last_upd: currentTime,
          last_upd_by: session.user.email
        });
        setSuccess(true);
      }
      setUserData({ user_id: '', password: '', user_type: '', user_org: '', last_upd: '' });
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete user ${user.user_id}?`)) {
      try {
        await deleteUserMutation.mutateAsync(user.id);
        setSuccess(true);
        setSelectedUser(null);
        setUserData({ user_id: '', password: '', user_type: '', user_org: '', last_upd: '' });
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const filteredUsers = existingUsers?.filter(user =>
    user.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_org.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">Manage Users</h1>
      <p className="text-center text-gray-600">Admin access only</p>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertDescription>Operation completed successfully!</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-md">
        <div className="space-y-2">
          <Label htmlFor="user_id">User ID</Label>
          <Input
            id="user_id"
            name="user_id"
            value={userData.user_id}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password {selectedUser ? '(Leave blank to keep current)' : ''}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={userData.password}
            onChange={handleInputChange}
            required={!selectedUser}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user_type">User Type</Label>
          <Select name="user_type" onValueChange={(value) => handleSelectChange("user_type", value)} value={userData.user_type} required>
            <SelectTrigger>
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TSV-Admin">TSV-Admin</SelectItem>
              <SelectItem value="TSV-User">TSV-User</SelectItem>
              <SelectItem value="Guest">Guest</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="user_org">User Organization</Label>
          <Select name="user_org" onValueChange={(value) => handleSelectChange("user_org", value)} value={userData.user_org} required>
            <SelectTrigger>
              <SelectValue placeholder="Select user organization" />
            </SelectTrigger>
            <SelectContent>
              {userOrganizations.map((org) => (
                <SelectItem key={org.id} value={org.org_name}>{org.org_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-between">
          <Button type="submit" className="flex-grow mr-2">
            {selectedUser ? 'Update User' : 'Create User'}
          </Button>
          {selectedUser && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedUser(null);
                setUserData({
                  user_id: '',
                  password: '',
                  user_type: '',
                  user_org: '',
                  last_upd: '',
                });
              }}
              className="flex-grow ml-2"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
      <div className="space-y-4 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold">User List</h2>
        <Input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>User Type</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.user_id}</TableCell>
                <TableCell>{user.user_type}</TableCell>
                <TableCell>{user.user_org}</TableCell>
                <TableCell>
                  {selectedUser && selectedUser.id === user.id ? (
                    <>
                      <Button onClick={handleSubmit} className="mr-2">
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedUser(null);
                          setUserData({
                            user_id: '',
                            password: '',
                            user_type: '',
                            user_org: '',
                            last_upd: '',
                          });
                        }}
                        variant="outline"
                        className="mr-2"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          setSelectedUser(user);
                          setUserData({
                            user_id: user.user_id,
                            password: '',
                            user_type: user.user_type,
                            user_org: user.user_org,
                            last_upd: user.last_upd,
                          });
                        }}
                        className="mr-2"
                      >
                        Edit
                      </Button>
                      <Button onClick={() => handleDelete(user)} variant="destructive">
                        Delete
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CreateUser;
