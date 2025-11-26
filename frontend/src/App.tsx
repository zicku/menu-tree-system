import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Folder,
  FolderOpen,
  FileText,
  Plus,
  Edit3,
  Trash2,
  ChevronRight,
  ChevronDown,
  Search,
  Layout,
  Command,
  Wifi,
  WifiOff,
  X,
  Loader2,
  Layers,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ==========================================
 * SECTION 1: UTILS & TYPES
 * ==========================================
 */

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Menu {
  id: string;
  name: string;
  parentId: string | null;
  children?: Menu[];
  order: number;
}

interface MenuState {
  data: Menu[];
  loading: boolean;
  isDemoMode: boolean;
}

/**
 * ==========================================
 * SECTION 2: API & SERVICE LAYER
 * ==========================================
 */

// Menggunakan hardcoded URL untuk Docker Build Stability
const API_BASE_URL = "http://localhost:3000/api";

// --- MOCK DATA (Untuk Fallback/Demo) ---
const INITIAL_MOCK_DATA: Menu[] = [
  {
    id: "root-1",
    name: "Dashboard",
    parentId: null,
    order: 0,
    children: [],
  },
  {
    id: "root-2",
    name: "System Management",
    parentId: null,
    order: 1,
    children: [
      { id: "c-1", name: "Users", parentId: "root-2", order: 0, children: [] },
      {
        id: "c-2",
        name: "Roles & Permissions",
        parentId: "root-2",
        order: 1,
        children: [],
      },
    ],
  },
];

// Helper recursive untuk manipulasi data lokal
const traverseAndModify = (
  nodes: Menu[],
  targetId: string,
  action: (node: Menu, parentArr: Menu[], idx: number) => void
): boolean => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === targetId) {
      action(nodes[i], nodes, i);
      return true;
    }
    if (
      nodes[i].children &&
      traverseAndModify(nodes[i].children!, targetId, action)
    )
      return true;
  }
  return false;
};

// --- SERVICE FACTORY ---
const MenuService = {
  mockStore: JSON.parse(JSON.stringify(INITIAL_MOCK_DATA)) as Menu[],

  async fetchAll(setDemo: (v: boolean) => void) {
    try {
      const res = await axios.get(`${API_BASE_URL}/menus`, { timeout: 1500 });
      setDemo(false);
      return res.data;
    } catch (_err) {
      setDemo(true);
      return this.mockStore;
    }
  },

  async create(name: string, parentId: string | null, isDemo: boolean) {
    if (isDemo) {
      const newItem: Menu = {
        id: crypto.randomUUID(),
        name,
        parentId,
        order: 0,
        children: [],
      };
      if (!parentId) {
        newItem.order = this.mockStore.length;
        this.mockStore.push(newItem);
      } else {
        traverseAndModify(this.mockStore, parentId, (node) => {
          node.children = node.children || [];
          newItem.order = node.children.length;
          node.children.push(newItem);
        });
      }
      return newItem;
    }
    return (await axios.post(`${API_BASE_URL}/menus`, { name, parentId })).data;
  },

  async update(
    id: string,
    updateData: { name?: string; parentId?: string | null },
    isDemo: boolean
  ) {
    if (isDemo) {
      traverseAndModify(this.mockStore, id, (node) => {
        if (updateData.name) node.name = updateData.name;
        if (updateData.parentId !== undefined)
          node.parentId = updateData.parentId;
      });
      return { id, ...updateData };
    }
    return (await axios.put(`${API_BASE_URL}/menus/${id}`, updateData)).data;
  },

  async delete(id: string, isDemo: boolean) {
    if (isDemo) {
      const rootIdx = this.mockStore.findIndex((n) => n.id === id);
      if (rootIdx > -1) {
        this.mockStore.splice(rootIdx, 1);
      } else {
        traverseAndModify(this.mockStore, id, (_node, parentArr, idx) => {
          parentArr.splice(idx, 1);
        });
      }
      return true;
    }
    await axios.delete(`${API_BASE_URL}/menus/${id}`);
  },

  async reorder(id: string, newOrder: number, isDemo: boolean) {
    if (isDemo) {
      console.warn("Reorder not fully implemented in mock mode.");
      return { message: "Reorder simulated locally." };
    }
    return (
      await axios.patch(`${API_BASE_URL}/menus/${id}/reorder`, {
        order: newOrder,
      })
    ).data;
  },

  async move(id: string, newParentId: string | null, isDemo: boolean) {
    if (isDemo) {
      return this.update(id, { parentId: newParentId }, true);
    }
    return (
      await axios.patch(`${API_BASE_URL}/menus/${id}/move`, {
        parentId: newParentId,
      })
    ).data;
  },
};

