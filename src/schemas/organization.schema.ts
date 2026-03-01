import { z } from "zod";
import { NodeType } from "@/types/organization";

export const ActorSchema = z.object({
  id: z.string().min(1),
  type: z.nativeEnum(NodeType),
  label: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().nullable(),
  organizationId: z.string().min(1),
  color: z.string(),
});
