import type { DiagramSchema } from '@/types/diagram';

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  type: DiagramSchema['metadata']['type'];
  schema: DiagramSchema;
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'customer-onboarding',
    name: 'Customer Onboarding',
    description: 'Standard SaaS customer onboarding workflow with email, CRM, and billing steps.',
    type: 'workflow',
    schema: {
      schema_version: 1,
      metadata: { type: 'workflow', title: 'Customer Onboarding' },
      nodes: [
        { id: 'n1', type: 'startEnd', label: 'Start', position: { x: 0, y: 100 } },
        { id: 'n2', type: 'process', label: 'Sign Up', position: { x: 200, y: 100 } },
        { id: 'n3', type: 'toolService', label: 'Send Welcome Email', position: { x: 400, y: 100 }, toolCategory: 'communication', toolName: 'SendGrid' },
        { id: 'n4', type: 'toolService', label: 'Create CRM Record', position: { x: 600, y: 100 }, toolCategory: 'crm', toolName: 'HubSpot' },
        { id: 'n5', type: 'decision', label: 'Trial or Paid?', position: { x: 800, y: 100 } },
        { id: 'n6', type: 'toolService', label: 'Start Trial', position: { x: 1000, y: 50 }, toolCategory: 'payments', toolName: 'Stripe' },
        { id: 'n7', type: 'toolService', label: 'Process Payment', position: { x: 1000, y: 200 }, toolCategory: 'payments', toolName: 'Stripe' },
        { id: 'n8', type: 'process', label: 'Activate Account', position: { x: 1200, y: 100 } },
        { id: 'n9', type: 'startEnd', label: 'End', position: { x: 1400, y: 100 } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4' },
        { id: 'e4', source: 'n4', target: 'n5' },
        { id: 'e5', source: 'n5', target: 'n6', label: 'Trial' },
        { id: 'e6', source: 'n5', target: 'n7', label: 'Paid' },
        { id: 'e7', source: 'n6', target: 'n8' },
        { id: 'e8', source: 'n7', target: 'n8' },
        { id: 'e9', source: 'n8', target: 'n9' },
      ],
    },
  },
  {
    id: 'support-ticket',
    name: 'Support Ticket Flow',
    description: 'Customer support workflow from ticket creation to resolution.',
    type: 'workflow',
    schema: {
      schema_version: 1,
      metadata: { type: 'workflow', title: 'Support Ticket Flow' },
      nodes: [
        { id: 'n1', type: 'startEnd', label: 'Ticket Created', position: { x: 0, y: 100 } },
        { id: 'n2', type: 'process', label: 'Auto-Assign', position: { x: 200, y: 100 } },
        { id: 'n3', type: 'person', label: 'Support Agent', description: 'L1 Support', position: { x: 400, y: 100 } },
        { id: 'n4', type: 'decision', label: 'Resolved?', position: { x: 600, y: 100 } },
        { id: 'n5', type: 'handoff', label: 'Escalate', position: { x: 800, y: 200 } },
        { id: 'n6', type: 'person', label: 'Senior Engineer', description: 'L2 Support', position: { x: 1000, y: 200 } },
        { id: 'n7', type: 'toolService', label: 'Send Resolution', position: { x: 800, y: 0 }, toolCategory: 'communication', toolName: 'Email' },
        { id: 'n8', type: 'startEnd', label: 'Closed', position: { x: 1000, y: 0 } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4' },
        { id: 'e4', source: 'n4', target: 'n7', label: 'Yes' },
        { id: 'e5', source: 'n4', target: 'n5', label: 'No' },
        { id: 'e6', source: 'n5', target: 'n6' },
        { id: 'e7', source: 'n6', target: 'n4' },
        { id: 'e8', source: 'n7', target: 'n8' },
      ],
    },
  },
  {
    id: 'ecommerce-order',
    name: 'E-Commerce Order',
    description: 'Order processing from checkout to delivery with payment and fulfillment.',
    type: 'workflow',
    schema: {
      schema_version: 1,
      metadata: { type: 'workflow', title: 'E-Commerce Order Processing' },
      nodes: [
        { id: 'n1', type: 'startEnd', label: 'Order Placed', position: { x: 0, y: 100 } },
        { id: 'n2', type: 'toolService', label: 'Charge Card', position: { x: 200, y: 100 }, toolCategory: 'payments', toolName: 'Stripe' },
        { id: 'n3', type: 'decision', label: 'Payment OK?', position: { x: 400, y: 100 } },
        { id: 'n4', type: 'dataStore', label: 'Save Order', position: { x: 600, y: 50 }, toolCategory: 'database', toolName: 'PostgreSQL' },
        { id: 'n5', type: 'process', label: 'Notify Failure', position: { x: 600, y: 200 } },
        { id: 'n6', type: 'process', label: 'Pick & Pack', position: { x: 800, y: 50 } },
        { id: 'n7', type: 'toolService', label: 'Ship', position: { x: 1000, y: 50 }, toolCategory: 'api', toolName: 'ShipStation' },
        { id: 'n8', type: 'toolService', label: 'Send Tracking', position: { x: 1200, y: 50 }, toolCategory: 'communication', toolName: 'Email' },
        { id: 'n9', type: 'startEnd', label: 'Delivered', position: { x: 1400, y: 50 } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4', label: 'Yes' },
        { id: 'e4', source: 'n3', target: 'n5', label: 'No' },
        { id: 'e5', source: 'n4', target: 'n6' },
        { id: 'e6', source: 'n6', target: 'n7' },
        { id: 'e7', source: 'n7', target: 'n8' },
        { id: 'e8', source: 'n8', target: 'n9' },
      ],
    },
  },
  {
    id: 'small-team-org',
    name: 'Small Team Org Chart',
    description: 'Organization chart for a 10-person startup.',
    type: 'orgchart',
    schema: {
      schema_version: 1,
      metadata: { type: 'orgchart', title: 'Small Team Org Chart' },
      nodes: [
        { id: 'n1', type: 'person', label: 'CEO', description: 'Founder', position: { x: 400, y: 0 } },
        { id: 'n2', type: 'person', label: 'CTO', description: 'Engineering', position: { x: 200, y: 150 } },
        { id: 'n3', type: 'person', label: 'Head of Sales', description: 'Revenue', position: { x: 600, y: 150 } },
        { id: 'n4', type: 'person', label: 'Frontend Dev', description: 'UI/UX', position: { x: 50, y: 300 } },
        { id: 'n5', type: 'person', label: 'Backend Dev', description: 'API & Data', position: { x: 250, y: 300 } },
        { id: 'n6', type: 'person', label: 'Account Exec', description: 'Enterprise', position: { x: 500, y: 300 } },
        { id: 'n7', type: 'person', label: 'SDR', description: 'Outbound', position: { x: 700, y: 300 } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n1', target: 'n3' },
        { id: 'e3', source: 'n2', target: 'n4' },
        { id: 'e4', source: 'n2', target: 'n5' },
        { id: 'e5', source: 'n3', target: 'n6' },
        { id: 'e6', source: 'n3', target: 'n7' },
      ],
    },
  },
  {
    id: 'data-pipeline',
    name: 'Data Pipeline',
    description: 'ETL pipeline with data ingestion, transformation, and analytics.',
    type: 'workflow',
    schema: {
      schema_version: 1,
      metadata: { type: 'workflow', title: 'Data Pipeline' },
      nodes: [
        { id: 'n1', type: 'startEnd', label: 'Start', position: { x: 0, y: 100 } },
        { id: 'n2', type: 'toolService', label: 'API Ingestion', position: { x: 200, y: 100 }, toolCategory: 'api', toolName: 'REST API' },
        { id: 'n3', type: 'dataStore', label: 'Raw Data Lake', position: { x: 400, y: 100 }, toolCategory: 'storage', toolName: 'S3' },
        { id: 'n4', type: 'process', label: 'Transform & Clean', position: { x: 600, y: 100 } },
        { id: 'n5', type: 'dataStore', label: 'Data Warehouse', position: { x: 800, y: 100 }, toolCategory: 'database', toolName: 'BigQuery' },
        { id: 'n6', type: 'toolService', label: 'Analytics Dashboard', position: { x: 1000, y: 100 }, toolCategory: 'analytics', toolName: 'Metabase' },
        { id: 'n7', type: 'startEnd', label: 'End', position: { x: 1200, y: 100 } },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4' },
        { id: 'e4', source: 'n4', target: 'n5' },
        { id: 'e5', source: 'n5', target: 'n6' },
        { id: 'e6', source: 'n6', target: 'n7' },
      ],
    },
  },
];
