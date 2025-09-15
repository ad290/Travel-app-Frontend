import React, { useEffect, useState } from 'react';
import { destinationService, hotelService } from '../services/apiService';

const HotelManager = () => {
  const [hotels, setHotels] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingHotel, setEditingHotel] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    destinationId: '',
    address: '',
    starRating: 3,
    guestRating: 0,
    pricePerNight: '',
    imageUrl: '',
    hotelAmenities: '',
    nearbyAttractions: '',
    contactInfo: {
      phoneNumber: '',
      email: '',
      website: ''
    }
  });

  useEffect(() => {
    loadHotels();
    loadDestinations();
  }, []);

  const loadHotels = async () => {
    try {
      setLoading(true);
      const response = await hotelService.getAllHotels();
      setHotels(response.data || []);
    } catch (err) {
      setError('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const loadDestinations = async () => {
    try {
      const response = await destinationService.getAllDestinations();
      setDestinations(response.data || []);
    } catch (err) {
      console.error('Failed to load destinations');
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
      destinationId: '',
      address: '',
      starRating: 3,
      guestRating: 0,
      pricePerNight: '',
      imageUrl: '',
      hotelAmenities: '',
      nearbyAttractions: '',
      contactInfo: {
        phoneNumber: '',
        email: '',
        website: ''
      }
    });
    setEditingHotel(null);
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
        pricePerNight: parseFloat(formData.pricePerNight),
        starRating: parseInt(formData.starRating),
        guestRating: parseFloat(formData.guestRating),
        hotelAmenities: formData.hotelAmenities.split(',').map(item => item.trim()).filter(item => item),
        nearbyAttractions: formData.nearbyAttractions.split(',').map(item => {
          const trimmed = item.trim();
          if (trimmed) {
            const parts = trimmed.split('|');
            return {
              name: parts[0] ? parts[0].trim() : trimmed,
              distance: parts[1] ? parts[1].trim() : ''
            };
          }
          return null;
        }).filter(item => item)
      };

      if (editingHotel) {
        await hotelService.updateHotel(editingHotel._id, submitData);
        setSuccess('Hotel updated successfully!');
      } else {
        await hotelService.createHotel(submitData);
        setSuccess('Hotel created successfully!');
      }

      resetForm();
      loadHotels();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save hotel');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (hotel) => {
    setFormData({
      name: hotel.name,
      destinationId: hotel.destinationId._id || hotel.destinationId,
      address: hotel.address,
      starRating: hotel.starRating,
      guestRating: hotel.guestRating,
      pricePerNight: hotel.pricePerNight,
      imageUrl: hotel.imageUrl || '',
      hotelAmenities: hotel.hotelAmenities ? hotel.hotelAmenities.join(', ') : '',
      nearbyAttractions: hotel.nearbyAttractions ? hotel.nearbyAttractions.map(attraction => `${attraction.name}|${attraction.distance}`).join(', ') : '',
      contactInfo: {
        phoneNumber: hotel.contactInfo?.phoneNumber || '',
        email: hotel.contactInfo?.email || '',
        website: hotel.contactInfo?.website || ''
      }
    });
    setEditingHotel(hotel);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      try {
        setLoading(true);
        await hotelService.deleteHotel(id);
        setSuccess('Hotel deleted successfully!');
        loadHotels();
      } catch (err) {
        setError('Failed to delete hotel');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <h2>{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Hotel Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Destination *</label>
            <select
              name="destinationId"
              value={formData.destinationId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a destination</option>
              {destinations.map((destination) => (
                <option key={destination._id} value={destination._id}>
                  {destination.name}, {destination.country}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Hotel Image URL</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="add website link"
            />
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label>Star Rating *</label>
              <select
                name="starRating"
                value={formData.starRating}
                onChange={handleInputChange}
                required
              >
                <option value={1}>1 Star</option>
                <option value={2}>2 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={5}>5 Stars</option>
              </select>
            </div>

            <div className="form-group">
              <label>Guest Rating (0-5)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                name="guestRating"
                value={formData.guestRating}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Price per Night *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="pricePerNight"
                value={formData.pricePerNight}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Hotel Amenities</label>
            <input
              type="text"
              name="hotelAmenities"
              value={formData.hotelAmenities}
              onChange={handleInputChange}
              placeholder="e.g., Free Wi-Fi, Pool"
            />
          </div>

          <div className="form-group">
            <label>Nearby Attractions</label>
            <input
              type="text"
              name="nearbyAttractions"
              value={formData.nearbyAttractions}
              onChange={handleInputChange}
              placeholder="e.g., Beach|5km, Park|2km"
            />
          </div>

          <h4>Contact Information</h4>
          <div className="grid-3">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="contactInfo.phoneNumber"
                value={formData.contactInfo.phoneNumber}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="contactInfo.email"
                value={formData.contactInfo.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                name="contactInfo.website"
                value={formData.contactInfo.website}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Saving...' : editingHotel ? 'Update Hotel' : 'Add Hotel'}
          </button>
          
          {editingHotel && (
            <button type="button" className="btn" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <h3>Existing Hotels</h3>
      {loading && <div className="loading">Loading hotels...</div>}
      
      <div className="card-grid">
        {hotels.map((hotel) => (
          <div key={hotel._id} className="card hotel-item">
            <h3>{hotel.name}</h3>
            <p><strong>Destination:</strong> {hotel.destinationId?.name}, {hotel.destinationId?.country}</p>
            <p><strong>Address:</strong> {hotel.address}</p>
            <p><strong>Star Rating:</strong> <span className="rating">{'★'.repeat(hotel.starRating)}</span></p>
            <p><strong>Guest Rating:</strong> <span className="rating">{hotel.guestRating}/5</span></p>
            <p><strong>Price per Night:</strong> <span className="price">₹{hotel.pricePerNight}</span></p>
            
            {hotel.imageUrl && (
              <div className="image-container">
                <img 
                  src={hotel.imageUrl} 
                  alt={hotel.name}
                  className="hotel-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {hotel.hotelAmenities && hotel.hotelAmenities.length > 0 && (
              <p><strong>Amenities:</strong> {hotel.hotelAmenities.join(', ')}</p>
            )}
            
            {hotel.nearbyAttractions && (
              <p><strong>Nearby Attractions:</strong> {hotel.nearbyAttractions.map(attraction => `${attraction.name} (${attraction.distance})`).join(', ')}</p>
            )}
            
            {hotel.contactInfo && (
              <div className="contact-info">
                <strong>Contact Information:</strong>
                {hotel.contactInfo.phoneNumber && <p>📞 {hotel.contactInfo.phoneNumber}</p>}
                {hotel.contactInfo.email && <p>📧 {hotel.contactInfo.email}</p>}
                {hotel.contactInfo.website && (
                  <p>🌐 <a href={hotel.contactInfo.website} target="_blank" rel="noopener noreferrer">
                    {hotel.contactInfo.website}
                  </a></p>
                )}
              </div>
            )}
            
            <div style={{ marginTop: '1rem' }}>
              <button 
                className="btn" 
                onClick={() => handleEdit(hotel)}
              >
                Edit
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => handleDelete(hotel._id)}
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

export default HotelManager;
