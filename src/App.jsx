import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/layout/Footer";
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

function App() {
  return (
    <BrowserRouter>
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
            <Route path="/materials/year/:year/:trackSlug/semester/:semesterId" element={<SemesterDetail />} />
            <Route path="/materials/course/:courseId" element={<CourseDetail />} />
            <Route path="/diplomas" element={<Diplomas />} />
            <Route path="/diplomas/:slug" element={<DiplomaDetail />} />
            <Route path="/training-sessions" element={<TrainingSessions />} />
            <Route path="/training-sessions/:sessionId" element={<SessionDetail />} />
            <Route path="/training-sessions/:sessionId/:categoryId" element={<CategoryDetail />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
