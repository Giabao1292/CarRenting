import { Outlet } from "react-router-dom";
import TopNav from "./components/TopNav";
import Footer from "./Footer";

const UserLayout = () => {
  return (
    <div style={{ backgroundColor: "#f6f8f6", minHeight: "100vh" }}>
      <TopNav />
      <Outlet />
      <Footer />
    </div>
  );
};

export default UserLayout;
