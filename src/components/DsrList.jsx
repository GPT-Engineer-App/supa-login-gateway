import { useState } from 'react';
import { useDsrTracker, useUpdateDsrTracker, useDeleteDsrTracker } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSupabaseAuth } from '../integrations/supabase/auth';
import { format } from 'date-fns';

const DsrList = () => {
  const [searchId, setSearchId] = useState('');
  const [updateComment, setUpdateComment] = useState('');
  const { data: dsrs, isLoading, isError } = useDsrTracker();
  const updateDsrMutation = useUpdateDsrTracker();
  const deleteDsrMutation = useDeleteDsrTracker();
  const { session } = useSupabaseAuth();

  const filteredDsrs = searchId
    ? dsrs?.filter(dsr => dsr.po_number.includes(searchId))
    : dsrs;

  const handleUpdate = async (dsr) => {
    if (!updateComment.trim()) return;

    const currentTime = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX");
    const updatedComments = JSON.parse(dsr.comments || '[]');
    updatedComments.push({
      date: currentTime,
      user: session.user.user_id,
      comment: updateComment
    });

    try {
      await updateDsrMutation.mutateAsync({
        id: dsr.id,
        comments: JSON.stringify(updatedComments),
        last_upd_dt: currentTime,
        last_upd_by: session.user.user_id
      });
      setUpdateComment('');
      alert('DSR updated successfully!');
    } catch (error) {
      console.error('Error updating DSR:', error);
      alert('Failed to update DSR. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this DSR?')) {
      try {
        await deleteDsrMutation.mutateAsync(id);
        alert('DSR deleted successfully!');
      } catch (error) {
        console.error('Error deleting DSR:', error);
        alert('Failed to delete DSR. Please try again.');
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading DSRs</div>;

  return (
    <div className="space-y-4">
      <Input
        type="text"
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
        placeholder="Search by Tracking ID"
      />
      {filteredDsrs?.map(dsr => (
        <div key={dsr.id} className="border p-4 rounded">
          <h3 className="font-bold">Tracking ID: {dsr.po_number}</h3>
          <p>Created: {new Date(dsr.created_dt).toLocaleString()}</p>
          <p>Last Updated: {new Date(dsr.last_upd_dt).toLocaleString()}</p>
          <h4 className="font-semibold mt-2">Comments:</h4>
          <ul className="list-disc pl-5">
            {JSON.parse(dsr.comments || '[]').map((comment, index) => (
              <li key={index}>
                {new Date(comment.date).toLocaleString()} - {comment.user}: {comment.comment}
              </li>
            ))}
          </ul>
          <div className="mt-2">
            <Textarea
              value={updateComment}
              onChange={(e) => setUpdateComment(e.target.value)}
              placeholder="Add a new comment"
            />
            <Button onClick={() => handleUpdate(dsr)} className="mt-2">Update</Button>
            <Button onClick={() => handleDelete(dsr.id)} variant="destructive" className="mt-2 ml-2">Delete</Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DsrList;
