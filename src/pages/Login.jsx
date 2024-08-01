import { SupabaseAuthUI } from "../integrations/supabase/auth";

const Login = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-center">Login</h1>
        <SupabaseAuthUI />
      </div>
    </div>
  );
};

export default Login;
