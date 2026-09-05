export async function GET() {
  const auditFiles = [
    {
      id: 'PAPER5_EXPORT_CANONICAL_2026-08-19',
      name: 'Paper 5 Canonical Export Audit Matrix',
      description: 'Pre-registered morphogenetic canalization baseline and multi-seed replications',
      format: 'application/json',
      retentionRate: '88.4%',
      status: 'AUDITED'
    },
    {
      id: 'PAPER6_CANARY_REPLICATION_H1',
      name: 'Paper 6 Hypothesis 1 (H1) Canary Replications',
      description: 'Differential response vs null model p < 0.001',
      format: 'application/json',
      retentionRate: '92.1%',
      status: 'VERIFIED'
    }
  ];

  return new Response(JSON.stringify(auditFiles), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
