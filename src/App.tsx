import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Mentors from './pages/Mentors';
import Program from './pages/Program';
import FAQ from './pages/FAQ';
import Statistics from './pages/Statistics';
import Hiring from './pages/Hiring';
import Records from './pages/Records';
import NotFound from './pages/NotFound';
import { RECORDS_PAGE } from './config/records';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Mentors />} />
          <Route path="/mentors" element={<Navigate to="/team" replace />} />
          <Route path="/program" element={<Program />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/hiring" element={<Hiring />} />
          <Route path={RECORDS_PAGE.path} element={<Records />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
