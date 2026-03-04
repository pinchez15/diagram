import Link from 'next/link';
import { Sparkles, Zap, Users, BarChart3, ArrowRight, Check } from 'lucide-react';

const FEATURES = [
  { icon: Sparkles, title: 'AI-Powered', description: 'Describe your workflow in plain English and get a complete diagram in seconds.' },
  { icon: Zap, title: 'Real-Time Canvas', description: 'Drag-and-drop editor with custom nodes, auto-layout, and instant auto-save.' },
  { icon: Users, title: 'Built for Teams', description: 'Share diagrams, collaborate with your team, and keep everyone aligned.' },
  { icon: BarChart3, title: 'Tool Integration', description: 'Visualize your actual tech stack with Stripe, PostgreSQL, SendGrid, and more.' },
];

const PRICING = [
  {
    name: 'Individual',
    price: '$8',
    period: '/month',
    features: ['5 diagrams', '10 AI generations/month', 'JSON & Mermaid export', 'All node types'],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    name: 'Team',
    price: '$20',
    period: '/month per seat',
    features: ['Unlimited diagrams', 'Unlimited AI generations', 'All export formats', 'Team collaboration', 'Priority support'],
    cta: 'Start Free Trial',
    highlight: true,
  },
];

export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="flex flex-col items-center px-6 py-24 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-4 py-1.5 text-sm text-brand-primary">
          <Sparkles className="h-4 w-4" />
          AI-Powered Diagramming
        </div>
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-neutral-900">
          From idea to diagram in{' '}
          <span className="text-brand-primary">under 60 seconds</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-neutral-500">
          Describe your workflow in plain English. Our AI generates a complete, editable diagram with your actual tools and services.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Start free trial
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/new"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            View templates
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-neutral-200 bg-neutral-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-neutral-900">
            Everything you need to visualize workflows
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-lg border border-neutral-200 bg-white p-6">
                <f.icon className="mb-3 h-8 w-8 text-brand-primary" />
                <h3 className="mb-2 text-lg font-semibold text-neutral-900">{f.title}</h3>
                <p className="text-sm text-neutral-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-neutral-900">Simple pricing</h2>
          <p className="mb-12 text-center text-neutral-500">14-day free trial. No credit card required.</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border-2 p-6 ${
                  plan.highlight ? 'border-brand-primary bg-brand-primary/5' : 'border-neutral-200 bg-white'
                }`}
              >
                <h3 className="text-lg font-semibold text-neutral-900">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-neutral-900">{plan.price}</span>
                  <span className="text-sm text-neutral-500">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-neutral-600">
                      <Check className="h-4 w-4 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={`mt-6 block rounded-lg py-2.5 text-center text-sm font-medium transition-colors ${
                    plan.highlight
                      ? 'bg-brand-primary text-white hover:bg-blue-700'
                      : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-neutral-200 bg-neutral-50 px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-neutral-900">Ready to diagram smarter?</h2>
        <p className="mt-2 text-neutral-500">Start your free trial today. No credit card required.</p>
        <Link
          href="/sign-up"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-8 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Get started free
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
