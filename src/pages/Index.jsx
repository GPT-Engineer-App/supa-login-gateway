import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSupabaseAuth } from "../integrations/supabase/auth";
import { SupabaseAuthUI } from "../integrations/supabase/auth";

const Index = () => {
  const { session } = useSupabaseAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center" style={{backgroundImage: "url('/logistics-background.jpg')"}}>
      <div className="bg-black bg-opacity-50 p-8 rounded-lg text-white">
        <div className="text-center mb-8">
          <img src="/tsv-logo.png" alt="TSV Global Solutions Logo" className="mx-auto object-contain w-32 h-32 mb-4" />
          <h1 className="text-5xl font-bold mb-4">Welcome to DSR Tracking Application</h1>
          <p className="text-xl mb-8">Streamline your logistics with TSV Global Solutions</p>
        </div>

        {session ? (
          <Button asChild className="bg-white text-blue-700 hover:bg-blue-100">
            <Link to="/create-user">Manage DSR</Link>
          </Button>
        ) : (
          <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
            <SupabaseAuthUI />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
