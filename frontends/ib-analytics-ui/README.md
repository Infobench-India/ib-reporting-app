mqtt topic : 00000000000000000000000/vgvs

Sample payload to publish
{
  "eventId": "event1",
  "timestamp": 1733874000000,
  "data": {
    "temp": 45,
    "pressure": 2500
  }
}
Sample Machine configuration created
{
    "success": true,
    "docs": [
        {
            "_id": "6939c74eab7abcf8ffa89200",
            "id": "vgvs",
            "type": "machine",
            "description": "volve guide and volve sheet",
            "events": [
                {
                    "id": "event1",
                    "type": "alarm",
                    "description": "",
                    "tableName": "alarms",
                    "live": true,
                    "fields": [
                        {
                            "name": "Temp",
                            "key": "temp",
                            "db-columName": "temp",
                            "ui-displayOnCardAt": 1,
                            "unit": "celcious"
                        },
                        {
                            "name": "Pressure",
                            "key": "pressure",
                            "db-columName": "pressure",
                            "ui-displayOnCardAt": 1,
                            "unit": "pascale"
                        }
                    ]
                }
            ],
            "updatedAt": "2025-12-10T19:17:34.557Z",
            "createdAt": "2025-12-10T19:17:34.557Z",
            "__v": 0
        }
    ],
    "pagination": {
        "totalItems": 1,
        "totalPages": 1,
        "currentPage": 1,
        "itemsPerPage": 10
    }
}