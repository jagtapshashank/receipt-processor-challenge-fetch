from flask import Flask, request, jsonify, make_response
import uuid

from processor import ReceiptProcessor
from storage import ReceiptStorage
from utils import ReceiptValidator

app = Flask(__name__)

# Instantiate class objects
processor = ReceiptProcessor() # Points calculation logic
storage = ReceiptStorage() # In-memory receipt storage
validator = ReceiptValidator() # Receipt validation rules

@app.route("/receipts/process", methods=["POST"])
def process_receipt():
    """Endpoint for submitting receipts. Performs:
    1. JSON validation
    2. UUID generation
    3. Points calculation
    4. Storage
    """
    data = request.get_json()
    # Validate against receipt schema and business rules
    if not validator.is_valid_receipt(data):
        return jsonify({"error": "The receipt is invalid."}), 400

    # Generate unique identifier
    receipt_id = str(uuid.uuid4())
    points = processor.calculate_points(data)
    storage.store_receipt(receipt_id, points)
    # Return UUID for future lookup
    return jsonify({"id": receipt_id}), 200

@app.route("/receipts/<receipt_id>/points", methods=["GET"])
def get_receipt_points(receipt_id):
    """Retrieves calculated points for a given receipt ID
    """
    points = storage.get_points(receipt_id)
     
    if points is None:
        # If ID not found in storage
        return make_response(jsonify({"error": "No receipt found for that ID."}), 404)
    return jsonify({"points": points}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
