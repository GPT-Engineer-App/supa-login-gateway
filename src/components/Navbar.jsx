import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "../integrations/supabase/auth";
import { navItems } from "../nav-items";

const Navbar = () => {
  const { session, logout } = useSupabaseAuth();

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          {navItems.map(({ title, to, icon }) => (
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
