import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop with built-in transition */}
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/25 transition duration-300 ease-out data-closed:opacity-0"
      />

      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        {/* Dialog panel with built-in transition */}
        <DialogPanel
          transition
          className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition duration-300 ease-out data-closed:opacity-0 data-closed:scale-95"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-lg font-medium leading-6 text-gray-900">
              {title}
            </DialogTitle>
            <button
              onClick={onClose}
              className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="mt-2">
            {children}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}