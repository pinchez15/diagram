import type { DiagramSchema } from '@/types/diagram';

export function diagramToMermaid(schema: DiagramSchema): string {
  const lines: string[] = [];

  if (schema.metadata.type === 'orgchart') {
    lines.push('graph TD');
  } else {
    lines.push('graph LR');
  }

  for (const node of schema.nodes) {
    const label = node.label.replace(/"/g, '#quot;');
    switch (node.type) {
      case 'startEnd':
        lines.push(`    ${node.id}([${label}])`);
        break;
      case 'decision':
        lines.push(`    ${node.id}{${label}}`);
        break;
      case 'dataStore':
        lines.push(`    ${node.id}[(${label})]`);
        break;
      case 'person':
        lines.push(`    ${node.id}((${label}))`);
        break;
      default:
        lines.push(`    ${node.id}[${label}]`);
        break;
    }
  }

  for (const edge of schema.edges) {
    const arrow = edge.style === 'dashed' ? '-.->' : '-->';
    if (edge.label) {
      lines.push(`    ${edge.source} ${arrow}|${edge.label}| ${edge.target}`);
    } else {
      lines.push(`    ${edge.source} ${arrow} ${edge.target}`);
    }
  }

  return lines.join('\n');
}
