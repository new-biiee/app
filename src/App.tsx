import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TradingView } from "./components/pages/trading/TradingView";
import { HistoryView } from "./components/pages/HistoryView";
import { WalletLPLayout } from "./components/pages/WalletLPLayout";
import { IntroView } from "./components/pages/IntroView";
import { Toaster } from "react-hot-toast";
import { DocsRouter } from "./docs/DocsRouter";

import { Layout } from "./components/Layout";
import { PageNotFound } from "./components/pages/fallback/PageNotFound";
import { UpcomingPage } from "./components/pages/UpcomingPage";

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<IntroView />} />
          <Route path="/trade" element={<TradingView />} />
          <Route path="/profile" element={<HistoryView />} />
          <Route path="/wallet" element={<WalletLPLayout />} />
          <Route path="/documentation" element={<DocsRouter />} />
          <Route path="/documentation/:section" element={<DocsRouter />} />
          <Route path="/documentation/:section/:slug" element={<DocsRouter />} />
          <Route path="/upcoming" element={<UpcomingPage />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
