# Receipt Processor Challenge – Fetch 

This repository contains my implementation of the [Fetch Rewards Receipt Processor Challenge](https://github.com/fetch-rewards/receipt-processor-challenge). I used Python Flask backend for receipt processing and a React-based frontend for interacting with the API in a user-friendly way.

---

## Overview

The goal of this project is to process receipts and calculate reward points based on specific rules. The application exposes two API endpoints:

* `POST /receipts/process`: Accepts a JSON receipt, processes it, calculates points, and returns a unique receipt ID.
* `GET /receipts/{id}/points`: Returns the points associated with the receipt ID generated from the previous request.

The backend handles data validation, error responses, and in-memory storage using UUIDs (UUID4). The frontend provides a simple UI to test receipt submissions and points retrieval, with some error handling implemented on the frontend itself to reduce computation on the backend.

---

## Project Structure

```
receipt-processor-challenge-fetch/
│
├── backend/                     # Flask-based receipt API
│   ├── app.py                   # Main app and route definitions
│   ├── processor.py             # Points allocation logic
│   ├── utils.py                 # Input validation logic
│   ├── requirements.txt         # Backend dependencies
│   ├── Dockerfile               # Dockerfile for backend
│   └── static/api.yml           # documented API (Given)
│
├── frontend/                    # React app for UI testing
│   ├── src/                     # React source code
│       ├── App.css              # Styling presentational component
│       ├── App.js               # For all states and handlers
│       ├── AppView.js           # Pure presentational component for rendering the UI
│       ├── index.js             # Inital routing
│   ├── public/
│   └── package.json             # Frontend dependencies
│
└── README.md                    # This file
```

---

## Getting Started

1. Make sure you have Docker Desktop App installed and running or download it via this [link](https://www.docker.com/products/docker-desktop/)
2. Make sure you have Python installed and configured or download it via this [link](https://www.python.org/downloads/)

### Step 1: Running Backend
#### Option 1: Using Docker (Recommended) for backend

1. Open Docker Desktop and keep it running.
2. In the `receipt-processor-challenge` directory build the Docker image by running: `docker build -t receipt-processor-challenge ./backend`
```bash
cd backend
cd receipt-processor-challenge
docker build -t receipt-processor-challenge ./backend
```
3. After that you can see the Docker image created in Docker desktop App with the image name as `receipt-processor-challenge`
4. Following it run: `docker run -p 8080:8080 receipt-processor-challenge` which will start the Docker image connecting the Docker container's port 8080 to your machine's 8080 port
```bash
docker run -p 8080:8080 receipt-processor-challenge
```

* The Flask backend runs on: `http://localhost:8080`

#### Option 2: Run Backend Locally

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask run --port=8080
```

* The Flask backend will be available at `http://localhost:8080`.

### Step 2: Run Frontend Locally

```bash
cd frontend
npm install
npm start
```

Open your browser and go to `http://localhost:3000`.

---

## Testing API Usage

### Step 1: Submit a Receipt

**POST /receipts/process**

```bash
curl -X POST http://localhost:8080/receipts/process \
  -H "Content-Type: application/json" \
  -d '{
    "retailer": "Target",
    "purchaseDate": "2022-01-01",
    "purchaseTime": "13:01",
    "items": [
      { "shortDescription": "Mountain Dew 12PK", "price": "6.49" },
      { "shortDescription": "Emils Cheese Pizza", "price": "12.25" },
      { "shortDescription": "Knorr Creamy Chicken", "price": "1.26" },
      { "shortDescription": "Doritos Nacho Cheese", "price": "3.35" },
      { "shortDescription": " Klarbrunn 12-PK 12 FL OZ ", "price": "12.00" }
    ],
    "total": "35.35"
  }'
```

**Response:**

```json
{ "id": "42cfea9c-7cc0-47e9-91a2-fa97c6e9b4e4" }
```

### Step 2: Get Points for a Receipt

**GET /receipts/{id}/points**

```bash
curl http://localhost:8080/receipts/42cfea9c-7cc0-47e9-91a2-fa97c6e9b4e4/points
```

**Response:**

```json
{ "points": 28 }
```

---
Fun Fact: I initially used Postman where I created two requests mentioned below as I am more familiar with it than curl

1. POST request with:
   * URL: `http://localhost:8080/receipts/process`
   * Enter this json data in `Body/raw` and set it to `JSON`
```bash
 {
  "retailer": "Walgreens",
  "purchaseDate": "2022-01-02",
  "purchaseTime": "08:13",
  "total": "2.65",
  "items": [
      {"shortDescription": "Pepsi - 12-oz", "price": "1.25"},
      {"shortDescription": "Dasani", "price": "1.40"}
   ]
 }
```
2. GET request with:
     * URL: `http://localhost:8080/receipts/<receipt_id>/points`
     * Here enter the `<receipt_id>` got from POST request
     * For example: `http://localhost:8080/receipts/4a04d6c9-227d-4e13-8bd4-9d5c5fe9ae5e/points`
     * Got response:
```json
{ "points": 15 }
```

## Using the Frontend

The React-based UI simplifies testing the receipt processor:

* Fill in the form fields (retailer, purchase date/time, items, etc.)
* Add multiple items dynamically
* Submit the receipt and view the generated ID
* Fetch the points using the receipt ID

> Ensure the backend is running before launching the frontend.

---

## Error Handling

Robust error handling is implemented on both the **backend** and **frontend** to ensure data integrity, user guidance, and graceful failure in case of incorrect input or system issues.

### Backend Error Handling (Flask)

The backend validates incoming requests thoroughly and returns meaningful HTTP error codes with explanatory messages in accordance with OpenAPI standards given in `static/api.yml`.

#### 1. **Invalid Receipt Data (HTTP 400 - Bad Request)**

* **Missing or Incorrect Fields**: If any required field (`retailer`, `purchaseDate`, `purchaseTime`, `total`, or `items`) is missing, a `400` response is returned.
* **Incorrect Data Types**: A `400` is also triggered if the JSON is not a dictionary or if `items` is not a list with at least one valid item.
* **Regex Pattern Violations**: Fields like `retailer`, `purchaseDate`, `purchaseTime`, `total`, `shortDescription`, and `price` must match expected formats. Violations lead to a `400` response.
* **Item Validation**: Each item must contain both `shortDescription` and `price`. Any missing or malformed item results in a `400` error.
* **Non-numeric Prices or Totals**: If conversion to float fails for any price or total field, a `400` response is returned.
* **Total Mismatch (Custom Rule)**: If the sum of item prices (rounded to two decimals) does not match the provided `total` value, a `400` error is raised.
* **Error Message Format**:

  ```json
  {
    "error": "The receipt is invalid."
  }
  ```

#### 2. **Receipt Not Found (HTTP 404 - Not Found)**

* **Unknown Receipt ID**: If a user requests points for an unknown or expired receipt ID, the server responds with:

  ```json
  {
    "error": "No receipt found for that ID."
  }
  ```

---

### Frontend Error Handling (React)

The frontend includes pre-submission validation, clear user feedback, and response-based error handling to improve UX and reduce load on the backend.

#### 1. **Form Input Validation**

* **Invalid Prices**: Before submission, all item prices are validated to ensure they are numeric and not empty.
* **Error Message**:
  `"Please enter valid numeric prices for all items."`
* **Visual Feedback**: Invalid price fields are cleared, and error styles are applied to guide correction.

#### 2. **API Error Handling**

* **Receipt Submission (`POST /receipts/process`)**

  * Displays specific error messages returned by the backend, or:
    `"Invalid receipt data."`
  * On network failure:
    `"Network error."`
* **Point Retrieval (`GET /receipts/{id}/points`)**

  * If ID is invalid or not found, displays:
    `"Receipt not found."`
  * On network failure:
    `"Network error."`

#### 3. **User Interface Error Display**

* All errors are displayed prominently using a styled `.error-box` component to ensure visibility and clarity.

#### 4. **Input Safeguards**

* **Prevent Deleting All Items**: The frontend prevents users from removing the last remaining item, since at least one is required by the backend.

---

## More Error Handling That Could Be Added (Future Scope)

While the current implementation handles most core validation scenarios, there are a few additional checks that could further improve the robustness and accuracy of the system:

### Backend Enhancements

1. **Future Purchase Date Restriction**

   * **Validation**: Ensure the `purchaseDate` is not a future date.
   * **Benefit**: Prevents invalid or mistakenly entered receipts from being accepted.

2. **Invalid Purchase Time Check**

   * **Validation**: Ensure `purchaseTime` is a valid 24-hour time format (e.g., does not exceed `23:59`).
   * **Note**: Although the frontend uses a time picker, backend validation is still essential for security and API usage outside the UI.

3. **Duplicate Receipt Detection**

   * **Idea**: If a receipt with identical content (e.g., same retailer, items, timestamp, and total) has already been submitted, return a conflict (`409`) response. This is because, currently an unique id is created everytime for each new receipt but there is no logic in the code to determine whether the same receipt is submitted twice.
   * **Benefit**: Prevents unintentional resubmission or abuse.

4. **Sanitization and Security Checks**

   * **Implementation**: Strip or escape any malicious input (e.g., script tags or SQL-like syntax) to avoid potential injection attacks in more advanced deployments.

### Frontend Enhancements

1. **Item Field Auto-Formatting**

   * Automatically trim whitespace or fix casing for descriptions and prices to prevent user error.

---

## Points Calculation Rules (Summary)

The backend calculates points based on a variety of rules:

All rules follow those defined in the [challenge instructions](https://github.com/fetch-rewards/receipt-processor-challenge).

---

## Reflections and Future Work

This challenge was a great opportunity to integrate a lightweight backend and React UI. A few improvements I plan to explore:

* Replace in-memory storage with Redis or SQLite
* Improve form validation in the frontend
* Enhance error messages with more granular status codes on backend (didn't implement as it was explicitly mentioned to follow given specs on backend)


---

## Contact

If you have questions, feedback, or want to collaborate, feel free to reach out through email `shashanksantoshjagtap05@gmail.com` or open an issue.

---
