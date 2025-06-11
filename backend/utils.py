import re

class ReceiptValidator:
    """Enforces receipt structure as mentioned in specs file"""
    def is_valid_receipt(self, data):
        """Comprehensive validation including:
        - Required fields presence
        - Field format validation
        - Item validation
        - Total amount consistency
        """

        required_fields = {"retailer", "purchaseDate", "purchaseTime", "total", "items"}

        # Basic structure validation
        if not isinstance(data, dict):
            return False
        if not required_fields.issubset(data.keys()):
            return False
        if not isinstance(data["items"], list) or len(data["items"]) < 1:
            return False

        # Field pattern validation using regex
        field_checks = [
            (r"^[\w\s\-\&]+$", data["retailer"]),        # Retailer name
            (r"^\d{4}-\d{2}-\d{2}$", data["purchaseDate"]),# ISO date
            (r"^\d{2}:\d{2}$", data["purchaseTime"]),  # 24h time
            (r"^\d+\.\d{2}$", data["total"])         # Monetary value
        ]
        for pattern, value in field_checks:
            if not re.match(pattern, value):
                return False

        # Item validation
        total_from_items = 0.0
        for item in data["items"]:
            if "shortDescription" not in item or "price" not in item:
                return False
            if not re.match(r"^[\w\s\-]+$", item["shortDescription"].strip()):
                return False
            if not re.match(r"^\d+\.\d{2}$", item["price"]):
                return False
            try:
                total_from_items += float(item["price"])
            except ValueError:
                return False

        # Check if the sum of item prices equals the total (allowing for small floating point errors) {I have added this for better error handling}
        try:
            provided_total = float(data["total"])
        except ValueError:
            return False

        if abs(provided_total - total_from_items) > 0.01:
            return False

        return True
