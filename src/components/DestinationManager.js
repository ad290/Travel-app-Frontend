import React, { useEffect, useState } from 'react';
import { destinationService } from '../services/apiService';

const DestinationManager = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingDestination, setEditingDestination] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    description: '',
    coordinates: {
      latitude: '',
      longitude: ''
    },
    bestTimeToVisit: '',
    currency: '',
    language: ''
  });

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    try {
      setLoading(true);
      const response = await destinationService.getAllDestinations();
      setDestinations(response.data || []);
    } catch (err) {
      setError('Failed to load destinations');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      description: '',
      coordinates: {
        latitude: '',
        longitude: ''
      },
      bestTimeToVisit: '',
      currency: '',
      language: ''
    });
    setEditingDestination(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        coordinates: {
          latitude: parseFloat(formData.coordinates.latitude),
          longitude: parseFloat(formData.coordinates.longitude)
        }
      };

      if (editingDestination) {
        await destinationService.updateDestination(editingDestination._id, submitData);
        setSuccess('Destination updated successfully!');
      } else {
        await destinationService.createDestination(submitData);
        setSuccess('Destination created successfully!');
      }

      resetForm();
      loadDestinations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save destination');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (destination) => {
    setFormData({
      name: destination.name,
      country: destination.country,
      description: destination.description,
      coordinates: {
        latitude: destination.coordinates?.latitude || '',
        longitude: destination.coordinates?.longitude || ''
      },
      bestTimeToVisit: destination.bestTimeToVisit || '',
      currency: destination.currency || '',
      language: destination.language || ''
    });
    setEditingDestination(destination);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      try {
        setLoading(true);
        await destinationService.deleteDestination(id);
        setSuccess('Destination deleted successfully!');
        loadDestinations();
      } catch (err) {
        setError('Failed to delete destination');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <h2>{editingDestination ? 'Edit Destination' : 'Add New Destination'}</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Destination Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Country *</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Latitude *</label>
              <input
                type="number"
                step="any"
                name="coordinates.latitude"
                value={formData.coordinates.latitude}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Longitude *</label>
              <input
                type="number"
                step="any"
                name="coordinates.longitude"
                value={formData.coordinates.longitude}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Best Time to Visit</label>
            <input
              type="text"
              name="bestTimeToVisit"
              value={formData.bestTimeToVisit}
              onChange={handleInputChange}
              placeholder="e.g., March to May"
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Currency</label>
              <input
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                placeholder="e.g., INR ,USD "
              />
            </div>

            <div className="form-group">
              <label>Language</label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                placeholder="e.g.,Hindi,English"
              />
            </div>
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Saving...' : editingDestination ? 'Update Destination' : 'Add Destination'}
          </button>
          
          {editingDestination && (
            <button type="button" className="btn" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <h3>Existing Destinations</h3>
      {loading && <div className="loading">Loading destinations...</div>}
      
      <div className="card-grid">
        {destinations.map((destination) => (
          <div key={destination._id} className="card">
            <h3>{destination.name}</h3>
            <p><strong>Country:</strong> {destination.country}</p>
            <p><strong>Description:</strong> {destination.description}</p>
            <p><strong>Coordinates:</strong> {destination.coordinates?.latitude}, {destination.coordinates?.longitude}</p>
            {destination.bestTimeToVisit && (
              <p><strong>Best Time to Visit:</strong> {destination.bestTimeToVisit}</p>
            )}
            {destination.currency && (
              <p><strong>Currency:</strong> {destination.currency}</p>
            )}
            {destination.language && (
              <p><strong>Language:</strong> {destination.language}</p>
            )}
            
            <div style={{ marginTop: '1rem' }}>
              <button 
                className="btn" 
                onClick={() => handleEdit(destination)}
              >
                Edit
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => handleDelete(destination._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DestinationManager;
