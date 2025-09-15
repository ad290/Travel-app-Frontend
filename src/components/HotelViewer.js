import React, { useEffect, useState } from "react";
import { destinationService, hotelService } from "../services/apiService";

const HotelViewer = () => {
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const loadDestinations = async () => {
      setLoadingDestinations(true);
      try {
        const response = await destinationService.getAllDestinations();
        // handle common shapes: response.data or response
        const payload = response?.data ?? response;
        if (mounted) {
          setDestinations(Array.isArray(payload) ? payload : payload?.data ?? []);
        }
      } catch (err) {
        if (mounted) setError("Failed to load destinations");
        console.error("loadDestinations error:", err);
      } finally {
        if (mounted) setLoadingDestinations(false);
      }
    };

    loadDestinations();
    return () => {
      mounted = false;
    };
  }, []);

  const handleDestinationChange = async (e) => {
    const destinationId = e.target.value;
    setSelectedDestination(destinationId);
    setError("");
    setHotels([]);

    if (!destinationId) return;

    setLoading(true);
    try {
      const response = await hotelService.getHotelsByDestination(destinationId);
      // support common response shapes
      const payload = response?.data ?? response;
      const hotelsArray = Array.isArray(payload) ? payload : payload?.hotels ?? payload?.data ?? [];
      setHotels(hotelsArray);
    } catch (err) {
      setError("Failed to load hotels for this destination");
      console.error("getHotelsByDestination error:", err);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedDestinationInfo = () =>
    destinations.find((dest) => String(dest._id) === String(selectedDestination));

  const formatPrice = (value) => {
    if (value == null || Number.isNaN(Number(value))) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "USD", // or dynamic value like getSelectedDestinationInfo()?.currency
      maximumFractionDigits: 2,
    }).format(Number(value));
  };

  return (
    <div className="hotel-viewer">
      <h2>View Hotels by Destination</h2>

      {error && <div className="error" role="alert">{error}</div>}

      <div className="dropdown-container">
        <div className="form-group">
          <label htmlFor="destination-select">Select Destination</label>
          <select
            id="destination-select"
            value={selectedDestination}
            onChange={handleDestinationChange}
            className="form-control"
          >
            <option value="">Choose a destination...</option>
            {loadingDestinations ? (
              <option value="" disabled>Loading destinations...</option>
            ) : (
              destinations.map((destination) => (
                <option key={destination._id} value={destination._id}>
                  {destination.name}{destination.country ? `, ${destination.country}` : ""}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {selectedDestination && (
        <div className="form-container">
          <h3>Destination Information</h3>
          {(() => {
            const destInfo = getSelectedDestinationInfo();
            return destInfo ? (
              <div>
                <h4>
                  {destInfo.name}
                  {destInfo.country ? `, ${destInfo.country}` : ""}
                </h4>

                {destInfo.description && (
                  <p>
                    <strong>Description:</strong> {destInfo.description}
                  </p>
                )}

                {(destInfo.coordinates?.latitude || destInfo.coordinates?.longitude) && (
                  <p>
                    <strong>Coordinates:</strong>{" "}
                    {destInfo.coordinates?.latitude ?? "-"}, {destInfo.coordinates?.longitude ?? "-"}
                  </p>
                )}

                {destInfo.bestTimeToVisit && (
                  <p>
                    <strong>Best Time to Visit:</strong> {destInfo.bestTimeToVisit}
                  </p>
                )}

                {destInfo.currency && (
                  <p>
                    <strong>Currency:</strong> {destInfo.currency}
                  </p>
                )}

                {destInfo.language && (
                  <p>
                    <strong>Language:</strong> {destInfo.language}
                  </p>
                )}
              </div>
            ) : (
              <p>No destination information available.</p>
            );
          })()}
        </div>
      )}

      {loading && <div className="loading">Loading hotels...</div>}

      {selectedDestination && !loading && (
        <div className="hotel-list">
          <h3>Available Hotels ({hotels.length})</h3>

          {hotels.length === 0 ? (
            <div className="card">
              <p>
                No hotels found for this destination. Add some hotels using the Hotel Management
                section.
              </p>
            </div>
          ) : (
            <div className="card-grid">
              {hotels.map((hotel) => {
                // safe values and defaults
                const starRating = Math.max(0, Math.min(5, Number(hotel.starRating) || 0));
                const guestRating = hotel.guestRating ?? "N/A";
                const pricePerNight = hotel.pricePerNight ?? null;

                return (
                  <div key={hotel._id} className="card hotel-item">
                    <h3>{hotel.name ?? "Unnamed Hotel"}</h3>
                    {hotel.address && <p><strong>Address:</strong> {hotel.address}</p>}

                    {hotel.imageUrl ? (
                      <div className="image-container">
                        <img
                          src={hotel.imageUrl}
                          alt={hotel.name ?? "hotel image"}
                          className="hotel-image"
                          onError={(e) => {
                            // hide broken images
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    ) : null}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0", flexWrap: "wrap", gap: "10px" }}>
                      <span>
                        <strong>Star Rating:</strong>{" "}
                        <span className="rating">{'★'.repeat(starRating)}</span>
                      </span>
                      <span>
                        <strong>Guest Rating:</strong>{" "}
                        <span className="rating">{guestRating}/5</span>
                      </span>
                    </div>

                    <p>
                      <strong>Price per Night:</strong>{" "}
                      <span className="price">{pricePerNight != null ? formatPrice(pricePerNight) : "N/A"}</span>
                    </p>

                    {hotel.hotelAmenities && hotel.hotelAmenities.length > 0 && (
                      <div>
                        <strong>Amenities:</strong>
                        <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
                          {hotel.hotelAmenities.map((amenity, index) => (
                            <li key={index}>{amenity}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {hotel.roomCategories && hotel.roomCategories.length > 0 && (
                      <div>
                        <strong>Room Types:</strong>
                        {hotel.roomCategories.map((room, index) => (
                          <div key={index} style={{ marginLeft: "10px", marginTop: "5px" }}>
                            <p>
                              <strong>{room.categoryName ?? "Room"}</strong>:{" "}
                              {room.pricePerNight != null ? formatPrice(room.pricePerNight) : "N/A"}/night
                            </p>
                            {room.amenities && room.amenities.length > 0 && (
                              <p style={{ fontSize: "0.9em", color: "#666" }}>
                                Amenities: {room.amenities.join(", ")}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {hotel.nearbyLandmarks && hotel.nearbyLandmarks.length > 0 && (
                      <div>
                        <strong>Nearby Landmarks:</strong>
                        <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
                          {hotel.nearbyLandmarks.map((landmark, index) => (
                            <li key={index}>
                              {landmark.landmarkName ?? "Landmark"} - {landmark.distanceInKm ?? "-"}km away
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {hotel.contactInfo && (
                      <div className="contact-info">
                        <strong>Contact Information:</strong>
                        {hotel.contactInfo.phoneNumber && <p>📞 {hotel.contactInfo.phoneNumber}</p>}
                        {hotel.contactInfo.email && <p>📧 {hotel.contactInfo.email}</p>}
                        {hotel.contactInfo.website && (
                          <p>
                            🌐{" "}
                            <a href={hotel.contactInfo.website} target="_blank" rel="noopener noreferrer">
                              {hotel.contactInfo.website}
                            </a>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HotelViewer;
