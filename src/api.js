const API_ROOT = 'http://localhost:4000';

export async function get(path, params='') {
  const res = await fetch(`${API_ROOT}${path}${params}`);
  return res.json();
}

export async function post(path, body) {
  const res = await fetch(`${API_ROOT}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

export async function put(path, body) {
  const res = await fetch(`${API_ROOT}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

export async function patch(path, body) {
  const res = await fetch(`${API_ROOT}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

export async function remove(path) {
  const res = await fetch(`${API_ROOT}${path}`, {
    method: 'DELETE'
  });
  return res.json();
}
