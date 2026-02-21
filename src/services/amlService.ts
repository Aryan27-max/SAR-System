const BASE_URL = "http://localhost:4000";

export async function getAllUsers() {
  const res = await fetch(`${BASE_URL}/aml_users`);
  return res.json();
}

export async function getSuspiciousUsers() {
  const res = await fetch(`${BASE_URL}/aml_users?is_suspicious=true`);
  return res.json();
}

export async function getHighRiskUsers() {
  const res = await fetch(`${BASE_URL}/aml_users?risk_score_gte=80`);
  return res.json();
}