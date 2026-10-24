import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DeviceProvider } from "@/context/DeviceContext";
import { isFullApp, userHomePath } from "@/lib/appMode";
import { isNative } from "@/lib/native";
import Login from "@/pages/Login";
import Launcher from "@/pages/Launcher";
import Phone from "@/pages/Phone";
import Settings from "@/pages/Settings";
import General from "@/pages/General";
import About from "@/pages/About";
import SettingsDetail from "@/pages/SettingsDetail";
import AppleAccount from "@/pages/AppleAccount";
import AppleAccountDetail from "@/pages/AppleAccountDetail";
import AnimatedOutlet from "@/components/ios/Navigation";
import Wifi from "@/pages/Wifi";
import Bluetooth from "@/pages/Bluetooth";
import UserEditDevice from "@/pages/UserEditDevice";
import AdminAccounts from "@/pages/AdminAccounts";

// iPhone-like frame with a home indicator that returns to the app launcher
function IosFrame() {
  const navigate = useNavigate();
  // Native (Capacitor) or a single-purpose app build -> fullscreen, no desktop frame.
  if (isNative || !isFullApp) {
    return (
      <div data-testid="native-app-shell" className="ios-app-shell bg-white app-safe-top app-safe-bottom relative">
        <AnimatedOutlet />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#1c1c1e] flex justify-center sm:py-8">
      <div className="ios-app-shell ios-desktop-shell w-full max-w-[430px] bg-[#F2F2F7] sm:rounded-[44px] sm:shadow-2xl sm:overflow-hidden sm:ring-1 sm:ring-black/40 relative">
        <AnimatedOutlet />
        <button
          data-testid="home-indicator"
          aria-label="Home"
          onClick={() => navigate("/apps")}
          className="fixed sm:absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[140px] h-[5px] rounded-full bg-black/35 hover:bg-black/55 transition-colors z-50"
        />
      </div>
    </div>
  );
}

function RequireUser() {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/" replace />;
  if (auth.role !== "user") return <Navigate to="/admin" replace />;
  return <Outlet />;
}

function RequireAdmin() {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/" replace />;
  if (auth.role !== "admin") return <Navigate to="/apps" replace />;
  return <Outlet />;
}

function LoginGate() {
  const { auth } = useAuth();
  if (auth?.role === "admin") return <Navigate to="/admin" replace />;
  if (auth?.role === "user") return <Navigate to={userHomePath()} replace />;
  return <Login />;
}

function App() {
  return (
    <AuthProvider>
      <DeviceProvider>
        <BrowserRouter>
          <Toaster position="top-center" richColors />
          <Routes>
            <Route path="/" element={<LoginGate />} />

            <Route element={<RequireUser />}>
              <Route path="/apps" element={<Launcher />} />
              <Route element={<IosFrame />}>
                <Route path="/settings" element={<Settings />} />
                <Route path="/general" element={<General />} />
                <Route path="/about" element={<About />} />
                <Route path="/account" element={<AppleAccount />} />
                <Route path="/account/:section" element={<AppleAccountDetail />} />
                <Route path="/settings/:section/*" element={<SettingsDetail />} />
                <Route path="/general/:section/*" element={<SettingsDetail />} />
                <Route path="/wifi" element={<Wifi />} />
                <Route path="/bluetooth" element={<Bluetooth />} />
                <Route path="/edit" element={<UserEditDevice />} />
                <Route path="/phone" element={<Phone />} />
              </Route>
            </Route>

            <Route element={<RequireAdmin />}>
              <Route path="/admin" element={<AdminAccounts />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DeviceProvider>
    </AuthProvider>
  );
}

export default App;
