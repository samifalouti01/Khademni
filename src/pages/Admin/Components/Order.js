import React, { useEffect, useState } from 'react';
import { supabase } from "../../../supabaseClient";
import './Order.css';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('order')
          .select('*')
          .order('created_at', { ascending: false });

        if (ordersError) {
          throw ordersError;
        }

        const ordersWithUserData = await Promise.all(ordersData.map(async (order) => {
          const { data: userData, error: userError } = await supabase
            .from('user_data')
            .select('perso, ppcg')
            .eq('id', order.user_id)
            .single();

          if (userError) {
            order.userData = null;
            if (userError.code === 'PGRST116') {
              setError(`No user found for user_id: ${order.user_id}`);
            } else {
              throw userError;
            }
          } else {
            order.userData = userData;
          }
          return order;
        }));

        setOrders(ordersWithUserData);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleValidate = async (orderId, userId, currentTotalPrice) => {
    try {
      // Step 1: Get user data
      const { data: userData, error: userError } = await supabase
        .from('user_data')
        .select('perso, ppcg, parrain_id')
        .eq('id', userId)
        .single();
  
      if (userError) {
        if (userError.code === 'PGRST116') {
          setError(`No user found for user_id: ${userId}`);
        } else {
          throw userError;
        }
        return;
      }
  
      // Step 2: Calculate new values for the user's points (perso and ppcg)
      const currentPersoValue = parseFloat(userData.perso) || 0;
      const currentPrice = parseFloat(currentTotalPrice) || 0;
      const newPersoValue = currentPersoValue + currentPrice;
  
      const currentPpcgValue = parseFloat(userData.ppcg) || 0;
      const newPpcgValue = currentPpcgValue + currentPrice;
  
      // Step 3: Update the order status to 'validé'
      const { error: updateOrderError } = await supabase
        .from('order')
        .update({ order_status: 'validé' })
        .eq('id', orderId);
  
      if (updateOrderError) {
        throw updateOrderError;
      }
  
      // Step 4: Update the user's data
      const { error: updateUserError } = await supabase
        .from('user_data')
        .update({
          perso: newPersoValue.toString(),
          ppcg: newPpcgValue.toString(),
        })
        .eq('id', userId);
  
      if (updateUserError) {
        throw updateUserError;
      }
  
      // Step 5: Check if the user has a parrain_id and update the referred user's parainage_points
      if (userData.parrain_id) {
        // Step 1: Split the parrain_id into an array of IDs
        const parrainIds = userData.parrain_id.split(',').map(id => id.trim());
      
        // Step 2: Fetch the data of all users whose IDs are in the parrainIds array
        const { data: parrainsData, error: parrainsError } = await supabase
          .from('user_data')
          .select('id, parainage_points, ppcg')
          .in('id', parrainIds);
      
        if (parrainsError) {
          throw parrainsError;
        }
      
        // Step 3: Update the parainage_points and ppcg for each parrain
        for (const parrain of parrainsData) {
          const currentParainagePoints = parseFloat(parrain.parainage_points) || 0;
          const currentPpcgValue = parseFloat(parrain.ppcg) || 0;
      
          const newParainagePoints = currentParainagePoints + currentPrice;
          const newPpcgValue = currentPpcgValue + currentPrice;
      
          const { error: updateParrainError } = await supabase
            .from('user_data')
            .update({
              parainage_points: newParainagePoints.toString(),
              ppcg: newPpcgValue.toString(),
            })
            .eq('id', parrain.id);
      
          if (updateParrainError) {
            throw updateParrainError;
          }
        }
      }      
  
      // Step 6: Update the orders state
      setOrders(prevOrders => prevOrders.map(order => {
        if (order.id === orderId) {
          return { ...order, order_status: 'validé' };
        }
        return order;
      }));
  
    } catch (error) {
      setError(error.message);
    }
  };
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
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
            <th>Product Ref</th>
            <th>Total Price</th>
            <th>Order Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{new Date(order.created_at).toLocaleString()}</td>
              <td>{order.name}</td>
              <td>{order.email}</td>
              <td>{order.product_ref}</td>
              <td>{order.total_price}</td>
              <td>{order.order_status}</td>
              <td>
                {order.order_status !== 'validé' && order.userData ? (
                  <button onClick={() => handleValidate(order.id, order.user_id, order.total_price)}>
                    Validate
                  </button>
                ) : (
                  <span style={{ color: '#007bff' }}>{order.userData ? 'Validated' : 'User not found'}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Order;
