import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSupabaseAuth } from "../integrations/supabase/auth";
import { SupabaseAuthUI } from "../integrations/supabase/auth";

const Index = () => {
  const { session } = useSupabaseAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome to User Management</h1>
      {session ? (
        <Button asChild>
          <Link to="/create-user">Create New User</Link>
        </Button>
      ) : (
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Please log in to continue</h2>
          <SupabaseAuthUI />
        </div>
      )}
    </div>
  );
};

export default Index;
