'use client';

import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  label: string;
  value: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  badge?: number | string;
}

interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
}

export function Tabs({
  tabs,
  defaultValue,
  value: controlledValue,
  onChange,
  variant = 'default',
  fullWidth = false,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || tabs[0]?.value);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const activeTab = tabs.find((tab) => tab.value === value);

  const handleTabClick = (tabValue: string, disabled?: boolean) => {
    if (disabled) return;

    if (onChange) {
      onChange(tabValue);
    } else {
      setInternalValue(tabValue);
    }
  };

  const variantClasses = {
    default: {
      list: 'bg-white/5 p-1 rounded-lg',
      tab: 'px-4 py-2 rounded-md transition-all',
      active: 'bg-emerald-500/20 text-emerald-400',
      inactive: 'text-slate-400 hover:text-white hover:bg-white/10',
    },
    pills: {
      list: 'gap-2',
      tab: 'px-4 py-2 rounded-full transition-all border border-transparent',
      active: 'bg-emerald-500 text-white',
      inactive: 'text-slate-400 hover:text-white border-white/20 hover:bg-white/10',
    },
    underline: {
      list: 'border-b border-white/10',
      tab: 'px-4 py-3 border-b-2 border-transparent transition-all',
      active: 'border-emerald-500 text-emerald-400',
      inactive: 'text-slate-400 hover:text-white hover:border-white/20',
    },
  };

  const classes = variantClasses[variant];

  return (
    <div className="w-full">
      {/* Tab List */}
      <div
        className={cn(
          'flex items-center',
          classes.list,
          fullWidth && 'justify-stretch'
        )}
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value, tab.disabled)}
            disabled={tab.disabled}
            className={cn(
              classes.tab,
              value === tab.value ? classes.active : classes.inactive,
              tab.disabled && 'opacity-50 cursor-not-allowed',
              fullWidth && 'flex-1',
              'flex items-center justify-center gap-2 font-medium text-sm'
            )}
            role="tab"
            aria-selected={value === tab.value}
            aria-disabled={tab.disabled}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6" role="tabpanel">
        {activeTab?.content}
      </div>
    </div>
  );
}
