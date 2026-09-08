import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FieldMap from './FieldMap';

const FarmerDashboard = ({ farmerId }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [selectedField, setSelectedField] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await axios.get(`http://127.0.0.1:8000/api/dashboard/farmer/${farmerId}`);
                setDashboardData(res.data);
                if (res.data.fields && res.data.fields.length > 0 && !selectedField) {
                    setSelectedField(res.data.fields[0].field_id);
                }
            } catch (err) {
                console.error("Dashboard error:", err);
            }
        };
        fetchDashboard();
        const interval = setInterval(fetchDashboard, 60000);
        return () => clearInterval(interval);
    }, [farmerId]);

    if (!dashboardData) return <div>Loading Dashboard...</div>;

    // Aggregate Alerts
    const redFields = dashboardData.fields.filter(f => f.status === 'red').length;
    const yellowFields = dashboardData.fields.filter(f => f.status === 'yellow').length;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Farmer Dashboard</h1>
            
            <div style={{ background: '#ffebee', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
                <h3>Aggregated Alerts</h3>
                <p>🔴 {redFields} fields need urgent attention (High Water Need)</p>
                <p>🟡 {yellowFields} fields need moderate attention</p>
                <p>🟢 {dashboardData.fields.length - redFields - yellowFields} fields are healthy</p>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: '1', borderRight: '1px solid #ccc', paddingRight: '20px' }}>
                    <h2>Your Fields</h2>
                    {dashboardData.fields.map(field => (
                        <div 
                            key={field.field_id} 
                            onClick={() => setSelectedField(field.field_id)}
                            style={{
                                padding: '15px', 
                                margin: '10px 0', 
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                background: selectedField === field.field_id ? '#e3f2fd' : 'white',
                                borderLeft: `5px solid ${field.status === 'red' ? '#f44336' : field.status === 'yellow' ? '#ffeb3b' : '#4caf50'}`
                            }}
                        >
                            <h4>Field {field.field_id} - {field.crop_type}</h4>
                            <p>Size: {field.size_ha} ha | Soil: {field.soil_type}</p>
                            <p>Latest Rec: {field.latest_recommendation ? `${field.latest_recommendation} mm` : 'None'}</p>
                            <small>Updated: {field.last_updated ? new Date(field.last_updated).toLocaleString() : 'N/A'}</small>
                        </div>
                    ))}
                </div>
                
                <div style={{ flex: '2' }}>
                    <h2>Interactive Field Map</h2>
                    {selectedField ? (
                        <FieldMap fieldId={selectedField} key={selectedField} />
                    ) : (
                        <p>Select a field to view its map.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FarmerDashboard;
