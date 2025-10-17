class ApiService {
  constructor() {
    // Use path relativo quando no Docker
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Racks
  async getRacks() {
    return this.request('/racks');
  }

  async getRack(id) {
    return this.request(`/rack/${id}`);
  }

  exportRacksXLSX() {
    return `${this.baseURL}/racks/export/xlsx`;
  }

  // Objects
  async getObjects() {
    return this.request('/objects');
  }

  async getObject(id) {
    return this.request(`/object/${id}`);
  }

  async getObjectsByPerson(personName) {
    return this.request(`/objects/by_person/${encodeURIComponent(personName)}`);
  }

  exportObjectsXLSX() {
    return `${this.baseURL}/objects/export/xlsx`;
  }

  // Contacts
  async getContacts() {
    return this.request('/contacts');
  }

  exportContactsXLSX() {
    return `${this.baseURL}/contacts/export/xlsx`;
  }

  exportContactXLSX(contactName) {
    return `${this.baseURL}/contacts/${encodeURIComponent(contactName)}/export/xlsx`;
  }

  // Stats
  async getStats() {
    return this.request('/stats');
  }
}

// Singleton instance
export const apiService = new ApiService();
export default apiService;