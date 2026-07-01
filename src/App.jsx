import { useState } from 'react'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import ReportIssue from './pages/ReportIssue'
import IssueMap from './pages/IssueMap'
import Profile from './pages/Profile'
import Community from './pages/Community'

export default function App() {
  const [page, setPage] = useState('landing')

  const navigate = (p) => {
    setPage(p)
    window.scrollTo(0, 0)
  }

 const renderPage = () => {
   switch (page) {
     case 'landing'  : return <Landing   navigate={navigate} />
     case 'dashboard': return <Dashboard navigate={navigate} />
     case 'report'   : return <ReportIssue navigate={navigate} />
     case 'map'      : return <IssueMap  navigate={navigate} />
     case 'profile'  : return <Profile   navigate={navigate} />   
     default         : return <Landing   navigate={navigate} />
     case 'community': return <Community navigate={navigate} />
   }
 }

  return (
    <AppProvider>
      <div style={{ paddingTop: page === 'map' ? 0 : 64 }}>
        <Navbar currentPage={page} setCurrentPage={navigate} />
        <main style={{ minHeight: 'calc(100vh - 64px)' }}>
          {renderPage()}
        </main>
        <Toast />
      </div>
    </AppProvider>
  )
}
