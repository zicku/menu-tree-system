import { Menu } from "lucide-react";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const menuItems = [
    { name: "Systems", href: "#" },
    { name: "System Code", href: "#" },
    { name: "Properties", href: "#" },
    { name: "Menus", href: "#" },
    { name: "API List", href: "#" },
    { name: "Users & Group", href: "#" },
    { name: "Competition", href: "#" },
  ];

  return (
    <>
      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-[#0054B8] text-white 
          p-6 transition-all duration-300 z-[998] shadow-xl
          ${open ? "w-64 translate-x-0" : "w-0 -translate-x-64"}
        `}
      >
        {/* LOGO */}
        {open && (
          <div className="flex items-center mb-8">
            <img
              src="https://solusiteknologikreatif.id/wp-content/uploads/2023/09/logo-75x32.png"
              alt="Logo"
              className="h-10"
            />
          </div>
        )}

        {/* MENU LIST */}
        {open && (
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 rounded-lg 
                  hover:bg-[#0A66CC] transition"
              >
                {item.name}
              </a>
            ))}
          </nav>
        )}
      </aside>

      {/* TOGGLE BUTTON */}
      <button
        className={`
          fixed top-6 
          ${open ? "left-[260px]" : "left-6"} 
          z-[999] p-3 bg-white rounded-xl shadow-lg 
          transition-all duration-300`}
        onClick={onToggle}
      >
        <Menu size={20} />
      </button>
    </>
  );
}
