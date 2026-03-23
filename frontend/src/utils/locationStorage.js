const SEARCH_LOCATION_KEY = "searchLocation";

export const saveSearchLocation = (payload) => {
  if (!payload || typeof payload !== "object") {
    return;
  }

  localStorage.setItem(SEARCH_LOCATION_KEY, JSON.stringify(payload));
};

export const getSearchLocation = () => {
  const rawValue = localStorage.getItem(SEARCH_LOCATION_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    if (!parsedValue || typeof parsedValue !== "object") {
      return null;
    }

    return {
      locationLabel: parsedValue.locationLabel || "",
      city: parsedValue.city || "",
      source: parsedValue.source || "manual",
    };
  } catch {
    return null;
  }
};
