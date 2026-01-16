import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  onRemove?: (id: string) => void;
}

export const SortableItem: React.FC<SortableItemProps> = ({ id, children, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="h-full">
      <div className="group relative h-full">
        {/* Drag Handle */}
        <div 
           {...attributes} 
           {...listeners}
           className="absolute top-2 right-2 p-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-400 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing z-10 transition-opacity hover:text-gray-600 dark:hover:text-gray-200"
           title="Arrastar"
        >
           <GripVertical size={16} />
        </div>

        {/* Remove Button */}
        {onRemove && (
            <button 
                onClick={() => onRemove(id)}
                className="absolute top-2 right-8 p-1 rounded bg-red-50 dark:bg-red-900/20 text-red-400 opacity-0 group-hover:opacity-100 cursor-pointer z-10 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600"
                title="Remover Widget"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <X size={16} />
            </button>
        )}

        {children}
      </div>
    </div>
  );
};
