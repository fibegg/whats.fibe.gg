const page = {name: 'page', in: 'query', type: 'integer', required: false, example: 1, description: 'One-based page number. Defaults to 1.'};
const perPage = {name: 'per_page', in: 'query', type: 'integer', required: false, example: 25, description: 'Number of records per page. Maximum is 100.'};

const pathParam = (name = 'id', description = 'Resource id.') => ({
  name,
  in: 'path',
  type: 'string',
  required: true,
  example: name === 'filename' ? 'artifact.txt' : '123',
  description,
});

const query = (name, type, description, example = '') => ({
  name,
  in: 'query',
  type,
  required: false,
  example,
  description,
});

const body = (description, example) => ({description, example});

const listResponses = [
  {status: '200', description: 'Returns `{ data, meta }` with pagination metadata.'},
  {status: '401', description: 'The bearer token is missing, invalid, or not allowed to use the API.'},
];

const showResponses = [
  {status: '200', description: 'Returns the requested resource.'},
  {status: '404', description: 'The resource was not found or is not visible to the token.'},
];

const createResponses = [
  {status: '201', description: 'Creates the resource and returns its serialized representation.'},
  {status: '422', description: 'Validation failed. The response includes the shared error envelope.'},
];

const updateResponses = [
  {status: '200', description: 'Updates the resource and returns its serialized representation.'},
  {status: '422', description: 'Validation failed. The response includes field-level details when available.'},
];

const deleteResponses = [
  {status: '204', description: 'Deletes or revokes the resource. The response body is empty.'},
  {status: '404', description: 'The resource was not found or is not visible to the token.'},
];

const acceptedResponses = [
  {status: '202', description: 'Queues a long-running operation and returns `{ request_id, status, status_url }`.'},
  {status: '402', description: 'The target Marquee is not funded. Requests return code `MARQUEE_NOT_FUNDED` until the Marquee is funded.'},
  {status: '422', description: 'The request was understood but could not be queued.'},
];

function endpoint({method, path, title, description, parameters = [], requestBody, responses}) {
  return {
    method,
    path,
    title,
    description,
    parameters,
    body: requestBody,
    responses,
  };
}

function listEndpoint(path, label, extra = {}) {
  return endpoint({
    method: 'GET',
    path,
    title: `List ${label}`,
    description: [
      `Returns a paginated collection of ${label}.`,
      `Use this endpoint to discover records visible to the current API key before targeting a specific id.`,
      'List responses use the shared `{ data, meta }` envelope with `page`, `per_page`, and `total` metadata.',
    ],
    parameters: [page, perPage, ...(extra.parameters || [])],
    responses: listResponses,
  });
}

function createEndpoint(path, singular, example, extra = {}) {
  return endpoint({
    method: 'POST',
    path,
    title: `Create ${singular}`,
    description: [
      `Creates a new ${singular} owned by the authenticated player or workspace context.`,
      `Send JSON using the resource root shown in the schema so the server can apply the correct parameter contract.`,
      `Creation returns the serialized resource when validation succeeds and the shared error envelope when it fails.`,
    ],
    requestBody: body(`JSON payload for creating a ${singular}.`, example),
    responses: createResponses,
    ...extra,
  });
}

function showEndpoint(path, singular, params = [pathParam()]) {
  return endpoint({
    method: 'GET',
    path,
    title: `Read ${singular}`,
    description: [
      `Returns one ${singular} by id.`,
      `Use this endpoint when you already know the resource id and need the full serialized record.`,
      `A missing or unauthorized record is returned as a not-found response instead of leaking ownership details.`,
    ],
    parameters: params,
    responses: showResponses,
  });
}

function updateEndpoint(path, singular, example, params = [pathParam()]) {
  return endpoint({
    method: ['PATCH', 'PUT'],
    path,
    title: `Update ${singular}`,
    description: [
      `Updates mutable fields on an existing ${singular}.`,
      `Use ` + '`PATCH`' + ` for partial updates; ` + '`PUT`' + ` is accepted for clients that model full replacement.`,
      `The response returns the updated resource or a validation error envelope.`,
    ],
    parameters: params,
    requestBody: body(`JSON payload for updating a ${singular}.`, example),
    responses: updateResponses,
  });
}

function deleteEndpoint(path, singular, params = [pathParam()]) {
  return endpoint({
    method: 'DELETE',
    path,
    title: `Delete ${singular}`,
    description: [
      `Deletes the selected ${singular} or removes the current player's access to it.`,
      `Use this endpoint carefully because destructive actions may also queue cleanup work.`,
      `Successful deletion returns an empty response.`,
    ],
    parameters: params,
    responses: deleteResponses,
  });
}

function crud(path, singular, plural, example) {
  return [
    listEndpoint(path, plural),
    createEndpoint(path, singular, example),
    showEndpoint(`${path}/:id`, singular),
    updateEndpoint(`${path}/:id`, singular, example),
    deleteEndpoint(`${path}/:id`, singular),
  ];
}

const marqueeBody = {
  marquee: {
    name: 'staging-runner',
    host: 'captain.example.com',
    username: 'ubuntu',
    port: 22,
  },
};

const propBody = {
  prop: {
    name: 'web-app',
    repo_url: 'https://github.com/example/web-app',
    branch: 'main',
  },
};

const playspecBody = {
  playspec: {
    name: 'web-app',
    compose_yaml: 'services:\n  web:\n    image: nginx:alpine',
    prop_id: 123,
  },
};

const playgroundBody = {
  playground: {
    name: 'web-app-staging',
    playspec_id: 123,
    marquee_id: 123,
  },
};

const importTemplateBody = {
  import_template: {
    name: 'Rails starter',
    description: 'Production-ready Rails template',
    source_url: 'https://github.com/example/template',
  },
};

const agentBody = {
  agent: {
    name: 'Builder',
    playground_id: 123,
    instructions: 'Work on the app and report changes.',
  },
};

const artefactBody = {
  artefact: {
    name: 'report.md',
    content_type: 'text/markdown',
    body: '# Report',
  },
};

