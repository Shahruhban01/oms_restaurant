import React from 'react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Confirm', message, loading = false, variant = 'danger' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={380}
      footer={<>
        <Button variant="subtle" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>Confirm</Button>
      </>}
    >
      <p style={{ color:'var(--text-muted)', lineHeight:1.6 }}>{message}</p>
    </Modal>
  );
}
