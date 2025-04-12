import React, { useState } from 'react';
import SimpleModal from '../SimpleModal';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rows: number, columns: number) => void;
}

const TableModal: React.FC<TableModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [rows, setRows] = useState(3);
  const [columns, setColumns] = useState(3);
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);
  const [selectedSize, setSelectedSize] = useState<[number, number]>([3, 3]);

  const maxPreviewSize = 6;
  const previewGrid = Array.from({ length: maxPreviewSize }, (_, i) => i + 1);

  const handleCellHover = (row: number, col: number) => {
    setHoveredCell([row, col]);
  };

  const handleCellClick = (row: number, col: number) => {
    setSelectedSize([row, col]);
    setRows(row);
    setColumns(col);
  };

  const handleConfirm = () => {
    onConfirm(rows, columns);
    onClose();
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Insert Table"
      primaryAction={{
        label: "Insert",
        onClick: handleConfirm,
        variant: "primary",
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: onClose,
      }}
      size="md"
    >
      <div className="space-y-6">
        {/* Visual table size selector */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select table size:
          </p>
          <div
            className="inline-block bg-gray-100 dark:bg-gray-700 p-2 rounded-lg"
            onMouseLeave={() => setHoveredCell(null)}
          >
            <div className="grid grid-cols-6 gap-1">
              {previewGrid.map(row => (
                previewGrid.map(col => (
                  <div
                    key={`${row}-${col}`}
                    className={`w-8 h-8 rounded cursor-pointer transition-colors ${
                      (hoveredCell && row <= hoveredCell[0] && col <= hoveredCell[1]) ||
                      (row <= selectedSize[0] && col <= selectedSize[1])
                        ? 'bg-indigo-500'
                        : 'bg-white dark:bg-gray-600'
                    }`}
                    onMouseEnter={() => handleCellHover(row, col)}
                    onClick={() => handleCellClick(row, col)}
                  />
                ))
              ))}
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {hoveredCell ? `${hoveredCell[0]} × ${hoveredCell[1]}` : `${selectedSize[0]} × ${selectedSize[1]}`}
          </p>
        </div>

        {/* Manual input */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="rows" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rows
            </label>
            <input
              type="number"
              id="rows"
              value={rows}
              onChange={(e) => setRows(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              min="1"
              max="20"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
          </div>
          <div>
            <label htmlFor="columns" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Columns
            </label>
            <input
              type="number"
              id="columns"
              value={columns}
              onChange={(e) => setColumns(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              min="1"
              max="10"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Tables will be inserted as markdown tables with headers. You can edit the content after insertion.
          </p>
        </div>
      </div>
    </SimpleModal>
  );
};

export default TableModal;
