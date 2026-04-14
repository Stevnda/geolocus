import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  GeometryCollection,
} from "geojson";
import mapboxgl, { LngLatBounds } from "mapbox-gl";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

const MAP_SOURCE_ID = "uploaded-geojson";
const FILL_LAYER_ID = "uploaded-geojson-fill";
const LINE_LAYER_ID = "uploaded-geojson-line";
const POINT_LAYER_ID = "uploaded-geojson-point";
const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

type UploadState = {
  fileName: string;
  featureCount: number;
  geometrySummary: string;
};

const baseCollection: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

const normalizeGeoJSON = (
  value: unknown,
): FeatureCollection<Geometry, GeoJsonProperties> => {
  if (!value || typeof value !== "object" || !("type" in value)) {
    throw new Error("文件内容不是合法的 GeoJSON。");
  }

  const typedValue = value as {
    type: string;
    features?: Feature[];
    geometry?: Geometry;
  };

  if (typedValue.type === "FeatureCollection") {
    return {
      type: "FeatureCollection",
      features: Array.isArray(typedValue.features) ? typedValue.features : [],
    };
  }

  if (typedValue.type === "Feature") {
    return {
      type: "FeatureCollection",
      features: [typedValue as Feature<Geometry, GeoJsonProperties>],
    };
  }

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: typedValue as Geometry,
        properties: {},
      },
    ],
  };
};

const visitCoordinates = (
  coordinates: unknown,
  visitor: (lng: number, lat: number) => void,
) => {
  if (!Array.isArray(coordinates)) return;
  if (
    coordinates.length >= 2 &&
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number"
  ) {
    visitor(coordinates[0], coordinates[1]);
    return;
  }

  for (const item of coordinates) {
    visitCoordinates(item, visitor);
  }
};

const visitGeometry = (
  geometry: Geometry | GeometryCollection,
  visitor: (lng: number, lat: number) => void,
) => {
  if (geometry.type === "GeometryCollection") {
    for (const childGeometry of geometry.geometries) {
      visitGeometry(childGeometry, visitor);
    }
    return;
  }

  visitCoordinates(geometry.coordinates, visitor);
};

const getBounds = (collection: FeatureCollection) => {
  let bounds: LngLatBounds | null = null;

  for (const feature of collection.features) {
    if (!feature.geometry) continue;
    visitGeometry(feature.geometry, (lng, lat) => {
      if (!bounds) {
        bounds = new LngLatBounds([lng, lat], [lng, lat]);
        return;
      }
      bounds.extend([lng, lat]);
    });
  }

  return bounds;
};

const getGeometrySummary = (collection: FeatureCollection) => {
  const counts = new Map<string, number>();

  for (const feature of collection.features) {
    const geometryType = feature.geometry?.type ?? "Null";
    counts.set(geometryType, (counts.get(geometryType) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([geometryType, count]) => `${geometryType} × ${count}`)
    .join(" / ");
};

const ensureLayers = (map: mapboxgl.Map) => {
  if (!map.getSource(MAP_SOURCE_ID)) {
    map.addSource(MAP_SOURCE_ID, {
      type: "geojson",
      data: baseCollection,
    });
  }

  if (!map.getLayer(FILL_LAYER_ID)) {
    map.addLayer({
      id: FILL_LAYER_ID,
      type: "fill",
      source: MAP_SOURCE_ID,
      filter: [
        "in",
        ["geometry-type"],
        ["literal", ["Polygon", "MultiPolygon"]],
      ],
      paint: {
        "fill-color": "#0f766e",
        "fill-opacity": 0.18,
      },
    });
  }

  if (!map.getLayer(LINE_LAYER_ID)) {
    map.addLayer({
      id: LINE_LAYER_ID,
      type: "line",
      source: MAP_SOURCE_ID,
      filter: [
        "in",
        ["geometry-type"],
        [
          "literal",
          ["LineString", "MultiLineString", "Polygon", "MultiPolygon"],
        ],
      ],
      paint: {
        "line-color": "#f97316",
        "line-width": 2,
      },
    });
  }

  if (!map.getLayer(POINT_LAYER_ID)) {
    map.addLayer({
      id: POINT_LAYER_ID,
      type: "circle",
      source: MAP_SOURCE_ID,
      filter: ["in", ["geometry-type"], ["literal", ["Point", "MultiPoint"]]],
      paint: {
        "circle-radius": 5,
        "circle-color": "#1d4ed8",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#eff6ff",
      },
    });
  }
};

export const App = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    if (!mapboxAccessToken) {
      throw new Error(
        "缺少 Mapbox 配置。请在 package/client/.env 中设置 VITE_MAPBOX_ACCESS_TOKEN。",
      );
    }

    mapboxgl.accessToken = mapboxAccessToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [116.3913, 39.9075],
      zoom: 3,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));

    map.on("load", () => {
      ensureLayers(map);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const resizeTimer = window.setTimeout(() => {
      mapRef.current?.resize();
    }, 180);

    return () => {
      window.clearTimeout(resizeTimer);
    };
  }, [panelCollapsed]);

  const helperText = useMemo(() => {
    if (uploadState) {
      return `${uploadState.fileName} · ${uploadState.featureCount} 个要素 · ${uploadState.geometrySummary}`;
    }
    return "支持 .geojson 和 .json，上传后会自动缩放到全图。";
  }, [uploadState]);

  const updateMapData = (collection: FeatureCollection, fileName: string) => {
    const map = mapRef.current;
    if (!map) return;

    ensureLayers(map);

    const source = map.getSource(MAP_SOURCE_ID) as
      | mapboxgl.GeoJSONSource
      | undefined;
    source?.setData(collection);

    const bounds = getBounds(collection);
    if (bounds) {
      map.fitBounds(bounds, {
        padding: 48,
        duration: 800,
        maxZoom: 15,
      });
    }

    setUploadState({
      fileName,
      featureCount: collection.features.length,
      geometrySummary: getGeometrySummary(collection) || "无几何对象",
    });
    setErrorMessage("");
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const collection = normalizeGeoJSON(parsed);

      if (collection.features.length === 0) {
        throw new Error("GeoJSON 中没有可显示的要素。");
      }

      updateMapData(collection, file.name);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "GeoJSON 读取失败。";
      setErrorMessage(message);
    }
  };

  const clearMap = () => {
    const map = mapRef.current;
    const source = map?.getSource(MAP_SOURCE_ID) as
      | mapboxgl.GeoJSONSource
      | undefined;
    source?.setData(baseCollection);
    setUploadState(null);
    setErrorMessage("");
  };

  return (
    <main className="app-shell">
      <div className="map-stage" ref={mapContainerRef} />
      <section
        className={`control-panel${panelCollapsed ? " is-collapsed" : ""}`}
      >
        <button
          className="panel-toggle"
          type="button"
          onClick={() => {
            setPanelCollapsed((value) => !value);
          }}
        >
          {panelCollapsed ? "展开" : "收起"}
        </button>
        <div className="panel-card">
          <p className="eyebrow">Json2Map</p>
          <h1>GeoJSON 截图工具</h1>
          <p className="description">
            上传文件后直接在地图上显示，适合做论文中的区域、路径和点位截图对比。
          </p>
          <label className="upload-button">
            <input
              type="file"
              accept=".geojson,.json,application/geo+json,application/json"
              onChange={onFileChange}
            />
            选择 GeoJSON 文件
          </label>
          <button className="secondary-button" type="button" onClick={clearMap}>
            清空图层
          </button>
          <p className="helper-text">{helperText}</p>
          {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
        </div>
      </section>
    </main>
  );
};
