import React from "react";

// Pure presentational component for rendering the UI
function AppView({
  receipt,
  receiptId,
  submittedId,
  points,
  error,
  loading,
  handleReceiptChange,
  handleItemChange,
  addItem,
  deleteItem,
  submitReceipt,
  fetchPoints,
  setReceiptId,
  calculateTotal,
}) {
  return (
    <div className="app-bg">
      <div className="card">
        <div className="form-inner">
          <h2>Submit a Receipt</h2>
          <form onSubmit={submitReceipt}>
            <div className="form-group">
              <label>Retailer</label>
              <input
                name="retailer"
                type="text"
                value={receipt.retailer}
                onChange={handleReceiptChange}
                required
                placeholder="e.g. Target"
              />
            </div>
            <div className="form-group">
              <label>Purchase Date</label>
              <input
                name="purchaseDate"
                type="date"
                value={receipt.purchaseDate}
                onChange={handleReceiptChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Purchase Time</label>
              <input
                name="purchaseTime"
                type="time"
                value={receipt.purchaseTime}
                onChange={handleReceiptChange}
                required
              />
            </div>
            <div className="form-group items-list">
              <label>Items</label>
              {receipt.items.map((item, idx) => (
                <div className="item-row" key={idx}>
                  <input
                    name="shortDescription"
                    type="text"
                    placeholder="Description"
                    value={item.shortDescription}
                    onChange={(e) => handleItemChange(idx, e)}
                    required
                  />
                  <input
                    name="price"
                    type="text"
                    placeholder="Price (e.g. 6.49)"
                    value={item.price}
                    onChange={(e) => handleItemChange(idx, e)}
                    required
                  />
                  <button
                    type="button"
                    className="delete-item-btn"
                    onClick={() => deleteItem(idx)}
                    disabled={receipt.items.length === 1}
                    title={
                      receipt.items.length === 1
                        ? "At least one item required"
                        : "Delete item"
                    }
                    style={{
                      marginLeft: 6,
                      background: "#ffe6e6",
                      color: "#b91c1c",
                      border: "none",
                      borderRadius: 6,
                      padding: "0 10px",
                      fontWeight: "bold",
                      cursor:
                        receipt.items.length === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" className="add-item-btn" onClick={addItem}>
                + Add Item
              </button>
            </div>
            <div className="form-group">
              <label>Total</label>
              <input
                name="total"
                type="text"
                value={calculateTotal()}
                readOnly
                placeholder="Total"
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit Receipt"}
            </button>
          </form>
          {submittedId && (
            <div className="info-box">
              Receipt submitted! <br />
              <b>ID:</b> <span>{submittedId}</span>
            </div>
          )}

          <hr />

          <h2>Check Points</h2>
          <form onSubmit={fetchPoints}>
            <div className="form-group">
              <label>Receipt ID</label>
              <input
                value={receiptId}
                onChange={(e) => setReceiptId(e.target.value)}
                placeholder="Enter Receipt ID"
                required
                type="text"
              />
            </div>
            <button type="submit" className="points-btn" disabled={loading}>
              {loading ? "Checking..." : "Get Points"}
            </button>
          </form>
          {points !== null && (
            <div className="info-box">
              Points for receipt <b>{receiptId}</b>: <b>{points}</b>
            </div>
          )}
          {error && (
            <div className="error-box">
              <b>{error}</b>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppView;
