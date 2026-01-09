"use client";

interface TopbarProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, actions }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#F4F7F9]/80 backdrop-blur-sm">
      <div className="px-10 py-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}
