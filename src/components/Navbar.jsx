import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "../integrations/supabase/auth";
import { navItems } from "../nav-items";

const Navbar = () => {
  const { session, logout } = useSupabaseAuth();

  const isAdmin = session?.user?.user_type === 'admin';
  const isUser = session?.user?.user_type === 'user';

  const filteredNavItems = navItems.filter(item => {
    if (!session) return item.title === "Home";
    if (item.title === "Create User" || item.title === "Manage Organizations") return isAdmin || isUser;
    return true;
  });

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          {filteredNavItems.map(({ title, to, icon }) => (
            <Link key={to} to={to} className="text-white hover:text-gray-300 flex items-center">
              {icon}
              <span className="ml-1">{title}</span>
            </Link>
          ))}
        </div>
        <div>
          {session ? (
            <Button onClick={logout} variant="outline" className="text-white">
              Logout
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="outline" className="text-white">
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
