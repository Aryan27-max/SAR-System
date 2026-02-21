import random
import json

NUM_USERS = 10000
SUSPICIOUS_RATIO = 0.13

anomaly_types = [
    "structuring",
    "velocity_spike",
    "cross_border_layering",
    "round_tripping",
    "unusual_hours",
    "mule_behavior"
]

def normal_user(uid):
    return {
        "user_id": uid,
        "avg_monthly_txn_count": random.randint(20, 80),
        "avg_txn_amount": round(random.uniform(200, 1500), 2),
        "countries_used": 1,
        "night_txn_ratio": round(random.uniform(0.01, 0.12), 2),
        "velocity_spike": round(random.uniform(0.1, 0.6), 2),
        "round_amount_ratio": round(random.uniform(0.01, 0.2), 2),
        "linked_accounts": 1,
        "risk_score": random.randint(5, 35),
        "is_suspicious": False,
        "anomaly_type": "normal"
    }

def suspicious_user(uid):
    anomaly = random.choice(anomaly_types)

    txn_count = random.randint(150, 600)
    avg_amt = round(random.uniform(50, 700), 2)

    return {
        "user_id": uid,
        "avg_monthly_txn_count": txn_count,
        "avg_txn_amount": avg_amt,
        "countries_used": random.randint(3, 8) if anomaly == "cross_border_layering" else 1,
        "night_txn_ratio": round(random.uniform(0.4, 0.9), 2),
        "velocity_spike": round(random.uniform(2.0, 5.0), 2),
        "round_amount_ratio": round(random.uniform(0.6, 1.0), 2),
        "linked_accounts": random.randint(3, 10),
        "risk_score": random.randint(70, 100),
        "is_suspicious": True,
        "anomaly_type": anomaly
    }

users = []

for i in range(NUM_USERS):
    uid = f"U{i:05d}"

    if random.random() < SUSPICIOUS_RATIO:
        users.append(suspicious_user(uid))
    else:
        users.append(normal_user(uid))

db = {
    "aml_users": users
}

with open("db.json", "w") as f:
    json.dump(db, f, indent=2)

print("db.json created with 10,000 AML users")