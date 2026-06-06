import type { ReactNode } from 'react';

type PanelProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function Panel({ title, description, children }: PanelProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {children}
    </section>
  );
}
