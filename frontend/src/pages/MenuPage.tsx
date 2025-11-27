import { useState } from "react";
import { Layers } from "lucide-react";

import PageWrapper from "../components/layout/PageWrapper";
import Header from "../components/layout/Header";
import MenuToolbar from "../components/menu/MenuToolbar";
import MenuNode from "../components/menu/MenuNode";
import MenuModal from "../components/menu/MenuModal";
import { useMenuSystem } from "../hooks/useMenuSystem";

export default function SystemMenusPage() {
  const {
    filteredData,
    expandedIds,
    toggleExpand,
    searchTerm,
    setSearchTerm,
    addMenu,
    editMenu,
    deleteMenu,
    handleReorder,
    expandAll,
    collapseAll,
    data,
  } = useMenuSystem();

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editLevel, setEditLevel] = useState<number | null>(null);

  // create
  const openCreate = (pid: string | null) => {
    setMode("create");
    setParentId(pid);
    setName("");
    setEditId(null);
    setEditLevel(null);
    setModalOpen(true);
  };

  // edit
  const openEdit = (id: string, existingName: string, level: number) => {
    setMode("edit");
    setEditId(id);
    setName(existingName);
    setEditLevel(level);
    setModalOpen(true);
  };

  const save = async () => {
    if (!name.trim()) return;

    if (mode === "create") {
      await addMenu(parentId, name);
    } else if (mode === "edit" && editId) {
      await editMenu(editId, name, parentId);
    }

    setModalOpen(false);
    setName("");
    setEditId(null);
    setParentId(null);
    setEditLevel(null);
  };

  return (
    <PageWrapper>
      <Header
        icon={Layers}
        title="System Menus"
        subtitle="Manage system-level menu configuration"
        status="connected"
      />

      <MenuToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        expandAll={expandAll}
        collapseAll={collapseAll}
      />

      <div className="flex justify-end mb-3">
        <button
          className="px-3 py-2 bg-blue-600 text-white rounded-md"
          onClick={() => openCreate(null)}
        >
          Add Root
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        {filteredData.map((node) => (
          <MenuNode
            key={node.id}
            node={node}
            expandedIds={expandedIds}
            onToggle={toggleExpand}
            onAdd={(pid) => openCreate(pid)}
            onEdit={(id, nm, level) => openEdit(id, nm, level)} // FIX
            onDelete={deleteMenu}
            onReorder={handleReorder}
          />
        ))}
      </div>

      <MenuModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        name={name}
        setName={setName}
        parentId={parentId}
        setParentId={setParentId}
        onSave={save}
        allNodes={data}
        title={mode === "create" ? "New Menu" : "Edit Menu"}
        idValue={editId ?? ""}
        level={editLevel ?? 0}
        isEdit={mode === "edit"}
      />
    </PageWrapper>
  );
}
