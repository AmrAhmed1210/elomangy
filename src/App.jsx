import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/layout/Footer";
import LaunchScreen from "./components/LaunchScreen";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedAdminRoute from "./components/auth/ProtectedAdminRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Materials from "./pages/Materials";
import YearDetail from "./pages/YearDetail";
import TrackYearDetail from "./pages/TrackYearDetail";
import SemesterDetail from "./pages/SemesterDetail";
import CourseDetail from "./pages/CourseDetail";
import Diplomas from "./pages/Diplomas";
import DiplomaDetail from "./pages/DiplomaDetail";
import TrainingSessions from "./pages/TrainingSessions";
import SessionDetail from "./pages/SessionDetail";
import CategoryDetail from "./pages/CategoryDetail";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import BoxDetail from "./pages/BoxDetail";
import Team from "./pages/Team";
import JoinUs from "./pages/JoinUs";
import SpecialSectionDetail from "./pages/SpecialSectionDetail";
import Chatbot from "./pages/Chatbot";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <LaunchScreen />
            <ScrollToTop />
            <div className="min-h-screen flex flex-col relative">
              <div className="animated-bg">
                <div className="animated-circle animated-circle-1" />
                <div className="animated-circle animated-circle-2" />
                <div className="animated-circle animated-circle-3" />
                <div className="animated-circle animated-circle-4" />
                <div className="animated-circle animated-circle-5" />
                <div className="animated-circle animated-circle-6" />
              </div>

              <Navbar />

              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/materials" element={<Materials />} />
                  <Route path="/materials/year/:year" element={<YearDetail />} />
                  <Route path="/materials/year/:year/:trackSlug" element={<TrackYearDetail />} />
                  <Route path="/materials/year/:year/semester/:semesterId" element={<SemesterDetail />} />
                  <Route path="/materials/year/:year/:trackSlug/semester/:semesterId" element={<SemesterDetail />} />
                  <Route path="/materials/course/:courseId" element={<CourseDetail />} />
                  <Route path="/materials/box/:boxId" element={<BoxDetail />} />
                  <Route path="/diplomas" element={<Diplomas />} />
                  <Route path="/diplomas/:slug" element={<DiplomaDetail />} />
                  <Route path="/training-sessions" element={<TrainingSessions />} />
                  <Route path="/training-sessions/:sessionId" element={<SessionDetail />} />
                  <Route path="/training-sessions/:sessionId/:categoryId" element={<CategoryDetail />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/join-us" element={<JoinUs />} />
                  <Route path="/chatbot" element={<Chatbot />} />
                  <Route path="/materials/section/:slug" element={<SpecialSectionDetail />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedAdminRoute>
                        <AdminDashboard />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>

              <Footer />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
