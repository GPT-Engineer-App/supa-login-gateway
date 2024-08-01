import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSupabaseAuth } from "../integrations/supabase/auth";
import { SupabaseAuthUI } from "../integrations/supabase/auth";

const Index = () => {
  const { session } = useSupabaseAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 text-white">
      <div className="text-center mb-8">
        <img src="/tsv-logo.png" alt="TSV Global Solutions Logo" className="mx-auto object-contain w-32 h-32 mb-4" />
        <h1 className="text-5xl font-bold mb-4">Welcome to DSR Tracking Application</h1>
        <p className="text-xl mb-8">Streamline your logistics with TSV Global Solutions</p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md text-blue-800 text-center">
          <img src="/airplane-icon.png" alt="Air Freight" className="mx-auto object-contain w-16 h-16 mb-4" />
          <h3 className="text-lg font-semibold">Air Freight</h3>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-blue-800 text-center">
          <img src="/ship-icon.png" alt="Sea Freight" className="mx-auto object-contain w-16 h-16 mb-4" />
          <h3 className="text-lg font-semibold">Sea Freight</h3>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-blue-800 text-center">
          <img src="/truck-icon.png" alt="Ground Transport" className="mx-auto object-contain w-16 h-16 mb-4" />
          <h3 className="text-lg font-semibold">Ground Transport</h3>
        </div>
      </div>

      {session ? (
        <Button asChild className="bg-white text-blue-700 hover:bg-blue-100">
          <Link to="/create-user">Manage DSR</Link>
        </Button>
      ) : (
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-blue-800">Please log in to continue</h2>
          <SupabaseAuthUI />
        </div>
      )}
    </div>
  );
};

export default Index;
