const VIETNAM_PROVINCES_API_BASE = "https://provinces.open-api.vn/api";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const requestJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Không thể tải dữ liệu địa chỉ.");
  }

  return response.json();
};

export const getProvinces = async () => {
  const payload = await requestJson(`${VIETNAM_PROVINCES_API_BASE}/p/`);
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item) => ({
      code: toNumber(item?.code),
      name: String(item?.name || "").trim(),
    }))
    .filter((item) => item.code && item.name)
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
};

export const getDistrictsByProvinceCode = async (provinceCode) => {
  if (!provinceCode) {
    return [];
  }

  const payload = await requestJson(
    `${VIETNAM_PROVINCES_API_BASE}/p/${provinceCode}?depth=2`,
  );
  const districts = Array.isArray(payload?.districts) ? payload.districts : [];

  return districts
    .map((item) => ({
      code: toNumber(item?.code),
      name: String(item?.name || "").trim(),
    }))
    .filter((item) => item.code && item.name)
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
};

export const getWardsByDistrictCode = async (districtCode) => {
  if (!districtCode) {
    return [];
  }

  const payload = await requestJson(
    `${VIETNAM_PROVINCES_API_BASE}/d/${districtCode}?depth=2`,
  );
  const wards = Array.isArray(payload?.wards) ? payload.wards : [];

  return wards
    .map((item) => ({
      code: toNumber(item?.code),
      name: String(item?.name || "").trim(),
    }))
    .filter((item) => item.code && item.name)
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
};

export const getCurrentCoordinates = () => {
  if (!navigator.geolocation) {
    return Promise.reject(
      new Error("Trình duyệt không hỗ trợ lấy vị trí hiện tại."),
    );
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position?.coords?.latitude);
        const lng = Number(position?.coords?.longitude);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          reject(new Error("Không lấy được tọa độ hợp lệ."));
          return;
        }

        resolve({ lat, lng });
      },
      () => {
        reject(
          new Error(
            "Không thể truy cập vị trí hiện tại. Vui lòng kiểm tra quyền truy cập GPS.",
          ),
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  });
};

export const reverseGeocodeCoordinates = async (lat, lng) => {
  const normalizedLat = Number(lat);
  const normalizedLng = Number(lng);

  if (!Number.isFinite(normalizedLat) || !Number.isFinite(normalizedLng)) {
    return null;
  }

  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(normalizedLat),
    lon: String(normalizedLng),
    addressdetails: "1",
    "accept-language": "vi",
  });

  const payload = await requestJson(
    `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
  );

  const address = payload?.address || {};
  const road = String(address.road || address.neighbourhood || "").trim();
  const suburb = String(address.suburb || "").trim();
  const ward = String(address.quarter || address.suburb || "").trim();
  const district = String(
    address.city_district || address.district || address.county || "",
  ).trim();
  const province = String(
    address.state || address.city || address.province || "",
  ).trim();

  const fullAddress = [
    road,
    suburb && suburb !== ward ? suburb : "",
    ward,
    district,
    province,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    fullAddress: fullAddress || String(payload?.display_name || "").trim(),
    streetAddress: road,
    ward,
    district,
    province,
  };
};
