import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-30" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="bg-neutral-800 rounded-lg shadow-xl p-6 w-11/12 max-w-sm">
                <h2 id="modal-title" className="text-xl font-medium text-white mb-4">{title}</h2>
                <div className="text-neutral-300 mb-6">
                    {children}
                </div>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md text-white bg-neutral-600 hover:bg-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-neutral-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-red-400"
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
