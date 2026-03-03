import type { NodeTypes } from '@xyflow/react';
import { ProcessNode } from './ProcessNode';
import { DecisionNode } from './DecisionNode';
import { ToolServiceNode } from './ToolServiceNode';
import { DataStoreNode } from './DataStoreNode';
import { PersonNode } from './PersonNode';
import { StartEndNode } from './StartEndNode';
import { HandoffNode } from './HandoffNode';
import { SwimlaneNode } from './SwimlaneNode';

export const nodeTypes: NodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  toolService: ToolServiceNode,
  dataStore: DataStoreNode,
  person: PersonNode,
  startEnd: StartEndNode,
  handoff: HandoffNode,
  swimlane: SwimlaneNode,
};

export { ProcessNode, DecisionNode, ToolServiceNode, DataStoreNode, PersonNode, StartEndNode, HandoffNode, SwimlaneNode };
export { CATEGORY_COLORS, getCategoryColor } from './categoryColors';
