import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import { SupabaseAuthProvider } from "./integrations/supabase/auth";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";

const App = () => (
  <SupabaseAuthProvider>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Navbar />
        <Routes>
          {navItems.map(({ to, page }) => (
            <Route key={to} path={to} element={page} />
          ))}
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </SupabaseAuthProvider>
);

export default App;
