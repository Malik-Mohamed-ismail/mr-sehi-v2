import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const CustomSelect = forwardRef<HTMLSelectElement, CustomSelectProps>(
  ({ children, className, value, defaultValue, onChange, onBlur, name, disabled, style: triggerStyle, ...rest }, ref) => {

    const options: { value: any; label: string; disabled?: boolean }[] = [];
    React.Children.toArray(children).forEach((child) => {
      if (React.isValidElement(child) && child.type === 'option') {
        const p = child.props as any;
        options.push({ value: p.value, label: String(p.children), disabled: Boolean(p.disabled) });
      }
    });

    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<any>(
      value !== undefined ? value : (defaultValue !== undefined ? defaultValue : '')
    );

    useEffect(() => {
      if (value !== undefined) setInternalValue(value);
    }, [value]);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLSelectElement | null>(null);

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayLabel = options.find(o => String(o.value) === String(internalValue))?.label ?? '';
    // Allow caller to pass height via style prop; default to 52
    const triggerHeight = (triggerStyle as React.CSSProperties | undefined)?.height ?? 52;

    const handleSelect = (val: any) => {
      setInternalValue(val);
      setIsOpen(false);
      // Sync the hidden native select so react-hook-form picks up the value
      if (selectRef.current) {
        selectRef.current.value = String(val);
        selectRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (onChange) {
        onChange({ target: { name, value: val } } as any);
      }
    };

    return (
      <div
        ref={wrapperRef}
        className={`custom-select-wrapper ${className || ''}`}
        style={{ position: 'relative', width: '100%', direction: 'rtl' }}
      >
        {/*
          Hidden native <select> — react-hook-form registers to this via ref.
          IMPORTANT: `style` is NOT spread here, so display:none is never overridden.
        */}
        <select
          ref={(el) => {
            selectRef.current = el;
            if (typeof ref === 'function') ref(el);
            else if (ref) (ref as React.MutableRefObject<HTMLSelectElement | null>).current = el;
          }}
          name={name}
          disabled={disabled}
          value={internalValue}
          onChange={() => { /* handled by handleSelect */ }}
          style={{ display: 'none' }}  // explicit — never overridden
          aria-hidden="true"
          tabIndex={-1}
          {...rest}  // rest does NOT contain 'style'
        >
          {children}
        </select>

        {/* Visible custom trigger */}
        <div
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          onClick={() => !disabled && setIsOpen((o) => !o)}
          style={{
            width: '100%',
            height: triggerHeight,
            padding: '0 16px',
            paddingLeft: 36,
            border: `1px solid ${isOpen ? 'var(--color-primary)' : 'var(--border-strong)'}`,
            borderRadius: 'var(--radius-md)',
            fontSize: 14,
            color: internalValue !== '' ? 'var(--text-primary)' : 'var(--text-muted)',
            background: 'var(--bg-surface)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: isOpen ? '0 0 0 4px var(--color-primary-alpha)' : 'none',
            transition: 'all 0.2s',
            opacity: disabled ? 0.7 : 1,
            userSelect: 'none',
            position: 'relative',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {displayLabel || <span style={{ color: 'var(--text-muted)' }}>—</span>}
          </span>
          <ChevronDown
            size={18}
            style={{
              position: 'absolute',
              left: 12,
              color: 'var(--text-muted)',
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
              flexShrink: 0,
            }}
          />
        </div>

        {/* Dropdown list */}
        {isOpen && (
          <div
            role="listbox"
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              maxHeight: 260,
              overflowY: 'auto',
              zIndex: 999,
              padding: 4,
            }}
          >
            {options.map((opt, idx) => {
              const isActive = String(opt.value) === String(internalValue);
              return (
                <div
                  key={idx}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => !opt.disabled && handleSelect(opt.value)}
                  style={{
                    padding: '10px 16px',
                    cursor: opt.disabled ? 'not-allowed' : 'pointer',
                    borderRadius: 4,
                    background: isActive ? 'var(--color-primary-alpha)' : 'transparent',
                    color: isActive
                      ? 'var(--color-primary)'
                      : opt.disabled
                      ? 'var(--text-muted)'
                      : 'var(--text-primary)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 14,
                    transition: 'background 0.1s',
                    opacity: opt.disabled ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!opt.disabled && !isActive)
                      e.currentTarget.style.background = 'var(--bg-surface-2)';
                  }}
                  onMouseLeave={(e) => {
                    if (!opt.disabled && !isActive)
                      e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {opt.label}
                </div>
              );
            })}
            {options.length === 0 && (
              <div style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
                لا توجد خيارات
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

CustomSelect.displayName = 'CustomSelect';
