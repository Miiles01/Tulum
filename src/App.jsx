import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { SmoothScroll } from './components/SmoothScroll';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ReserveModal from './components/ReserveModal';
import Home from './pages/Home';
import MenuPage from './pages/MenuPage';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import Account from './pages/Account';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import Overview from './admin/Overview';
import Orders from './admin/Orders';
import MenuAdmin from './admin/MenuAdmin';
import Customers from './admin/Customers';
import Loyalty from './admin/Loyalty';
import Reservations from './admin/Reservations';
import Settings from './admin/Settings';
import { tickKitchen } from './demo/store';
import './demo/demo.css';

function useSimulatedKitchen() {
  useEffect(() => {
    tickKitchen();
    const t = setInterval(tickKitchen, 5000);
    return () => clearInterval(t);
  }, []);
}

function App() {
  const { pathname } = useLocation();
  useSimulatedKitchen();

  if (pathname.startsWith('/admin')) {
    return (
      <SmoothScroll>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Overview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="menu" element={<MenuAdmin />} />
            <Route path="customers" element={<Customers />} />
            <Route path="loyalty" element={<Loyalty />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <ReserveModal />
      </SmoothScroll>
    );
  }

  return (
    <SmoothScroll>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:id" element={<OrderTracking />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <ReserveModal />
    </SmoothScroll>
  );
}

export default App;
