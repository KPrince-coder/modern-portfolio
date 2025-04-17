import React from 'react';
import BasicModal from '../BasicModal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger' | 'warning';
  icon?: React.ReactNode;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
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
  secondaryAction,
}) => {
  return (
    <BasicModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      primaryAction={{
        label: confirmLabel,
        onClick: onConfirm,
        variant: variant,
      }}
      secondaryAction={secondaryAction || {
        label: cancelLabel,
        onClick: onClose,
      }}
      size="sm"
    >
      <div className="flex items-start space-x-4">
        {icon && (
          <div className={`flex-shrink-0 ${
            variant === 'danger' ? 'text-red-500' :
            variant === 'warning' ? 'text-yellow-500' :
            'text-indigo-500'
          }`}>
            {icon}
          </div>
        )}
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {message}
        </div>
      </div>
    </BasicModal>
  );
};

export default ConfirmModal;
