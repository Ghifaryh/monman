import { useState } from 'react'
import Button from './Button'
import Modal from './Modal'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function ComponentShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Alternative way to set dynamic title from within component
  // This is useful for conditional titles based on component state
  useDocumentTitle('UI Components Showcase')

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        MonMan UI Components
      </h3>

      {/* Button Examples */}
      <div className="space-y-2">
        <h4 className="text-lg font-medium text-gray-700">Buttons</h4>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm">
            Primary Small
          </Button>
          <Button variant="secondary" size="md">
            Secondary Medium
          </Button>
          <Button variant="outline" size="lg">
            Outline Large
          </Button>
          <Button variant="ghost">
            Ghost Button
          </Button>
          <Button variant="danger">
            Delete Transaction
          </Button>
          <Button loading>
            Loading...
          </Button>
        </div>
      </div>

      {/* Modal Example */}
      <div className="space-y-2">
        <h4 className="text-lg font-medium text-gray-700">Modal</h4>
        <Button onClick={() => setIsModalOpen(true)}>
          Open Modal
        </Button>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Transaction"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Coffee, groceries, etc."
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="primary" className="flex-1">
                Save Transaction
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}