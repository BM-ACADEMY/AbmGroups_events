import {
  IconUser,
} from "@tabler/icons-react";
import {LayoutDashboard, CalendarPlus,Trophy, UserPlus2,BookImage, Video, Image, ImagePlus } from "lucide-react";

export const sidebarMenuItems = {
  admin: [
    { url: "/admin-dashboard", title: "Dashboard", icon: LayoutDashboard },
    { url: "/admin-dashboard/userregistration", title: "User Registration", icon: UserPlus2 },
    { url: "/admin-dashboard/competition", title: "Competitions", icon: CalendarPlus },
    { url: "/admin-dashboard/prices", title: "Prices", icon: Trophy },
    { url: "/admin-dashboard/drawingcandidates", title: "Drawing Candidates", icon: BookImage },
    { url: "/admin-dashboard/skidcandidates", title: "Skid Candidates", icon: Video },
    { url: "/admin-dashboard/memescandidates", title: "Memes Candidates", icon: Image },
    { url: "/admin-dashboard/logocandidates", title: "Logo Candidates", icon: ImagePlus },
    { url: "/admin-dashboard/photographycandidates", title: "Photography Candidates", icon: ImagePlus },
  ],
  college_student: [
    { url: "/college_student-dashboard", title: "Dashboard", icon: LayoutDashboard },
    { url: "/college_student-dashboard/competition", title: "Competition", icon: CalendarPlus },
  ],
  school_student: [
    { url: "/school_student-dashboard", title: "Dashboard", icon: LayoutDashboard },
    { url: "/school_student-dashboard/competition", title: "Competition", icon: CalendarPlus },
  ],
};

export const validRoles = ["admin", "college_student", "school_student"];