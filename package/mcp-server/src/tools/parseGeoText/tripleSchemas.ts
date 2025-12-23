import { z } from 'zod'

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonObject | JsonValue[]
type JsonObject = { [key: string]: JsonValue }

const jsonPrimitiveSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
])

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    jsonPrimitiveSchema,
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
)

const jsonObjectSchema: z.ZodType<JsonObject> = z.record(
  z.string(),
  jsonValueSchema,
)

const topologySchema = z.enum([
  'disjoint',
  'contain',
  'within',
  'intersect',
  'along',
])

const semanticDistanceSchema = z.enum(['VN', 'N', 'M', 'F', 'VF'])

const computeRegionRangeSchema = z.enum(['inside', 'outside', 'both'])

const geoLayoutSchema = z.object({
  layout: z.enum(['arrangement', 'geometry', 'sequence', 'custom']),
  number: z.number(),
  init: jsonObjectSchema,
})

const userGeoRelationSchema = z.object({
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

const coordSchema = z.union([
  z.tuple([z.number(), z.number()]),
  z.array(z.tuple([z.number(), z.number()])),
  z.array(z.array(z.tuple([z.number(), z.number()]))),
  z.array(z.array(z.array(z.tuple([z.number(), z.number()])))),
])

const originSchema = z.object({
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

export type LlmOrigin = z.infer<typeof originSchema>
export type LlmRelation = z.infer<typeof userGeoRelationSchema>
export type LlmTriple = {
  role?: string
  tupleList: Array<{
    originList?: Array<LlmOrigin | LlmTriple>
    relation?: LlmRelation
  }>
  target: string
}

export const llmTripleSchema: z.ZodType<LlmTriple> = z.lazy(() =>
  z.object({
    role: z.string().optional(),
    tupleList: z.array(
      z.object({
        originList: z
          .array(z.union([originSchema, llmTripleSchema]))
          .optional(),
        relation: userGeoRelationSchema.optional(),
      }),
    ),
    target: z.string(),
  }),
)

export const llmTripleArraySchema = z.array(llmTripleSchema)
