from datetime import datetime
import math
import re

class ReceiptProcessor:
    def calculate_points(self, receipt):
        points = 0
        retailer = receipt.get("retailer", "")
        total = float(receipt.get("total", "0.00"))
        items = receipt.get("items", [])
        purchase_date = receipt.get("purchaseDate", "")
        purchase_time = receipt.get("purchaseTime", "")

        # One point for every alphanumeric character in the string of retailer name
        points += len(re.findall(r'\w', retailer))

        # 50 points if total is a whole number that is positive integer (exclude negative integers but include zero{Assumption})
        if total > 0 and total.is_integer():
            points += 50

        # 25 points if total is multiple of 0.25. Assumption: 0 is a multiple of 0.25
        if total % 0.25 == 0:
            points += 25

        # 5 points for every two items on the receipt
        points += (len(items) // 2) * 5

        # If the trimmed length of the item description is a multiple of 3, multiply the price by 0.2 and round up to the nearest integer. The result is the number of points earned.
        for item in items:
            desc = item.get("shortDescription", "").strip()
            price = float(item.get("price", "0.00"))
            if len(desc) % 3 == 0:
                points += math.ceil(price * 0.2)

        try:
            # 6 points if date number in the date is odd
            day = int(purchase_date.split("-")[2])
            if day % 2 == 1:
                points += 6
        except:
            pass

        try:
            time_obj = datetime.strptime(purchase_time, "%H:%M")
            # Condition to check whether purchase time in between 2pm and 4pm (exact 2pm and 4pm excluded)
            if (time_obj.hour == 14 and time_obj.minute > 0) or (time_obj.hour == 15 and time_obj.minute < 60):
                points += 10
        except:
            pass

        return points
