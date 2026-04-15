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
const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

type UploadState = {
  fileName: string;
  featureCount: number;
  geometrySummary: string;
};

type TaskOption = {
  value: string;
  count: number;
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

const getTaskId = (feature: Feature<Geometry, GeoJsonProperties>) => {
  const taskId = feature.properties?.task_id;
  return typeof taskId === "string" && taskId.trim() ? taskId : null;
};

const getTaskOptions = (
  collection: FeatureCollection<Geometry, GeoJsonProperties>,
) => {
  const counts = new Map<string, number>();

  for (const feature of collection.features) {
    const taskId = getTaskId(feature);
    if (!taskId) continue;
    counts.set(taskId, (counts.get(taskId) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort(([left], [right]) =>
      left.localeCompare(right, undefined, { numeric: true }),
    )
    .map(([value, count]) => ({ value, count }));
};

const filterCollectionByTaskId = (
  collection: FeatureCollection<Geometry, GeoJsonProperties>,
  taskId: string,
): FeatureCollection<Geometry, GeoJsonProperties> => {
  if (!taskId) return collection;

  return {
    ...collection,
    features: collection.features.filter(
      (feature) => getTaskId(feature) === taskId,
    ),
  };
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
};

export const App = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [rawCollection, setRawCollection] = useState<FeatureCollection<
    Geometry,
    GeoJsonProperties
  > | null>(null);
  const [taskOptions, setTaskOptions] = useState<TaskOption[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [showRoleText, setShowRoleText] = useState(false);
  const [centerInput, setCenterInput] = useState("116.391300, 39.907500");
  const [zoomInput, setZoomInput] = useState("3.0");
  const [cropSize, setCropSize] = useState(640);
  const [cropSizeInput, setCropSizeInput] = useState("640");

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
      preserveDrawingBuffer: true,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));

    map.on("load", () => {
      ensureLayers(map);
    });

    const syncMapState = () => {
      setCenterInput(
        `${map.getCenter().lng.toFixed(6)}, ${map.getCenter().lat.toFixed(6)}`,
      );
      setZoomInput(map.getZoom().toFixed(1));
    };

    map.on("moveend", syncMapState);
    map.on("zoomend", syncMapState);

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

  const handleApplyView = () => {
    const map = mapRef.current;
    if (!map) return;

    const parts = centerInput.split(/[,，]/).map((s) => s.trim());
    if (parts.length === 2) {
      const lng = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      if (!isNaN(lng) && !isNaN(lat)) {
        map.setCenter([lng, lat]);
      }
    }

    const zoom = parseFloat(zoomInput);
    if (!isNaN(zoom)) {
      map.setZoom(zoom);
    }

    const size = parseInt(cropSizeInput, 10);
    if (!isNaN(size) && size >= 100) {
      setCropSize(size);
    }
  };

  const helperText = useMemo(() => {
    if (uploadState) {
      const taskText = selectedTaskId
        ? ` · 当前 task_id: ${selectedTaskId}`
        : taskOptions.length > 0
          ? ` · 可按 ${taskOptions.length} 个 task_id 筛选`
          : "";
      return `${uploadState.fileName} · ${uploadState.featureCount} 个要素 · ${uploadState.geometrySummary}${taskText}`;
    }
    return "支持 .geojson 和 .json，上传后会自动缩放到全图。";
  }, [selectedTaskId, taskOptions.length, uploadState]);

  const updateMapData = (collection: FeatureCollection, fileName: string) => {
    const map = mapRef.current;
    if (!map) return;

    ensureLayers(map);

    const source = map.getSource(MAP_SOURCE_ID) as
      | mapboxgl.GeoJSONSource
      | undefined;
    source?.setData(collection);

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const addMarkersForGeometry = (
      geom: Geometry,
      properties: GeoJsonProperties,
    ) => {
      const createMarker = (lng: number, lat: number) => {
        const marker = new mapboxgl.Marker({ color: "#ef4444" });
        const roleId = properties?.role_id;
        if (roleId !== undefined && roleId !== null) {
          const textEl = document.createElement("div");
          textEl.className = "marker-text";
          textEl.innerText = String(roleId);
          textEl.style.position = "absolute";
          textEl.style.top = "-24px";
          textEl.style.left = "50%";
          textEl.style.transform = "translateX(-50%)";
          textEl.style.background = "white";
          textEl.style.padding = "2px 6px";
          textEl.style.borderRadius = "4px";
          textEl.style.fontSize = "12px";
          textEl.style.fontWeight = "bold";
          textEl.style.color = "#333";
          textEl.style.boxShadow = "0 1px 3px rgba(0,0,0,0.3)";
          textEl.style.pointerEvents = "none";
          textEl.style.whiteSpace = "nowrap";
          marker.getElement().appendChild(textEl);
        }
        markersRef.current.push(marker.setLngLat([lng, lat]).addTo(map));
      };

      if (geom.type === "Point") {
        const [lng, lat] = geom.coordinates;
        createMarker(lng, lat);
      } else if (geom.type === "MultiPoint") {
        geom.coordinates.forEach(([lng, lat]) => {
          createMarker(lng, lat);
        });
      } else if (geom.type === "GeometryCollection") {
        geom.geometries.forEach((g) => addMarkersForGeometry(g, properties));
      }
    };

    for (const feature of collection.features) {
      if (feature.geometry) {
        addMarkersForGeometry(feature.geometry, feature.properties);
      }
    }

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

  useEffect(() => {
    if (!rawCollection) return;

    const filteredCollection = filterCollectionByTaskId(
      rawCollection,
      selectedTaskId,
    );

    if (selectedTaskId && filteredCollection.features.length === 0) {
      setErrorMessage(`没有找到 task_id = ${selectedTaskId} 的要素。`);
      return;
    }

    updateMapData(filteredCollection, uploadedFileName || "已上传数据");
  }, [rawCollection, selectedTaskId, uploadedFileName]);

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

      setUploadedFileName(file.name);
      setRawCollection(collection);
      setTaskOptions(getTaskOptions(collection));
      setSelectedTaskId("");
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

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    setUploadedFileName("");
    setRawCollection(null);
    setTaskOptions([]);
    setSelectedTaskId("");
    setUploadState(null);
    setErrorMessage("");
  };

  const cropWidth = cropSize;
  const cropHeight = cropSize;

  const captureScreenshot = async () => {
    const map = mapRef.current;
    const container = mapContainerRef.current;
    if (!map || !container) return;

    try {
      const canvas = map.getCanvas();
      const pixelRatio = window.devicePixelRatio || 1;
      const physicalWidth = cropWidth * pixelRatio;
      const physicalHeight = cropHeight * pixelRatio;

      const x = (canvas.width - physicalWidth) / 2;
      const y = (canvas.height - physicalHeight) / 2;

      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = physicalWidth;
      cropCanvas.height = physicalHeight;
      const ctx = cropCanvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(
          canvas,
          x,
          y,
          physicalWidth,
          physicalHeight,
          0,
          0,
          physicalWidth,
          physicalHeight,
        );

        const mapWidth = container.offsetWidth;
        const mapHeight = container.offsetHeight;

        const promises = markersRef.current.map((marker) => {
          return new Promise<void>((resolve) => {
            const el = marker.getElement();
            const pos = map.project(marker.getLngLat());
            const px = (pos.x - (mapWidth - cropWidth) / 2) * pixelRatio;
            const py = (pos.y - (mapHeight - cropHeight) / 2) * pixelRatio;

            // Only draw if within or near the crop box
            if (
              px < -50 ||
              px > physicalWidth + 50 ||
              py < -50 ||
              py > physicalHeight + 50
            ) {
              resolve();
              return;
            }

            const svg = el.querySelector("svg");
            if (svg) {
              const svgString = new XMLSerializer().serializeToString(svg);
              const img = new Image();
              img.onload = () => {
                const width = 27 * pixelRatio;
                const height = 41 * pixelRatio;
                ctx.drawImage(img, px - width / 2, py - height, width, height);

                if (showRoleText) {
                  const textEl = el.querySelector(
                    ".marker-text",
                  ) as HTMLElement;
                  if (textEl) {
                    const text = textEl.innerText;
                    ctx.font = `bold ${12 * pixelRatio}px sans-serif`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    const textWidth = ctx.measureText(text).width;
                    const textHeight = 14 * pixelRatio;

                    const tx = px;
                    const ty = py - height - 16 * pixelRatio;

                    ctx.shadowColor = "rgba(0,0,0,0.3)";
                    ctx.shadowBlur = 3 * pixelRatio;
                    ctx.shadowOffsetY = 1 * pixelRatio;

                    ctx.fillStyle = "white";
                    const bgWidth = textWidth + 12 * pixelRatio;
                    const bgHeight = textHeight + 8 * pixelRatio;
                    ctx.fillRect(
                      tx - bgWidth / 2,
                      ty - bgHeight / 2,
                      bgWidth,
                      bgHeight,
                    );

                    ctx.shadowColor = "transparent";
                    ctx.fillStyle = "#333";
                    ctx.fillText(text, tx, ty);
                  }
                }
                resolve();
              };
              img.onerror = () => resolve();
              img.src =
                "data:image/svg+xml;charset=utf-8," +
                encodeURIComponent(svgString);
            } else {
              resolve();
            }
          });
        });

        await Promise.all(promises);

        cropCanvas.toBlob(async (blob) => {
          if (blob) {
            const item = new ClipboardItem({ "image/png": blob });
            await navigator.clipboard.write([item]);
            alert("截图已复制到剪贴板！");
          }
        }, "image/png");
      }
    } catch (e) {
      console.error(e);
      alert("截图失败：" + (e instanceof Error ? e.message : ""));
    }
  };

  return (
    <main className="app-shell">
      <style>{`
        .map-stage .marker-text { display: none; }
        .map-stage.show-text .marker-text { display: block; }
        .crop-box {
          position: absolute;
          top: 50%;
          left: 50%;
          width: ${cropWidth}px;
          height: ${cropHeight}px;
          transform: translate(-50%, -50%);
          border: 2px dashed #ef4444;
          box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);
          pointer-events: none;
          z-index: 10;
        }
        .control-panel {
          z-index: 20;
        }
      `}</style>
      <div
        className={`map-stage ${showRoleText ? "show-text" : ""}`}
        ref={mapContainerRef}
      >
        <div className="crop-box" />
      </div>
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
          <div className="filter-group">
            <label className="field-label" htmlFor="task-id-filter">
              按 task_id 筛选
            </label>
            <select
              id="task-id-filter"
              className="field-input"
              value={selectedTaskId}
              disabled={taskOptions.length === 0}
              onChange={(event) => {
                setSelectedTaskId(event.target.value);
              }}
            >
              <option value="">显示全部</option>
              {taskOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value} ({option.count})
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label
              className="field-label"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={showRoleText}
                onChange={(event) => {
                  setShowRoleText(event.target.checked);
                }}
              />
              显示点位 role_id
            </label>
          </div>
          <button className="secondary-button" type="button" onClick={clearMap}>
            清空图层
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={captureScreenshot}
            style={{ marginTop: "8px" }}
          >
            一键截图（复制到剪切板）
          </button>

          <div className="filter-group" style={{ marginTop: "16px" }}>
            <label className="field-label">视图参数：中心、缩放与尺寸</label>
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <input
                className="field-input"
                style={{ flex: 1 }}
                value={centerInput}
                onChange={(e) => setCenterInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyView()}
                onBlur={handleApplyView}
                placeholder="经度, 纬度"
                title="经度, 纬度"
              />
              <input
                className="field-input"
                style={{ width: "60px" }}
                value={zoomInput}
                onChange={(e) => setZoomInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyView()}
                onBlur={handleApplyView}
                placeholder="缩放"
                title="地图缩放"
              />
              <input
                className="field-input"
                style={{ width: "60px" }}
                value={cropSizeInput}
                onChange={(e) => setCropSizeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyView()}
                onBlur={handleApplyView}
                placeholder="尺寸"
                title="截图框边长(默认640px)"
              />
            </div>
            <p className="helper-text" style={{ marginTop: "4px" }}>
              修改后按回车键或失去焦点生效
            </p>
          </div>

          <p className="helper-text">{helperText}</p>
          {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
        </div>
      </section>
    </main>
  );
};
