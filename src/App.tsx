import { BrowserRouter, Routes, Route } from "react-router-dom";
import EntryPage from "./pages/EntryPage";
import DetailsPage from "./pages/DetailsPage";
import OperationsPage from "./pages/OperationsPage";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<EntryPage />} />
      <Route path="/details" element={<DetailsPage />} />
      <Route path="/operations" element={<OperationsPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
