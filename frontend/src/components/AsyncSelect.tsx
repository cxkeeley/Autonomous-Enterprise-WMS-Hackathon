import { useQuery } from "@tanstack/react-query";
import type { QueryFunction, QueryKey } from "@tanstack/react-query";

interface Option {
  id: string;
  label: string;
}

interface Props {
  queryKey: QueryKey;
  queryFn: QueryFunction<unknown[]>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  mapOption: (item: unknown) => Option;
}

export default function AsyncSelect({
  queryKey,
  queryFn,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  mapOption,
}: Props) {
  const { data = [], isLoading } = useQuery({
    queryKey,
    queryFn,
  });

  const options: Option[] = data.map(mapOption);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || isLoading}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm w-full disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="">{isLoading ? "Loading..." : placeholder}</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
