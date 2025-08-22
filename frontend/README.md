# Interview AI Application - Frontend

This is the frontend for the Interview AI application, built with React, TypeScript, and Vite.

## Prerequisites

- Node.js (latest LTS version recommended)
- npm or yarn
- Backend service running (see the backend README)

## Environment Setup

1. Create a `.env` file in the frontend directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
```

## Installation

1. Install dependencies:

```bash
npm install
# or if you're using yarn
yarn
```

2. Start the development server:

```bash
npm run dev
# or with yarn
yarn dev
```

The frontend will be available at `http://localhost:5173`.

## Building for Production

To create a production build:

```bash
npm run build
# or with yarn
yarn build
```

## Project Structure

- `src/components/` - Reusable UI components
  - `CodeEditor.tsx` - Code editor component for technical interviews
  - `Navbar.tsx` - Navigation bar component
  - `SignInForm.tsx` and `SignUpForm.tsx` - Authentication forms
  - `SplitScreen.tsx` - Layout component for interview interface
  
- `src/routes/` - Application pages and routes
  - `App.tsx` - Main application component
  - `Behavioral.tsx` - Behavioral interview page
  - `HomePage.tsx` - Landing page
  - `InterviewRoom.tsx` - Main interview interface
  - `Interviews.tsx` - List of interviews
  - `InterviewSummary.tsx` - Post-interview summary
  - `SignPage.tsx` - Authentication page

## Technologies Used

- React 19
- TypeScript
- Vite
- React Router
- Supabase for authentication
- Bootstrap and React Bootstrap for UI components
- Syntax highlighters for code display

## Development

The application uses Vite's hot module replacement for fast development cycles. Changes to code will be reflected immediately in the browser.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

