import { useEffect, useState } from "react";
import { Alert, Col, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../app/routes";
import {
  getBestPromotion,
  getCars,
  getPromotions,
} from "../../../services/carService";
import { buildCitySearchExpression } from "../../../utils/locationSearch";
import { getSearchLocation } from "../../../utils/locationStorage";
import { featuredCars } from "../../../data/landingData";
import ResultCard from "../results/ResultCard";

const FeaturedSection = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const mapFallbackCars = featuredCars.map((car, index) => ({
      id: `featured-fallback-${index}`,
      title: car.title,
      image: car.image,
      location: car.location,
      displayPrice: (car.price || "").replace(/\$/g, "") || "490K",
      displayOldPrice: "",
      priceUnit: "/ngày",
      pickupLabel: "Tự nhận xe",
      flashLabel: "Flash Sale",
      specs: [
        { icon: "person", value: "5", label: "Chỗ" },
        { icon: "tune", value: "Số tự động", label: "Hộp số" },
        { icon: "local_gas_station", value: "Xăng", label: "Nhiên liệu" },
      ],
    }));

    const loadFeaturedCars = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const savedLocation = getSearchLocation();
        const city = savedLocation?.city || "";
        let bestPromotion = null;

        try {
          const promotions = await getPromotions();
          bestPromotion = getBestPromotion(promotions);
        } catch {
          bestPromotion = null;
        }

        const response = await getCars({
          page: 0,
          size: 16,
          city,
          sort: "avgRating,desc",
          bestPromotion,
        });

        if (isCancelled) {
          return;
        }

        setCars(response.cars);
      } catch {
        if (isCancelled) {
          return;
        }

        setCars(mapFallbackCars);
        setErrorMessage(
          "Không thể tải xe nổi bật từ server. Đang hiển thị dữ liệu mẫu.",
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadFeaturedCars();

    return () => {
      isCancelled = true;
    };
  }, []);

  const displayCars = cars.slice(0, 16);

  const handleViewMore = () => {
    const city = getSearchLocation()?.city || "";
    const expression = buildCitySearchExpression(city);

    if (!expression) {
      navigate(APP_ROUTES.RESULTS);
      return;
    }

    navigate(`${APP_ROUTES.RESULTS}?search=${encodeURIComponent(expression)}`);
  };

  if (isLoading) {
    return (
      <section className="mb-5 py-4 text-center">
        <Spinner animation="border" role="status" />
      </section>
    );
  }

  return (
    <section className="mb-5">
      <div className="d-flex justify-content-center align-items-center mb-3">
        <h2 className="h3 fw-bold mb-0">Xe nổi bật</h2>
      </div>

      {errorMessage ? (
        <Alert variant="warning" className="py-2 mb-3 small">
          {errorMessage}
        </Alert>
      ) : null}

      <Row xs={1} sm={2} lg={4} className="g-3 landing-featured-grid">
        {displayCars.map((car) => (
          <Col key={car.id || car.title}>
            <ResultCard car={car} />
          </Col>
        ))}
      </Row>

      {!displayCars.length ? (
        <div className="text-muted-soft mt-3">Hiện chưa có xe nổi bật.</div>
      ) : null}

      {displayCars.length ? (
        <div className="text-center mt-4">
          <button
            type="button"
            className="landing-view-more-btn"
            onClick={handleViewMore}
          >
            XEM THÊM
          </button>
        </div>
      ) : null}
    </section>
  );
};

export default FeaturedSection;
