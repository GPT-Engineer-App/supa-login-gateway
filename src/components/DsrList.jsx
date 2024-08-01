import { useState } from 'react';
import { useDsrTracker, useUpdateDsrTracker, useDeleteDsrTracker } from '../integrations/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSupabaseAuth } from '../integrations/supabase/auth';
import { format } from 'date-fns';

const DsrList = () => {
  const [searchId, setSearchId] = useState('');
  const [updateComment, setUpdateComment] = useState('');
  const [selectedDsr, setSelectedDsr] = useState(null);
  const { data: dsrs, isLoading, isError } = useDsrTracker();
  const updateDsrMutation = useUpdateDsrTracker();
  const deleteDsrMutation = useDeleteDsrTracker();
  const { session } = useSupabaseAuth();

  const filteredDsrs = searchId
    ? dsrs?.filter(dsr => dsr.po_number.includes(searchId))
    : dsrs;

  const sortedDsrs = filteredDsrs?.sort((a, b) => new Date(b.last_upd_dt) - new Date(a.last_upd_dt)).slice(0, 10);

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
      setSelectedDsr(null);
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tracking ID</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDsrs?.map(dsr => (
            <TableRow key={dsr.id}>
              <TableCell>{dsr.po_number}</TableCell>
              <TableCell>{new Date(dsr.last_upd_dt).toLocaleString()}</TableCell>
              <TableCell>{JSON.parse(dsr.comments || '[]').slice(-1)[0]?.comment || 'No status'}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setSelectedDsr(dsr)}>View</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>DSR Details</DialogTitle>
                    </DialogHeader>
                    {selectedDsr && (
                      <div className="mt-2">
                        <h3 className="font-bold">Tracking ID: {selectedDsr.po_number}</h3>
                        <p>Created: {new Date(selectedDsr.created_dt).toLocaleString()}</p>
                        <p>Last Updated: {new Date(selectedDsr.last_upd_dt).toLocaleString()}</p>
                        <h4 className="font-semibold mt-2">Comments:</h4>
                        <ul className="list-disc pl-5">
                          {JSON.parse(selectedDsr.comments || '[]').map((comment, index) => (
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
                          <Button onClick={() => handleUpdate(selectedDsr)} className="mt-2">Update</Button>
                          <Button onClick={() => handleDelete(selectedDsr.id)} variant="destructive" className="mt-2 ml-2">Delete</Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DsrList;
