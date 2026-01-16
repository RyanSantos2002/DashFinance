import React from 'react';
import { WIDGET_REGISTRY, type WidgetType } from './registry';
import { Plus } from 'lucide-react';

interface WidgetSelectorProps {
  onAdd: (type: WidgetType) => void;
}

export const WidgetSelector: React.FC<WidgetSelectorProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative mb-6">
       <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-primary dark:bg-blue-600 text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
      >
        <Plus size={18} />
        <span>Adicionar Widget</span>
      </button>

      {isOpen && (
        <div className="absolute top-12 left-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-4 z-50 grid gap-2 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase text-xs">Disponíveis</h3>
          {Object.values(WIDGET_REGISTRY).map((widget) => (
            <button
              key={widget.type}
              onClick={() => {
                onAdd(widget.type);
                setIsOpen(false);
              }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
            >
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 group-hover:bg-white dark:group-hover:bg-gray-600 group-hover:shadow-sm transition-all">
                <widget.icon size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{widget.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">{widget.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {/* Backdrop to close */}
      {isOpen && (
        <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
