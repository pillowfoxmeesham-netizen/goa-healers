import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, User, Navigation, Phone, MapPinned, Calendar, IdCard } from 'lucide-react';
import { Button } from './ui/button';
import { StarRating } from './StarRating';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for healers
const healerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export function HealerMap({ healers, selectedHealer, onHealerSelect, onRate }) {
  const goaCenter = React.useMemo(() => [15.2993, 74.1240], []); // Center of Goa
  const [mapCenter, setMapCenter] = useState(goaCenter);
  const [mapZoom, setMapZoom] = useState(10);

  useEffect(() => {
    if (selectedHealer) {
      setMapCenter([selectedHealer.lat, selectedHealer.lng]);
      setMapZoom(14);
    } else {
      setMapCenter(goaCenter);
      setMapZoom(10);
    }
  }, [selectedHealer, goaCenter]);

  return (
    <div className="h-full w-full" data-testid="healer-map">
      <MapContainer
        center={goaCenter}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg shadow-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={mapCenter} zoom={mapZoom} />
        <MarkerClusterGroup
          chunkedLoading
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          maxClusterRadius={60}
        >
          {healers.map((healer) => (
            <Marker
              key={healer.id}
              position={[healer.lat, healer.lng]}
              icon={healerIcon}
              eventHandlers={{
                click: () => onHealerSelect(healer),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[280px] max-w-[320px]" data-testid={`popup-healer-${healer.id}`}>
                  <div className="flex items-start gap-2 mb-3">
                    <User className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg leading-tight" data-testid={`popup-name-${healer.id}`}>{healer.name}</h3>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {/* Specializations */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1 font-semibold">Specializations:</p>
                      <div className="flex flex-wrap gap-1">
                        {healer.specialisation.split(',').map((spec, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {spec.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="pt-1">
                      <StarRating
                        healerId={healer.id}
                        avgRating={healer.avg_rating}
                        ratingCount={healer.rating_count}
                        onRate={onRate}
                        size="sm"
                      />
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-2">
                      {healer.contact && (
                        <div className="flex items-start gap-2">
                          <Phone className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <a href={`tel:${healer.contact}`} className="text-sm text-blue-600 hover:underline break-all">
                            {healer.contact}
                          </a>
                        </div>
                      )}

                      {healer.address && (
                        <div className="flex items-start gap-2">
                          <MapPinned className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-600">{healer.address}</span>
                        </div>
                      )}

                      {(healer.taluka || healer.district) && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-600">
                            {[healer.taluka, healer.district, healer.pincode].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}

                      {healer.uid && (
                        <div className="flex items-start gap-2">
                          <IdCard className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-600 font-mono">{healer.uid}</span>
                        </div>
                      )}

                      {healer.validity && (
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-600">Valid: {healer.validity}</span>
                        </div>
                      )}
                    </div>

                    {/* Get Directions Button */}
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      onClick={() => {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${healer.lat},${healer.lng}`;
                        window.open(url, '_blank');
                      }}
                      data-testid={`get-directions-${healer.id}`}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}