const feedbackBody = {
  feedback: {
    rating: 'positive',
    body: 'Useful result',
  },
};

const pokeBody = {
  poke: {
    body: 'Please check the deployment logs.',
  },
};

export const platformSections = [
  {
    title: 'System and launch flows',
    description: 'Use these endpoints for health checks and high-level creation flows that start from templates or remote environments.',
    endpoints: [
      endpoint({
        method: 'GET',
        path: '/api/status',
        title: 'Check API status',
        description: [
          'Returns a small availability payload from the API namespace.',
          'Use it before running automation to confirm the host is reachable and the API process is responding.',
          'This is the safest endpoint for validating bearer-token wiring because it has no side effects.',
        ],
        responses: [{status: '200', description: 'The API is reachable.'}, ...listResponses.slice(1)],
      }),
      endpoint({
        method: 'POST',
        path: '/api/launches',
        title: 'Launch from Compose or GitHub repo',
        description: [
          'Creates a Playspec and optionally deploys a Playground from inline Compose/Fibe YAML or a GitHub repository config file.',
          'Deployments require the target Marquee to be funded; unpaid Marquees return `MARQUEE_NOT_FUNDED`.',
          'For repository-backed launches, Fibe fetches the config through the selected GitHub App installation and discovers `fibe.yml`, `fibe.yaml`, `docker-compose.yml`, then `docker-compose.yaml` when `config_path` is omitted.',
          '`github_ref` selects only the config file revision; service branch/ref behavior remains explicit in the YAML.',
        ],
        requestBody: body('Launch request using either compose_yaml or repository_url.', {
          repository_url: 'owner/repo',
          config_path: 'deploy/fibe.yml',
          github_ref: 'main',
          github_account: 'owner',
          name: 'repo',
          marquee_id: 123,
          variables: {DATABASE_PASSWORD: 'change-me'},
        }),
        responses: createResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/greenfields',
        title: 'Create greenfield project',
        description: [
          'Starts a new project workflow from a template, inline template body, or GitHub repository config snapshot.',
          'Use it when automation wants Fibe to create app-owned destination repo(s), Props, an app-owned template version, a Playspec, and a Playground.',
          'The deployment phase requires a funded Marquee; unpaid Marquees return `MARQUEE_NOT_FUNDED`.',
          'Repository snapshot inputs are fetched through the selected GitHub App installation and must already be Fibe-compatible.',
        ],
        requestBody: body('Greenfield project request.', {
          repository_url: 'owner/repo',
          config_path: 'fibe.yml',
          github_ref: 'main',
          github_installation_id: 123,
          name: 'new-app',
          marquee_id: 123,
          git_provider: 'gitea',
        }),
        responses: acceptedResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/autoconnect_tokens',
        title: 'Create autoconnect token',
        description: [
          'Creates a short-lived token used by a remote Marquee host to connect itself back to Fibe.',
          'Use this endpoint during host bootstrap when direct SSH credentials are not yet attached.',
          'Treat the returned token as a secret because it authorizes a one-time connection flow.',
        ],
        requestBody: body('Autoconnect target metadata.', {marquee_id: 123}),
        responses: createResponses,
      }),
      endpoint({
        method: 'GET',
        path: '/api/async_requests/:id',
        title: 'Poll async request',
        description: [
          'Reads the status for a previously queued long-running operation.',
          'Queued and running work returns 202, while terminal success or failure returns 200 with the final payload.',
          'Use the `status_url` returned by async endpoints instead of constructing the path when possible.',
        ],
        parameters: [pathParam('id', 'Async request id returned by a 202 response.')],
        responses: [
          {status: '202', description: 'The operation is still queued or running.'},
          {status: '200', description: 'The operation reached a terminal state.'},
          {status: '404', description: 'The async request id was not found.'},
        ],
      }),
    ],
  },
  {
    title: 'Marquees',
    description: 'Marquees are remote compute targets where Fibe can deploy and manage playgrounds. Marquee actions require current funding.',
    endpoints: [
      ...crud('/api/marquees', 'Marquee', 'Marquees', marqueeBody),
      endpoint({
        method: 'POST',
        path: '/api/marquees/:id/ssh_keys',
        title: 'Generate SSH key',
        description: [
          'Creates or rotates SSH key material for a Marquee connection.',
          'Use it when bootstrapping a host that needs Fibe-managed SSH access.',
          'The response includes the updated Marquee connection state or validation errors.',
        ],
        parameters: [pathParam()],
        requestBody: body('Optional SSH key generation options.', {label: 'deploy-key'}),
        responses: createResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/marquees/:id/connection_tests',
        title: 'Test Marquee connection',
        description: [
          'Runs a connection test against the Marquee host using its stored connection settings.',
          'Use it after creating or updating SSH details to verify Fibe can reach the Marquee.',
          'The operation may run remotely and can return diagnostic output for failed checks.',
        ],
        parameters: [pathParam()],
        responses: acceptedResponses,
      }),
    ],
  },
  {
    title: 'Props',
    description: 'Props describe source repositories and source-like inputs used by playspecs, templates, and playgrounds.',
    endpoints: [
      ...crud('/api/props', 'prop', 'props', propBody),
      endpoint({
        method: 'POST',
        path: '/api/props/attachments',
        title: 'Attach prop',
        description: [
          'Attaches an existing prop to another Fibe resource such as a playspec or playground.',
          'Use this when source ownership already exists and the target only needs a relationship.',
          'The request identifies both the prop and the target resource to attach it to.',
        ],
        requestBody: body('Prop attachment request.', {prop_id: 123, target_type: 'Playground', target_id: 123}),
        responses: createResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/props/mirrors',
        title: 'Mirror prop source',
        description: [
          'Creates or refreshes a mirrored copy of a prop source.',
          'Use it when Fibe needs its own repository mirror before agents or jobs can work safely.',
          'Mirroring can involve remote repository access and may return an async status.',
        ],
        requestBody: body('Mirror request.', {prop_id: 123}),
        responses: acceptedResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/props/:id/syncs',
        title: 'Synchronize prop',
        description: [
          'Queues synchronization for the selected prop.',
          'Use it after repository changes when Fibe should refresh branches, metadata, or mirrored state.',
          'The endpoint returns an async status when remote work is queued.',
        ],
        parameters: [pathParam()],
        responses: acceptedResponses,
      }),
      endpoint({
        method: 'GET',
        path: '/api/props/:id/branches',
        title: 'List prop branches',
        description: [
          'Returns branch names discovered for the prop source.',
          'Use it to populate branch pickers or validate that a requested branch exists before updating a playspec.',
          'The response is read-only and depends on the latest synchronized repository metadata.',
        ],
        parameters: [pathParam()],
        responses: showResponses,
      }),
      endpoint({
        method: 'GET',
        path: '/api/props/:id/env_defaults',
        title: 'Read prop environment defaults',
        description: [
          'Returns environment defaults inferred from the prop source.',
          'Use it before creating playspecs or playgrounds so generated configuration starts with sensible values.',
          'The payload is derived from repository metadata and Fibe template conventions.',
        ],
        parameters: [pathParam()],
        responses: showResponses,
      }),
    ],
  },
  {
    title: 'Prop mutations',
    description: 'Prop mutations track source edits that Fibe or agents apply to repositories.',
    endpoints: [
      listEndpoint('/api/props/:prop_id/mutations', 'prop mutations', {parameters: [pathParam('prop_id', 'Parent prop id.')]}),
      createEndpoint('/api/props/:prop_id/mutations', 'prop mutation', {mutation: {title: 'Add env file', patch: 'diff --git ...'}}, {parameters: [pathParam('prop_id', 'Parent prop id.')]}),
      updateEndpoint('/api/props/:prop_id/mutations/:id', 'prop mutation', {mutation: {title: 'Updated mutation title'}}, [pathParam('prop_id', 'Parent prop id.'), pathParam()]),
    ],
  },
  {
    title: 'Playgrounds',
    description: 'Playgrounds are provisioned application environments running on a Marquee.',
    endpoints: [
      ...crud('/api/playgrounds', 'playground', 'playgrounds', playgroundBody),
      endpoint({
        method: 'POST',
        path: '/api/playgrounds/:id/operations',
        title: 'Queue playground operation',
        description: [
          'Queues a lifecycle operation for a playground.',
          'Allowed actions include `start`, `stop`, `rollout`, `hard_restart`, `retry_compose`, `enable_maintenance`, and `disable_maintenance`.',
          'Actions that use a Marquee require it to be funded and return `MARQUEE_NOT_FUNDED` when unpaid.',
          'Use the returned async request status to follow long-running remote Docker work.',
        ],
        parameters: [pathParam()],
        requestBody: body('Lifecycle operation request.', {action: 'rollout'}),
        responses: acceptedResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/playgrounds/:id/expiration',
        title: 'Extend playground expiration',
        description: [
          'Updates a playground expiration window using a duration in hours.',
          'Use it for temporary environments that should stay alive longer during testing or review.',
          'The response returns the updated playground state after the new expiration is applied.',
        ],
        parameters: [pathParam()],
        requestBody: body('Expiration extension request.', {duration_hours: 24}),
        responses: updateResponses,
      }),
      endpoint({
        method: 'GET',
        path: '/api/playgrounds/:id/compose',
        title: 'Read rendered compose',
        description: [
          'Returns the Docker Compose configuration rendered for the playground.',
          'Use it for diagnostics or to compare the final deployed config against the source playspec.',
          'The payload reflects Fibe transformations, injected labels, and deployment defaults.',
        ],
        parameters: [pathParam()],
        responses: showResponses,
      }),
      endpoint({
        method: 'GET',
        path: '/api/playgrounds/:id/status',
        title: 'Read cached playground status',
        description: [
          'Returns the latest cached status for the playground.',
          'Use it for fast UI or automation checks when a fresh remote query is not required.',
          'To force a remote refresh, queue `POST /api/playgrounds/:id/status`.',
        ],
        parameters: [pathParam()],
        responses: showResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/playgrounds/:id/status',
        title: 'Refresh playground status',
        description: [
          'Queues a remote status refresh for the playground.',
          'Use it when cached status is stale and automation needs an up-to-date Docker view.',
          'The async result can be polled through the returned status URL.',
        ],
        parameters: [pathParam()],
        responses: acceptedResponses,
      }),
      endpoint({
        method: ['GET', 'POST'],
        path: '/api/playgrounds/:id/debug',
        title: 'Read or refresh playground debug data',
        description: [
          'GET returns cached debug information, while POST queues a fresh remote debug collection.',
          'Use this endpoint when diagnosing failed deploys, unhealthy services, or network exposure problems.',
          'The POST form returns an async request because debug collection may contact the remote Marquee.',
        ],
        parameters: [pathParam()],
        responses: acceptedResponses,
      }),
      endpoint({
        method: 'GET',
        path: '/api/playgrounds/:id/env_metadata',
        title: 'Read environment metadata',
        description: [
          'Returns metadata about the environment values attached to the playground.',
          'Use it to understand which variables, secrets, and generated values Fibe expects when the Playground runs.',
          'The endpoint does not reveal secret values unless the API surface explicitly allows them.',
        ],
        parameters: [pathParam()],
        responses: showResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/playgrounds/:id/logs',
        title: 'Queue playground log snapshot',
        description: [
          'Queues a log snapshot for a playground service.',
          'Provide `service` or `service_name` and optionally `tail` to bound the amount of log output.',
          'The result is asynchronous because log collection reads from the remote Marquee.',
        ],
        parameters: [pathParam()],
        requestBody: body('Log snapshot request.', {service: 'web', tail: 200}),
        responses: acceptedResponses,
      }),
    ],
  },
  {
    title: 'Playspecs',
    description: 'Playspecs define application composition before it is launched into playgrounds.',
    endpoints: [
      endpoint({
        method: 'POST',
        path: '/api/compose_validations',
        title: 'Validate compose',
        description: [
          'Validates Docker Compose input against Fibe parsing and deployment expectations.',
          'Use it before creating or updating a playspec to catch unsupported keys and missing metadata.',
          'The response reports validation success or structured errors that can be shown directly in tooling.',
        ],
        requestBody: body('Compose validation request.', {compose_yaml: 'services:\n  web:\n    image: nginx:alpine'}),
        responses: [{status: '200', description: 'Validation completed.'}, {status: '422', description: 'Compose validation failed.'}],
      }),
      ...crud('/api/playspecs', 'playspec', 'playspecs', playspecBody),
      endpoint({
        method: 'GET',
        path: '/api/playspecs/:id/services',
        title: 'List playspec services',
        description: [
          'Returns the services detected in a playspec.',
          'Use it when choosing service names for mounts, registry credentials, logs, or lifecycle actions.',
          'The response is based on the parsed compose model Fibe will use for deployment.',
        ],
        parameters: [pathParam()],
        responses: showResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/playspecs/:id/template_switch_previews',
        title: 'Preview template switch',
        description: [
          'Previews the effect of moving a playspec to a different template version.',
          'Use it to show diffs and compatibility warnings before applying a template upgrade.',
          'The response is read-only and does not mutate the playspec.',
        ],
        parameters: [pathParam()],
        requestBody: body('Template switch preview request.', {version_id: 123}),
        responses: [{status: '200', description: 'Returns the preview result.'}, {status: '422', description: 'The switch cannot be previewed.'}],
      }),
      endpoint({
        method: 'POST',
        path: '/api/playspecs/:id/template_switches',
        title: 'Apply template switch',
        description: [
          'Applies a template version switch to the playspec.',
          'Use it after reviewing the preview and accepting any migration implications.',
          'The response returns the updated playspec or validation errors.',
        ],
        parameters: [pathParam()],
        requestBody: body('Template switch request.', {version_id: 123}),
        responses: updateResponses,
      }),
      endpoint({
        method: ['POST', 'PATCH', 'DELETE'],
        path: '/api/playspecs/:id/mounts',
        title: 'Manage playspec mounts',
        description: [
          'Adds, updates, or removes a mounted file definition on the playspec.',
          'Use mounts for generated files, config overlays, and source-backed files that must appear in the running container.',
          'The method controls whether the mount is created, changed, or removed.',
        ],
        parameters: [pathParam()],
        requestBody: body('Mount mutation request.', {mount: {path: '/app/.env', content: 'KEY=value'}}),
        responses: updateResponses,
      }),
      endpoint({
        method: ['POST', 'DELETE'],
        path: '/api/playspecs/:id/registry_credentials',
        title: 'Manage registry credentials',
        description: [
          'Adds or removes container registry credentials for a playspec.',
          'Use it when private images must be pulled during playground deployment.',
          'Credential values should be treated as secrets and rotated when no longer needed.',
        ],
        parameters: [pathParam()],
        requestBody: body('Registry credential request.', {registry: 'ghcr.io', username: 'octocat', password: 'token'}),
        responses: updateResponses,
      }),
    ],
  },
  {
    title: 'Import templates',
    description: 'Import templates model reusable launchable templates and their versioned source.',
    endpoints: [
      ...crud('/api/import_templates', 'import template', 'import templates', importTemplateBody),
      endpoint({
        method: 'GET',
        path: '/api/import_templates/:id/lineage',
        title: 'Read template lineage',
        description: [
          'Returns parent, fork, and version lineage for an import template.',
          'Use it to explain where a template came from and how it relates to other published templates.',
          'The response is read-only and suitable for audit or UI display.',
        ],
        parameters: [pathParam()],
        responses: showResponses,
      }),
      listEndpoint('/api/import_templates/:id/versions', 'template versions', {parameters: [pathParam()]}),
      createEndpoint('/api/import_templates/:id/versions', 'template version', {version: {name: 'v1', notes: 'Initial version'}}, {parameters: [pathParam()]}),
      deleteEndpoint('/api/import_templates/:id/versions/:version_id', 'template version', [pathParam(), pathParam('version_id', 'Template version id.')]),
      endpoint({
        method: 'POST',
        path: '/api/import_templates/:id/patch_previews',
        title: 'Preview template patch',
        description: [
          'Previews a source patch against an import template without applying it.',
          'Use it to validate generated edits and show the resulting diff before persisting changes.',
          'The response can include transformed source, validation output, and patch diagnostics.',
        ],
        parameters: [pathParam()],
        requestBody: body('Patch preview request.', {patch: 'diff --git ...'}),
        responses: [{status: '200', description: 'Returns the patch preview.'}, {status: '422', description: 'The patch could not be applied.'}],
      }),
      endpoint({
        method: 'POST',
        path: '/api/import_templates/:id/patches',
        title: 'Apply template patch',
        description: [
          'Applies a patch to the import template source.',
          'Use it after a preview succeeds and the caller is ready to persist the change.',
          'The response returns the updated template or patch application errors.',
        ],
        parameters: [pathParam()],
        requestBody: body('Patch apply request.', {patch: 'diff --git ...'}),
        responses: updateResponses,
      }),
      endpoint({
        method: ['PUT', 'DELETE', 'POST'],
        path: '/api/import_templates/:id/source',
        title: 'Manage template source',
        description: [
          'PUT replaces source, DELETE clears source, and POST refreshes source metadata.',
          'Use this endpoint to keep the template source synchronized with its backing repository or uploaded content.',
          'Source changes can affect future versions and launch behavior, so validate before publishing.',
        ],
        parameters: [pathParam()],
        requestBody: body('Template source mutation request.', {source_url: 'https://github.com/example/template'}),
        responses: updateResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/import_templates/:id/versions/:version_id/upgrades',
        title: 'Upgrade linked playspecs',
        description: [
          'Queues upgrades for playspecs linked to a template version.',
          'Use it when a published version should roll forward dependent application definitions.',
          'The operation can be long-running because each linked playspec may need validation and mutation.',
        ],
        parameters: [pathParam(), pathParam('version_id', 'Template version id.')],
        responses: acceptedResponses,
      }),
      endpoint({
        method: 'PATCH',
        path: '/api/import_templates/:id/versions/:version_id/publication',
        title: 'Update version publication',
        description: [
          'Changes whether a template version is publicly visible or otherwise published.',
          'Use it after validating source, generated images, and launch behavior.',
          'Publication state controls how the template appears in catalog and launch flows.',
        ],
        parameters: [pathParam(), pathParam('version_id', 'Template version id.')],
        requestBody: body('Publication request.', {public: true}),
        responses: updateResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/import_templates/:id/launches',
        title: 'Launch import template',
        description: [
          'Launches a playground or related resources from the selected import template.',
          'Use it when the caller has already chosen a template and wants to start deployment directly.',
          'Provisioning may be queued and should be followed through async status or returned resource state.',
        ],
        parameters: [pathParam()],
        requestBody: body('Template launch request.', {marquee_id: 123, variables: {APP_NAME: 'demo'}}),
        responses: acceptedResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/import_templates/:id/forks',
        title: 'Fork import template',
        description: [
          'Creates a new template derived from an existing import template.',
          'Use it to customize a public or shared template without modifying the original.',
          'The response returns the forked template resource.',
        ],
        parameters: [pathParam()],
        requestBody: body('Template fork request.', {name: 'Custom Rails starter'}),
        responses: createResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/import_templates/:id/images',
        title: 'Generate template image',
        description: [
          'Generates or attaches preview imagery for an import template.',
          'Use it when updating catalog presentation or refreshing screenshots after source changes.',
          'Image generation may be queued depending on the template and asset pipeline.',
        ],
        parameters: [pathParam()],
        requestBody: body('Template image request.', {prompt: 'Rails app dashboard'}),
        responses: acceptedResponses,
      }),
      endpoint({
        method: 'GET',
        path: '/api/template_categories',
        title: 'List template categories',
        description: [
          'Returns categories used to organize import templates.',
          'Use it for catalog filters, creation forms, and publication workflows.',
          'The endpoint is read-only and returns the currently configured taxonomy.',
        ],
        responses: listResponses,
      }),
    ],
  },
];

