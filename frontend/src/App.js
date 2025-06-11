import React, { useState, useEffect } from "react";
import "./App.css";
import AppView from "./AppView"; // Import the presentational component

function App() {
  // State for receipt fields and items
  const [receipt, setReceipt] = useState({
    retailer: "",
    purchaseDate: "",
    purchaseTime: "",
    total: "",
    items: [{ shortDescription: "", price: "" }],
  });
  // State for receipt ID (for lookup), submitted ID, points, error messages, and loading status
  const [receiptId, setReceiptId] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const [points, setPoints] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Calculate total from items, always two decimals
  const calculateTotal = (items = receipt.items) => {
    return items
      .reduce((sum, item) => {
        const price = parseFloat(item.price);
        return sum + (isNaN(price) ? 0 : price);
      }, 0)
      .toFixed(2);
  };

  // Update total automatically when items change
  useEffect(() => {
    setReceipt((prev) => ({
      ...prev,
      total: calculateTotal(),
    }));
    // eslint-disable-next-line
  }, [receipt.items]);

  const handleReceiptChange = (e) => {
    setReceipt({ ...receipt, [e.target.name]: e.target.value });
  };

  // Let user type anything for price 
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...receipt.items];
    newItems[index][name] = value;
    setReceipt({ ...receipt, items: newItems });
  };

  // Add a new item row
  const addItem = () => {
    setReceipt({
      ...receipt,
      items: [...receipt.items, { shortDescription: "", price: "" }],
    });
  };

  // Delete a specific item
  const deleteItem = (index) => {
    if (receipt.items.length === 1) return; // Prevent deleting last item
    const newItems = receipt.items.filter((_, idx) => idx !== index);
    setReceipt({ ...receipt, items: newItems });
  };

  // Helper to validate and format prices to 2 decimals
  const validateAndFormatPrices = (items) => {
    let valid = true;
    const newItems = items.map((item) => {
      let priceNum = parseFloat(item.price);
      if (isNaN(priceNum) || item.price === "") {
        valid = false;
        return { ...item, price: "" }; // Mark invalid
      }
      // Round to two decimals
      return { ...item, price: priceNum.toFixed(2) };
    });
    return { valid, newItems };
  };

  // Handle receipt submission to backend
  const submitReceipt = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setPoints(null);
    setSubmittedId("");

    // Validate and format prices
    const { valid, newItems } = validateAndFormatPrices(receipt.items);
    if (!valid) {
      setError("Please enter valid numeric prices for all items.");
      setReceipt((prev) => ({ ...prev, items: newItems }));
      setLoading(false);
      return;
    }

    // Update prices in the UI before sending
    const updatedReceipt = { ...receipt, items: newItems, total: calculateTotal(newItems) };

    try {
      // Send POST request to backend
      const response = await fetch("/receipts/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedReceipt),
      });
      const data = await response.json();
      if (response.ok) {
        setSubmittedId(data.id);
        setReceiptId(data.id);
        setReceipt(updatedReceipt); // Update UI with formatted prices
      } else {
        setError(data.error || "Invalid receipt data."); // Backend validation 
      }
    } catch (err) {
      setError("Network error."); // Network or server error
    }
    setLoading(false);
  };

  // Fetch points for a submitted receipt ID from backend
  const fetchPoints = async (e) => {
    e.preventDefault();
    setError("");
    setPoints(null);
    setLoading(true);
    try {
      const response = await fetch(`/receipts/${receiptId}/points`);
      const data = await response.json();
      if (response.ok) {
        setPoints(data.points);
      } else {
        setError(data.error || "Receipt not found."); // Backend: receipt not found error
      }
    } catch (err) {
      setError("Network error."); // Network or server error
    }
    setLoading(false);
  };

  // Passing all state and handlers as props to the presentational component
  return (
    <AppView
      receipt={receipt}
      receiptId={receiptId}
      submittedId={submittedId}
      points={points}
      error={error}
      loading={loading}
      handleReceiptChange={handleReceiptChange}
      handleItemChange={handleItemChange}
      addItem={addItem}
      deleteItem={deleteItem}
      submitReceipt={submitReceipt}
      fetchPoints={fetchPoints}
      setReceiptId={setReceiptId}
      calculateTotal={calculateTotal}
    />
  );
}

export default App;
