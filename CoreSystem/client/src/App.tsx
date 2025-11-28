import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./pages/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        } />
        {/* Catch all route - redirect to login if not authenticated */}
        <Route path="*" element={<Navigate to="/" replace />} /> 
        {/* replace removes the previous entry from history, so users can’t go back to a protected page after redirect. */}
      </Routes>
    </Router>
  );
}

export default App;