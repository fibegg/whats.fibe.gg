// @ts-check
// Manual sidebar hierarchy.
//
// Top-level sections (in order):
//   - Welcome
//   - Concepts (Agents nested as a sub-category)
//   - Security
//   - Fibe Templates (Operate nested as a sub-category)
//   - SDK, CLI & MCP
//   - Reference: API
//   - Reference: skills & tools (Tools and Skills sub-categories)

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'intro',

    {
      type: 'category',
      label: 'Concepts',
      collapsed: false,
      items: [
        // Workspace & discovery — matches the top group of the Fibe app sidebar
        // (Bridge → Agents, since Bridge was removed from docs).
        'concepts/agents',
        'concepts/bazaar',
        'concepts/scrolls',
        // Build-and-run resources — matches the middle group.
        'concepts/marquees',
        'concepts/props',
        'concepts/playspecs',
        'concepts/playgrounds',
        'concepts/tricks',
        // Billing stays last (not in the app sidebar; lives under Profile).
        'concepts/billing',
      ],
    },

    {
      type: 'category',
      label: 'Advanced Settings',
      collapsed: true,
      items: [
        'advanced/overview',
        'advanced/security',
        'advanced/limits',
        'advanced/api-keys',
        'advanced/secrets',
        'advanced/webhooks',
        'advanced/github-apps',
        'advanced/agent-defaults',
        'advanced/features',
        'advanced/notifications',
        'advanced/backup',
        'advanced/audit-log',
      ],
    },

    {
      type: 'category',
      label: 'Fibe Templates',
      collapsed: true,
      items: [
        'authoring/overview',
        'authoring/compose-to-fibe',
        'authoring/service-labels',
        'authoring/settings-block',
        'authoring/variables',
        'authoring/variable-placement',
        'authoring/decisions',
        'authoring/execution-modes',
        'authoring/recipes',
        'authoring/playbooks',
        {
          type: 'category',
          label: 'Operate',
          collapsed: true,
          items: [
            'operate/common-problems',
            'operate/publishing',
          ],
        },
      ],
    },

    {
      type: 'category',
      label: 'SDK, CLI & MCP',
      collapsed: true,
      items: [
        'sdk/intro',
        'sdk/install',
        'sdk/authentication',
        'sdk/cli-reference',
        'sdk/go-library',
        'sdk/mcp-server',
        'sdk/tools-catalog',
        'sdk/workflows',
        'sdk/troubleshooting',
      ],
    },

    {
      type: 'category',
      label: 'Reference: API',
      collapsed: true,
      items: [
        'api/intro',
        'api/platform',
        'api/agents-and-knowledge',
        'api/integrations',
      ],
    },

    {
      type: 'category',
      label: 'Reference: skills & tools',
      collapsed: true,
      items: [
        'reference/intro',

        {
          type: 'category',
          label: 'Tools',
          collapsed: true,
          items: [
            // Auth, doctor & meta
            'reference/tools/auth-set',
            'reference/tools/doctor',
            'reference/tools/status',
            'reference/tools/schema',
            'reference/tools/help',
            'reference/tools/tools-catalog',
            'reference/tools/call',
            'reference/tools/run',
            'reference/tools/update-name',
            'reference/tools/memorize',
            // Resource CRUD
            'reference/tools/resource-list',
            'reference/tools/resource-get',
            'reference/tools/resource-mutate',
            'reference/tools/resource-delete',
            // Playgrounds
            'reference/tools/playgrounds-wait',
            'reference/tools/playgrounds-logs',
            'reference/tools/playgrounds-logs-follow',
            'reference/tools/playgrounds-action',
            'reference/tools/playgrounds-debug',
            'reference/tools/playgrounds-transform',
            // Agents
            'reference/tools/agents-duplicate',
            'reference/tools/agents-runtime-status',
            'reference/tools/agents-send-message',
            'reference/tools/agents-start-chat',
            'reference/tools/agents-interrupt',
            'reference/tools/agents-messages',
            'reference/tools/agents-activity',
            'reference/tools/agents-live-state',
            'reference/tools/agents-create-conversation',
            'reference/tools/agents-delete-conversation',
            'reference/tools/agent-defaults-get',
            'reference/tools/agent-defaults-update',
            'reference/tools/agent-defaults-reset',
            // Greenfield / Templates / Repos
            'reference/tools/launch-create',
            'reference/tools/greenfield-create',
            'reference/tools/templates-launch',
            'reference/tools/templates-search',
            'reference/tools/templates-change',
            'reference/tools/github-repos-create',
            'reference/tools/gitea-repos-create',
            'reference/tools/find-github-repos',
            'reference/tools/get-github-token',
            'reference/tools/repo-status-check',
            // Monitoring / Mutters / Feedback / Artefacts
            'reference/tools/monitor-list',
            'reference/tools/monitor-follow',
            'reference/tools/mutter',
            'reference/tools/mutters-get',
            'reference/tools/feedbacks-list',
            'reference/tools/feedbacks-get',
            'reference/tools/artefact-upload',
            // Pipeline
            'reference/tools/pipeline',
            'reference/tools/pipeline-result',
            // Local dev
            'reference/tools/local-playgrounds-info',
            'reference/tools/local-playgrounds-link',
          ],
        },

        {
          type: 'category',
          label: 'Skills',
          collapsed: true,
          items: [
            {
              type: 'category',
              label: 'Foundations',
              collapsed: true,
              items: [
                'reference/fibe-product-map',
                'reference/fibe-feature-surface',
                'reference/fibe-resource-lifecycles',
                'reference/fibe-agents-and-automation',
                'reference/fibe-security-access-and-integrations',
                'reference/glossary',
              ],
            },
            {
              type: 'category',
              label: 'Compose conversion',
              collapsed: true,
              items: [
                'reference/convert-compose-to-fibe',
                'reference/common-errors-and-fixes',
                'reference/templates-publish-checklist',
              ],
            },
            {
              type: 'category',
              label: 'References',
              collapsed: true,
              items: [
                'reference/json-schema',
                'reference/reference-fibe-labels',
                'reference/reference-x-fibe-gg-namespace',
                'reference/reference-template-variables',
                'reference/reference-yaml-paths',
                'reference/reference-runtime-implied-semantics',
                'reference/reference-validation-pipeline',
              ],
            },
            {
              type: 'category',
              label: 'Decision guides',
              collapsed: true,
              items: [
                'reference/decide-static-vs-dynamic',
                'reference/decide-exposure-strategy',
                'reference/decide-zero-downtime',
                'reference/decide-secrets-and-randoms',
                'reference/decide-job-mode',
              ],
            },
            {
              type: 'category',
              label: 'Execution modes',
              collapsed: true,
              items: [
                'reference/mode-job-trick',
                'reference/mode-schedule-cron',
                'reference/mode-trigger-vcs',
              ],
            },
            {
              type: 'category',
              label: 'Recipes',
              collapsed: true,
              items: [
                'reference/recipe-ports-to-expose',
                'reference/recipe-add-subdomain',
                'reference/recipe-add-path-rule',
                'reference/recipe-build-to-repo-url',
                'reference/recipe-build-args-and-target',
                'reference/recipe-source-mount',
                'reference/recipe-env-file',
                'reference/recipe-extract-env-variables',
                'reference/recipe-inline-variables',
                'reference/recipe-whole-node-paths',
                'reference/recipe-random-and-secrets',
                'reference/recipe-strip-incompatible-keys',
                'reference/recipe-named-volumes',
                'reference/recipe-depends-on',
                'reference/recipe-anchors-and-aliases',
                'reference/recipe-configs-block',
                'reference/recipe-add-metadata',
                'reference/recipe-zero-downtime-healthcheck',
              ],
            },
            {
              type: 'category',
              label: 'App playbooks',
              collapsed: true,
              items: [
                'reference/playbook-nginx-static',
                'reference/playbook-nodejs-dev',
                'reference/playbook-postgres-app',
                'reference/playbook-python-app',
                'reference/playbook-rails-app',
                'reference/playbook-wikijs',
                'reference/playbook-wordpress',
                'reference/playbook-multi-service',
                'reference/playbook-cron-scheduled',
                'reference/playbook-test-runner',
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default sidebars;
