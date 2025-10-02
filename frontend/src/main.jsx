import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import App from './routes/Home/App.jsx'
import AccountPage from './routes/Account/AccountPage.jsx';
import ResumeGenerationPage from './routes/ResumeGeneration/ResumeGenerationPage.jsx';
import ProfileCreationPage from './routes/ProfileCreation/ProfileCreationPage.jsx'
import RegisterPage from './routes/Register/RegisterPage.jsx'
import LoginPage from './routes/Login/LoginPage.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  { //will be loaded with user id
    path: "/account",
    element: <AccountPage/>,
  },
  { //will be loaded with user id
    path: "/profile",
    element: <ProfileCreationPage />,
  },{
    path:"/login",
    element:<LoginPage/>
  },
  {
    path:"/register",
    element:<RegisterPage/>
  }, 
  {
    path:"/resumegeneration",
    element:<ResumeGenerationPage/>
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
