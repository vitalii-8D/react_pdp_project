import type { CodegenConfig } from '@graphql-codegen/cli';

// Generates TypedDocumentNodes + result/variables types for every operation in app/graphql/**.
// Types come from the local `schema.graphql` snapshot (refresh it with `npm run schema:download`),
// so codegen works offline and the generated types only change when the snapshot is updated.
const config: CodegenConfig = {
  overwrite: true,
  schema: 'schema.graphql',
  documents: ['app/graphql/**/*.graphql'],
  generates: {
    'app/graphql/__generated__/graphql.ts': {
      plugins: ['typescript-operations', 'typed-document-node'],
      config: {
        avoidOptionals: { field: true, inputValue: false },
        defaultScalarType: 'unknown',
        nonOptionalTypename: true,
        skipTypeNameForRoot: true,
        onlyOperationTypes: true,
        useTypeImports: true,
        scalars: { DateTime: 'string' },
        // Schema enums become real TS enums (e.g. `PostStatus.Published`), re-exported from
        // app/enums so API values and app code share one definition.
        enumType: 'native',
      },
    },
  },
};

export default config;
