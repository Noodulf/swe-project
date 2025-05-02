# API Documentation

## Base URL
`http://localhost:3000`

## Endpoints

### 1. Chef Inventory
**GET** `/api/inventory/chef`

Returns a simplified view of inventory for chefs.

**Response:**
```javascript
{
  "success": true,
  "data": [
    {
      "ingredient": "Tomatoes",
      "quantity": 5,
      "unit": "kg"
    }
  ]
}
```

### 2. Inventory Management
**GET** `/api/inventory`

Returns detailed inventory information with status.

**Response:**
```javascript
{
  "success": true,
  "data": [
    {
      "id": 1,
      "Ingredient": {
        "name": "Tomatoes",
        "unit": "kg"
      },
      "stockLevel": 5,
      "status": "Low Stock",
      "needsReorder": true
    }
  ]
}
```

### 3. Purchase Orders
**GET** `/api/purchase-orders`

Returns all purchase orders.

**Response:**
```javascript
{
  "success": true,
  "data": [
    {
      "id": 1,
      "items": [
        {
          "ingredient": "Tomatoes",
          "quantity": 10,
          "supplier": "FreshFarm"
        }
      ],
      "status": "pending"
    }
  ]
}
```

**POST** `/api/purchase-orders`

Create a new purchase order.

**Request Body:**
```javascript
{
  "supplierId": 1,
  "items": [
    {
      "ingredientId": 1,
      "quantity": 10
    }
  ]
}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "id": 1,
    "items": [
      {
        "ingredient": "Tomatoes",
        "quantity": 10,
        "supplier": "FreshFarm"
      }
    ],
    "status": "pending"
  }
}
```

**PUT** `/api/purchase-orders/:id/approve`

Approve a purchase order.

**Response:**
```javascript
{
  "success": true,
  "data": {
    "id": 1,
    "status": "approved"
  },
  "message": "Purchase order approved successfully"
}
```

## Error Responses

All endpoints return error responses in this format:
```javascript
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error message (in development only)"
}
```

## Status Codes

- 200: Success
- 400: Bad Request
- 404: Not Found
- 500: Server Error

## Notes

1. All responses include a `success` boolean field
2. Successful responses include a `data` field
3. Error responses include a `message` field
4. The backend runs on port 3000
5. CORS is enabled for all origins 