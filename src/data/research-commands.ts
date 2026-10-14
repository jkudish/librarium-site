// Canonical first research workflow for product pages and content checks.
export const RESEARCH_COMMANDS = {
  cli: {
    requirement: "Node.js 22.12+",
    install: "npm install -g librarium",
    setup: "librarium setup",
    preview: 'librarium research "Lisbon or Porto without a car?" --only exa --dry-run --json',
    research: 'librarium research "Lisbon or Porto without a car?" --only exa --json',
  },
  javascript: {
    requirement: "Node.js 22.12+ for the Node client",
    install: "npm install librarium",
    setup: "librarium setup",
    preview: "await librarium.research('Lisbon or Porto without a car?', { only: ['exa'], dryRun: true });",
    research: "await librarium.research('Lisbon or Porto without a car?', { only: ['exa'] });",
  },
  laravel: {
    requirement: "PHP 8.4+ · Laravel 13.30+ · Laravel AI SDK ^1.0.1",
    install: "composer require jkudish/laravel-ai-librarium",
    setup: "php artisan vendor:publish --tag=librarium-config",
    preview: "Librarium::research('Lisbon or Porto without a car?')->only(['exa'])->dryRun();",
    research: "Librarium::research('Lisbon or Porto without a car?')->only(['exa'])->run();",
  },
} as const;
