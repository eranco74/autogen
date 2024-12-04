import React from "react";
import { Link } from "gatsby";
import { useConfigStore } from "../hooks/store";
import { Tooltip } from "antd";
import { Settings, MessagesSquare, Blocks } from "lucide-react";
import Icon from "./icons";

interface INavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  breadcrumbs?: Array<{
    name: string;
    href: string;
    current?: boolean;
  }>;
}

const navigation: INavItem[] = [
  {
    name: "Playground",
    href: "/",
    icon: MessagesSquare,
    breadcrumbs: [{ name: "Playground", href: "/", current: true }],
  },
  {
    name: "Build",
    href: "/build",
    icon: Blocks,
    breadcrumbs: [{ name: "Build", href: "/build", current: true }],
  },
];

const classNames = (...classes: (string | undefined | boolean)[]) => {
  return classes.filter(Boolean).join(" ");
};

type SidebarProps = {
  link: string;
  meta?: {
    title: string;
    description: string;
  };
  isMobile: boolean;
};

const Sidebar = ({ link, meta, isMobile }: SidebarProps) => {
  const { sidebar, setHeader, setSidebarState } = useConfigStore();
  const { isExpanded } = sidebar;

  // Set initial header state based on current route
  React.useEffect(() => {
    setNavigationHeader(link);
  }, [link]);

  // Always show full sidebar in mobile view
  const showFull = isMobile || isExpanded;

  const handleNavClick = (item: INavItem) => {
    // if (!isExpanded) {
    //   setSidebarState({ isExpanded: true });
    // }
    setHeader({
      title: item.name,
      breadcrumbs: item.breadcrumbs,
    });
  };

  const setNavigationHeader = (path: string) => {
    const navItem = navigation.find((item) => item.href === path);
    if (navItem) {
      setHeader({
        title: navItem.name,
        breadcrumbs: navItem.breadcrumbs,
      });
    } else if (path === "/settings") {
      setHeader({
        title: "Settings",
        breadcrumbs: [{ name: "Settings", href: "/settings", current: true }],
      });
    }
  };

  return (
    <div
      className={classNames(
        "flex grow flex-col gap-y-5 overflow-y-auto border-r border-secondary bg-primary",
        "transition-all duration-300 ease-in-out",
        showFull ? "w-72 px-6" : "w-16 px-2"
      )}
    >
      {/* App Logo/Title */}
      <div
        className={`flex h-16 items-center ${showFull ? "gap-x-3" : "ml-2"}`}
      >
        <Link
          to="/"
          onClick={() => setNavigationHeader("/")}
          className="w-8 text-right text-accent hover:opacity-80 transition-opacity"
        >
          <Icon icon="app" size={8} />
        </Link>
        {showFull && (
          <div className="flex flex-col" style={{ minWidth: "200px" }}>
            <span className="text-base font-semibold text-primary">
              {meta?.title}
            </span>
            <span className="text-xs text-secondary">{meta?.description}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          {/* Main Navigation */}
          <li>
            <ul
              role="list"
              className={classNames(
                "-mx-2 space-y-1",
                !showFull && "items-center"
              )}
            >
              {navigation.map((item) => {
                const isActive = item.href === link;
                const IconComponent = item.icon;

                const navLink = (
                  <Link
                    to={item.href}
                    onClick={() => handleNavClick(item)}
                    className={classNames(
                      // Base styles
                      "group flex gap-x-3 rounded-md p-2 text-sm font-medium",
                      !showFull && "justify-center",
                      // Color states
                      isActive
                        ? "bg-secondary/50 text-accent"
                        : "text-secondary hover:bg-secondary/50 hover:text-accent"
                    )}
                  >
                    <IconComponent
                      className={classNames(
                        "h-6 w-6 shrink-0",
                        isActive
                          ? "text-accent"
                          : "text-secondary group-hover:text-accent"
                      )}
                    />
                    {showFull && item.name}
                  </Link>
                );

                return (
                  <li key={item.name}>
                    {!showFull && !isMobile ? (
                      <Tooltip title={item.name} placement="right">
                        {navLink}
                      </Tooltip>
                    ) : (
                      navLink
                    )}
                  </li>
                );
              })}
            </ul>
          </li>

          {/* Settings at bottom */}
          <li
            className={classNames(
              "mt-auto -mx-2 mb-4",
              !showFull && "flex justify-center"
            )}
          >
            {!showFull && !isMobile ? (
              <Tooltip title="Settings" placement="right">
                <Link
                  to="/settings"
                  onClick={() =>
                    setHeader({
                      title: "Settings",
                      breadcrumbs: [
                        { name: "Settings", href: "/settings", current: true },
                      ],
                    })
                  }
                  className={classNames(
                    "group flex gap-x-3 rounded-md p-2 text-sm font-medium",
                    "text-primary hover:text-accent hover:bg-secondary",
                    !showFull && "justify-center"
                  )}
                >
                  <Settings className="h-6 w-6 shrink-0 text-secondary group-hover:text-accent" />
                </Link>
              </Tooltip>
            ) : (
              <Link
                to="/settings"
                onClick={() =>
                  setHeader({
                    title: "Settings",
                    breadcrumbs: [
                      { name: "Settings", href: "/settings", current: true },
                    ],
                  })
                }
                className="group flex gap-x-3 rounded-md p-2 text-sm font-medium text-primary hover:text-accent hover:bg-secondary"
              >
                <Settings className="h-6 w-6 shrink-0 text-secondary group-hover:text-accent" />
                {showFull && "Settings"}
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
