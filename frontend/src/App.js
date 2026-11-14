
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      {/* Guest users can access Home */}
      <Route path="/" element={<Home />} />

      {/* Settings requires login */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
