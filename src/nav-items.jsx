import { Home, UserPlus } from "lucide-react";
import Index from "./pages/Index.jsx";
import CreateUser from "./pages/CreateUser.jsx";

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
];
