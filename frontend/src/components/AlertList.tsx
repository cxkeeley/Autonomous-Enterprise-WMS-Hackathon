import { Link } from "react-router-dom";

export interface AlertItem {
  id: string;
  title: string;
  subtitle: string;
  severity: "warning" | "danger" | "info";
  linkTo?: string;
}

interface Props {
  title: string;
  items: AlertItem[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const severityClasses: Record<string, string> = {
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

const severityDot: Record<string, string> = {
  warning: "bg-amber-400",
  danger: "bg-red-400",
  info: "bg-blue-400",
};

export default function AlertList({ title, items, isLoading, emptyMessage = "No alerts" }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        {title} <span className="text-gray-400 font-normal">({items.length})</span>
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 rounded-md border p-3 ${severityClasses[item.severity]}`}
          >
            <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${severityDot[item.severity]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs mt-0.5 opacity-75">{item.subtitle}</p>
            </div>
            {item.linkTo && (
              <Link
                to={item.linkTo}
                className="text-xs font-medium underline shrink-0 hover:opacity-80"
              >
                View
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
