import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ThemeProvider } from './components/ThemeProvider';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { ClientDetail } from './pages/ClientDetail';
import { Deals } from './pages/Deals';
import { DealDetail } from './pages/DealDetail';
import { Activities } from './pages/Activities';
import { Proposals } from './pages/Proposals';
import { ProposalDetail } from './pages/ProposalDetail';
import { NewProposal } from './pages/NewProposal';
import { Toaster } from './components/ui/toaster';
import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="clienttrack-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="deals" element={<Deals />} />
            <Route path="deals/:id" element={<DealDetail />} />
            <Route path="activities" element={<Activities />} />
            <Route path="proposals" element={<Proposals />} />
            <Route path="proposals/:id" element={<ProposalDetail />} />
            <Route path="proposals/new" element={<NewProposal />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
