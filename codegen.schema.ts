import type { CodegenConfig } from '@graphql-codegen/cli';

// `npm run schema:download` - introspects the running API and writes its SDL to schema.graphql.
// Point it at another server with SERVER_URL (same variable the app uses).
const serverUrl = process.env.SERVER_URL ?? 'http://localhost:3000';

const config: CodegenConfig = {
  overwrite: true,
  schema: `${serverUrl}/graphql`,
  generates: {
    'schema.graphql': {
      plugins: ['schema-ast'],
      config: { includeDirectives: false, sort: true },
    },
  },
};

export default config;
