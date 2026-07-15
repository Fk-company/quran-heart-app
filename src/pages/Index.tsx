import { Navigate } from "react-router-dom";

// Fallback route — redirects to the main home page.
const Index = () => <Navigate to="/" replace />;

export default Index;
