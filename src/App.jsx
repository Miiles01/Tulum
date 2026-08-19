import { Routes, Route } from 'react-router-dom';
import { SmoothScroll } from './components/SmoothScroll';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';

function App() {
  return (
    <SmoothScroll>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </SmoothScroll>
  );
}

export default App;
