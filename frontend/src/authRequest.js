export async function authRequest(action, form, failureMessage) {
  const unavailable = "The account server is unavailable. Please try again shortly.";
  const response = await fetch(`/api/auth/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  }).catch(() => {
    throw new Error(unavailable);
  });

  const data = await response.json().catch(() => null);
  if (!data) throw new Error(unavailable);
  if (!response.ok) throw new Error(data.message || failureMessage);
  return data;
}
