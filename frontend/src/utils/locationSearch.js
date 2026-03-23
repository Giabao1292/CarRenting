const COUNTRY_TOKENS = ["vietnam", "viet nam", "việt nam"];
const ADMIN_AREA_TOKENS = [
  "duong",
  "đường",
  "phuong",
  "phường",
  "quan",
  "quận",
  "huyen",
  "huyện",
  "xa",
  "xã",
  "ward",
  "district",
  "street",
];

const CITY_ALIAS_MAP = {
  "da nang": "Da Nang",
  "đà nẵng": "Da Nang",
  "ho chi minh": "Ho Chi Minh",
  "hồ chí minh": "Ho Chi Minh",
  hcm: "Ho Chi Minh",
  "ha noi": "Ha Noi",
  "hà nội": "Ha Noi",
  "hoi an": "Hoi An",
  "hội an": "Hoi An",
  "khanh hoa": "Khanh Hoa",
  "khánh hòa": "Khanh Hoa",
  "binh duong": "Binh Duong",
  "bình dương": "Binh Duong",
  "can tho": "Can Tho",
  "cần thơ": "Can Tho",
  "da lat": "Da Lat",
  "đà lạt": "Da Lat",
};

const removeDiacritics = (value = "") => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

const sanitizeCityCandidate = (value = "") => {
  return value
    .trim()
    .replace(/^(thanh pho|thành phố|tp\.?|tinh|tỉnh)\s+/i, "")
    .replace(/\s+/g, " ");
};

const normalizeLookupKey = (value = "") => {
  return removeDiacritics(sanitizeCityCandidate(value)).toLowerCase().trim();
};

const isPostalCode = (value = "") => /^\d{4,}$/.test(value.trim());

const isAdministrativeSegment = (value = "") => {
  const lookup = normalizeLookupKey(value);
  return ADMIN_AREA_TOKENS.some((token) => lookup.includes(token));
};

export const normalizeCityName = (rawCity = "") => {
  const sanitized = sanitizeCityCandidate(rawCity);
  if (!sanitized) {
    return "";
  }

  const rawKey = rawCity.trim().toLowerCase();
  const normalizedKey = normalizeLookupKey(sanitized);

  if (CITY_ALIAS_MAP[rawKey]) {
    return CITY_ALIAS_MAP[rawKey];
  }

  if (CITY_ALIAS_MAP[normalizedKey]) {
    return CITY_ALIAS_MAP[normalizedKey];
  }

  return sanitized;
};

export const extractCityFromLocation = (locationText = "") => {
  if (!locationText || typeof locationText !== "string") {
    return "";
  }

  const segments = locationText
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!segments.length) {
    return "";
  }

  const meaningfulSegments = segments.filter((segment) => {
    const lowerSegment = segment.toLowerCase();

    if (COUNTRY_TOKENS.some((token) => lowerSegment.includes(token))) {
      return false;
    }

    if (isPostalCode(segment)) {
      return false;
    }

    return true;
  });

  if (!meaningfulSegments.length) {
    return "";
  }

  const knownCitySegment = meaningfulSegments.find((segment) => {
    const lookup = normalizeLookupKey(segment);
    return Boolean(CITY_ALIAS_MAP[lookup]);
  });

  if (knownCitySegment) {
    return normalizeCityName(knownCitySegment);
  }

  for (let index = meaningfulSegments.length - 1; index >= 0; index -= 1) {
    const segment = meaningfulSegments[index];

    if (isAdministrativeSegment(segment)) {
      continue;
    }

    return normalizeCityName(segment);
  }

  return normalizeCityName(meaningfulSegments[meaningfulSegments.length - 1]);
};

export const buildCitySearchExpression = (city) => {
  const normalizedCity = normalizeCityName(city);
  return normalizedCity ? `city:${normalizedCity}` : "";
};

export const parseSearchExpression = (searchExpression = "") => {
  const matcher = /^(\w+)([:<>])(.*)$/.exec(searchExpression || "");
  if (!matcher) {
    return null;
  }

  return {
    key: matcher[1],
    operator: matcher[2],
    value: matcher[3]?.trim() || "",
  };
};
