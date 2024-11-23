import React, { useEffect, useState } from 'react';
import { supabase } from "../../../supabaseClient";
import './Parrainage.css';

const Parrainage = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  // Fetch user data from Supabase
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_data')
        .select('*'); // You can filter or order if necessary

      if (error) {
        console.error(error);
      } else {
        setUserData(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Function to handle Block/Unblock button click
  const handleBlockToggle = async (id, currentBlocked) => {
    try {
      const { error } = await supabase
        .from('user_data')
        .update({ blocked: currentBlocked === 'blocked' ? 'unblocked' : 'blocked' })
        .match({ id });

      if (error) {
        console.error(error);
      } else {
        fetchUserData(); // Re-fetch the data after update
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Function to open modal with the image
  const openModal = (imageUrl) => {
    setModalImage(imageUrl);
    setShowModal(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
    setModalImage(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Created At</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Birthdate</th>
            <th>Card Recto</th>
            <th>Card Verso</th>
            <th>Blocked</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {userData.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.created_at}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.birthdate}</td>
              <td>
                {user.card_recto && (
                    <img
                    src={user.card_recto}
                    alt={`Card Recto for ${user.name}`}  // More descriptive alt text
                    style={{ width: '100px', height: 'auto', cursor: 'pointer' }}
                    onClick={() => openModal(user.card_recto)}
                    />
                )}
                </td>
                <td>
                {user.card_verso && (
                    <img
                    src={user.card_verso}
                    alt={`Card Verso for ${user.name}`}  // More descriptive alt text
                    style={{ width: '100px', height: 'auto', cursor: 'pointer' }}
                    onClick={() => openModal(user.card_verso)}
                    />
                )}
                </td>
              <td>{user.blocked}</td>
              <td>
                <button onClick={() => handleBlockToggle(user.id, user.blocked)}>
                  {user.blocked === 'blocked' ? 'Unblock' : 'Block'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for displaying image */}
        {showModal && (
        <div className="modal" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeModal}>&times;</span>
            <img src={modalImage} alt={`Full-size view of ${modalImage}`} className="modal-image" />
            </div>
        </div>
        )}
    </div>
  );
};

export default Parrainage;
