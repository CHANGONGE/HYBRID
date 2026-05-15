"use client";

interface KPICardProps {
  title: string;
  value: string;
  sub?: string;
  gradient: string;
  icon: string;
  alert?: boolean;
}

export function KPICard({ title, value, sub, gradient, icon, alert }: KPICardProps) {
  return (
    <div className={`${gradient} rounded-2xl p-4 text-white relative overflow-hidden card-hover`}>
      {alert && (
        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-yellow-300 rounded-full animate-pulse" />
      )}
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-xs text-white/80 font-medium">{title}</p>
      <p className="text-xl font-bold leading-tight mt-0.5">{value}</p>
      {sub && <p className="text-xs text-white/70 mt-0.5">{sub}</p>}
    </div>
  );
}
