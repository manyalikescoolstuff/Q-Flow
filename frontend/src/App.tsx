import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes/router';

/**
 * Root application component.
 * All layout and page rendering is handled by the router –
 * App.tsx stays minimal.
 */
export default function App() {
  return <RouterProvider router={router} />;
}
