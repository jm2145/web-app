import logo from './logo.svg';
import './App.css';
import AppRoutes from './Routes';

import { registerLicense } from "@syncfusion/ej2-base";

registerLicense(
  "Ngo9BigBOggjHTQxAR8/V1NAaF5cWWJCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdgWH1cdnZWQ2FZUEB/V0c="
);

function App() {
  return (
    <AppRoutes/>
  );
}

export default App;
