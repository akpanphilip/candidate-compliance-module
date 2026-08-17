import Modal from './Modal';
import { buttonDanger, buttonSecondary } from './ui';

export default function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onCancel} className={buttonSecondary}>
          Cancel
        </button>
        <button onClick={onConfirm} className={buttonDanger}>
          Delete
        </button>
      </div>
    </Modal>
  );
}
