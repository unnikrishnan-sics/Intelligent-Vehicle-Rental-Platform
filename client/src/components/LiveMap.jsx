import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import L from 'leaflet';

// Robust Icon Fix using CDN to avoid local asset issues
const carIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png', // Fallback to a reliable CDN image
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

// Component to auto-center map on vehicle
const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 13);
        }
    }, [lat, lng, map]);
    return null;
};

const LiveMap = ({ vehicles }) => {
    const [vehicleLocations, setVehicleLocations] = useState({});

    // Helper to safely extract vehicle info
    const getVehicleInfo = (v) => {
        // Handle both Mongoose GeoJSON and flat lat/lng (if any legacy data)
        let lat = 0;
        let lng = 0;

        if (v.currentLocation && v.currentLocation.coordinates) {
            lng = v.currentLocation.coordinates[0];
            lat = v.currentLocation.coordinates[1];
        } else if (v.currentLocation && v.currentLocation.lat) {
            lat = v.currentLocation.lat;
            lng = v.currentLocation.lng;
        }

        // Only return if valid
        if (lat === 0 && lng === 0) return null;

        return {
            lat,
            lng,
            make: v.make,
            model: v.model,
            status: v.status || 'Active',
            licensePlate: v.licensePlate,
            currentRenter: v.currentRenter,
            _id: v._id
        };
    };

    // Initialize locations from props
    useEffect(() => {
        console.log("LiveMap received vehicles:", vehicles);
        const initialLocs = {};
        vehicles.forEach(v => {
            const info = getVehicleInfo(v);
            if (info) {
                initialLocs[v._id] = info;
            } else {
                console.warn("Vehicle filtered out (invalid loc):", v._id, v.currentLocation);
            }
        });
        console.log("Initial Vehicle Locations calculated:", initialLocs);
        setVehicleLocations(initialLocs);
    }, [vehicles]);

    // Ref to access latest vehicles prop inside socket callback without re-running effect
    const vehiclesRef = useRef(vehicles);

    useEffect(() => {
        vehiclesRef.current = vehicles;
    }, [vehicles]);

    useEffect(() => {
        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

        socket.on('connect', () => {
        });

        socket.on('vehicle_location_updated', (data) => {

            setVehicleLocations(prev => {
                // STRICT FILTERING: Only update if this vehicle is in our allowed list (props)
                // This ensures Users only see their own cars, while Admins (who get all cars in props) see everything.
                const isAllowed = vehiclesRef.current.some(v => v._id.toString() === data.vehicleId.toString());

                if (!isAllowed) {
                    return prev;
                }

                // If vehicle exists in state, update it
                if (prev[data.vehicleId]) {
                    return {
                        ...prev,
                        [data.vehicleId]: {
                            ...prev[data.vehicleId],
                            lat: data.lat,
                            lng: data.lng,
                            status: 'Moving Now'
                        }
                    };
                }

                // Lookup in ref to find static data even if not in state yet
                const currentVehicles = vehiclesRef.current;
                const vehicleStaticData = currentVehicles.find(v => v._id === data.vehicleId);
                const renterName = vehicleStaticData?.currentRenter || 'Unknown';
                const plate = vehicleStaticData?.licensePlate || 'Unknown';
                const make = vehicleStaticData?.make || 'Vehicle';
                const model = vehicleStaticData?.model || '';

                return {
                    ...prev,
                    [data.vehicleId]: {
                        lat: data.lat,
                        lng: data.lng,
                        make,
                        model,
                        licensePlate: plate,
                        currentRenter: renterName,
                        status: 'Moving Now'
                    }
                };
            });
        });

        return () => socket.disconnect();
    }, []); // Empty dependency = stable connection

    const center = [20.5937, 78.9629];

    // Find first valid vehicle to center on
    const firstVehicleKey = Object.keys(vehicleLocations)[0];
    const firstVehicle = firstVehicleKey ? vehicleLocations[firstVehicleKey] : null;

    return (
        <div style={{ height: '500px', width: '100%', borderRadius: '1rem', overflow: 'hidden', border: '2px solid #e5e7eb' }}>
            <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Simulation Warning Overlay */}
                <div style={{
                    position: 'absolute',
                    top: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    background: 'rgba(255, 247, 237, 0.9)', // Orange-50 with opacity
                    border: '1px solid #fed7aa', // Orange-200
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#c2410c', // Orange-700
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <span style={{ width: '8px', height: '8px', background: '#f97316', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
                    Live Simulation Mode: Locations are estimated
                </div>

                {firstVehicle && <RecenterMap lat={firstVehicle.lat} lng={firstVehicle.lng} />}

                {Object.entries(vehicleLocations).map(([id, info]) => {
                    // Ensure lat/lng are valid numbers
                    if (isNaN(info.lat) || isNaN(info.lng)) return null;

                    return (
                        <Marker key={id} position={[info.lat, info.lng]} icon={carIcon}>
                            <Popup>
                                <div className="text-left min-w-[150px]">
                                    <div className="border-b pb-1 mb-2">
                                        <strong className="text-lg block text-gray-800">{info.make} {info.model}</strong>
                                        <span className="text-sm text-gray-500 font-mono tracking-wider">{info.licensePlate}</span>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-sm">
                                            <span className="text-gray-500">Status: </span>
                                            <span className={`font-bold ${info.status === 'Moving Now' ? 'text-green-600 animate-pulse' : 'text-blue-600'}`}>
                                                {info.status}
                                            </span>
                                        </div>
                                        {info.currentRenter && (
                                            <div className="text-sm">
                                                <span className="text-gray-500">Renter: </span>
                                                <span className="font-semibold text-gray-900">{info.currentRenter}</span>
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-400 mt-2">
                                            {info.lat.toFixed(6)}, {info.lng.toFixed(6)}
                                            <div className="text-orange-500 italic mt-1 scale-90 origin-left">
                                                * Location is estimated/simulated
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default LiveMap;
