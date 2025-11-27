interface BadgeProps {
  text: string;
  active?: boolean;
}

export default function Badge({ text, active = false }: BadgeProps) {
  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-md border
        ${
          active
            ? "bg-blue-100 text-blue-700 border-blue-200"
            : "bg-gray-100 text-gray-700 border-gray-200"
        }`}
    >
      {text}
    </span>
  );
}
