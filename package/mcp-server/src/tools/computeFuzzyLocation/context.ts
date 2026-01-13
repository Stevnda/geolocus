import { geolocus, type PlaceOutput, type PlacePlugin } from '@geolocus/core'
import type { ToolUserGeolocusTriple } from './schemas.js'

export type PlaceCatalogItem = {
  type:
    | 'Point'
    | 'LineString'
    | 'Polygon'
    | 'MultiPoint'
    | 'MultiLineString'
    | 'MultiPolygon'
  coord:
    | [number, number]
    | [number, number][]
    | [number, number][][]
    | [number, number][][][]
}

export type ComputeContextOverrides = {
  placeCatalog?: Record<string, PlaceCatalogItem>
}

function createPlaceCatalogPlugin(
  placeCatalog: Record<string, PlaceCatalogItem>,
): PlacePlugin {
  return (name) => {
    const item = placeCatalog[name]
    if (!item) return null
    const out: PlaceOutput = {
      type: item.type,
      coord: item.coord,
    }
    return out
  }
}

export function createDefaultGeolocusContext(
  overrides?: ComputeContextOverrides,
) {
  const geolocusContext = geolocus.createContext({
    maxDistance: 1000000,
    name: 'mcp-default-context',
    gridSum: 256 * 256,
    region: [
      [-99999999, -99999999],
      [99999999, -99999999],
      [99999999, 99999999],
      [-99999999, 99999999],
      [-99999999, -99999999],
    ],
    gridScale: 1000,
  })

  geolocusContext.addRole({
    name: 'default',
    directionDelta: 20,
    distanceDelta: 0.2,
    orientation: 0,
    timeDistanceMap: new Map([
      ['飞机', 300],
      ['步行', 1.67],
    ]),
    semanticDistanceMap: {
      VN: [0, 100],
      N: [0, 200],
      M: [300, 1000],
      F: [1000, 3000],
      VF: [3000, 20000],
    },
    weight: 1,
    spatialRef: geolocus.createSpatialRefFromEPSG(
      geolocus.generateUUID(),
      '4326',
    ),
    isDefault: true,
  })

  if (overrides?.placeCatalog) {
    geolocusContext.use(
      'placePlugin',
      createPlaceCatalogPlugin(overrides.placeCatalog),
    )
  }

  return geolocusContext
}

function collectUnresolvedOriginNamesFromTriple(
  triple: ToolUserGeolocusTriple,
  placeCatalog?: Record<string, PlaceCatalogItem>,
  names: Set<string> = new Set(),
): Set<string> {
  for (const tuple of triple.tupleList) {
    if (!tuple.originList) continue
    for (const origin of tuple.originList) {
      if ('target' in origin) {
        collectUnresolvedOriginNamesFromTriple(origin, placeCatalog, names)
        continue
      }
      if (origin.coord) continue
      const name = origin.name
      if (!name) continue
      if (placeCatalog?.[name]) continue
      names.add(name)
    }
  }
  return names
}

export function collectUnresolvedOriginNames(
  triples: ToolUserGeolocusTriple[],
  placeCatalog?: Record<string, PlaceCatalogItem>,
): string[] {
  const names = new Set<string>()
  for (const triple of triples) {
    collectUnresolvedOriginNamesFromTriple(triple, placeCatalog, names)
  }
  return Array.from(names)
}
