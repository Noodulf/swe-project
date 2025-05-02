import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/common.css";
import { toast } from "react-toastify";

function GeneratePO() {
  const [ingredients, setIngredients] = useState([]);
  const [quantities, setQuantities] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/api/ingredients")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIngredients(data.data);
        } else {
          throw new Error(data.message || 'Failed to load ingredients');
        }
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to load ingredients ❌");
      });
  }, []);

  const handleChange = (id, value) => {
    setQuantities({ ...quantities, [id]: value });
  };

  const handleGenerate = () => {
    const orders = ingredients
      .filter(i => quantities[i.ingredientId])
      .map(i => ({
        ingredient_id: i.ingredientId,
        quantity: parseFloat(quantities[i.ingredientId]),
      }));

    if (orders.length === 0) {
      toast.warn("Please enter quantities first ⚠️");
      return;
    }

    fetch("http://localhost:3000/api/purchase-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          toast.success("Purchase Order Created ✅");
          navigate("/inventory");
        } else {
          throw new Error(data.message || 'Failed to create PO');
        }
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to create PO ❌");
      });
  };

  return (
    <div className="page-container">
      <h2>📦 Generate Purchase Order</h2>
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