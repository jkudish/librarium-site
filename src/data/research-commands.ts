// Canonical first research workflow for product pages and content checks.
export const RESEARCH_COMMANDS = {
  cli: {
    requirement: "Node.js 22.12+",
    install: "npm install -g librarium",
    setup: "librarium setup",
    preview: 'librarium research "Lisbon or Porto without a car?" --only exa --dry-run --json',
    research: 'librarium research "Lisbon or Porto without a car?" --only exa --json',
    // The CLI also ships as a Homebrew formula with its own runtime.
    installOptions: [
      { id: "npm", label: "npm", requirement: "Node.js 22.12+", install: "npm install -g librarium" },
      { id: "homebrew", label: "Homebrew", requirement: "No Node.js needed", install: "brew install jkudish/tap/librarium" },
    ],
  },
  javascript: {
    requirement: "Node.js 22.12+ for the Node client",
    install: "npm install librarium",
    setup: "librarium setup",
    preview: "await librarium.research(\n  'Lisbon or Porto without a car?',\n  { only: ['exa'], dryRun: true },\n);",
    research: "await librarium.research(\n  'Lisbon or Porto without a car?',\n  { only: ['exa'] },\n);",
  },
  laravel: {
    requirement: "PHP 8.4+ · Laravel 13.30+ · Laravel AI SDK ^1.0.1",
    install: "composer require jkudish/laravel-ai-librarium",
    setup: "php artisan vendor:publish --tag=librarium-config",
    preview: "Librarium::research(\n    'Lisbon or Porto without a car?',\n)->only(['exa'])->dryRun();",
    research: "Librarium::research(\n    'Lisbon or Porto without a car?',\n)->only(['exa'])->run();",
  },
} as const;
