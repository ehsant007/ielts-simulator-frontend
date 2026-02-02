import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  input: 'http://localhost:8000/api/v1/openapi.json',
  output: {
    format: 'prettier',
    lint: 'eslint',
    path: './src/client',
  },
  plugins: [
   //  '@hey-api/schemas',
   //  {
   //    dates: true,
   //    name: '@hey-api/transformers',
   //  },
   //  {
   //    enums: 'javascript',
   //    name: '@hey-api/typescript',
   //  },
   //  {
   //    name: '@hey-api/sdk',
   //    transformer: true,
   //  },
	//  '@tanstack/react-query',
    {
      name: '@hey-api/client-next',
      runtimeConfigPath: '@/hey-api', 
		throwOnError: true,
    },
  ],
});
