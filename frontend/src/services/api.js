class ApiService {
  constructor() {
    // Use path relativo quando no Docker
    this.baseURL = process.env.REACT_APP_API_URL || 'http://juazeiro.cptec.inpe.br/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
   console.log('url: ', url); 
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
	console.log('HTTP: ', response); 
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      console.log('API Error: ', error); 
      throw error;
    }
  }

  // BUSCA GLOBAL - NOVO MÉTODO
  async searchGlobal(query) {
    return this.request(`/search/global?q=${encodeURIComponent(query)}`);
  }

  // Busca específica em equipamentos
  async searchEquipments(query, filters = {}) {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (filters.type_id) params.append('type_id', filters.type_id);
    if (filters.has_problems) params.append('has_problems', filters.has_problems);
    if (filters.rack_id) params.append('rack_id', filters.rack_id);
    
    return this.request(`/search/equipments?${params.toString()}`);
  }

  // Busca específica em racks
  async searchRacks(query, filters = {}) {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (filters.location_id) params.append('location_id', filters.location_id);
    
    return this.request(`/search/racks?${params.toString()}`);
  }

  // Racks
  async getRacks() {
    return this.request('/racks');
  }

  async getRack(id) {
    return this.request(`/rack/${id}`);
  }

  // Exportar lista de racks
  exportRacksXLSX() {
    return `${this.baseURL}/racks/export/xlsx`;
  }

   // Exportar equipamentos do rack
  exportRackXLSX(rackId) {
    return `${this.baseURL}/racks/${rackId}/export/xlsx`;
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

  // Exportar lista de equipamentos
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
