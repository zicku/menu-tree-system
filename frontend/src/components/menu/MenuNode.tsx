import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface Props {
  node: any;
  expandedIds: string[];
  onToggle: (id: string) => void;
  onAdd: (parentId: string | null) => void;

  // ⬅ UPDATE: sekarang menerima level
  onEdit: (id: string, name: string, level: number) => void;

  onDelete: (id: string) => void;
  onReorder: (id: string, d: "up" | "down") => void;

  level?: number;
}

export default function MenuNode({
  node,
  expandedIds,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
  level = 0,
}: Props) {
  const expanded = expandedIds.includes(node.id);
  const hasChildren = node.children?.length > 0;

  return (
    <div className="relative pl-4">
      {node.parentId && (
        <div className="absolute left-1 top-0 bottom-0 border-l border-slate-300"></div>
      )}

      <div className="group flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-slate-100 transition">
        {hasChildren ? (
          <button
            onClick={() => onToggle(node.id)}
            className="text-slate-600 hover:text-black"
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <div className="w-4" />
        )}

        {hasChildren ? (
          <div className="w-2 h-2 bg-slate-500 rounded-full" />
        ) : (
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        )}

        <span className="flex-1 font-medium text-slate-700">{node.name}</span>

        <div className="flex items-center gap-1 text-slate-500 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => onReorder(node.id, "up")}
            className="hover:text-blue-600"
          >
            <ArrowUp size={14} />
          </button>

          <button
            onClick={() => onReorder(node.id, "down")}
            className="hover:text-blue-600"
          >
            <ArrowDown size={14} />
          </button>

          <button
            onClick={() => onAdd(node.id)}
            className="hover:text-green-600"
          >
            <Plus size={14} />
          </button>

          <button
            onClick={() => onEdit(node.id, node.name, level)}
            className="hover:text-yellow-600"
          >
            <Pencil size={14} />
          </button>

          <button
            onClick={() => onDelete(node.id)}
            className="hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded &&
        hasChildren &&
        node.children.map((child: any) => (
          <div key={child.id} className="ml-4">
            <MenuNode
              node={child}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              onReorder={onReorder}
              level={level + 1}
            />
          </div>
        ))}
    </div>
  );
}
