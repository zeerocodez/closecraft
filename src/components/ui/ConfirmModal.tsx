'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Style the confirm button as a destructive action. */
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

/**
 * A small confirmation dialog built on the shared Modal and Button
 * primitives: a title, an explanation, and Cancel / Confirm actions.
 * The confirm action may be async; the button disables itself while
 * it runs so the action cannot be fired twice.
 */
export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onCancel} title={title} description={description} size="sm">
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={handleConfirm} disabled={busy}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
