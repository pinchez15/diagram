import type { DiagramType } from './diagram';

export interface DiagramListItem {
  id: string;
  title: string;
  description: string | null;
  type: DiagramType;
  created_at: string;
  updated_at: string;
}

export interface CreateDiagramRequest {
  title?: string;
  description?: string;
  type?: DiagramType;
  schema_data?: Record<string, unknown>;
}

export interface UpdateDiagramRequest {
  title?: string;
  description?: string;
  type?: DiagramType;
  schema_data?: Record<string, unknown>;
}

export interface DiagramRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: DiagramType;
  schema_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
