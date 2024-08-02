import { useState, useEffect } from 'react';
import { useAddDsrTracker, useUserTable, useUserOrg } from '../integrations/supabase';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseAuth } from '../integrations/supabase/auth';
import { format } from 'date-fns/format';

const DsrForm = () => {
  const [trackingId, setTrackingId] = useState('');
  const [comment, setComment] = useState('');
  const [userOrg, setUserOrg] = useState('');
  const { session } = useSupabaseAuth();
  const addDsrMutation = useAddDsrTracker();
  const { data: users } = useUserTable();
  const { data: userOrgs = [], isLoading: isLoadingOrgs, error: orgsError } = useUserOrg();

  useEffect(() => {
    if (session && session.user.user_type === 'guest') {
      const guestOrg = users?.find(user => user.user_id === session.user.user_id)?.user_org;
      setUserOrg(guestOrg || '');
    }
  }, [session, users]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentTime = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX");
    const newDsr = {
      po_number: trackingId,
      comments: JSON.stringify([{
        date: currentTime,
        user: session.user.user_id,
        comment: comment
      }]),
      created_dt: currentTime,
      last_upd_dt: currentTime,
      last_upd_by: session.user.user_id,
      created_by: session.user.user_id,
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
            {userOrgs?.map((org) => (
              <SelectItem key={org} value={org}>
                {org}
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
