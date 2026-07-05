const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const request = async (endpoint, { method = "GET", body, headers = {} } = {}) => {
  // Ambil token dari localStorage secara dinamis setiap request
  const token = localStorage.getItem("eventhub_token");

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      // Sisipkan Authorization header jika token tersedia
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const text = await response.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { message: text || "Tidak ada respons dari server." };
    }

    if (!response.ok) {
      throw new Error(data?.message || `Server mengembalikan error ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.");
    }
    throw error;
  }
};

const api = {
  get: (endpoint, headers) => request(endpoint, { headers }),
  post: (endpoint, body, headers) => request(endpoint, { method: "POST", body, headers }),
  put: (endpoint, body, headers) => request(endpoint, { method: "PUT", body, headers }),
  patch: (endpoint, body, headers) => request(endpoint, { method: "PATCH", body, headers }),
  delete: (endpoint, headers) => request(endpoint, { method: "DELETE", headers }),
};

export default api;