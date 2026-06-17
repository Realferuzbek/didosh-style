'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

interface DeliveryMapProps {
  lat: number
  lng: number
}

export default function DeliveryMap({ lat, lng }: DeliveryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // ── BUG FIX 1: cancellation flag ──────────────────────────────────────
    // React Strict Mode invokes effects twice. The cleanup below sets this
    // flag to true, so the first async import's callback aborts before
    // calling L.map() — preventing the "Map container is already initialized"
    // crash on the second invocation.
    let cancelled = false

    // Tear down any previous synchronous instance before the async import
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    import('leaflet').then((L) => {
      // Abort if cleanup already ran, or container unmounted
      if (cancelled || !containerRef.current) return

      // Secondary guard: if Leaflet already owns this node (race in dev), bail
      if ((containerRef.current as unknown as { _leaflet_id?: number })._leaflet_id != null) return

      const map = L.map(containerRef.current, {
        center:             [lat, lng],
        zoom:               17,          // zoom 17 ≈ 100–150 m scale; ESRI has coverage here
        zoomControl:        false,
        attributionControl: false,       // removes the attribution bar entirely
        dragging:           false,
        touchZoom:          false,
        scrollWheelZoom:    false,
        doubleClickZoom:    false,
        boxZoom:            false,
        keyboard:           false,
      })

      // ── BUG FIX 2: maxNativeZoom ──────────────────────────────────────────
      // ESRI World Imagery has no satellite tiles for Central Asia at zoom 18,
      // causing the "Map data not yet available" grey tiles.
      // maxNativeZoom: 17 tells Leaflet to load zoom-17 tiles and scale them
      // up when the map view is at a higher zoom — real imagery, never grey.
L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
  subdomains:     ['0', '1', '2', '3'],
  maxZoom:        21,
  maxNativeZoom:  20,   // Google has full high-res coverage for Uzbekistan at zoom 20
}).addTo(map)

      // Custom brand-colored "Bu siz" pin marker
      const icon = L.divIcon({
        html: `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -100%);
            pointer-events: none;
          ">
            <div style="
              background: #D4698A;
              color: white;
              font-size: 11px;
              font-weight: 700;
              padding: 3px 10px;
              border-radius: 999px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.35);
              white-space: nowrap;
            ">📍 Bu siz</div>
            <div style="
              width: 0;
              height: 0;
              border-left: 7px solid transparent;
              border-right: 7px solid transparent;
              border-top: 9px solid #D4698A;
              margin-top: -1px;
            "></div>
          </div>
        `,
        className:  '',
        iconSize:   [0, 0],
        iconAnchor: [0, 0],
      })

      L.marker([lat, lng], { icon }).addTo(map)

      mapRef.current = map
    })

    return () => {
      cancelled = true          // cancels any still-pending async import
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [lat, lng])

  return (
    <div
      ref={containerRef}
      className="w-full h-[210px] sm:h-[290px] rounded-xl overflow-hidden"
    />
  )
}