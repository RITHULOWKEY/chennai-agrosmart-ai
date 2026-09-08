import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Fix Leaflet marker icons
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
});
L.Marker.prototype.options.icon = DefaultIcon;

const FieldMap = ({ fieldId }) => {
    const [fieldData, setFieldData] = useState(null);
    const [layers, setLayers] = useState({
        soil: true,
        water: true,
        health: true,
        weather: true,
        market: true
    });

    useEffect(() => {
        // Poll for updates every minute
        const fetchFieldData = async () => {
            try {
                // Fetch GeoJSON format
                const response = await axios.get(`http://127.0.0.1:8000/api/map/field/${fieldId}?format=geojson`);
                if (response.data.features && response.data.features.length > 0) {
                    setFieldData(response.data.features[0]);
                }
            } catch (error) {
                console.error("Error fetching field data:", error);
            }
        };

        fetchFieldData();
        const interval = setInterval(fetchFieldData, 60000);
        return () => clearInterval(interval);
    }, [fieldId]);

    if (!fieldData) return <div className="p-4 text-emerald-400">Loading Map GIS View...</div>;

    const { geometry, properties } = fieldData;
    const center = geometry.type === 'Point' 
        ? [geometry.coordinates[1], geometry.coordinates[0]] 
        : [geometry.coordinates[0][0][1], geometry.coordinates[0][0][0]]; // Center for polygon
        
    const soilColor = properties.soil_type === 'clay' ? 'brown' : properties.soil_type === 'loamy' ? 'yellow' : 'orange';
    const waterColor = properties.irrigation_mm > 30 ? 'red' : properties.irrigation_mm > 20 ? 'yellow' : 'green';

    return (
        <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
            <div style={{ padding: '10px', background: '#0f172a', color: '#f8fafc', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#34d399' }}>GIS Layers:</span>
                    {Object.keys(layers).map(key => (
                        <label key={key} style={{ fontSize: '12px', cursor: 'pointer' }}>
                            <input 
                                type="checkbox" 
                                checked={layers[key]} 
                                onChange={(e) => setLayers({...layers, [key]: e.target.checked})} 
                                style={{ marginRight: '4px' }}
                            /> {key.charAt(0).toUpperCase() + key.slice(1)}
                        </label>
                    ))}
                </div>
                <button 
                    onClick={() => window.print()} 
                    style={{ marginLeft: 'auto', padding: '4px 10px', background: '#059669', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}
                >
                    🖨️ Export PDF Map
                </button>
            </div>
            
            <MapContainer center={center} zoom={15} style={{ height: 'calc(100% - 45px)', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                {geometry.type === 'Polygon' && (
                    <Polygon 
                        positions={geometry.coordinates[0].map(c => [c[1], c[0]])}
                        color="#2563eb"
                        fillColor={layers.soil ? soilColor : "#2563eb"}
                        fillOpacity={layers.soil ? 0.4 : 0.2}
                    >
                        <Popup>
                            <strong>Field #{properties.field_id}</strong><br/>
                            Size: {properties.size_ha} ha<br/>
                            Crop: {properties.crop_type}
                        </Popup>
                    </Polygon>
                )}

                {layers.water && properties.irrigation_mm !== undefined && (
                    <CircleMarker center={center} radius={22} color={waterColor} fillOpacity={0.6}>
                        <Popup>
                            <strong>Water Advisory</strong><br/>
                            {properties.irrigation_mm} mm recommended
                        </Popup>
                    </CircleMarker>
                )}
                
                {layers.weather && (
                     <Marker position={[center[0] - 0.002, center[1] - 0.002]}>
                        <Popup>Chennai Telemetry Station</Popup>
                     </Marker>
                )}
            </MapContainer>
        </div>
    );
};

export default FieldMap;

