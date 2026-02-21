import random
import csv

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
    return [
        uid,
        random.randint(20, 80),
        round(random.uniform(200, 1500), 2),
        0,  # volume calculated later
        1,
        round(random.uniform(0.01, 0.12), 2),
        round(random.uniform(0.1, 0.6), 2),
        round(random.uniform(0.01, 0.2), 2),
        1,
        random.randint(5, 35),
        0,
        "normal"
    ]

def suspicious_user(uid):
    anomaly = random.choice(anomaly_types)

    txn_count = random.randint(150, 600)
    avg_amt = round(random.uniform(50, 700), 2)

    countries = random.randint(3, 8) if anomaly == "cross_border_layering" else 1
    night_ratio = round(random.uniform(0.4, 0.9), 2) if anomaly == "unusual_hours" else round(random.uniform(0.05, 0.3), 2)

    return [
        uid,
        txn_count,
        avg_amt,
        0,
        countries,
        night_ratio,
        round(random.uniform(2.0, 5.0), 2),
        round(random.uniform(0.6, 1.0), 2),
        random.randint(3, 10),
        random.randint(70, 100),
        1,
        anomaly
    ]

rows = []
for i in range(NUM_USERS):
    uid = f"U{i:05d}"

    if random.random() < SUSPICIOUS_RATIO:
        row = suspicious_user(uid)
    else:
        row = normal_user(uid)

    # calculate volume
    row[3] = round(row[1] * row[2], 2)

    rows.append(row)

with open("aml_anomaly_users.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow([
        "user_id",
        "avg_monthly_txn_count",
        "avg_txn_amount",
        "total_monthly_volume",
        "countries_used",
        "night_txn_ratio",
        "velocity_spike",
        "round_amount_ratio",
        "linked_accounts",
        "risk_score",
        "is_suspicious",
        "anomaly_type"
    ])
    writer.writerows(rows)

print("Generated aml_anomaly_users.csv with 10,000 users")