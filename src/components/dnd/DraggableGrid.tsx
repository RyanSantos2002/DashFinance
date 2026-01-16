import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

interface DraggableGridProps {
  items: string[];
  onReorder: (newOrder: string[]) => void;
  onRemove?: (id: string) => void;
  renderItem: (id: string) => React.ReactNode;
  columns?: number; // Optional grid column configuration hint
}

export const DraggableGrid: React.FC<DraggableGridProps> = ({ 
    items, 
    onReorder,
    onRemove, 
    renderItem,
    columns = 4 
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8, // Prevent drag on simple click
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
          {items.map((id) => (
            <SortableItem key={id} id={id} onRemove={onRemove}>
              {renderItem(id)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
