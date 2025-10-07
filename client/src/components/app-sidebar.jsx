import * as React from "react";
import {
  IconInnerShadowTopLeft,
} from "@tabler/icons-react";
import { NavMain } from "@/components/nav-main";
import { Link } from "react-router-dom";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { AuthContext } from "@/modules/AuthContext/AuthContext";
import { sidebarMenuItems, validRoles } from "@/modules/utils/SidebarMenuitem";

export function AppSidebar({ ...props }) {
  const { user } = React.useContext(AuthContext);

  // Get menu items based on user role, fallback to empty array if no user or invalid role
  const role = user?.role?.name && validRoles.includes(user.role.name) ? user.role.name : null;
  const navMainItems = role ? sidebarMenuItems[role] : [];

  // User data for NavUser
  const userData = user
    ? {
        name: user.name || "User",
        email: user.email || "No email",
        avatar: user.profileImage || "/avatars/default.jpg",
      }
    : { name: "Guest", email: "", avatar: "/avatars/default.jpg" };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/">
                <IconInnerShadowTopLeft className="!size-5" />
                <span className="text-base font-semibold">Politico 360</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent >
        <NavMain  items={navMainItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}