import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "../integrations/supabase/auth";
import { navItems } from "../nav-items";
import { useTheme } from "../contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

const Navbar = () => {
  const { session, logout } = useSupabaseAuth();
  const { theme, toggleTheme } = useTheme();

  const isAdmin = session?.user?.user_type === 'admin';

  const filteredNavItems = navItems.filter(item => {
    if (!session) return item.title === "Home";
    if (item.adminOnly) return isAdmin;
    return true;
  });

  return (
    <nav className="bg-gray-800 dark:bg-gray-900 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          {filteredNavItems.map(({ title, to, icon }) => (
            <Link key={to} to={to} className="text-white hover:text-gray-300 flex items-center">
              {icon}
              <span className="ml-1">{title}</span>
            </Link>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={toggleTheme} variant="outline" size="icon">
            {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
          {session ? (
            <Button onClick={logout} variant="outline" className="bg-white text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
              Logout
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="outline" className="bg-white text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