export const agentsSections = [
  {
    title: 'Agents',
    description: 'Agent endpoints manage Genies, chat entrypoints, mounts, uploads, and lifecycle operations.',
    endpoints: [
      ...crud('/api/agents', 'agent', 'agents', agentBody),
      endpoint({
        method: ['POST', 'PATCH', 'DELETE'],
        path: '/api/agents/:id/mounts',
        title: 'Manage agent mounts',
        description: [
          'Adds, updates, or removes a file mount for an agent.',
          'Use mounts to provide configuration, source files, or generated context inside the agent workspace.',
          'The method selects whether the mount is created, changed, or removed.',
        ],
        parameters: [pathParam()],
        requestBody: body('Agent mount mutation request.', {mount: {path: '/workspace/notes.md', content: 'Context'}}),
        responses: updateResponses,
      }),
      endpoint({
        method: 'PUT',
        path: '/api/agents/:id/auth',
        title: 'Authenticate agent',
        description: [
          'Updates authentication material or auth state for an agent.',
          'Use it when the agent needs refreshed provider credentials before starting or resuming work.',
          'Credentials should be scoped narrowly and rotated after use.',
        ],
        parameters: [pathParam()],
        requestBody: body('Agent auth request.', {provider: 'github', token: 'ghp_...'}),
        responses: updateResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/agents/:id/chats',
        title: 'Start agent chat',
        description: [
          'Creates a new chat session for an agent.',
          'Use it when a caller wants to start a fresh task thread rather than append to existing conversation state.',
          'The selected Marquee must be funded; unpaid Marquees return `MARQUEE_NOT_FUNDED`.',
          'The response returns the chat state needed by Fibe clients.',
        ],
        parameters: [pathParam()],
        requestBody: body('Chat start request.', {message: 'Investigate the latest deploy failure.'}),
        responses: createResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/agents/:id/restarts',
        title: 'Restart agent chat',
        description: [
          'Restarts the chat process for the selected agent.',
          'Use it after chat failure, dependency changes, or when the current process should be recreated.',
          'Restart work may be asynchronous because it interacts with the Marquee.',
        ],
        parameters: [pathParam()],
        responses: acceptedResponses,
      }),
      endpoint({
        method: 'GET',
        path: '/api/agents/:id/runtime_status',
        title: 'Read agent live status',
        description: [
          'Returns current live status for an agent.',
          'Use it to determine whether the agent is connected, starting, stopped, or unhealthy.',
          'The status is useful before sending messages or uploading files.',
        ],
        parameters: [pathParam()],
        responses: showResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/agents/:id/interrupts',
        title: 'Interrupt agent',
        description: [
          'Requests that an agent stop its current task or generation.',
          'Use it when a user changes direction or a runaway task should be cancelled.',
          'The endpoint returns after the interruption request is accepted, not necessarily after every process has stopped.',
        ],
        parameters: [pathParam()],
        requestBody: body('Optional interrupt reason.', {reason: 'User changed the task.'}),
        responses: acceptedResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/agents/:id/purges',
        title: 'Purge agent state',
        description: [
          'Purges chat state for an agent.',
          'Use it when stale state should be discarded before starting new work.',
          'This is destructive for the selected agent state and should be used intentionally.',
        ],
        parameters: [pathParam()],
        responses: acceptedResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/agents/:id/messages',
        title: 'Send agent message',
        description: [
          'Sends a user message to an agent chat.',
          'Use it for the primary interaction loop after the agent and chat are ready.',
          'Message delivery requires a funded Marquee and returns `MARQUEE_NOT_FUNDED` when unpaid.',
          'The response reflects accepted message state while actual work may continue asynchronously.',
        ],
        parameters: [pathParam()],
        requestBody: body('Agent message request.', {message: 'Check the failing build and summarize the cause.'}),
        responses: acceptedResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/agents/:id/uploads',
        title: 'Upload agent file',
        description: [
          'Uploads a file for use by an agent.',
          'Use it when the agent needs attachments that are not already available in the mounted workspace.',
          'The response returns metadata that can be referenced by later agent messages.',
        ],
        parameters: [pathParam()],
        requestBody: body('Upload metadata or multipart-compatible payload.', {filename: 'context.txt', content: 'Relevant context'}),
        responses: createResponses,
      }),
      endpoint({
        method: 'GET',
        path: '/api/agents/:id/uploads/:filename',
        title: 'Download agent upload',
        description: [
          'Downloads a previously uploaded file for an agent.',
          'Use it to retrieve attachment content by filename after it has been stored.',
          'The filename is part of the route and must match the uploaded artifact name.',
        ],
        parameters: [pathParam(), pathParam('filename', 'Uploaded filename.')],
        responses: showResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/agents/:id/copies',
        title: 'Copy agent',
        description: [
          'Creates a copy of an existing agent.',
          'Use it to duplicate configuration before experimenting with a different task or Marquee.',
          'The copied agent receives its own identity and can be changed independently.',
        ],
        parameters: [pathParam()],
        requestBody: body('Agent copy options.', {name: 'Builder copy'}),
        responses: createResponses,
      }),
    ],
  },
  {
    title: 'Agent defaults',
    description: 'Defaults apply to newly created agents for the authenticated player.',
    endpoints: [
      showEndpoint('/api/agent_defaults', 'agent defaults', []),
      updateEndpoint('/api/agent_defaults', 'agent defaults', {agent_defaults: {model: 'default', instructions: 'Be concise.'}}, []),
      deleteEndpoint('/api/agent_defaults', 'agent defaults', []),
    ],
  },
  {
    title: 'Agent conversation synchronization',
    description: 'Conversation synchronization endpoints are used by agents and clients that mirror conversation state.',
    endpoints: [
      endpoint({
        method: ['GET', 'POST', 'DELETE'],
        path: '/api/agents/:id/conversations',
        title: 'Synchronize agent conversations',
        description: [
          'Reads, creates, or deletes synchronized conversation records for an agent.',
          'Use it when an external agent needs to keep Fibe conversation state aligned with local state.',
          'The method controls whether the caller reads, upserts, or removes conversation data.',
        ],
        parameters: [pathParam()],
        requestBody: body('Conversation sync payload for write methods.', {conversation: {id: 'conv_123', title: 'Build fix'}}),
        responses: updateResponses,
      }),
      endpoint({
        method: ['GET', 'PUT'],
        path: '/api/agents/:id/messages',
        title: 'Synchronize agent messages',
        description: [
          'Reads or replaces synchronized message data for an agent.',
          'Use it when an agent persists messages outside Fibe and needs to mirror them back.',
          'PUT should send the authoritative message list for the current sync cycle.',
        ],
        parameters: [pathParam()],
        requestBody: body('Message sync payload for PUT.', {messages: [{id: 'msg_1', role: 'user', content: 'Hello'}]}),
        responses: updateResponses,
      }),
      endpoint({
        method: ['GET', 'PUT'],
        path: '/api/agents/:id/activity',
        title: 'Synchronize agent activity',
        description: [
          'Reads or replaces synchronized activity events for an agent.',
          'Use it to mirror tool calls, terminal events, and progress markers into Fibe.',
          'The payload is append-like in meaning but PUT replaces the synchronized snapshot.',
        ],
        parameters: [pathParam()],
        requestBody: body('Activity sync payload for PUT.', {activity: [{type: 'command', summary: 'npm test'}]}),
        responses: updateResponses,
      }),
      endpoint({
        method: 'GET',
        path: '/api/agents/:id/live_state',
        title: 'Read live agent state',
        description: [
          'Returns live state for the current agent conversation.',
          'Use it to render active work, streaming status, or availability without loading all messages.',
          'The payload is optimized for current state rather than historical audit.',
        ],
        parameters: [pathParam()],
        responses: showResponses,
      }),
      endpoint({
        method: ['DELETE', 'PATCH'],
        path: '/api/agents/:id/turns/:turn_id',
        title: 'Manage queued turn',
        description: [
          'Deletes or updates a queued agent turn.',
          'Use it when a pending user turn must be cancelled, reordered, or edited before the agent processes it.',
          'The route targets a single turn inside the selected agent.',
        ],
        parameters: [pathParam(), pathParam('turn_id', 'Queued turn id.')],
        requestBody: body('Queued turn update payload for PATCH.', {turn: {content: 'Updated request'}}),
        responses: updateResponses,
      }),
      endpoint({
        method: 'PUT',
        path: '/api/agents/:id/turn_order',
        title: 'Replace queued turn order',
        description: [
          'Replaces the order of queued turns for an agent.',
          'Use it when a client supports reordering pending work before the agent consumes it.',
          'The request should include the complete desired order.',
        ],
        parameters: [pathParam()],
        requestBody: body('Queued turn order payload.', {turn_ids: ['turn_1', 'turn_2']}),
        responses: updateResponses,
      }),
      endpoint({
        method: ['GET', 'PUT'],
        path: '/api/agents/:id/provider_traffic',
        title: 'Synchronize provider traffic',
        description: [
          'Reads or replaces provider traffic metrics for an agent.',
          'Use it to report model-provider usage, request counts, or traffic snapshots collected by the agent.',
          'The data is operational telemetry and should not include secrets.',
        ],
        parameters: [pathParam()],
        requestBody: body('Provider traffic payload for PUT.', {provider_traffic: {openai: {requests: 10}}}),
        responses: updateResponses,
      }),
      endpoint({
        method: 'GET',
        path: '/api/agents/:id/gitea_token',
        title: 'Read agent Gitea token',
        description: [
          'Returns a Gitea token scoped for the selected agent.',
          'Use it when an agent needs to interact with Fibe-managed Gitea repositories.',
          'Treat the returned token as a secret and avoid logging it.',
        ],
        parameters: [pathParam()],
        responses: showResponses,
      }),
    ],
  },
  {
    title: 'Agent subresources',
    description: 'Subresources hang off a specific agent and represent artefacts, feedback, pokes, and mutter entries.',
    endpoints: [
      ...crud('/api/agents/:agent_id/artefacts', 'agent artefact', 'agent artefacts', artefactBody).map((item) => ({
        ...item,
        parameters: [pathParam('agent_id', 'Parent agent id.'), ...(item.parameters || []).filter((param) => param.name !== 'page' && param.name !== 'per_page' && param.name !== 'agent_id')],
      })),
      endpoint({
        method: 'GET',
        path: '/api/agents/:agent_id/artefacts/:id/download',
        title: 'Download agent artefact',
        description: [
          'Downloads the binary or text content of an artefact that belongs to an agent.',
          'Use it when metadata from the artefact endpoint is not enough and the caller needs the produced file.',
          'The response may be a file download rather than a JSON envelope.',
        ],
        parameters: [pathParam('agent_id', 'Parent agent id.'), pathParam()],
        responses: showResponses,
      }),
      ...crud('/api/agents/:agent_id/feedbacks', 'feedback', 'feedback records', feedbackBody).map((item) => ({
        ...item,
        parameters: [pathParam('agent_id', 'Parent agent id.'), ...(item.parameters || []).filter((param) => param.name !== 'page' && param.name !== 'per_page' && param.name !== 'agent_id')],
      })),
      ...crud('/api/agents/:agent_id/pokes', 'poke', 'pokes', pokeBody).map((item) => ({
        ...item,
        parameters: [pathParam('agent_id', 'Parent agent id.'), ...(item.parameters || []).filter((param) => param.name !== 'page' && param.name !== 'per_page' && param.name !== 'agent_id')],
      })),
      endpoint({
        method: ['GET', 'POST'],
        path: '/api/agents/:agent_id/mutter',
        title: 'Read or create mutter entry',
        description: [
          'Reads or creates mutter entries for an agent.',
          'Use this lower-level channel for agent notes that should be visible to Fibe but are not normal chat messages.',
          'POST creates a new entry, while GET returns the current collection or state.',
        ],
        parameters: [pathParam('agent_id', 'Parent agent id.')],
        requestBody: body('Mutter creation payload for POST.', {mutter: {body: 'Runtime note'}}),
        responses: updateResponses,
      }),
    ],
  },
  {
    title: 'Global artefacts',
    description: 'Global artefact endpoints expose artefacts without nesting them under a specific agent route.',
    endpoints: [
      ...crud('/api/artefacts', 'artefact', 'artefacts', artefactBody).filter((item) => item.method !== 'DELETE'),
      endpoint({
        method: 'GET',
        path: '/api/artefacts/:id/download',
        title: 'Download artefact',
        description: [
          'Downloads the content of a global artefact.',
          'Use it when a caller needs the generated file or document represented by artefact metadata.',
          'The response may be file content rather than a JSON envelope.',
        ],
        parameters: [pathParam()],
        responses: showResponses,
      }),
    ],
  },
  {
    title: 'Knowledge and monitoring',
    description: 'Knowledge endpoints expose conversations, memory, and monitor events for automation and diagnostics.',
    endpoints: [
      endpoint({
        method: 'GET',
        path: '/api/events',
        title: 'List monitor events',
        description: [
          'Returns monitor events visible to the API key.',
          'Use filters to narrow events by agent, type, timestamp, or text query when debugging agent behavior.',
          'API keys must include the monitor read scope when scoped access is enforced.',
        ],
        parameters: [page, perPage, query('agent_id', 'integer', 'Filter events for one agent.'), query('type', 'string', 'Filter by one event type.'), query('types', 'string', 'Comma-separated event types.'), query('since', 'datetime', 'Return events after this timestamp.'), query('q', 'string', 'Text search query.'), query('content_limit', 'integer', 'Limit content included per event.', 500)],
        responses: listResponses,
      }),
      listEndpoint('/api/conversations', 'conversations'),
      showEndpoint('/api/conversations/:id', 'conversation'),
      deleteEndpoint('/api/conversations/:id', 'conversation'),
      endpoint({
        method: 'GET',
        path: '/api/conversations/:id/raw_events',
        title: 'Read raw conversation events',
        description: [
          'Returns low-level raw events for a conversation.',
          'Use it for diagnostics, replay, or export workflows that need more detail than the normalized conversation record.',
          'The payload can be larger than the conversation summary and should be paged or filtered by clients when possible.',
        ],
        parameters: [pathParam()],
        responses: showResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/conversation_syncs',
        title: 'Synchronize conversations',
        description: [
          'Synchronizes conversation data from an agent or external client into Fibe.',
          'Use it when conversation state is produced outside Fibe but should appear in Fibe knowledge surfaces.',
          'The server validates ownership and shape before accepting the sync payload.',
        ],
        requestBody: body('Conversation sync payload.', {conversations: [{id: 'conv_123', title: 'Deploy fix'}]}),
        responses: acceptedResponses,
      }),
      listEndpoint('/api/memories', 'memories'),
      showEndpoint('/api/memories/:id', 'memory'),
      deleteEndpoint('/api/memories/:id', 'memory'),
      endpoint({
        method: 'POST',
        path: '/api/memories',
        title: 'Create memory',
        description: [
          'Stores a memory entry for future retrieval.',
          'Use it to persist durable facts, decisions, or project context that agents should be able to reuse.',
          'Memory content should avoid secrets and short-lived operational noise.',
        ],
        requestBody: body('Memory creation payload.', {content: 'Production deploys run from GitHub Actions.'}),
        responses: createResponses,
      }),
    ],
  },
];

