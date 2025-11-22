import React, { useState } from 'react';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
}

const JoinModal: React.FC<JoinModalProps> = ({ isOpen, onClose, onJoin }) => {
  const [code, setCode] = useState('');
  
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onJoin(code);
    setCode('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-gray-800 text-lg font-bold mb-4">Join Session</h3>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-gray-800 text-center font-mono uppercase tracking-widest text-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="CODE"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition-colors"
            >
              Join
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinModal;