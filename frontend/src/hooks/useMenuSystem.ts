import { useState, useEffect, useCallback, useMemo } from "react";
import type { MenuNode } from "../types/MenuNode";
import { MenuService } from "../services/MenuService";

export const useMenuSystem = () => {
  const [data, setData] = useState<MenuNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setDemoMode] = useState<boolean>(false);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // FETCH DATA
  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await MenuService.fetchAll(setDemoMode);
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  //EXPAND / COLLAPSE
  const toggleExpand = (id: string) =>
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const expandAll = () => {
    const collect = (nodes: MenuNode[]): string[] =>
      nodes.flatMap((n) => [n.id, ...(n.children ? collect(n.children) : [])]);
    setExpandedIds(collect(data));
  };

  const collapseAll = () => setExpandedIds([]);

  //crud
  const addMenu = async (parentId: string | null, name: string) => {
    await MenuService.create(name, parentId, isDemoMode);
    await fetchData();
  };

  const editMenu = async (
    id: string,
    name: string,
    parentId: string | null
  ) => {
    await MenuService.update(
      id,
      { name, parentId: parentId ?? undefined },
      isDemoMode
    );
    await fetchData();
  };

  const deleteMenu = async (id: string) => {
    await MenuService.delete(id, isDemoMode);
    await fetchData();
  };

  //find node
  const findNode = (nodes: MenuNode[], id: string): MenuNode | undefined => {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) {
        const f = findNode(n.children, id);
        if (f) return f;
      }
    }
    return undefined;
  };

  //reoder
  const handleReorder = async (id: string, direction: "up" | "down") => {
    const node = findNode(data, id);
    if (!node) return;

    const newOrder = direction === "up" ? node.order - 1 : node.order + 1;
    await MenuService.reorder(id, newOrder, isDemoMode);
    await fetchData();
  };

  // NEW SEARCH with root

  const filterTree = (node: MenuNode, term: string): MenuNode | null => {
    const search = term.toLowerCase();
    const nameMatch = node.name.toLowerCase().includes(search);

    const childMatches =
      node.children
        ?.map((child) => filterTree(child, term))
        .filter((x): x is MenuNode => x !== null) ?? [];

    // Jika nama cocok → tampilkan node + full children (tanpa filter)
    if (nameMatch) {
      return {
        ...node,
        children: node.children ?? [],
      };
    }

    // Jika ada child yang cocok → tampilkan dengan filtered children
    if (childMatches.length > 0) {
      return {
        ...node,
        children: childMatches,
      };
    }
    return null;
  };

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    return data
      .map((node) => filterTree(node, searchTerm))
      .filter((n): n is MenuNode => n !== null);
  }, [data, searchTerm]);

  return {
    data,
    loading,
    isDemoMode,
    expandedIds,
    searchTerm,
    filteredData,
    setSearchTerm,
    toggleExpand,
    addMenu,
    editMenu,
    deleteMenu,
    handleReorder,
    expandAll,
    collapseAll,
    refresh: fetchData,
  } as const;
};
