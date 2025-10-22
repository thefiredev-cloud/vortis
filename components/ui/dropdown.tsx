'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropdownItem {
  label: ReactNode;
  value: string;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

interface DropdownProps {
  trigger?: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: 'auto' | 'full' | string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function Dropdown({
  trigger,
  items,
  align = 'left',
  width = 'auto',
  placeholder = 'Select option',
  value,
  onChange,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find((item) => item.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;

    if (item.onClick) {
      item.onClick();
    } else if (onChange) {
      onChange(item.value);
    }

    setIsOpen(false);
  };

  const widthClass = width === 'full' ? 'w-full' : width === 'auto' ? 'w-auto' : width;

  return (
    <div className={cn('relative', widthClass)} ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors',
          widthClass
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger || (
          <>
            <span className="flex items-center gap-2">
              {selectedItem?.icon}
              {selectedItem?.label || placeholder}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isOpen && 'rotate-180'
              )}
              aria-hidden="true"
            />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-2 py-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 min-w-[200px] max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
        >
          {items.map((item, index) => (
            <button
              key={item.value}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                item.disabled
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-white hover:bg-white/10',
                value === item.value && 'bg-emerald-500/10 text-emerald-400'
              )}
              role="menuitem"
            >
              {item.icon && (
                <span className="flex-shrink-0">{item.icon}</span>
              )}
              <span className="flex-1">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
