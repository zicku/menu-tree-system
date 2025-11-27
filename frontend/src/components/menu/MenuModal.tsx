import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import type { MenuNode } from "../../types/MenuNode";

interface Props {
  open: boolean;
  onClose: () => void;
  name: string;
  setName: (v: string) => void;
  parentId: string | null;
  setParentId: (v: string | null) => void;
  onSave: () => void;
  title?: string;
  allNodes: MenuNode[];

  // Extra fields for edit mode
  idValue?: string;
  level?: number;
  isEdit?: boolean;
}

const flatten = (nodes: MenuNode[], depth = 0): any[] => {
  return nodes.flatMap((n) => [
    { id: n.id, label: `${"— ".repeat(depth)}${n.name}` },
    ...(n.children ? flatten(n.children, depth + 1) : []),
  ]);
};

export default function MenuModal({
  open,
  onClose,
  name,
  setName,
  parentId,
  setParentId,
  onSave,
  title = "Menu",
  allNodes,
  idValue,
  level,
  isEdit = false,
}: Props) {
  if (!open) return null;

  const parentOptions = [
    { id: null, label: "(Root Level)" },
    ...flatten(allNodes),
  ];

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
        className="space-y-5"
      >
        {/* ID & Level — Readonly for Edit Mode */}
        {isEdit && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Menu ID
              </label>
              <input
                value={idValue ?? ""}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Level
              </label>
              <input
                value={level ?? ""}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500"
              />
            </div>
          </div>
        )}

        <Input
          label="Menu Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">
            Parent Menu
          </label>

          <select
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
            value={parentId ?? ""}
            onChange={(e) =>
              setParentId(e.target.value === "" ? null : e.target.value)
            }
          >
            {parentOptions.map((opt) => (
              <option key={opt.id ?? "root"} value={opt.id ?? ""}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
}
