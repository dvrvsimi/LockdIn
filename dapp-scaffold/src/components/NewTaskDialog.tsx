import { FC, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input'; 
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useTaskProgram } from '../hooks/useTaskProgram';
import { PublicKey } from '@solana/web3.js';

interface NewTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => Promise<void>;
}

export const NewTaskDialog: FC<NewTaskDialogProps> = ({ isOpen, onClose, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Leisure' | 'Casual' | 'Urgent'>('Casual');
  const [category, setCategory] = useState<'Work' | 'Personal' | 'Home' | 'Shopping'>('Personal');
  const [assignee, setAssignee] = useState('');
  const { createTask } = useTaskProgram();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      let assigneePubkey: PublicKey | undefined;
      
      if (assignee.trim()) {
        try {
          assigneePubkey = new PublicKey(assignee.trim());
        } catch {
          alert('Invalid assignee address');
          setIsSubmitting(false);
          return;
        }
      }

      await createTask(title, description, priority, category, assigneePubkey);
      await onTaskCreated();
      onClose();
      setTitle('');
      setDescription('');
      setPriority('Casual');
      setCategory('Personal');
      setAssignee('');
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-[600px] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-900 mb-6">Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-gray-700 text-lg">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              maxLength={50}
              required
              className="text-gray-900 placeholder:text-gray-400 text-lg p-3"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="description" className="text-gray-700 text-lg">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              maxLength={250}
              className="text-gray-900 placeholder:text-gray-400 text-lg p-3"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-gray-700 text-lg">Priority</Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger className="text-gray-900 bg-white text-lg p-3">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Leisure">Leisure</SelectItem>
                <SelectItem value="Casual">Casual</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-gray-700 text-lg">Category</Label>
            <Select value={category} onValueChange={(value: any) => setCategory(value)}>
              <SelectTrigger className="text-gray-900 bg-white text-lg p-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Home">Home</SelectItem>
                <SelectItem value="Shopping">Shopping</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="assignee" className="text-gray-700 text-lg">Assignee (Optional)</Label>
            <Input
              id="assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Enter Solana address"
              className="text-gray-900 placeholder:text-gray-400 text-lg p-3"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="text-gray-700 text-lg px-6 py-3"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-6 py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};