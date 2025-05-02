import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/common.css";
import { toast } from "react-toastify";

function GeneratePO() {
  const [ingredients, setIngredients] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const fetchIngredients = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/ingredients");
      const data = await res.json();
      if (data.success) {
        console.log('Fetched ingredients:', data.data);
        setIngredients(data.data);
        // Clear quantities when ingredients are refreshed
        setQuantities({});
      } else {
        throw new Error(data.message || 'Failed to load ingredients');
      }
    } catch (err) {
      console.error('Error fetching ingredients:', err);
      toast.error("Failed to load ingredients ❌");
    }
  };

  useEffect(() => {
    console.log('Component mounted, fetching ingredients...');
    fetchIngredients();

    // Cleanup function
    return () => {
      console.log('Component unmounting, clearing state...');
      setIngredients([]);
      setQuantities({});
    };
  }, [refreshKey]); // Re-fetch when refreshKey changes

  const handleChange = (id, value) => {
    console.log(`Updating quantity for ingredient ${id} to ${value}`);
    setQuantities(prev => ({ ...prev, [id]: value }));
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
    setRefreshKey(prev => prev + 1);
    toast.info("Refreshing ingredients data...");
  };

  const handleGenerate = () => {
    console.log('Current ingredients:', ingredients);
    console.log('Current quantities:', quantities);
    
    // Validate that we have valid ingredient IDs
    const validOrders = ingredients
      .filter(i => {
        const hasQuantity = quantities[i.ingredientId] && parseFloat(quantities[i.ingredientId]) > 0;
        if (!hasQuantity) return false;
        
        // Validate ingredient ID
        if (!i.ingredientId) {
          console.error(`Invalid ingredient ID for ${i.name}`);
          toast.error(`Invalid ingredient ID for ${i.name} ❌`);
          return false;
        }
        return true;
      })
      .map(i => {
        const quantity = parseFloat(quantities[i.ingredientId]);
        console.log(`Processing ingredient: ${i.name} (ID: ${i.ingredientId}), Quantity: ${quantity}`);
        return {
          ingredientId: i.ingredientId,
          quantity: quantity
        };
      });

    console.log('Final orders to be sent:', validOrders);

    if (validOrders.length === 0) {
      toast.warn("Please enter valid quantities first ⚠️");
      return;
    }

    fetch("http://localhost:3000/api/purchase-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: validOrders })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('PO created successfully:', data);
          toast.success("Purchase Order Created ✅");
          // Clear quantities after successful PO creation
          setQuantities({});
          navigate("/inventory");
        } else {
          throw new Error(data.message || 'Failed to create PO');
        }
      })
      .catch(err => {
        console.error('Error creating PO:', err);
        toast.error("Failed to create PO ❌");
      });
  };

  return (
    <div className="page-container">
      <h2>📦 Generate Purchase Order</h2>
      <button onClick={handleRefresh} style={{ marginBottom: "1rem" }}>
        🔄 Refresh Ingredients
      </button>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Ingredient</th>
            <th>Unit</th>
            <th>Quantity to Order</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map(i => (
            <tr key={i.ingredientId}>
              <td>{i.name}</td>
              <td>{i.unit}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  value={quantities[i.ingredientId] || ""}
                  onChange={e => handleChange(i.ingredientId, e.target.value)}
                  placeholder="0"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <br />
      <button onClick={handleGenerate}>Generate PO</button>
      <button onClick={() => navigate("/inventory")} style={{ marginLeft: "1rem" }}>
        Cancel
      </button>
    </div>
  );
}

export default GeneratePO;