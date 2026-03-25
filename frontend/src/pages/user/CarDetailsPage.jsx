import { useEffect, useMemo, useState } from "react";
import { Alert, Col, Container, Row, Spinner } from "react-bootstrap";
import { useParams, useSearchParams } from "react-router-dom";
import BookingCard from "../../components/user/car-details/BookingCard";
import CarImageGallery from "../../components/user/car-details/CarImageGallery";
import CarInfoSection from "../../components/user/car-details/CarInfoSection";
import SimilarCarsSection from "../../components/user/car-details/SimilarCarsSection";
import { getCarById, getCars, getPromotions } from "../../services/carService";
import {
  extractCityFromLocation,
  normalizeCityName,
} from "../../utils/locationSearch";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const EARTH_RADIUS_METERS = 6378137;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatTransmission = (transmission = "") => {
  if (!transmission) {
    return "Số tự động";
  }

  const normalized = transmission.toLowerCase();
  if (normalized === "automatic") {
    return "Số tự động";
  }

  if (normalized === "manual") {
    return "Số sàn";
  }

  return transmission;
};

const computeAverageRating = (reviews = []) => {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return 0;
  }

  const total = reviews.reduce(
    (sum, review) => sum + toNumber(review?.rating),
    0,
  );
  return total / reviews.length;
};

const toRadians = (value) => (value * Math.PI) / 180;
const toDegrees = (value) => (value * 180) / Math.PI;

const getDestinationPoint = (lat, lng, bearing, distanceMeters) => {
  const angularDistance = distanceMeters / EARTH_RADIUS_METERS;
  const bearingRadians = toRadians(bearing);
  const latRadians = toRadians(lat);
  const lngRadians = toRadians(lng);

  const nextLat = Math.asin(
    Math.sin(latRadians) * Math.cos(angularDistance) +
      Math.cos(latRadians) *
        Math.sin(angularDistance) *
        Math.cos(bearingRadians),
  );

  const nextLng =
    lngRadians +
    Math.atan2(
      Math.sin(bearingRadians) *
        Math.sin(angularDistance) *
        Math.cos(latRadians),
      Math.cos(angularDistance) - Math.sin(latRadians) * Math.sin(nextLat),
    );

  return {
    lat: toDegrees(nextLat),
    lng: toDegrees(nextLng),
  };
};

const buildCirclePath = ({ lat, lng }, radiusMeters = 280, points = 30) => {
  const pathPoints = [];

  for (let i = 0; i <= points; i += 1) {
    const bearing = (360 / points) * i;
    const point = getDestinationPoint(lat, lng, bearing, radiusMeters);
    pathPoints.push(`${point.lat.toFixed(6)},${point.lng.toFixed(6)}`);
  }

  return pathPoints.join("|");
};

const buildGoogleMapAssets = (address = "", coordinates = null) => {
  const normalizedAddress = String(address || "").trim();
  if (!normalizedAddress) {
    return {
      mapImage: "",
      mapEmbedUrl: "",
      mapLink: "",
    };
  }

  const encodedAddress = encodeURIComponent(normalizedAddress);
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  if (!GOOGLE_MAPS_API_KEY) {
    return {
      mapImage: "",
      mapEmbedUrl,
      mapLink,
    };
  }

  const hasCoordinates =
    coordinates &&
    Number.isFinite(Number(coordinates.lat)) &&
    Number.isFinite(Number(coordinates.lng));

  const centerValue = hasCoordinates
    ? `${Number(coordinates.lat)},${Number(coordinates.lng)}`
    : normalizedAddress;
  const markerValue = hasCoordinates ? centerValue : normalizedAddress;
  const circlePath = hasCoordinates
    ? buildCirclePath(
        {
          lat: Number(coordinates.lat),
          lng: Number(coordinates.lng),
        },
        360,
      )
    : "";

  const staticMapParams = new URLSearchParams({
    center: centerValue,
    zoom: "15",
    size: "1200x600",
    scale: "2",
    maptype: "roadmap",
    markers: `size:mid|color:0x16a34a|${markerValue}`,
    key: GOOGLE_MAPS_API_KEY,
  });

  if (circlePath) {
    staticMapParams.append(
      "path",
      `color:0x16a34aff|fillcolor:0x16a34a55|weight:3|${circlePath}`,
    );
  }

  return {
    mapImage: `https://maps.googleapis.com/maps/api/staticmap?${staticMapParams.toString()}`,
    mapEmbedUrl,
    mapLink,
  };
};

