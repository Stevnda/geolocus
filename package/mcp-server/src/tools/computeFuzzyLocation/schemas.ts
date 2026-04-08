import { z } from 'zod'

import type { JsonObject, JsonValue } from './jsonTypes.js'

const jsonPrimitiveSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
])

export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    jsonPrimitiveSchema,
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
)

export const jsonObjectSchema: z.ZodType<JsonObject> = z.record(
  z.string(),
  jsonValueSchema,
)

export const geometryTypeSchema = z.enum(['point', 'line', 'polygon'])

export const position2Schema = z.tuple([z.number(), z.number()])

export const coordSchema = z.union([
  position2Schema,
  z.array(position2Schema),
  z.array(z.array(position2Schema)),
  z.array(z.array(z.array(position2Schema))),
])

export const tripleOriginSchema = z.object({
  name: z.string().optional(),
  type: z
    .enum([
      'Point',
      'LineString',
      'Polygon',
      'MultiPoint',
      'MultiLineString',
      'MultiPolygon',
    ])
    .optional(),
  coord: coordSchema.optional(),
})

const topologySchema = z.enum([
  'disjoint',
  'contain',
  'within',
  'intersect',
  'along',
  'toward',
])

const semanticDistanceSchema = z.enum(['VN', 'N', 'M', 'F', 'VF'])

const computeRegionRangeSchema = z.enum(['inside', 'outside', 'both'])

const geoLayoutSchema = z.object({
  layout: z.enum(['arrangement', 'geometry', 'sequence', 'custom']),
  number: z.number(),
  init: jsonValueSchema,
})

export const userGeoRelationSchema = z.object({
  topology: topologySchema.optional(),
  direction: z.union([z.string(), z.number()]).optional(),
  distance: z
    .union([
      z.number(),
      z.tuple([z.number(), z.number()]),
      semanticDistanceSchema,
      z.object({
        time: z.number(),
        rate: z.union([z.string(), z.number()]),
      }),
    ])
    .optional(),
  range: computeRegionRangeSchema.optional(),
  layout: geoLayoutSchema.optional(),
})

export type ToolUserGeoRelation = z.infer<typeof userGeoRelationSchema>

export type ToolUserGeolocusTriple = {
  role: string
  tupleList: Array<{
    originList?: Array<
      z.infer<typeof tripleOriginSchema> | ToolUserGeolocusTriple
    >
    relation?: ToolUserGeoRelation
  }>
  target: string
}

export const toolUserGeolocusTripleSchema: z.ZodType<ToolUserGeolocusTriple> =
  z.lazy(() =>
    z.object({
      role: z.string().min(1),
      tupleList: z.array(
        z.object({
          originList: z
            .array(z.union([tripleOriginSchema, toolUserGeolocusTripleSchema]))
            .optional(),
          relation: userGeoRelationSchema.optional(),
        }),
      ),
      target: z.string().min(1),
    }),
  )

export const placeCatalogSchema = z.record(
  z.string().min(1),
  z.object({
    type: z.enum([
      'Point',
      'LineString',
      'Polygon',
      'MultiPoint',
      'MultiLineString',
      'MultiPolygon',
    ]),
    coord: coordSchema,
  }),
)

export const contextOverridesSchema = z
  .object({
    placeCatalog: placeCatalogSchema.optional(),
  })
  .optional()

export const computeFuzzyLocationInputSchema = {
  geometryType: geometryTypeSchema,
  triples: z.array(toolUserGeolocusTripleSchema).min(1),
  contextOverrides: contextOverridesSchema,
}
