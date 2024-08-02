import { useState, useEffect } from 'react';
import { useAddDsrTracker, useUserTable, useUserOrg } from '../integrations/supabase';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseAuth } from '../integrations/supabase/auth';
import { format } from 'date-fns';

const DsrForm = () => {
  const [trackingId, setTrackingId] = useState('');
  const [comment, setComment] = useState('');
  const [userOrg, setUserOrg] = useState('');
  const { session } = useSupabaseAuth();
  const addDsrMutation = useAddDsrTracker();
  const { data: users } = useUserTable();
  const { data: userOrgs = [], isLoading: isLoadingOrgs, error: orgsError } = useUserOrg();
  const userOrgOptions = Array.isArray(userOrgs) ? userOrgs : userOrgs ? [userOrgs] : [];

  useEffect(() => {
    if (session && session.user.user_type === 'guest') {
      const guestOrg = users?.find(user => user.user_id === session.user.user_id)?.user_org;
      setUserOrg(guestOrg || '');
    }
  }, [session, users]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session || !session.user) {
      toast.error("You must be logged in to create a DSR.");
      return;
    }
    if (!session.user.email && !session.user.user_id) {
      toast.error("Invalid user data. Please log in again.");
      return;
    }
    const currentTime = new Date().toISOString();
    const newDsr = {
      po_number: trackingId,
      comments: JSON.stringify([{
        date: currentTime,
        user: session.user.email,
        comment: comment
      }]),
      created_dt: currentTime,
      last_upd_dt: currentTime,
      last_upd_by: session.user.email || session.user.user_id,
      created_by: session.user.email || session.user.user_id,
      user_org: userOrg
    };

    try {
      await addDsrMutation.mutateAsync(newDsr);
      setTrackingId('');
      setComment('');
      toast.success("Fantastic! New DSR created successfully!", {
        description: "Your DSR has been added to the system. Keep up the great work!",
      });
    } catch (error) {
      console.error('Error creating DSR:', error);
      toast.error("Oops! Failed to create DSR.", {
        description: "Don't worry, these things happen. Please try again or contact support if the issue persists.",
      });
    }
  };

  if (isLoadingOrgs) {
    return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
  }

  if (orgsError) {
    return <div>Error loading organizations: {orgsError.message}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="text"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          placeholder="Tracking ID"
          required
        />
      </div>
      <div>
        <Select
          value={userOrg}
          onValueChange={setUserOrg}
          disabled={session?.user.user_type === 'guest'}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            {userOrgOptions.map((org) => (
              <SelectItem key={org.org_name} value={org.org_name}>
                {org.org_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comment"
          required
        />
      </div>
      <Button type="submit">Create DSR</Button>
    </form>
  );
};

export default DsrForm;
