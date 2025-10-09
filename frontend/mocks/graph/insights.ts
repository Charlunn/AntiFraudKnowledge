import type {
  AIExplainSection,
  EvidenceItem,
  PitfallInsight,
  ScenarioPayload,
  ScenarioStep,
  TrendingInsight
} from '~/types/graph'

export const scenarioSteps: ScenarioStep[] = [
  {
    id: 'who',
    label: 'graph.sceneWizard.steps.who',
    options: [
      {
        id: 'senior',
        label: 'graph.sceneWizard.options.senior.label',
        description: 'graph.sceneWizard.options.senior.description'
      },
      {
        id: 'youth',
        label: 'graph.sceneWizard.options.youth.label',
        description: 'graph.sceneWizard.options.youth.description'
      },
      {
        id: 'pro',
        label: 'graph.sceneWizard.options.pro.label',
        description: 'graph.sceneWizard.options.pro.description'
      }
    ]
  },
  {
    id: 'ask',
    label: 'graph.sceneWizard.steps.ask',
    options: [
      {
        id: 'investment',
        label: 'graph.sceneWizard.options.investment.label',
        description: 'graph.sceneWizard.options.investment.description'
      },
      {
        id: 'impersonation',
        label: 'graph.sceneWizard.options.impersonation.label',
        description: 'graph.sceneWizard.options.impersonation.description'
      },
      {
        id: 'romance',
        label: 'graph.sceneWizard.options.romance.label',
        description: 'graph.sceneWizard.options.romance.description'
      }
    ]
  },
  {
    id: 'where',
    label: 'graph.sceneWizard.steps.where',
    options: [
      {
        id: 'shortVideo',
        label: 'graph.sceneWizard.options.shortVideo.label',
        description: 'graph.sceneWizard.options.shortVideo.description'
      },
      {
        id: 'telecom',
        label: 'graph.sceneWizard.options.telecom.label',
        description: 'graph.sceneWizard.options.telecom.description'
      },
      {
        id: 'socialApp',
        label: 'graph.sceneWizard.options.socialApp.label',
        description: 'graph.sceneWizard.options.socialApp.description'
      }
    ]
  }
]

export const defaultScenario: ScenarioPayload = {
  id: 'baseline',
  title: 'graph.scenario.baseline.title',
  summary: 'graph.scenario.baseline.summary',
  riskLevel: 'high'
}

export const trendingInsights: TrendingInsight[] = [
  {
    id: 'ai-avatar',
    title: 'graph.trending.items.ai-avatar.title',
    delta: 0.36,
    description: 'graph.trending.items.ai-avatar.description'
  },
  {
    id: 'cross-border',
    title: 'graph.trending.items.cross-border.title',
    delta: 0.8,
    description: 'graph.trending.items.cross-border.description'
  }
]

export const pitfalls: PitfallInsight[] = [
  {
    id: 'quick-profit',
    title: 'graph.pitfalls.items.quick-profit.title',
    guidance: [
      'graph.pitfalls.items.quick-profit.guidance.0',
      'graph.pitfalls.items.quick-profit.guidance.1',
      'graph.pitfalls.items.quick-profit.guidance.2'
    ]
  },
  {
    id: 'official-number',
    title: 'graph.pitfalls.items.official-number.title',
    guidance: [
      'graph.pitfalls.items.official-number.guidance.0',
      'graph.pitfalls.items.official-number.guidance.1',
      'graph.pitfalls.items.official-number.guidance.2'
    ]
  }
]

export const aiExplainSections: AIExplainSection[] = [
  {
    id: 'whyCommon',
    title: 'graph.aiExplain.whyCommon',
    bullets: [
      'graph.aiExplain.bullets.whyCommon.0',
      'graph.aiExplain.bullets.whyCommon.1',
      'graph.aiExplain.bullets.whyCommon.2'
    ]
  },
  {
    id: 'howSpot',
    title: 'graph.aiExplain.howSpot',
    bullets: [
      'graph.aiExplain.bullets.howSpot.0',
      'graph.aiExplain.bullets.howSpot.1',
      'graph.aiExplain.bullets.howSpot.2'
    ]
  },
  {
    id: 'whatNow',
    title: 'graph.aiExplain.whatNow',
    bullets: [
      'graph.aiExplain.bullets.whatNow.0',
      'graph.aiExplain.bullets.whatNow.1',
      'graph.aiExplain.bullets.whatNow.2'
    ]
  }
]

export const evidenceListMock: EvidenceItem[] = [
  {
    id: 'report-1',
    title: 'graph.evidence.report-1.title',
    description: 'graph.evidence.report-1.description',
    source: 'bankingMonitor',
    timestamp: '2025-10-07T07:30:00Z',
    url: 'https://example.com/banking-monitor'
  },
  {
    id: 'report-2',
    title: 'graph.evidence.report-2.title',
    description: 'graph.evidence.report-2.description',
    source: 'modelInfer',
    timestamp: '2025-10-06T05:20:00Z'
  },
  {
    id: 'report-3',
    title: 'graph.evidence.report-3.title',
    description: 'graph.evidence.report-3.description',
    source: 'cityHotline',
    timestamp: '2025-10-05T10:00:00Z'
  }
]
