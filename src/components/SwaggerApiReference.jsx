import React, {useMemo} from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import styles from './SwaggerApiReference.module.css';

const SERVERS = [
  {url: 'https://fibe.gg', description: 'Production'},
  {url: 'https://next.fibe.live', description: 'Staging'},
];

function methodsFor(endpoint) {
  return Array.isArray(endpoint.method) ? endpoint.method : [endpoint.method];
}

function operationId(method, path) {
  return `${method.toLowerCase()}_${path.replace(/^\/api\//, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '')}`;
}

function schemaFromExample(value) {
  if (Array.isArray(value)) {
    return {type: 'array', items: value.length > 0 ? schemaFromExample(value[0]) : {}};
  }
  if (value === null) return {nullable: true};
  if (typeof value === 'boolean') return {type: 'boolean'};
  if (typeof value === 'number') return Number.isInteger(value) ? {type: 'integer'} : {type: 'number'};
  if (typeof value === 'string') return {type: 'string', example: value};
  if (typeof value === 'object') {
    return {
      type: 'object',
      properties: Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, schemaFromExample(nested)])),
    };
  }
  return {type: 'object'};
}

function parameterToOpenApi(parameter) {
  return {
    name: parameter.name,
    in: parameter.in,
    required: parameter.in === 'path' ? true : Boolean(parameter.required),
    description: parameter.description,
    schema: {
      type: parameter.type === 'datetime' ? 'string' : parameter.type,
      ...(parameter.type === 'datetime' ? {format: 'date-time'} : {}),
      ...(parameter.example !== undefined && parameter.example !== '' ? {example: parameter.example} : {}),
    },
  };
}

function requestBodyToOpenApi(requestBody) {
  if (!requestBody) return undefined;
  return {
    required: true,
    description: requestBody.description,
    content: {
      'application/json': {
        schema: schemaFromExample(requestBody.example || {}),
        example: requestBody.example || {},
      },
    },
  };
}

function responsesToOpenApi(responses = []) {
  return Object.fromEntries(
    responses.map((response) => [
      response.status,
      {
        description: response.description,
        ...(response.status === '204'
          ? {}
          : {
              content: {
                'application/json': {
                  schema: {type: 'object', additionalProperties: true},
                },
              },
            }),
      },
    ]),
  );
}

function buildSpec(sections) {
  const paths = {};

  for (const section of sections) {
    for (const endpoint of section.endpoints) {
      if (!paths[endpoint.path]) paths[endpoint.path] = {};
      for (const method of methodsFor(endpoint)) {
        paths[endpoint.path][method.toLowerCase()] = {
          tags: [section.title],
          summary: endpoint.title,
          description: endpoint.description.join('\n\n'),
          operationId: operationId(method, endpoint.path),
          security: [{bearerAuth: []}],
          parameters: (endpoint.parameters || []).map(parameterToOpenApi),
          requestBody: requestBodyToOpenApi(endpoint.body),
          responses: responsesToOpenApi(endpoint.responses),
        };
      }
    }
  }

  return {
    openapi: '3.1.0',
    info: {
      title: 'Fibe API',
      version: '2026-05-20',
      description: 'Public Fibe /api namespace. Excludes the legacy Stripe webhook, commented team routes, and internal routes outside /api.',
    },
    servers: SERVERS,
    tags: sections.map((section) => ({name: section.title, description: section.description})),
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'FIBE_API_KEY',
          description: 'Paste your FIBE_API_KEY without the `Bearer` prefix.',
        },
      },
    },
    paths,
  };
}

export default function SwaggerApiReference({sections}) {
  const spec = useMemo(() => buildSpec(sections), [sections]);

  return (
    <div className={styles.root}>
      <div className={styles.instructions}>
        <strong>Test against Fibe:</strong> choose Production or Staging in the server selector, click <strong>Authorize</strong>, paste your <code>FIBE_API_KEY</code>, then use <strong>Try it out</strong> on any endpoint. Swagger UI also generates the equivalent curl command for terminal use.
      </div>
      <SwaggerUI
        spec={spec}
        tryItOutEnabled
        persistAuthorization={false}
        docExpansion="none"
        defaultModelsExpandDepth={-1}
        deepLinking
        displayRequestDuration
      />
    </div>
  );
}
