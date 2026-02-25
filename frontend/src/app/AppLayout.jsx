import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/layout/Footer";
import TopNav from "../components/results/TopNav";

const AppLayout = () => {
  const { pathname } = useLocation();
  const hideMainHeader =
    pathname === "/dashboard/owner" || pathname === "/dashboard/admin";

  return (
    <div style={{ backgroundColor: "#f6f8f6", minHeight: "100vh" }}>
      {!hideMainHeader && <TopNav />}
      <Outlet />
      <Footer />
    </div>
  );
};

export default AppLayout;