export const integrationsSections = [
  {
    title: 'Identity and API keys',
    description: 'Identity endpoints show the current token context and manage API keys.',
    endpoints: [
      endpoint({
        method: 'GET',
        path: '/api/me',
        title: 'Read current API identity',
        description: [
          'Returns the player represented by the bearer token and the scopes attached to the current API key.',
          'Use it after creating a token to confirm the key belongs to the expected account.',
          'The endpoint is read-only and safe for health checks that need authenticated identity.',
        ],
        responses: showResponses,
      }),
      listEndpoint('/api/api_keys', 'API keys', {parameters: [query('q', 'string', 'Search API keys by label.'), query('sort', 'string', 'Sort by supported fields such as label or created_at.')] }),
      createEndpoint('/api/api_keys', 'API key', {api_key: {label: 'CI token', expires_at: '2026-12-31T23:59:59Z', agent_accessible: false, scopes: ['monitor:read'], granular_scopes: {agents: [123]}}}),
      deleteEndpoint('/api/api_keys/:id', 'API key'),
    ],
  },
  {
    title: 'Secrets and job environment',
    description: 'Secrets and job environment endpoints manage values injected into jobs and playgrounds.',
    endpoints: [
      ...crud('/api/secrets', 'secret', 'secrets', {secret: {name: 'DATABASE_PASSWORD', value: 'change-me', scope: 'playground'}}),
      ...crud('/api/job_env', 'job environment variable', 'job environment variables', {job_env: {key: 'RAILS_ENV', value: 'production'}}),
    ],
  },
  {
    title: 'Repository integrations',
    description: 'Repository endpoints connect GitHub, Gitea, and app installation state to Fibe resources.',
    endpoints: [
      endpoint({
        method: 'POST',
        path: '/api/repo_status_checks',
        title: 'Update repository status check',
        description: [
          'Creates or updates a repository status check for a commit or branch.',
          'Use it from automation that reports Fibe validation, deploy, or template status back to source control.',
          'The request identifies the repository target and the status payload to publish.',
        ],
        requestBody: body('Repository status check payload.', {repository: 'fibegg/app', sha: 'abc123', state: 'success', description: 'Fibe validation passed'}),
        responses: createResponses,
      }),
      listEndpoint('/api/github_repositories', 'GitHub repositories', {parameters: [query('q', 'string', 'Search repository names.')] }),
      createEndpoint('/api/github_repositories', 'GitHub repository', {github_repository: {full_name: 'example/app', installation_id: 123}}),
      createEndpoint('/api/gitea_repositories', 'Gitea repository', {gitea_repository: {name: 'app', owner: 'fibe'}}),
      endpoint({
        method: 'GET',
        path: '/api/github_apps/connect',
        title: 'Read GitHub App install URL',
        description: [
          'Returns the GitHub App installation URL for this Fibe server.',
          'CLI users normally call `fibe github apps connect`, open the returned URL in a browser, and finish setup on GitHub.',
          'After setup, use `/api/installations` to list connected installations and select `github_account` or `github_installation_id` for repo-backed launch flows.',
        ],
        responses: showResponses,
      }),
      endpoint({
        method: 'GET',
        path: '/api/github_token',
        title: 'Read GitHub token',
        description: [
          'Returns a GitHub token for integration workflows that need direct GitHub API access.',
          'Use it only when the SDK or higher-level repository endpoints do not cover the task.',
          'Treat the returned token as a secret and avoid writing it to logs.',
        ],
        responses: showResponses,
      }),
      listEndpoint('/api/installations', 'GitHub app installations'),
      endpoint({
        method: 'GET',
        path: '/api/installations/:id/repos',
        title: 'List installation repositories',
        description: [
          'Returns repositories available through a GitHub app installation.',
          'Use it to populate repository pickers after the user selects an installation.',
          'The result is limited by GitHub installation permissions and Fibe visibility rules.',
        ],
        parameters: [pathParam()],
        responses: listResponses,
      }),
      endpoint({
        method: 'GET',
        path: '/api/installations/:id/token',
        title: 'Read installation token',
        description: [
          'Returns an installation token for a GitHub app installation.',
          'Use it for short-lived GitHub API calls scoped to repositories in that installation.',
          'Installation tokens are sensitive and should be kept out of logs and persisted storage.',
        ],
        parameters: [pathParam()],
        responses: showResponses,
      }),
    ],
  },
  {
    title: 'Webhook endpoints',
    description: 'Webhook endpoint records describe outbound webhook subscriptions managed through the API.',
    endpoints: [
      ...crud('/api/webhook_endpoints', 'webhook endpoint', 'webhook endpoints', {webhook_endpoint: {url: 'https://example.com/fibe-webhook', event_types: ['playground.updated'], enabled: true}}),
      endpoint({
        method: 'GET',
        path: '/api/webhook_endpoints/:webhook_endpoint_id/deliveries',
        title: 'List webhook deliveries',
        description: [
          'Returns delivery attempts for a webhook endpoint.',
          'Use it to diagnose failed webhook calls, inspect status codes, and audit retry behavior.',
          'The route is nested under the webhook endpoint whose deliveries are being inspected.',
        ],
        parameters: [pathParam('webhook_endpoint_id', 'Parent webhook endpoint id.'), page, perPage],
        responses: listResponses,
      }),
      endpoint({
        method: 'POST',
        path: '/api/webhook_endpoints/:id/test_deliveries',
        title: 'Send test webhook delivery',
        description: [
          'Sends a test delivery to the configured webhook endpoint.',
          'Use it after creating or updating an endpoint to confirm the receiver accepts Fibe payloads.',
          'The response records the delivery attempt and any immediate transport result.',
        ],
        parameters: [pathParam()],
        requestBody: body('Optional test delivery options.', {event_type: 'playground.updated'}),
        responses: createResponses,
      }),
      endpoint({
        method: 'GET',
        path: '/api/webhook_event_types',
        title: 'List webhook event types',
        description: [
          'Returns the event types that can be subscribed to by webhook endpoints.',
          'Use it to build event-type selectors and validate webhook endpoint configuration.',
          'The list reflects the server-side events currently supported by Fibe.',
        ],
        responses: listResponses,
      }),
    ],
  },
  {
    title: 'Audit logs',
    description: 'Audit logs expose security- and operations-relevant activity for the authenticated player.',
    endpoints: [
      endpoint({
        method: 'GET',
        path: '/api/audit_logs',
        title: 'List audit logs',
        description: [
          'Returns audit log entries visible to the authenticated API key.',
          'Use it for compliance exports, incident review, and automation that watches sensitive actions.',
          'Audit log entries are paginated and should be filtered client-side when exporting large ranges.',
        ],
        parameters: [page, perPage],
        responses: listResponses,
      }),
    ],
  },
];
