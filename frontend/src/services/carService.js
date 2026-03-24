import apiClient from "../api/axios";
import {
  buildCitySearchExpression,
  normalizeCityName,
} from "../utils/locationSearch";

const formatCompactVnd = (amount) => {
  if (typeof amount !== "number") {
    return "";
  }

  const thousandValue = Math.round(amount / 1000);
  return `${thousandValue}K`;
};

const formatTransmission = (transmission) => {
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

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const isPromotionActive = (promotion, now = new Date()) => {
  if (!promotion) {
    return false;
  }

  const startAt = promotion.startAt ? new Date(promotion.startAt) : null;
  const endAt = promotion.endAt ? new Date(promotion.endAt) : null;

  if (
    startAt instanceof Date &&
    !Number.isNaN(startAt.getTime()) &&
    now < startAt
  ) {
    return false;
  }

  if (endAt instanceof Date && !Number.isNaN(endAt.getTime()) && now > endAt) {
    return false;
  }

  if (typeof promotion.usageLimit === "number" && promotion.usageLimit <= 0) {
    return false;
  }

  return toNumber(promotion.discountValue) > 0;
};

export const mapVehicleToCard = (vehicle) => {
  const locationLabel =
    vehicle.location || normalizeCityName(vehicle.city || "") || "";
  const normalizedRating = Number(vehicle.avgRating ?? vehicle.rating);

  return {
    id: vehicle.id,
    title: vehicle.name,
    image: vehicle.imageUrl,
    location: locationLabel,
    displayPrice: formatCompactVnd(vehicle.pricePerDay),
    displayOldPrice: vehicle.originalPricePerDay
      ? formatCompactVnd(Number(vehicle.originalPricePerDay))
      : "",
    priceUnit: "/ngày",
    pickupLabel: "Tự nhận xe",
    flashLabel:
      vehicle.discountPercent > 0
        ? `Giảm ${vehicle.discountPercent}%`
        : "Flash Sale",
    specs: [
      {
        icon: "person",
        value: String(vehicle.seats || 4),
        label: "Chỗ",
      },
      {
        icon: "tune",
        value: formatTransmission(vehicle.transmission),
        label: "Hộp số",
      },
      {
        icon: "local_gas_station",
        value: "Xăng",
        label: "Nhiên liệu",
      },
    ],
    rating: Number.isFinite(normalizedRating) ? normalizedRating : null,
  };
};

export const getCars = async ({
  page = 0,
  size = 16,
  city = "",
  brand = "",
  seating = "",
  tranmission = "",
  address = "",
  pickupAt = "",
  dropoffAt = "",
  sort = "",
} = {}) => {
  const searchExpressions = [];
  const citySearch = buildCitySearchExpression(city);
  if (citySearch) {
    searchExpressions.push(citySearch);
  }

  if (brand) {
    searchExpressions.push(`brand:${brand}`);
  }

  if (seating) {
    searchExpressions.push(`seating:${seating}`);
  }

  if (tranmission) {
    searchExpressions.push(`tranmission:${tranmission}`);
  }

  if (address) {
    searchExpressions.push(`address:${address}`);
  }

  if (pickupAt) {
    searchExpressions.push(`pickupAt:${pickupAt}`);
  }

  if (dropoffAt) {
    searchExpressions.push(`dropoffAt:${dropoffAt}`);
  }

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));

  if (sort) {
    params.set("sort", sort);
  }

  searchExpressions.forEach((search) => {
    params.append("search", search);
  });

  const response = await apiClient.get("/cars", { params });
  const payload = response?.data?.data || {};
  const cars = Array.isArray(payload.content)
    ? payload.content.map(mapVehicleToCard)
    : [];

  return {
    cars,
    pageInfo: {
      totalElements: payload.totalElements || 0,
      totalPages: payload.totalPages || 0,
      number: payload.number || 0,
      size: payload.size || size,
    },
  };
};

export const getCarById = async (id) => {
  if (!id) {
    throw new Error("Car id is required");
  }

  const response = await apiClient.get(`/cars/${id}`);
  return response?.data?.data || null;
};

export const getPromotions = async () => {
  const response = await apiClient.get("/promotions");
  const promotions = response?.data?.data;
  return Array.isArray(promotions) ? promotions : [];
};

export const getBestPromotion = (promotions = [], now = new Date()) => {
  const validPromotions = promotions.filter((promotion) =>
    isPromotionActive(promotion, now),
  );

  if (!validPromotions.length) {
    return null;
  }

  return validPromotions.reduce((best, current) => {
    return toNumber(current.discountValue) > toNumber(best.discountValue)
      ? current
      : best;
  });
};
