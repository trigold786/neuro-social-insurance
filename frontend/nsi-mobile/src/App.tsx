import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Sandbox from './pages/Sandbox'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import OnboardingGuide from './components/OnboardingGuide'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sandbox" element={<Sandbox />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <OnboardingGuide />
    </Layout>
  )
}

export default App