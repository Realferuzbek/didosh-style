"use client";

import React, { useEffect, useRef, useState } from "react";

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city: string;
  mapsLink: string;
  yandexLink: string;
}

export interface LocationPickerProps {
  value: LocationData | null;
  onChange: (location: LocationData) => void;
  error?: string;
}

const STORAGE_KEY = "ds_delivery_location";

const brandColor = "#B3133B"; // brand-deeprose

function getSavedLocation(): LocationData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      typeof parsed.lat === "number" &&
      typeof parsed.lng === "number" &&
      typeof parsed.address === "string" &&
      typeof parsed.city === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveLocation(location: LocationData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
}

const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange, error }) => {
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [showSavedBanner, setShowSavedBanner] = useState(false);
  const bannerTimeout = useRef<NodeJS.Timeout | null>(null);
  const savedLocation = useRef<LocationData | null>(null);

  // On mount: check for saved location
  useEffect(() => {
    const saved = getSavedLocation();
    savedLocation.current = saved;
    if (saved && !value) {
      onChange(saved);
    }
    if (saved && value && JSON.stringify(saved) === JSON.stringify(value)) {
      setShowSavedBanner(true);
      if (bannerTimeout.current) clearTimeout(bannerTimeout.current);
      bannerTimeout.current = setTimeout(() => setShowSavedBanner(false), 4000);
    }
    // eslint-disable-next-line
  }, []);

  // Save to localStorage on value change
  useEffect(() => {
    if (value) saveLocation(value);
  }, [value]);

  function handleBannerYes() {
    setShowSavedBanner(false);
  }
  function handleBannerChange() {
    setShowSavedBanner(false);
    // Reset to manual mode instead of passing null
    setManual(true);
    setManualInput("");
    // Optionally, you can also clear the saved location
    // localStorage.removeItem(STORAGE_KEY);
  }

  function requestLocation() {
    setLoading(true);
    setManual(false);
    if (!navigator.geolocation) {
      showErrorToast();
      setManual(true);
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        showErrorToast();
        setManual(true);
        setLoading(false);
      },
      { timeout: 10000 }
    );
  }

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uz,ru`
      );
      const data = await res.json();
      const address = data.address || {};
      const city =
        address.city || address.town || address.village || address.county || "";
      const street = address.road || address.pedestrian || "";
      const formatted = street ? `${street}, ${city}` : city;
      const locationData: LocationData = {
        lat,
        lng,
        address: formatted,
        city,
        mapsLink: `https://www.google.com/maps?q=${lat},${lng}`,
        yandexLink: `https://yandex.uz/maps/?ll=${lng},${lat}&z=17&pt=${lng},${lat}`,
      };
      onChange(locationData);
    } catch {
      showErrorToast();
      setManual(true);
    } finally {
      setLoading(false);
    }
  }

  function showErrorToast() {
    if (typeof window !== "undefined") {
      // Simple toast fallback
      window.alert("Joylashuv aniqlanmadi. Qo'lda kiriting.");
    }
  }

  function handleManualSubmit() {
    if (!manualInput.trim()) return;
    const locationData: LocationData = {
      lat: 0,
      lng: 0,
      address: manualInput,
      city: manualInput,
      mapsLink: "",
      yandexLink: "",
    };
    onChange(locationData);
    setManual(false);
    setManualInput("");
  }

  // UI
  return (
    <div className="bg-white rounded-3xl border-2 border-[#B3133B]/10 p-6 flex flex-col items-center w-full max-w-xl mx-auto shadow-sm">
      {showSavedBanner && (
        <div className="w-full mb-3 bg-[#F8E6EC] border border-[#B3133B]/20 rounded-xl px-4 py-2 flex items-center justify-between text-sm">
          <span>📍 Oldingi manzil saqlangan — to&apos;g&apos;rimi?</span>
          <div className="flex gap-2 ml-2">
            <button
              className="text-green-700 font-semibold hover:underline"
              onClick={handleBannerYes}
            >
              Ha, to&apos;g&apos;ri ✓
            </button>
            <button
              className="text-[#B3133B] font-semibold hover:underline"
              onClick={handleBannerChange}
            >
              O&apos;zgartirish
            </button>
          </div>
        </div>
      )}
      {!value && !manual && (
        <div className="flex flex-col items-center w-full">
          <div className="mb-4">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#F8E6EC" />
              <path
                d="M20 10a7 7 0 0 1 7 7c0 4.2-5.1 10.2-6.2 11.5a1 1 0 0 1-1.6 0C18.1 27.2 13 21.2 13 17a7 7 0 0 1 7-7Zm0 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                fill={brandColor}
              />
            </svg>
          </div>
          <div className="text-lg font-bold mb-1 text-[#B3133B]">Manzilingizni aniqlash</div>
          <div className="text-gray-500 mb-4 text-center">
            Yetkazib berish manzilini xaritadan belgilang
          </div>
          <button
            className="btn btn-primary px-6 py-3 rounded-xl text-base font-semibold"
            onClick={requestLocation}
            disabled={loading}
          >
            {loading ? "Yuklanmoqda..." : "📍 Joylashuvimni aniqlash"}
          </button>
        </div>
      )}
      {manual && (
        <div className="w-full flex flex-col items-center mt-2">
          <input
            type="text"
            className="input input-bordered w-full max-w-md rounded-xl mb-2"
            placeholder="Manzilingizni yozing"
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            onBlur={handleManualSubmit}
            onKeyDown={e => {
              if (e.key === "Enter") handleManualSubmit();
            }}
            autoFocus
          />
          <div className="text-xs text-gray-400">Joylashuv aniqlanmadi — manzilni qo&apos;lda kiriting.</div>
        </div>
      )}
      {value && (
        <div className="w-full flex flex-col items-center">
          <div className="flex flex-col items-center mb-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="16" fill="#A7F3D0" />
                <path
                  d="M10 17l4 4 8-8"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-green-700 font-bold text-lg">Manzil belgilandi ✓</div>
          </div>
          <div className="text-center mb-2">
            <div className="font-bold text-base text-gray-900">{value.address}</div>
            <div className="text-gray-500 text-sm">{value.city}</div>
          </div>
          <div className="flex gap-2 mb-3">
            {value.mapsLink && (
              <a
                href={value.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium"
              >
                Google Maps ↗
              </a>
            )}
            {value.yandexLink && (
              <a
                href={value.yandexLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium"
              >
                Yandex Maps ↗
              </a>
            )}
          </div>
          <button
            className="btn btn-outline px-4 py-2 rounded-xl text-sm font-semibold"
            onClick={() => {
              setManual(true);
              setManualInput("");
            }}
          >
            O&apos;zgartirish
          </button>
        </div>
      )}
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
};

export default LocationPicker;
