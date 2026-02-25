import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./AppLayout";
import ErrorBoundary from "./ErrorBoundary";
import { APP_ROUTES } from "./routes";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import BookingSuccessPage from "../pages/BookingSuccessPage";
import CarDetailsPage from "../pages/CarDetailsPage";
import DashboardPage from "../pages/DashboardPage";
import LandingPage from "../pages/LandingPage";
import NotFoundPage from "../pages/NotFoundPage";
import OwnerDashboardPage from "../pages/OwnerDashboardPage";
import PaymentPage from "../pages/PaymentPage";
import ProfileVerificationPage from "../pages/ProfileVerificationPage";
import ResultsPage from "../pages/ResultsPage";

const AppRouter = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path={APP_ROUTES.HOME} element={<LandingPage />} />
            <Route path={APP_ROUTES.RESULTS} element={<ResultsPage />} />
            <Route path={APP_ROUTES.CAR_DETAILS} element={<CarDetailsPage />} />
            <Route path={APP_ROUTES.PAYMENT} element={<PaymentPage />} />
            <Route
              path={APP_ROUTES.BOOKING_SUCCESS}
              element={<BookingSuccessPage />}
            />
            <Route
              path={APP_ROUTES.RENTER_DASHBOARD}
              element={<DashboardPage />}
            />
            <Route
              path={APP_ROUTES.OWNER_DASHBOARD}
              element={<OwnerDashboardPage />}
            />
            <Route
              path={APP_ROUTES.ADMIN_DASHBOARD}
              element={<AdminDashboardPage />}
            />
            <Route
              path={APP_ROUTES.PROFILE_VERIFICATION}
              element={<ProfileVerificationPage />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default AppRouter;
