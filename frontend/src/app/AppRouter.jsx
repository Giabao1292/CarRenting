import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import ErrorBoundary from "./ErrorBoundary";
import { APP_ROUTES } from "./routes";
import AdminLayout from "../layout/admin/AdminLayout";
import OwnerLayout from "../layout/owner/OwnerLayout";
import UserLayout from "../layout/user/UserLayout";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import BookingManagementPage from "../pages/admin/BookingManagementPage";
import CarManagementPage from "../pages/admin/CarManagementPage";
import BookingSuccessPage from "../pages/user/BookingSuccessPage";
import CarDetailsPage from "../pages/user/CarDetailsPage";
import OwnerRegistrationPage from "../pages/user/OwnerRegistrationPage";
import ProfileLayout from "../layout/profile/ProfileLayout";
import LandingPage from "../pages/user/LandingPage";
import NotFoundPage from "../pages/common/NotFoundPage";
import OwnerDashboardPage from "../pages/owner/OwnerDashboardPage";
import PaymentPage from "../pages/user/PaymentPage";
import PaymentManagementPage from "../pages/admin/PaymentManagementPage";
import OwnerManagementPage from "../pages/admin/OwnerManagementPage";
import ProfileVerificationPage from "../pages/user/ProfileVerificationPage";
import PromotionManagementPage from "../pages/admin/PromotionManagementPage";
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
              path={APP_ROUTES.PAYMENT_SUCCESS}
              element={<BookingSuccessPage />}
            />
            <Route
              path={APP_ROUTES.PAYMENT_CANCEL}
              element={<BookingSuccessPage />}
            />
            <Route
              path={APP_ROUTES.BOOKING_SUCCESS}
              element={<BookingSuccessPage />}
            />
            <Route path={APP_ROUTES.PROFILE} element={<ProfileLayout />} />
            <Route
              path={APP_ROUTES.PROFILE_VERIFICATION}
              element={<ProfileVerificationPage />}
            />
            <Route
              path={APP_ROUTES.OWNER_REGISTER}
              element={<OwnerRegistrationPage />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={["OWNER"]}>
                <OwnerLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path={APP_ROUTES.OWNER_DASHBOARD}
              element={<OwnerDashboardPage />}
            />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path={APP_ROUTES.ADMIN_DASHBOARD}
              element={<AdminDashboardPage />}
            />
            <Route
              path={APP_ROUTES.ADMIN_CARS}
              element={<CarManagementPage />}
            />
            <Route
              path={APP_ROUTES.ADMIN_USERS}
              element={<UserManagementPage />}
            />
            <Route
              path={APP_ROUTES.ADMIN_OWNERS}
              element={<OwnerManagementPage />}
            />
            <Route
              path={APP_ROUTES.ADMIN_BOOKINGS}
              element={<BookingManagementPage />}
            />
            <Route
              path={APP_ROUTES.ADMIN_PAYMENTS}
              element={<PaymentManagementPage />}
            />
            <Route
              path={APP_ROUTES.ADMIN_REVIEWS}
              element={<ReviewManagementPage />}
            />
            <Route
              path={APP_ROUTES.ADMIN_PROMOTIONS}
              element={<PromotionManagementPage />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default AppRouter;
