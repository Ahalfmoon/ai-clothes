import { Outlet, NavLink } from "react-router-dom";
import { Shirt, Clock, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { path: "/", label: "换装首页", icon: Shirt },
  { path: "/history", label: "历史记录", icon: Clock },
];

const Layout = () => {
  const appName = "AI 换装";
  const userName = "用户";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo + Nav */}
            <div className="flex items-center gap-6">
              <NavLink to="/" className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Shirt className="size-4" />
                </div>
                <span className="font-semibold text-foreground text-sm">
                  {appName}
                </span>
              </NavLink>
              <nav className="flex items-center gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={`size-4 ${isActive ? "text-accent-foreground" : ""}`}
                        />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full hover:bg-accent p-1 pr-3 transition-colors">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground">
                    {userName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>退出登录</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
