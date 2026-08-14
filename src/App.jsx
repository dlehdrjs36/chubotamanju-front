
import './App.css'
import OAuth2Redirect from './pages/OAuth2Redirect'
import NotFound from './pages/Notfound'
import Home from './pages/Home'
import { Routes, Route } from 'react-router-dom'
import GlobalLayout from './layout/global-layout'


function App() {

  return (
    <>
      <Routes>
        <Route element={<GlobalLayout />} >
          <Route path="/" element={<Home />} />
          <Route path="/oauth2/redirect" element={<OAuth2Redirect/>} />
          <Route path="/a/:id" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