const geocodeAddress = async (address) => {
  const normalizedAddress = String(address || "").trim();
  if (!normalizedAddress || !GOOGLE_MAPS_API_KEY) {
    return null;
  }

  const params = new URLSearchParams({
    address: normalizedAddress,
    language: "vi",
    region: "vn",
    key: GOOGLE_MAPS_API_KEY,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
  );

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  if (payload?.status !== "OK") {
    return null;
  }

  const location = payload?.results?.[0]?.geometry?.location;

  const lat = Number(location?.lat);
  const lng = Number(location?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
};

const mapCarDetails = (car, mapCoordinates = null) => {
  if (!car) {
    return null;
  }

  const originalPricePerDay = toNumber(
    car.originalPricePerDay ?? car.pricePerDay,
    0,
  );

  const safeFeatures = Array.isArray(car.features)
    ? car.features
        .map((feature) => {
          if (typeof feature === "string") {
            return { name: feature, icon: null };
          }

          return {
            name: feature?.name || "",
            icon: feature?.icon || null,
          };
        })
        .filter((feature) => feature.name)
    : [];

  const mappedReviews = Array.isArray(car.reviews)
    ? car.reviews.map((review, index) => ({
        id: `${review?.reviewerName || "reviewer"}-${index}`,
        name: review?.reviewerName || "Người dùng",
        date: review?.createdAt
          ? new Date(review.createdAt).toLocaleDateString("vi-VN")
          : "",
        rating: toNumber(review?.rating, 0),
        comment: review?.comment || "",
        avatar: review?.avtUrl || "https://i.pravatar.cc/100?img=8",
      }))
    : [];

  const averageRating = computeAverageRating(mappedReviews);
  const roundedRating = averageRating > 0 ? averageRating.toFixed(1) : "0.0";

  const busySlots = Array.isArray(car.busySlots)
    ? car.busySlots
        .map((slot) => ({
          start: slot?.start || "",
          end: slot?.end || "",
        }))
        .filter((slot) => slot.start && slot.end)
    : [];

  const heroImages = (() => {
    const imageEntries = Array.isArray(car.images)
      ? car.images
          .map((item) => ({
            url: String(item?.imageUrl || "").trim(),
            isPrimary: Boolean(item?.isPrimary),
          }))
          .filter((item) => item.url)
      : [];

    if (!imageEntries.length) {
      const fallbackImage = String(car.imageUrl || "").trim();
      return fallbackImage ? [fallbackImage] : [];
    }

    const primaryImage = imageEntries.find((item) => item.isPrimary);
    const nonPrimaryImages = imageEntries
      .filter((item) => !item.isPrimary)
      .map((item) => item.url);

    if (!primaryImage) {
      return imageEntries.map((item) => item.url);
    }

    return [primaryImage.url, ...nonPrimaryImages];
  })();

  const mapAssets = buildGoogleMapAssets(car.address || "", mapCoordinates);

  return {
    id: car.id,
    model: car.name || "Chi tiết xe",
    location: car.address || "",
    rating: roundedRating,
    trips: mappedReviews.length,
    badges: [],
    specs: [
      `${toNumber(car.seats, 4)} Seats`,
      formatTransmission(car.transmission),
    ],
    pricePerDay: originalPricePerDay,
    pricePerHour: toNumber(car.pricePerHour, 0),
    originalPricePerDay,
    heroImages,
    description: [
      `Xe ${car.name || ""} có ${toNumber(car.seats, 4)} chỗ ngồi và ${formatTransmission(car.transmission)}.`,
      "Thông tin chi tiết và tình trạng xe sẽ được xác nhận lại trong quá trình đặt xe.",
    ],
    features: safeFeatures,
    mapImage: mapAssets.mapImage,
    mapEmbedUrl: mapAssets.mapEmbedUrl,
    mapLink: mapAssets.mapLink,
    reviews: mappedReviews,
    busySlots,
  };
};

const CarDetailsPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [carData, setCarData] = useState(null);
  const [mapCoordinates, setMapCoordinates] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [similarCars, setSimilarCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadCarDetails = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [carResponse, promotionsResponse] = await Promise.all([
          getCarById(id),
          getPromotions(),
        ]);

        if (isCancelled) {
          return;
        }

        setCarData(carResponse);
        setPromotions(promotionsResponse);
      } catch {
        if (!isCancelled) {
          setErrorMessage("Không tải được thông tin xe. Vui lòng thử lại sau.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    if (!id) {
      setErrorMessage("Thiếu mã xe để hiển thị chi tiết.");
      setIsLoading(false);
      return undefined;
    }

    loadCarDetails();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let isCancelled = false;

    const loadCoordinates = async () => {
      if (!carData?.address || !GOOGLE_MAPS_API_KEY) {
        setMapCoordinates(null);
        return;
      }

      // Reset immediately to avoid showing previous car coordinates while fetching.
      setMapCoordinates(null);

      try {
        const coordinates = await geocodeAddress(carData.address);
        if (!isCancelled) {
          setMapCoordinates(coordinates);
        }
      } catch {
        if (!isCancelled) {
          setMapCoordinates(null);
        }
      }
    };

    loadCoordinates();

    return () => {
      isCancelled = true;
    };
  }, [carData?.address]);

  useEffect(() => {
    let isCancelled = false;

    const loadSimilarCars = async () => {
      if (!carData?.id) {
        setSimilarCars([]);
        return;
      }

      const cityFromAddress = normalizeCityName(
        extractCityFromLocation(carData.address || ""),
      );

      try {
        const response = await getCars({
          page: 0,
          size: 5,
          city: cityFromAddress,
          sort: "avgRating,desc",
        });

        if (isCancelled) {
          return;
        }

        const filteredCars = (response?.cars || []).filter(
          (car) => Number(car.id) !== Number(carData.id),
        );

        setSimilarCars(filteredCars.slice(0, 4));
      } catch {
        if (!isCancelled) {
          setSimilarCars([]);
        }
      }
    };

    loadSimilarCars();

    return () => {
      isCancelled = true;
    };
  }, [carData?.address, carData?.id]);

  const carDetails = useMemo(
    () => mapCarDetails(carData, mapCoordinates),
    [carData, mapCoordinates],
  );

  const initialSchedule = useMemo(() => {
    const pickupAt = String(searchParams.get("pickupAt") || "").trim();
    const dropoffAt = String(searchParams.get("dropoffAt") || "").trim();

    const parseDateTimeValue = (value) => {
      const match = /^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})(?::\d{2})?$/.exec(
        value,
      );

      if (!match) {
        return null;
      }

      return {
        date: match[1],
        time: match[2],
      };
    };

    const pickup = parseDateTimeValue(pickupAt);
    const dropoff = parseDateTimeValue(dropoffAt);
    const rawBookingId = Number(searchParams.get("bookingId") || 0);
    const bookingId =
      Number.isFinite(rawBookingId) && rawBookingId > 0 ? rawBookingId : null;

    if (!pickup || !dropoff) {
      return null;
    }

    const pickupDateTime = new Date(`${pickup.date}T${pickup.time}:00`);
    const dropoffDateTime = new Date(`${dropoff.date}T${dropoff.time}:00`);

    if (
      Number.isNaN(pickupDateTime.getTime()) ||
      Number.isNaN(dropoffDateTime.getTime()) ||
      dropoffDateTime <= pickupDateTime
    ) {
      return null;
    }

    return {
      bookingId,
      pickupDate: pickup.date,
      pickupTime: pickup.time,
      returnDate: dropoff.date,
      returnTime: dropoff.time,
    };
  }, [searchParams]);

  if (isLoading) {
    return (
      <section className="bg-white py-4">
        <Container fluid="xl" className="py-5 text-center">
          <Spinner animation="border" role="status" />
        </Container>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="bg-white py-4">
        <Container fluid="xl" className="py-4">
          <Alert variant="warning" className="mb-0">
            {errorMessage}
          </Alert>
        </Container>
      </section>
    );
  }

  if (!carDetails) {
    return (
      <section className="bg-white py-4">
        <Container fluid="xl" className="py-4">
          <Alert variant="warning" className="mb-0">
            Không tìm thấy thông tin xe.
          </Alert>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-white py-4">
      <Container fluid="xl" className="py-4">
        <CarImageGallery images={carDetails.heroImages} />

        <Row className="g-4">
          <Col lg={8}>
            <CarInfoSection car={carDetails} />
          </Col>
          <Col lg={4} className="d-none d-lg-block">
            <BookingCard
              car={carDetails}
              promotions={promotions}
              initialSchedule={initialSchedule}
            />
          </Col>
        </Row>

        <SimilarCarsSection cars={similarCars} />
      </Container>
    </section>
  );
};

export default CarDetailsPage;
