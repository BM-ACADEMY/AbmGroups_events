import {
  IconUser,
} from "@tabler/icons-react";
import {LayoutDashboard } from "lucide-react";

export const sidebarMenuItems = {
  admin: [
    { url: "/admin-dashboard", title: "Dashboard", icon: LayoutDashboard },
  ],
  college_student: [
    { url: "/college_student-dashboard", title: "Dashboard", icon: LayoutDashboard },
    { url: "/college_student-dashboard/profile", title: "Profile", icon: IconUser },
  ],
  school_student: [
    { url: "/school_student-dashboard", title: "Dashboard", icon: LayoutDashboard },
    { url: "/school_student-dashboard/profile", title: "Profile", icon: IconUser },
  ],
};

export const validRoles = ["admin", "college_student", "school_student"];