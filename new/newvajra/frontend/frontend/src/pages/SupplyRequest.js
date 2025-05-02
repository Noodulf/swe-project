import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const SupplyRequest = () => {
  const [ingredients, setIngredients] = useState([]);
  const [rows, setRows] = useState([
    { ingredientId: '', name: '', unit: '', pricePerUnit: '', quantity: '' }
  ]);

  useEffect(() => {
    fetch("http://localhost:3000/api/ingredients")
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : data.data;
        setIngredients(
          arr.map((ing) => ({
            id: ing.ingredientId,
            name: ing.name,
            unit: ing.unit,
            pricePerUnit: ing.pricePerUnit
          }))
        );
      })
      .catch((err) => {
        console.error("Failed to fetch ingredients:", err);
        toast.error("Failed to load ingredients ❌");
      });
  }, []);

  const handleRowChange = (idx, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      // If ingredientId is changed, auto-fill name/unit/price for existing
      if (field === 'ingredientId') {
        const selected = ingredients.find((i) => i.id === parseInt(value));
        if (selected) {
          updated[idx].name = selected.name;
          updated[idx].unit = selected.unit;
          updated[idx].pricePerUnit = selected.pricePerUnit;
        } else {
          updated[idx].name = '';
          updated[idx].unit = '';
          updated[idx].pricePerUnit = '';
        }
      }
      return updated;
    });
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { ingredientId: '', name: '', unit: '', pricePerUnit: '', quantity: '' }
    ]);
  };

  const removeRow = (idx) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSendRequests = () => {
    const requestList = rows
      .filter((row) => row.quantity > 0 && (row.ingredientId || (row.name && row.unit && row.pricePerUnit)))
      .map((row) => {
        if (row.ingredientId) {
          return { ingredientId: parseInt(row.ingredientId), quantity: parseFloat(row.quantity) };
        } else {
          return {
            name: row.name,
            unit: row.unit,
            pricePerUnit: parseFloat(row.pricePerUnit),
            quantity: parseFloat(row.quantity)
          };
        }
      });

    if (requestList.length === 0) {
      toast.error("No valid supply requests!");
      return;
    }

    fetch("http://localhost:3000/api/purchase-orders/supply-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests: requestList })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to send supply request");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Supply Request Sent:", data);
        toast.success("Supply request sent successfully ✅");
        setRows([{ ingredientId: '', name: '', unit: '', pricePerUnit: '', quantity: '' }]);
      })
      .catch((err) => {
        console.error("Supply request error:", err);
        toast.error("Failed to send request ❌");
      });
  };

  return (
    <div className="page-container supply-page">
      <h2 className="supply-header">🍳 Supply Request</h2>
      <p className="supply-subtext">
        Select or add ingredients and specify the quantity you need.
      </p>
      <div className="table-wrapper">
        <table className="supply-table">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Unit</th>
              <th>Price/Unit</th>
              <th>Quantity Needed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td>
                  <select
                    value={row.ingredientId}
                    onChange={(e) => handleRowChange(idx, 'ingredientId', e.target.value)}
                  >
                    <option value="">-- New Ingredient --</option>
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>{ing.name}</option>
                    ))}
                  </select>
                  {!row.ingredientId && (
                    <input
                      type="text"
                      placeholder="Name"
                      value={row.name}
                      onChange={(e) => handleRowChange(idx, 'name', e.target.value)}
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </td>
                <td>
                  {row.ingredientId ? (
                    <input type="text" value={row.unit} readOnly />
                  ) : (
                    <input
                      type="text"
                      placeholder="Unit"
                      value={row.unit}
                      onChange={(e) => handleRowChange(idx, 'unit', e.target.value)}
                    />
                  )}
                </td>
                <td>
                  {row.ingredientId ? (
                    <input type="number" value={row.pricePerUnit} readOnly />
                  ) : (
                    <input
                      type="number"
                      placeholder="Price/Unit"
                      value={row.pricePerUnit}
                      onChange={(e) => handleRowChange(idx, 'pricePerUnit', e.target.value)}
                    />
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2"
                    value={row.quantity}
                    onChange={(e) => handleRowChange(idx, 'quantity', e.target.value)}
                  />
                </td>
                <td>
                  {rows.length > 1 && (
                    <button onClick={() => removeRow(idx)} style={{ color: 'red' }}>Remove</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addRow} style={{ marginTop: 8 }}>+ Add Ingredient</button>
      </div>
      <br />
      <button className="submit-request-btn" onClick={handleSendRequests}>
        📦 Send Request
      </button>
    </div>
  );
};

export default SupplyRequest;