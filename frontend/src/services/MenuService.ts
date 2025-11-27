// src/services/MenuService.ts
import axios from "axios";
import type { MenuNode } from "../types/MenuNode";

const API_BASE_URL = "http://localhost:3000/api";

const MOCK_DATA: MenuNode[] = [
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
      {
        id: "c-1",
        name: "Users",
        parentId: "root-2",
        order: 0,
        children: [],
      },
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

let mockStore = JSON.parse(JSON.stringify(MOCK_DATA)) as MenuNode[];

export const MenuService = {
  async fetchAll(setDemoMode: (v: boolean) => void): Promise<MenuNode[]> {
    try {
      const res = await axios.get(`${API_BASE_URL}/menus`, { timeout: 1500 });
      setDemoMode(false);
      return res.data;
    } catch (_err) {
      setDemoMode(true);
      return mockStore;
    }
  },

  async create(
    name: string,
    parentId: string | null,
    isDemo: boolean
  ): Promise<MenuNode> {
    if (isDemo) {
      const newItem: MenuNode = {
        id: crypto.randomUUID(),
        name,
        parentId,
        order: 0,
        children: [],
      };

      if (!parentId) {
        newItem.order = mockStore.length;
        mockStore.push(newItem);
      } else {
        const addRec = (nodes: MenuNode[]) => {
          for (const n of nodes) {
            if (n.id === parentId) {
              n.children = n.children || [];
              newItem.order = n.children.length;
              n.children.push(newItem);
              return true;
            }
            if (n.children && addRec(n.children)) return true;
          }
          return false;
        };
        addRec(mockStore);
      }
      return newItem;
    }

    const res = await axios.post(`${API_BASE_URL}/menus`, { name, parentId });
    return res.data;
  },

  async update(
    id: string,
    updateData: { name?: string; parentId?: string | null },
    isDemo: boolean
  ) {
    if (isDemo) {
      const rec = (nodes: MenuNode[]) => {
        for (const n of nodes) {
          if (n.id === id) {
            if (updateData.name) n.name = updateData.name;
            if (updateData.parentId !== undefined)
              n.parentId = updateData.parentId;
            return true;
          }
          if (n.children && rec(n.children)) return true;
        }
        return false;
      };
      rec(mockStore);
      return { id, ...updateData };
    }
    const res = await axios.put(`${API_BASE_URL}/menus/${id}`, updateData);
    return res.data;
  },

  async delete(id: string, isDemo: boolean) {
    if (isDemo) {
      const rec = (nodes: MenuNode[]) => {
        const idx = nodes.findIndex((n) => n.id === id);
        if (idx > -1) {
          nodes.splice(idx, 1);
          return true;
        }
        for (const n of nodes) {
          if (n.children && rec(n.children)) return true;
        }
        return false;
      };
      rec(mockStore);
      return true;
    }
    await axios.delete(`${API_BASE_URL}/menus/${id}`);
    return true;
  },

  async move(id: string, newParentId: string | null, isDemo: boolean) {
    if (isDemo) {
      return this.update(id, { parentId: newParentId }, true);
    }
    const res = await axios.patch(`${API_BASE_URL}/menus/${id}/move`, {
      parentId: newParentId,
    });
    return res.data;
  },

  async reorder(id: string, newOrder: number, isDemo: boolean) {
    if (isDemo) {
      console.warn("Mock reorder executed");
      return true;
    }
    const res = await axios.patch(`${API_BASE_URL}/menus/${id}/reorder`, {
      order: newOrder,
    });
    return res.data;
  },
};
