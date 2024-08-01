import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome to User Management</h1>
      <Button asChild>
        <Link to="/create-user">Create New User</Link>
      </Button>
    </div>
  );
};

export default Index;
