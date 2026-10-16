import { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Mentors from './pages/Mentors';
import Program from './pages/Program';
import FAQ from './pages/FAQ';
import Hiring from './pages/Hiring';
import Partnerships from './pages/Partnerships';
import Records from './pages/Records';
import NotFound from './pages/NotFound';
import { RECORDS_PAGE } from './config/records';

const INTRO_SESSION_KEY = 'ignite:intro-seen';

function App() {
  const [loading, setLoading] = useState(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    try {
      return sessionStorage.getItem(INTRO_SESSION_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const dismissIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
    } catch {
      // The intro still works when browser storage is unavailable.
    }
    setLoading(false);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen key="intro" onComplete={dismissIntro} />}
      </AnimatePresence>
      <div {...(loading ? { inert: '' } : {})} aria-hidden={loading || undefined}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/team" element={<Mentors />} />
              <Route path="/mentors" element={<Navigate to="/team" replace />} />
              <Route path="/program" element={<Program />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/apply" element={<Navigate to="/program" replace />} />
              <Route path="/statistics" element={<Navigate to={RECORDS_PAGE.path} replace />} />
              <Route path="/hiring" element={<Hiring />} />
              <Route path="/partnerships" element={<Partnerships />} />
              <Route path={RECORDS_PAGE.path} element={<Records />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </div>
    </>
  );
}

export default App;
