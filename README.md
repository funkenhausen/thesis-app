# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
# Emotion Detection Web App (Frontend)

This React application provides a user interface to interact with the Emotion Detection API Backend. It allows users to input text, select a model (BERT or Naive Bayes), and view the emotion predictions.

## Prerequisites

*   Node.js (v18.x or newer recommended)
*   npm (Node Package Manager, comes with Node.js) or yarn
*   Git (for cloning the repository)
*   A running instance of the [Emotion Detection API Backend](#link-to-backend-readme-if-in-same-repo-or-url).

## Setup

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <your-repository-url>
    cd <your-repository-url>/thesis-app
    ```

2.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root of the `thesis-app` directory (`thesis-app/.env`) with the following content:

    ```env
    # .env file in your frontend (thesis-app) directory

    # URL of your running backend API
    # If backend is running on the same machine on port 5001:
    VITE_API_BASE_URL=http://localhost:5001

    # IMPORTANT: For accessing from other devices on your local network (e.g., your phone):
    # Replace 'localhost' with your computer's actual local network IP address.
    # Example: VITE_API_BASE_URL=http://192.168.1.2:5001
    # Ensure this IP and port match where your backend is accessible.
    ```
    **Instructions:**
    *   If you are only running and accessing the app on the same computer, `VITE_API_BASE_URL=http://localhost:5001` is usually fine.
    *   **To access the app from your phone or another computer on your local network:**
        1.  Find your computer's local network IP address (e.g., `192.168.1.2`).
        2.  Set `VITE_API_BASE_URL=http://YOUR_PC_NETWORK_IP:5001` (replace with your actual IP and the backend's port).
        3.  Ensure your backend's `ALLOWED_ORIGINS` (in its own `.env` file) includes `http://YOUR_PC_NETWORK_IP:5173` (or whatever port Vite serves on for network access).

## Running the Frontend Application

1.  **Ensure the backend API server is running.**
2.  **Navigate to the `thesis-app` directory if you aren't already there.**
3.  **Start the Vite development server:**
    Using npm:
    ```bash
    npm run dev
    ```
    Or using yarn:
    ```bash
    yarn dev
    ```
4.  Vite will typically output URLs like:
    *   **Local:** `http://localhost:5173` (or similar port)
    *   **Network:** `http://YOUR_PC_NETWORK_IP:5173` (use this to access from other devices)

5.  Open the appropriate URL in your web browser.

## Features

*   Chat-like interface for sending text.
*   Model selection (BERT / Naive Bayes).
*   Displays predicted emotion and confidence.
*   Shows detailed emotion probabilities.
*   (For BERT) Can display model analysis like token attention scores.
*   Theme selection (Dark/Light).
*   Chat history management (stored in localStorage).
*   Settings modal to configure API URL (useful if `VITE_API_BASE_URL` needs to be changed without restarting Vite, though changes here are also stored in `localStorage`).

## Troubleshooting

*   **"Failed to fetch" or API errors:**
    *   Ensure the backend API is running and accessible at the URL specified by `VITE_API_BASE_URL` (or the URL in the app's settings).
    *   Test the backend's `/health` endpoint directly in your browser (e.g., `http://YOUR_PC_NETWORK_IP:5001/health`).
    *   Check the browser's developer console (Network tab and Console tab) for more detailed error messages (e.g., CORS errors).
    *   Verify the backend's `ALLOWED_ORIGINS` setting.
    *   Ensure your computer's firewall is not blocking connections to the backend port (e.g., 5001) from other devices if accessing via network IP.
*   **`VITE_API_BASE_URL` not working:**
    *   Make sure the `.env` file is in the root of the `thesis-app` directory.
    *   **Restart the Vite development server** after any changes to the `.env` file.
    *   Clear `localStorage` for the application in your browser to ensure it uses the new default from `.env` rather than a previously saved setting.