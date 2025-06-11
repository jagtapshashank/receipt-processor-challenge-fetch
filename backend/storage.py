"""Volatile in-memory storage for receipt data. Using in-memory storage is acceptable as per the guidlines
    Note: If this was for production use, I would have replaced it with some persistent storage."""
class ReceiptStorage:
    def __init__(self):
        self.store = {}

    def store_receipt(self, receipt_id, points):
        """Stores receipt-points pair"""
        self.store[receipt_id] = points

    def get_points(self, receipt_id):
        """Retrieves points by receipt ID. Returns None if not found."""
        return self.store.get(receipt_id)
