import { useState } from 'react';
import { useAddDsrTracker } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseAuth } from '../integrations/supabase/auth';
import { format } from 'date-fns';

const DsrForm = () => {
  const [trackingId, setTrackingId] = useState('');
  const [comment, setComment] = useState('');
  const { session } = useSupabaseAuth();
  const addDsrMutation = useAddDsrTracker();

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
      created_by: session.user.user_id
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
