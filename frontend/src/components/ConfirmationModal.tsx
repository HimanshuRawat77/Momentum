import React from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from './ui/Dialog';
import { Button } from './ui/Button';
import { Trash2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-md">
      <DialogHeader>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/30 mb-2">
          <Trash2 className="h-6 w-6 text-rose-600 dark:text-rose-400" />
        </div>
        <DialogTitle className="text-center">{title}</DialogTitle>
        <DialogDescription className="text-center">
          {description}
        </DialogDescription>
      </DialogHeader>

      <div className="flex gap-3 justify-end mt-6">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
          Delete Task
        </Button>
      </div>
    </Dialog>
  );
};

export default ConfirmationModal;
