async function request(method, path, body) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`)
  return res.status === 204 ? null : res.json()
}

export const api = {
  habits: () => request('GET', '/api/habits'),
  createHabit: (habit) => request('POST', '/api/habits', habit),
  updateHabit: (id, habit) => request('PUT', `/api/habits/${id}`, habit),
  deleteHabit: (id) => request('DELETE', `/api/habits/${id}`),
  entries: (start, end) => request('GET', `/api/entries?start=${start}&end=${end}`),
  setDone: (id, day, done) => request(done ? 'PUT' : 'DELETE', `/api/habits/${id}/days/${day}`),
}
