'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfPath: string;
}

export default function PdfPreviewModal({ isOpen, onClose, pdfPath }: PdfPreviewModalProps) {
  const [mounted, setMounted] = useState(false);

  // Handle escape key press to close modal
  useEffect(() => {
    setMounted(true);
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">CSRD Report Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-grow p-0 overflow-hidden">
          <iframe 
            src={`${pdfPath}#view=FitH`}
            className="w-full h-full min-h-[70vh]"
            title="CSRD Report Preview"
          />
        </div>
        
        <div className="p-4 border-t flex justify-between items-center">
          <p className="text-sm text-gray-500">
            This is a sample CSRD report to demonstrate the format and content.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 