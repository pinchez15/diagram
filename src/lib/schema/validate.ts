import { z } from "zod/v4";

const nodeTypeSchema = z.enum([
  "process",
  "decision",
  "toolService",
  "dataStore",
  "person",
  "startEnd",
  "handoff",
]);

const toolCategorySchema = z.enum([
  "database",
  "payments",
  "crm",
  "communication",
  "analytics",
  "storage",
  "api",
]);

const diagramTypeSchema = z.enum(["orgchart", "workflow", "swimlane"]);

const edgeStyleSchema = z.enum(["solid", "dashed", "dotted"]);

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const metadataSchema = z.object({
  type: diagramTypeSchema,
  title: z.string().min(1),
  description: z.string().optional(),
});

const nodeSchema = z.object({
  id: z.string().min(1),
  type: nodeTypeSchema,
  label: z.string().min(1),
  description: z.string().optional(),
  position: positionSchema,
  parentId: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  toolCategory: toolCategorySchema.optional(),
  toolName: z.string().optional(),
});

const edgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  label: z.string().optional(),
  animated: z.boolean().optional(),
  style: edgeStyleSchema.optional(),
});

const laneSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  order: z.number().int().min(0),
  collapsed: z.boolean().optional(),
  nodeIds: z.array(z.string()),
});

export const diagramSchemaValidator = z.object({
  schema_version: z.number().int().min(1),
  metadata: metadataSchema,
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
  lanes: z.array(laneSchema).optional(),
});

export type ValidatedDiagramSchema = z.infer<typeof diagramSchemaValidator>;

export function validateDiagramSchema(data: unknown) {
  return diagramSchemaValidator.safeParse(data);
}
