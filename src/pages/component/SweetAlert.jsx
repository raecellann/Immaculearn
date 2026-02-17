import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'

// Delete Button Component using consistent design
const DeleteButton = ({ onClick }) => {
  const buttonStyle = {
    cursor: 'pointer',
    padding: '0.5em 1em',
    fontSize: '0.9em',
    width: 'auto',
    height: 'auto',
    color: '#ef4444', // Red for delete
    background: 'transparent',
    borderRadius: '0.25em',
    border: 'none',
    boxShadow: 'none',
    transition: 'all 0.3s ease-in-out',
    outline: '0.1em solid #cc1515ff', 
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5em',
  };

  const iconStyle = {
    fill: '#ef4444',
    width: '1em',
    height: '1em',
    marginRight: '0.5em',
    display: 'inline-block',
    verticalAlign: 'middle',
  };

  return (
    <button 
      style={buttonStyle}
      onMouseEnter={(e) => {
        const color = 'rgba(239, 68, 68, 0.5)'; // Red hover
        e.target.style.background = `radial-gradient(circle at bottom, ${color} 10%, #212121 70%)`;
        e.target.style.transform = 'scale(1.1)';
        e.target.style.boxShadow = '0 0 1em 0.45em rgba(0, 0, 0, 0.1)';
        e.target.style.margin = '0 0.5em';
        e.target.style.color = 'white';
        const svg = e.target.querySelector('svg');
        if (svg) svg.style.fill = 'white';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = '#212121';
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 0 1em 1em rgba(0, 0, 0, 0.1)';
        e.target.style.margin = '0';
        e.target.style.color = '#ef4444';
        const svg = e.target.querySelector('svg');
        if (svg) svg.style.fill = '#ef4444';
      }}
      onClick={onClick}
    >
      <span style={iconStyle}>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
        </svg>
      </span>
      Delete
    </button>
  )
}

// Cancel Button Component using consistent design
const CancelButton = ({ onClick }) => {
  const buttonStyle = {
    cursor: 'pointer',
    padding: '0.5em 1em',
    fontSize: '0.9em',
    width: 'auto',
    height: 'auto',
    color: '#f4f4f4ff', // Gray for cancel
    background: 'transparent',
    borderRadius: '0.25em',
    border: 'none',
    boxShadow: 'none',
    transition: 'all 0.3s ease-in-out',
    outline: '0.1em solid #ffffffff', 
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5em',
  };

  const iconStyle = {
    fill: '#ffffffff',
    width: '1em',
    height: '1em',
    marginRight: '0.5em',
    display: 'inline-block',
    verticalAlign: 'middle',
  };

  return (
    <button 
      style={buttonStyle}
      onMouseEnter={(e) => {
        const color = 'rgba(107, 114, 128, 0.5)'; // Gray hover
        e.target.style.background = `radial-gradient(circle at bottom, ${color} 10%, #212121 70%)`;
        e.target.style.transform = 'scale(1.1)';
        e.target.style.boxShadow = '0 0 1em 0.45em rgba(0, 0, 0, 0.1)';
        e.target.style.margin = '0 0.5em';
        e.target.style.color = 'white';
        const svg = e.target.querySelector('svg');
        if (svg) svg.style.fill = 'white';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = '#212121';
        e.target.style.transform = 'scale(1)';
        e.target.style.boxShadow = '0 0 1em 1em rgba(0, 0, 0, 0.1)';
        e.target.style.margin = '0';
        e.target.style.color = '#6b7280';
        const svg = e.target.querySelector('svg');
        if (svg) svg.style.fill = '#6b7280';
      }}
      onClick={onClick}
    >
      <span style={iconStyle}>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </span>
      Cancel
    </button>
  )
}

// Delete confirmation dialog component
export function DeleteConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "You won't be able to revert this!",
  itemName = "" 
}) {
  const warningMessage = itemName 
    ? (
        <>
          Are you sure you want to delete the space
          <br />
          <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>
            "{itemName}?"
          </span>
          <br />
          You won't be able to revert this!
        </>
      )
    : "Are you sure you want to delete this space? You won't be able to revert this!";
  
  return (
    <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={() => {}}>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/50">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0 border border-white/20"
          >
            <DialogTitle as="h3" className="text-base/7 font-medium text-white flex items-center justify-between">
              {title}
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </DialogTitle>
            <p className="mt-2 text-sm/6 text-white/50 text-center" style={{ color: 'white' }}>
              {warningMessage}
            </p>
            <div className="mt-4 flex gap-3 justify-center">
              <DeleteButton onClick={onConfirm} />
              <CancelButton onClick={onClose} />
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

// Success notification dialog
export function SuccessDialog({ 
  isOpen, 
  onClose, 
  title = "Deleted!", 
  message = "Your file has been deleted." 
}) {
  return (
    <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={onClose}>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/50">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0 border border-green-500/20"
          >
            <DialogTitle as="h3" className="text-base/7 font-medium text-green-400 flex items-center justify-between">
              {title}
              <button
                onClick={onClose}
                className="text-green-400/70 hover:text-green-400 transition-colors p-1 rounded-md hover:bg-green-400/10"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </DialogTitle>
            <p className="mt-2 text-sm/6 text-white/50 text-center">
              {message}
            </p>
            <div className="mt-4 flex justify-center">
              <button
                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-green-600/20 focus:outline-none hover:bg-green-700 transition-colors"
                onClick={onClose}
              >
                Got it, thanks!
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

// Cancel notification dialog
export function CancelledDialog({ 
  isOpen, 
  onClose, 
  title = "Cancelled", 
  message = "Your imaginary file is safe :)" 
}) {
  return (
    <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={onClose}>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black/50">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0 border border-gray-500/20"
          >
            <DialogTitle as="h3" className="text-base/7 font-medium text-gray-400 flex items-center justify-between">
              {title}
              <button
                onClick={onClose}
                className="text-gray-400/70 hover:text-gray-400 transition-colors p-1 rounded-md hover:bg-gray-400/10"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </DialogTitle>
            <p className="mt-2 text-sm/6 text-white/50 text-center">
              {message}
            </p>
            <div className="mt-4 flex justify-center">
              <button
                className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-600 transition-colors"
                onClick={onClose}
              >
                Got it, thanks!
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
