import { useState, useEffect } from 'react';
import { useAddDsrTracker, useUserTable } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseAuth } from '../integrations/supabase/auth';
import { format } from 'date-fns';

const DsrForm = () => {
  const [trackingId, setTrackingId] = useState('');
  const [comment, setComment] = useState('');
  const [userOrg, setUserOrg] = useState('');
  const [userOrgs, setUserOrgs] = useState([]);
  const { session } = useSupabaseAuth();
  const addDsrMutation = useAddDsrTracker();
  const { data: users } = useUserTable();

  useEffect(() => {
    if (users) {
      const orgs = [...new Set(users.map(user => user.user_org))];
      setUserOrgs(orgs);
    }
  }, [users]);

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
      alert('DSR created successfully!');
    } catch (error) {
      console.error('Error creating DSR:', error);
      alert('Failed to create DSR. Please try again.');
    }
  };

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
            {userOrgs.map((org) => (
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