/**
 * ==========================================
 * SECTION 3: UI COMPONENTS (DESIGN SYSTEM)
 * ==========================================
 */

const Badge = ({ active, text }: { active: boolean; text: string }) => (
  <div
    className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border transition-colors",
      active
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-amber-50 text-amber-700 border-amber-200"
    )}
  >
    {active ? <Wifi size={12} /> : <WifiOff size={12} />}
    {text}
  </div>
);

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "icon";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: React.ElementType;
  title?: string;
}

const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className,
  disabled,
  icon: Icon,
  type = "button",
  title,
}: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200 border border-transparent",
    secondary:
      "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
    danger:
      "bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300",
    ghost:
      "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900",
  };
  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    icon: "p-1.5 w-8 h-8",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      title={title}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
};

const Input = ({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
    )}
    <input
      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
      {...props}
    />
  </div>
);

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-lg text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

/**
 * ==========================================
 * SECTION 4: FEATURE COMPONENTS (LOGIC)
 * ==========================================
 */

const MenuNode = ({
  node,
  depth = 0,
  expandedIds,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
  siblingsCount,
  onDragStart,
  onDragEnter,
  onDragOver,
  isDragging,
  isDragTarget,
}: {
  node: Menu;
  depth?: number;
  expandedIds: string[];
  onToggle: (id: string) => void;
  onAdd: (id: string) => void;
  onEdit: (node: Menu) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, direction: "up" | "down") => void;
  siblingsCount: number;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnter: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  isDragging: boolean;
  isDragTarget: boolean;
}) => {
  const isExpanded = expandedIds.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;

  const isFirst = node.order === 0;
  const isLast = node.order === siblingsCount - 1;

  return (
    <div
      className={cn("relative select-none", isDragging && "opacity-30")}
      draggable="true"
      onDragStart={(e) => onDragStart(e, node.id)}
      onDragEnter={(e) => onDragEnter(e, node.id)}
      onDragOver={onDragOver}
    >
      {/* Connector Line (Vertical) */}
      {depth > 0 && (
        <div
          className="absolute w-px bg-slate-200 -top-3 bottom-1/2"
          style={{ left: `${(depth - 1) * 28 + 24}px` }}
        />
      )}

      {/* Connector Line (Horizontal) */}
      {depth > 0 && (
        <div
          className="absolute h-px w-3 bg-slate-200 top-1/2"
          style={{ left: `${(depth - 1) * 28 + 24}px` }}
        />
      )}

      <div
        className={cn(
          "group flex items-center gap-3 py-2 pr-3 rounded-lg border border-transparent transition-all duration-200",
          isExpanded
            ? "bg-slate-50 border-slate-100"
            : "hover:bg-slate-50 hover:border-slate-100",
          // Tunjukkan target drag, tapi tidak bisa pindah ke diri sendiri
          isDragTarget &&
            !isDragging &&
            "ring-2 ring-blue-500 ring-offset-2 border-blue-500"
        )}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        {/* Toggle Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
          }}
          className={cn(
            "w-6 h-6 flex items-center justify-center rounded-md transition-colors",
            hasChildren
              ? "hover:bg-slate-200 text-slate-500"
              : "opacity-0 cursor-default"
          )}
        >
          {hasChildren &&
            (isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            ))}
        </button>

        {/* Icon & Label */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={cn(
              "p-1.5 rounded-md",
              hasChildren
                ? "bg-blue-50 text-blue-600"
                : "bg-slate-100 text-slate-500"
            )}
          >
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen size={16} />
              ) : (
                <Folder size={16} />
              )
            ) : (
              <FileText size={16} />
            )}
          </div>
          <span
            className={cn(
              "text-sm font-medium truncate",
              hasChildren ? "text-slate-700" : "text-slate-600"
            )}
          >
            {node.name}
          </span>
        </div>

        {/* Reorder Actions (Up/Down) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onReorder(node.id, "up")}
            className={cn(
              "hover:text-slate-600",
              isFirst && "opacity-30 pointer-events-none"
            )}
            disabled={isFirst}
            title="Move Up"
          >
            <ArrowUp size={14} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onReorder(node.id, "down")}
            className={cn(
              "hover:text-slate-600",
              isLast && "opacity-30 pointer-events-none"
            )}
            disabled={isLast}
            title="Move Down"
          >
            <ArrowDown size={14} />
          </Button>
        </div>

        {/* Quick CRUD Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 border-l border-slate-100 pl-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onAdd(node.id)}
            className="hover:text-blue-600"
            title="Add Child"
          >
            <Plus size={14} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(node)}
            className="hover:text-amber-600"
            title="Rename/Move"
          >
            <Edit3 size={14} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(node.id)}
            className="hover:text-red-600"
            title="Delete"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Children Recursion */}
      {isExpanded && hasChildren && (
        <div className="relative">
          {/* Long Vertical Guide Line for Children */}
          <div
            className="absolute w-px h-full bg-slate-200"
            style={{ left: `${depth * 28 + 27}px` }}
          />
          <div className="mt-1">
            {/* Mengirimkan siblings.length sebagai siblingsCount untuk anak */}
            {node.children!.map((child) => (
              <MenuNode
                key={child.id}
                node={child}
                depth={depth + 1}
                expandedIds={expandedIds}
                onToggle={onToggle}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                onReorder={onReorder}
                siblingsCount={node.children!.length}
                onDragStart={onDragStart}
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                isDragging={isDragging}
                isDragTarget={isDragTarget}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Custom Hook untuk memisahkan Logic dari View
const useMenuSystem = () => {
  const [state, setState] = useState<Omit<MenuState, "error">>({
    data: [],
    loading: true,
    isDemoMode: false,
  });
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragTargetId, setDragTargetId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    const data = await MenuService.fetchAll((isDemo) =>
      setState((prev) => ({ ...prev, isDemoMode: isDemo }))
    );
    setExpandedIds((prev) => {
      const currentIds = data.map((n: Menu) => n.id);
      return prev.filter((id) => currentIds.includes(id));
    });
    setState((prev) => ({ ...prev, data, loading: false }));
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    const getAllIds = (nodes: Menu[]): string[] => {
      let ids: string[] = [];
      nodes.forEach((n) => {
        ids.push(n.id);
        if (n.children) ids = [...ids, ...getAllIds(n.children)];
      });
      return ids;
    };
    setExpandedIds(getAllIds(state.data));
  };

  const handleCollapseAll = () => setExpandedIds([]);

  const findNodeInTree = (
    nodes: Menu[],
    id: string | null
  ): Menu | undefined => {
    if (!id) return undefined;
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeInTree(node.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const isAncestor = (
    targetId: string | null,
    potentialDescendantId: string | null
  ): boolean => {
    if (!targetId || !potentialDescendantId) return false;
    let currentNode = findNodeInTree(state.data, potentialDescendantId);
    while (currentNode && currentNode.parentId) {
      if (currentNode.parentId === targetId) return true;
      currentNode = findNodeInTree(state.data, currentNode.parentId);
    }
    return false;
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    const nodeToMove = findNodeInTree(state.data, id);
    if (!nodeToMove) return;

    let newOrder;
    if (direction === "up") {
      newOrder = nodeToMove.order - 1;
    } else {
      newOrder = nodeToMove.order + 1;
    }

    try {
      await MenuService.reorder(id, newOrder, state.isDemoMode);
      fetchData();
    } catch (e) {
      alert("Failed to reorder menu.");
    }
  };

  // --- DRAG HANDLERS ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggingId === targetId || isAncestor(draggingId, targetId)) {
      setDragTargetId(null);
      return;
    }
    setDragTargetId(targetId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragTargetId(null);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    const targetId = dragTargetId;

    if (!draggedId || !targetId || draggedId === targetId) {
      handleDragEnd();
      return;
    }

    const itemToMove = findNodeInTree(state.data, draggedId);
    const targetParent = findNodeInTree(state.data, targetId);

    if (!itemToMove || !targetParent) {
      handleDragEnd();
      return;
    }

    if (isAncestor(draggedId, targetId) || draggedId === targetId) {
      alert(
        "Cannot move item under itself or its descendants (circular dependency detected)."
      );
      handleDragEnd();
      return;
    }

    // Asumsi: Drop di atas node lain berarti MOVE PARENT
    if (confirm(`Move "${itemToMove.name}" under "${targetParent.name}"?`)) {
      try {
        await MenuService.move(draggedId, targetParent.id, state.isDemoMode);
        setExpandedIds((prev) => [...prev, targetParent.id]);
        fetchData();
      } catch (error) {
        alert("Move failed on server. Possible circular dependency or error.");
      }
    }

    handleDragEnd();
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return state.data;
    const filter = (nodes: Menu[]): Menu[] =>
      nodes.reduce((acc: Menu[], node) => {
        const matches = node.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const children = node.children ? filter(node.children) : [];
        if (matches || children.length > 0) acc.push({ ...node, children });
        return acc;
      }, []);
    return filter(state.data);
  }, [state.data, searchTerm]);

  return {
    ...state,
    expandedIds,
    searchTerm,
    setSearchTerm,
    toggleExpand,
    expandAll,
    collapseAll: handleCollapseAll,
    refresh: fetchData,
    filteredData,
    handleReorder,
    // Drag and Drop States/Handlers
    draggingId,
    dragTargetId,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    findNodeInTree,
  };
};

export default function App() {
  const {
    loading,
    isDemoMode,
    expandedIds,
    searchTerm,
    filteredData,
    toggleExpand,
    expandAll,
    collapseAll,
    refresh,
    setSearchTerm,
    handleReorder,
    draggingId,
    dragTargetId,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    findNodeInTree,
  } = useMenuSystem();

  const [modal, setModal] = useState({
    open: false,
    type: "create" as "create" | "edit",
    parentId: null as string | null,
    editId: null as string | null,
    name: "",
    moveTargetId: null as string | null,
    currentParentId: null as string | null,
    availableParents: [] as { id: string | null; name: string }[],
  });
  const [saving, setSaving] = useState(false);

  const getAvailableParents = (
    tree: Menu[],
    currentId: string | null
  ): { id: string | null; name: string }[] => {
    const parents: { id: string | null; name: string }[] = [
      { id: null, name: "(Root)" },
    ];

    // Fungsi untuk mencegah siklus saat memindahkan
    const isDescendantOrSelf = (
      potentialAncestorId: string | null,
      nodeId: string
    ): boolean => {
      if (potentialAncestorId === nodeId) return true;
      let currentNode = findNodeInTree(tree, nodeId);
      while (currentNode && currentNode.parentId) {
        if (currentNode.parentId === potentialAncestorId) return true;
        currentNode = findNodeInTree(tree, currentNode.parentId);
      }
      return false;
    };

    const collectValidParents = (nodes: Menu[]) => {
      nodes.forEach((node) => {
        // Hanya tambahkan jika BUKAN node yang sedang diedit
        if (node.id !== currentId) {
          parents.push({ id: node.id, name: node.name });
        }

        if (node.children) {
          collectValidParents(node.children);
        }
      });
    };

    collectValidParents(tree);

    // Filter semua node yang merupakan keturunan (descendant) dari node yang sedang diedit
    // Tujuannya agar tidak bisa memindahkan node X ke anak dari node X (circular)
    return parents.filter(
      (p) => !currentId || p.id === null || !isDescendantOrSelf(currentId, p.id)
    );
  };

  const openEditModal = (node: Menu) => {
    const parents = getAvailableParents(filteredData, node.id);

    setModal({
      ...modal,
      open: true,
      type: "edit",
      parentId: node.parentId,
      editId: node.id,
      name: node.name,
      moveTargetId: node.parentId,
      currentParentId: node.parentId,
      availableParents: parents,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.name.trim()) return;
    setSaving(true);

    try {
      if (modal.type === "create") {
        await MenuService.create(modal.name, modal.parentId, isDemoMode);
        if (modal.parentId) toggleExpand(modal.parentId);
      } else {
        if (modal.editId) {
          // 1. Handle Rename
          const originalNode = findNodeInTree(filteredData, modal.editId);
          if (modal.name !== originalNode?.name) {
            await MenuService.update(
              modal.editId,
              { name: modal.name },
              isDemoMode
            );
          }

          // 2. Handle Move (jika parent berubah)
          if (modal.moveTargetId !== modal.currentParentId) {
            await MenuService.move(
              modal.editId,
              modal.moveTargetId,
              isDemoMode
            );
          }
        }
      }
      setModal({ ...modal, open: false });
      refresh();
    } catch (error) {
      alert("Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all sub-menus too.")) return;
    await MenuService.delete(id, isDemoMode);
    refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-blue-600">
              <Layers size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                System Menus
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-500">
                  Hierarchical Management
                </span>
                <Badge
                  active={!isDemoMode}
                  text={isDemoMode ? "Demo Mode" : "Connected"}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white rounded-lg border border-slate-200 p-1 flex shadow-sm">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={expandAll}
              >
                Expand All
              </Button>
              <div className="w-px bg-slate-200 my-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={collapseAll}
              >
                Collapse
              </Button>
            </div>
            <Button
              onClick={() =>
                setModal({
                  ...modal,
                  open: true,
                  type: "create",
                  parentId: null,
                  editId: null,
                  name: "",
                })
              }
              icon={Plus}
            >
              Add Root
            </Button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
          {/* TOOLBAR */}
          <div className="p-4 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-20 flex gap-3">
            <div className="relative flex-1 max-w-sm group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Filter menu items..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Command size={12} className="text-slate-300" />
                <span className="text-[10px] text-slate-400 font-medium">
                  K
                </span>
              </div>
            </div>
          </div>

          {/* TREE VIEW */}
          <div
            className="flex-1 p-6 overflow-y-auto"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragEnd}
          >
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-sm font-medium">Loading structure...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                  <Layout size={32} strokeWidth={1} />
                </div>
                <div className="text-center">
                  <p className="text-slate-900 font-medium">No menus found</p>
                  <p className="text-sm mt-1 text-slate-500">
                    Create a new root menu to get started
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-0.5 max-w-4xl">
                {filteredData.map((node) => (
                  <MenuNode
                    key={node.id}
                    node={node}
                    expandedIds={expandedIds}
                    onToggle={toggleExpand}
                    onAdd={(id) =>
                      setModal({
                        ...modal,
                        open: true,
                        type: "create",
                        parentId: id,
                        editId: null,
                        name: "",
                      })
                    }
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    onReorder={handleReorder}
                    siblingsCount={filteredData.length}
                    onDragStart={handleDragStart}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    isDragging={draggingId === node.id}
                    isDragTarget={dragTargetId === node.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-between items-center text-xs text-slate-500">
            <span>STK Menu System v2.0</span>
            <span>{filteredData.length} Root Items</span>
          </div>
        </main>
      </div>

      {/* MODAL FORM */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
        title={
          modal.type === "create"
            ? modal.parentId
              ? "New Sub-Menu"
              : "New Root Menu"
            : `Edit ${modal.name}`
        }
      >
        <form onSubmit={handleSave} className="space-y-5">
          <Input
            label="Menu Label (Rename)"
            placeholder="e.g. Dashboard"
            autoFocus
            value={modal.name}
            onChange={(e) => setModal({ ...modal, name: e.target.value })}
          />

          {/* Bagian Move Parent (hanya muncul saat Edit) */}
          {modal.type !== "create" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Move To Parent
              </label>
              <select
                value={modal.moveTargetId || "null"}
                onChange={(e) =>
                  setModal({
                    ...modal,
                    moveTargetId:
                      e.target.value === "null" ? null : e.target.value,
                  })
                }
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              >
                {modal.availableParents.map((parent) => (
                  <option key={parent.id || "null"} value={parent.id || "null"}>
                    {parent.name}
                    {parent.id === modal.currentParentId && " (Current)"}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 mt-1.5">
                Select the new parent folder for this menu.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModal({ ...modal, open: false })}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !modal.name}>
              {saving ? (
                <Loader2 className="animate-spin" size={16} />
              ) : modal.type === "create" ? (
                "Create Item"
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
