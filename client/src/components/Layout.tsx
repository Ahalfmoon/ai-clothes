import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Shirt, Clock } from "lucide-react";
import { useAppInfo } from "@lark-apaas/client-toolkit/hooks/useAppInfo";
import { useCurrentUserProfile } from "@lark-apaas/client-toolkit/hooks/useCurrentUserProfile";
import { getDataloom } from "@lark-apaas/client-toolkit/dataloom";
import { logger } from "@lark-apaas/client-toolkit/logger";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const navItems = [
  { path: "/", label: "换装首页", icon: Shirt },
  { path: "/history", label: "历史记录", icon: Clock },
];

const Layout = () => {
  const { appName } = useAppInfo();
  const userInfo = useCurrentUserProfile();
  const location = useLocation();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = async () => {
    const dataloom = await getDataloom();
    const result = await dataloom.service.session.signOut();
    if (result.error) {
      logger.error("退出登录失败:", result.error.message);
      return;
    }
    window.location.reload();
  };

  const handleLogin = async () => {
    const dataloom = await getDataloom();
    dataloom.service.session.redirectToLogin();
  };

  const isLogin = !!userInfo?.user_id;
  const userName = isLogin
    ? (userInfo?.name && typeof userInfo.name === "object"
        ? (userInfo.name as { zh_cn?: string }).zh_cn
        : (userInfo?.name as string)) || "用户"
    : "游客";

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
                  {appName || "AI 换装"}
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
                    {isLogin && userInfo?.avatar ? (
                      <AvatarImage src={userInfo.avatar} />
                    ) : null}
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {isLogin ? userName.charAt(0) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground">
                    {userName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isLogin ? (
                  <DropdownMenuItem onClick={() => setLogoutOpen(true)}>
                    退出登录
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={handleLogin}>登录</DropdownMenuItem>
                )}
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

      {/* Logout Confirmation */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认退出</AlertDialogTitle>
            <AlertDialogDescription>
              退出登录后需要重新登录才能使用换装功能。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>确认退出</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Layout;
