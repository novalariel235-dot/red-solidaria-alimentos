import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Search, X, Loader2, CheckCircle2, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface AddressPickerProps {
  value: {
    direccion: string;
    lat?: number;
    lng?: number;
  };
  onChange: (value: { direccion: string; lat?: number; lng?: number }) => void;
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

// Centro de Villa Regina como ubicación inicial
const VILLA_REGINA_CENTER: [number, number] = [-39.0035, -67.0549];

export default function AddressPicker({ value, onChange }: AddressPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>(value.direccion || '');
  const [mapReady, setMapReady] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: value.lat && value.lng ? [value.lat, value.lng] : VILLA_REGINA_CENTER,
      zoom: 14,
      zoomControl: true,
    });

    // Tile layer de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    // Icono personalizado para el marker
    const customIcon = L.divIcon({
      html: `<div style="background: linear-gradient(135deg, #5a7a54, #8faa88); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <svg style="transform: rotate(45deg);" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
      </div>`,
      className: 'custom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    // Si ya hay coordenadas, agregar marker
    if (value.lat && value.lng) {
      markerRef.current = L.marker([value.lat, value.lng], { icon: customIcon, draggable: true }).addTo(map);
      
      markerRef.current.on('dragend', () => {
        if (markerRef.current) {
          const pos = markerRef.current.getLatLng();
          reverseGeocode(pos.lat, pos.lng);
        }
      });
    }

    // Click en el mapa para mover el marker
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(map);
        markerRef.current.on('dragend', () => {
          if (markerRef.current) {
            const pos = markerRef.current.getLatLng();
            reverseGeocode(pos.lat, pos.lng);
          }
        });
      }
      
      reverseGeocode(lat, lng);
    });

    mapRef.current = map;
    setMapReady(true);

    // Forzar resize después de montar
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Búsqueda con Nominatim (OpenStreetMap)
  const searchAddress = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setResults([]);
    
    try {
      // Buscar priorizando Villa Regina, Río Negro
      const query = `${searchQuery}, Villa Regina, Río Negro, Argentina`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ar&viewbox=-67.2,-39.1,-66.9,-38.9&bounded=0`
      );
      const data: NominatimResult[] = await response.json();
      setResults(data);
    } catch (err) {
      console.error('Error buscando dirección:', err);
    } finally {
      setSearching(false);
    }
  };

  // Reverse geocode (coordenadas → dirección)
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`
      );
      const data = await response.json();
      
      if (data.display_name) {
        const shortAddress = data.display_name.split(',').slice(0, 3).join(',').trim();
        setSelectedAddress(shortAddress);
        onChange({ direccion: shortAddress, lat, lng });
      }
    } catch (err) {
      console.error('Error en reverse geocode:', err);
    }
  };

  // Seleccionar resultado de búsqueda
  const selectResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const shortAddress = result.display_name.split(',').slice(0, 3).join(',').trim();
    
    setSelectedAddress(shortAddress);
    setResults([]);
    setSearchQuery('');
    
    // Mover mapa y marker
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 17);
      
      const customIcon = L.divIcon({
        html: `<div style="background: linear-gradient(135deg, #5a7a54, #8faa88); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <svg style="transform: rotate(45deg);" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>`,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
      
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(mapRef.current);
        markerRef.current.on('dragend', () => {
          if (markerRef.current) {
            const pos = markerRef.current.getLatLng();
            reverseGeocode(pos.lat, pos.lng);
          }
        });
      }
    }
    
    onChange({ direccion: shortAddress, lat, lng });
  };

  const clearSelection = () => {
    setSelectedAddress('');
    onChange({ direccion: '' });
    if (markerRef.current && mapRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1.5">Buscar dirección</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
              placeholder="Ej: Av. San Martín 450"
              className="w-full pl-10 pr-4 py-3 bg-[#faf9f7] border border-stone-200 rounded-xl focus:border-[#5a7a54] focus:ring-2 focus:ring-[#5a7a54]/10 transition-all outline-none text-stone-800 placeholder:text-stone-300 text-sm"
            />
          </div>
          <button
            onClick={searchAddress}
            disabled={searching || !searchQuery.trim()}
            className="px-4 py-3 bg-[#5a7a54] hover:bg-[#4d6a48] disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl transition-all flex items-center gap-2 text-sm font-medium"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Buscar
          </button>
        </div>
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm animate-fade-in">
          <div className="px-3 py-2 bg-stone-50 border-b border-stone-100">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Resultados</span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {results.map((result) => (
              <button
                key={result.place_id}
                onClick={() => selectResult(result)}
                className="w-full text-left px-4 py-3 hover:bg-[#f5f8f4] transition-colors border-b border-stone-50 last:border-0 flex items-start gap-3"
              >
                <MapPin className="w-4 h-4 text-[#5a7a54] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-700 line-clamp-2">{result.display_name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected address */}
      {selectedAddress && (
        <div className="bg-[#f5f8f4] border border-[#e4ede2] rounded-xl p-3.5 flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#5a7a54] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-[#5a7a54] font-medium uppercase tracking-wider mb-0.5">Dirección validada</div>
            <p className="text-sm text-stone-700 font-medium">{selectedAddress}</p>
            {value.lat && value.lng && (
              <p className="text-xs text-stone-400 mt-1">
                📍 {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
              </p>
            )}
          </div>
          <button
            onClick={clearSelection}
            className="p-1 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-stone-400" />
          </button>
        </div>
      )}

      {/* Map */}
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1.5">
          Ubicación en el mapa
          <span className="text-stone-400 font-normal ml-1">(hacé click o arrastrá el pin)</span>
        </label>
        <div className="relative rounded-xl overflow-hidden border border-stone-200 shadow-sm">
          <div 
            ref={mapContainerRef} 
            className="w-full h-64 md:h-72 bg-stone-100"
          />
          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-50">
              <Loader2 className="w-6 h-6 text-stone-400 animate-spin" />
              <span className="ml-2 text-sm text-stone-400">Cargando mapa...</span>
            </div>
          )}
        </div>
        <p className="text-xs text-stone-400 mt-2 flex items-center gap-1.5">
          <Navigation className="w-3 h-3" />
          Mapa validado por OpenStreetMap · Hacé click para ubicar el pin exacto
        </p>
      </div>
    </div>
  );
}
