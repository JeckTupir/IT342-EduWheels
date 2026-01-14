import './App.css'
import RoutesComponent from './Routes';
import { GoogleMapsProvider } from './components/GoogleMapsProvider';
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <GoogleMapsProvider>
      <div>
        <RoutesComponent />
      </div>
    </GoogleMapsProvider>
  )
}

export default App
