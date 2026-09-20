import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { InquiryForm } from './InquiryForm';
import { api } from '../services/api';
import type { AppConfig } from '../types';

const FOCUSABLE_SELECTOR = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export function nextDrawerFocusIndex(current: number, total: number, shiftKey: boolean) {
  if (total <= 0) return -1;
  if (shiftKey && current <= 0) return total - 1;
  if (!shiftKey && current >= total - 1) return 0;
  return shiftKey ? current - 1 : current + 1;
}

type InquiryDrawerProps = {
  config: AppConfig | null;
  onClose: () => void;
  onCreated: () => Promise<void>;
  setError: (message: string) => void;
};

export function InquiryDrawer({ config, onClose, onCreated, setError }: InquiryDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !drawerRef.current) return;
      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (!focusable.length) return;
      const current = focusable.indexOf(document.activeElement as HTMLElement);
      const next = nextDrawerFocusIndex(current < 0 ? 0 : current, focusable.length, event.shiftKey);
      if ((event.shiftKey && current <= 0) || (!event.shiftKey && current >= focusable.length - 1)) {
        event.preventDefault();
        focusable[next]?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      const returnTarget = previousFocusRef.current?.isConnected
        ? previousFocusRef.current
        : document.getElementById('add-inquiry-button');
      window.requestAnimationFrame(() => returnTarget?.focus());
    };
  }, [onClose]);

  return (
    <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="inquiry-drawer" ref={drawerRef} role="dialog" aria-modal="true" aria-labelledby="inquiry-drawer-title">
        <header className="drawer-header">
          <div>
            <h2 id="inquiry-drawer-title">Add Patient Inquiry</h2>
            <p>Capture the inquiry now without leaving your current work.</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close Add Patient Inquiry" title="Close">
            <X size={20} />
          </button>
        </header>
        <div className="drawer-body">
          <InquiryForm
            config={config}
            autoFocus
            onCancel={onClose}
            onSubmit={async (form) => {
              setError('');
              try {
                await api.createInquiry(form);
                await onCreated();
                onClose();
              } catch (error) {
                setError((error as Error).message);
                throw error;
              }
            }}
          />
        </div>
      </aside>
    </div>
  );
}
