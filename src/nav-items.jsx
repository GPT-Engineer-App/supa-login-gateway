import { Home, UserPlus, Settings } from "lucide-react";
import Index from "./pages/Index.jsx";
import CreateUser from "./pages/CreateUser.jsx";
import Login from "./pages/Login.jsx";
import ManageOrganizations from "./pages/ManageOrganizations.jsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Create User",
    to: "/create-user",
    icon: <UserPlus className="h-4 w-4" />,
    page: <CreateUser />,
  },
  {
    title: "Manage Organizations",
    to: "/manage-organizations",
    icon: <Settings className="h-4 w-4" />,
    page: <ManageOrganizations />,
    adminOnly: true,
  },
];
