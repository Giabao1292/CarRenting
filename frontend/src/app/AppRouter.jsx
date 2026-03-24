import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import { APP_ROUTES } from "./routes";
import AdminLayout from "../layout/admin/AdminLayout";
import OwnerLayout from "../layout/owner/OwnerLayout";
import UserLayout from "../layout/user/UserLayout";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import BookingSuccessPage from "../pages/user/BookingSuccessPage";
import CarDetailsPage from "../pages/user/CarDetailsPage";
import ProfileLayout from "../layout/profile/ProfileLayout";
import LandingPage from "../pages/user/LandingPage";
import NotFoundPage from "../pages/common/NotFoundPage";
import OwnerDashboardPage from "../pages/owner/OwnerDashboardPage";
import PaymentPage from "../pages/user/PaymentPage";
import PaymentManagementPage from "../pages/admin/PaymentManagementPage";
import ProfileVerificationPage from "../pages/user/ProfileVerificationPage";
import ReviewManagementPage from "../pages/admin/ReviewManagementPage";
import ResultsPage from "../pages/user/ResultsPage";
import UserManagementPage from "../pages/admin/UserManagementPage";

const AppRouter = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<UserLayout />}>
            <Route path={APP_ROUTES.HOME} element={<LandingPage />} />
            <Route path={APP_ROUTES.RESULTS} element={<ResultsPage />} />
            <Route path={APP_ROUTES.CAR_DETAILS} element={<CarDetailsPage />} />
            <Route path={APP_ROUTES.PAYMENT} element={<PaymentPage />} />
            <Route
              path={APP_ROUTES.BOOKING_SUCCESS}
              element={<BookingSuccessPage />}
            />
            <Route path={APP_ROUTES.PROFILE} element={<ProfileLayout />} />
            <Route
              path={APP_ROUTES.PROFILE_VERIFICATION}
              element={<ProfileVerificationPage />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route element={<OwnerLayout />}>
            <Route
              path={APP_ROUTES.OWNER_DASHBOARD}
              element={<OwnerDashboardPage />}
            />
          </Route>

          <Route element={<AdminLayout />}>
            <Route
              path={APP_ROUTES.ADMIN_DASHBOARD}
              element={<AdminDashboardPage />}
            />
            <Route
              path={APP_ROUTES.ADMIN_USERS}
              element={<UserManagementPage />}
            />
            <Route
              path={APP_ROUTES.ADMIN_PAYMENTS}
              element={<PaymentManagementPage />}
            />
            <Route
              path={APP_ROUTES.ADMIN_REVIEWS}
              element={<ReviewManagementPage />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default AppRouter;
