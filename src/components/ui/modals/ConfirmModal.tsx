import React from 'react';
import Modal from '../Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger';
  icon?: React.ReactNode;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  icon,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      primaryAction={{
        label: confirmLabel,
        onClick: onConfirm,
        variant: variant,
      }}
      secondaryAction={{
        label: cancelLabel,
        onClick: onClose,
      }}
      size="sm"
    >
      <div className="flex items-start space-x-4">
        {icon && (
          <div className={`flex-shrink-0 ${
            variant === 'danger' ? 'text-red-500' : 'text-indigo-500'
          }`}>
            {icon}
          </div>
        )}
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
