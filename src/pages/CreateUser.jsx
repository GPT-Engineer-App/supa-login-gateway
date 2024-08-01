import { useState, useEffect } from 'react';
import { useAddUserTable, useUserTable } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseAuth } from '../integrations/supabase/auth';
import { getUserOrganizations } from '../utils/userOrganizations';
import { Navigate } from 'react-router-dom';

const CreateUser = () => {
  const { session } = useSupabaseAuth();
  const [userData, setUserData] = useState({
    user_id: '',
    password: '',
    user_type: '',
    user_org: '',
    last_upd: '',
  });
  const [userOrganizations, setUserOrganizations] = useState([]);

  useEffect(() => {
    setUserOrganizations(getUserOrganizations());
  }, []);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const addUserMutation = useAddUserTable();
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
      user.user_org === userData.user_org
    );

    if (isDuplicate) {
      setError("A user with this ID, type, and organization already exists.");
      return;
    }

    try {
      const currentTime = format(new Date(), "yyyy-MM-dd HH:mm:ssXXX");
      await addUserMutation.mutateAsync({ ...userData, last_upd: currentTime });
      setSuccess(true);
      setUserData({ user_id: '', password: '', user_type: '', user_org: '', last_upd: '' });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-center">Create User</h1>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertDescription>User created successfully!</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={userData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user_type">User Type</Label>
            <Select name="user_type" onValueChange={(value) => handleSelectChange("user_type", value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="user_org">User Organization</Label>
            <Select name="user_org" onValueChange={(value) => handleSelectChange("user_org", value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select user organization" />
              </SelectTrigger>
              <SelectContent>
                {userOrganizations.map((org) => (
                  <SelectItem key={org} value={org}>{org}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Create User
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
