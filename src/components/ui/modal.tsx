'use client';

import { useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="fixed inset-0 m-0 mt-auto w-full max-w-none max-h-[85dvh] rounded-t-3xl bg-[var(--color-bg-primary)] p-0 backdrop:bg-black/40 open:animate-slide-up"
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
    >
      <div className="p-6">
        <div className="mx-auto w-10 h-1 bg-[var(--color-separator)] rounded-full mb-4" />
        {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
        {children}
      </div>
    </dialog>
  );
}
