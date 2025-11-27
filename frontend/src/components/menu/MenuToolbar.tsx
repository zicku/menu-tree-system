import Input from "../ui/Input";
import Button from "../ui/Button";

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

export default function MenuToolbar({
  searchTerm,
  setSearchTerm,
  expandAll,
  collapseAll,
}: Props) {
  return (
    <div className="flex items-center justify-between mb-4 bg-white shadow-sm p-4 rounded-xl border border-gray-200">
      <div className="w-1/2">
        <Input
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={expandAll} className="px-4 py-2">
          Expand All
        </Button>
        <Button variant="secondary" onClick={collapseAll} className="px-4 py-2">
          Collapse All
        </Button>
      </div>
    </div>
  );
}
