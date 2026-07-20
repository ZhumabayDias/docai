import { NavLink } from "react-router-dom";
import logo from "../assets/images/logo.png";

import { navigation } from "../constants/navigation";
import { cn } from "../utils/cn";

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-surface-border bg-surface-base px-4 py-5 lg:block">
      <div className="mb-8 flex items-center gap-3 px-2">
        <img
          src={logo}
          alt="Docai Cloud"
          className="h-9 w-9 object-contain"
        />
        <div>
          <p className="text-sm font-bold text-brand">Docai Cloud</p>
          <p className="text-xs text-brand-muted">Deploy workspace</p>
        </div>
      </div>

      <nav className="space-y-1">
        {navigation.map((item) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-brand-muted transition hover:bg-surface-subtle hover:text-brand",
                isActive && "bg-surface-subtle text-brand",
              )
            }
            key={item.href}
            to={item.href}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export function MobileNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-surface-border bg-surface-base/95 px-2 py-2 backdrop-blur-xl lg:hidden">
      {navigation.map((item) => (
        <NavLink
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-xs font-semibold text-brand-muted",
              isActive && "bg-surface-subtle text-brand",
            )
          }
          key={item.href}
          to={item.href}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
