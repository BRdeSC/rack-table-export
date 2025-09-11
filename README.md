# Data Center Rack Management

Sistema para gerenciamento e visualização de racks e equipamentos em data centers, com funcionalidades de exportação de relatórios.

## 🏗️ Estrutura do Projeto
rack-table-filter/
├── app.py # API Flask backend
├── requirements.txt # Dependências Python
├── .gitignore # Arquivos ignorados pelo Git
├── README.md # Documentação do projeto
└── frontend/ # Aplicação React
├── public/
├── src/
├── package.json
└── ...arquivos React

text

## ✨ Funcionalidades

- 📊 Listagem de racks cadastrados
- 🔍 Visualização de equipamentos por rack
- 📄 Exportação de dados em PDF
- 📊 Exportação de dados em XLSX (Excel)
- 🖥️ Interface web responsiva

## 🚀 Tecnologias Utilizadas

### Backend
- **Python** com Flask
- **SQLAlchemy** (ou outro ORM, se aplicável)
- **OpenPyXL** ou **Pandas** para exportação XLSX
- **ReportLab** ou **WeasyPrint** para exportação PDF

### Frontend
- **React.js**
- **Axios** para consumo da API
- **Bootstrap** ou outro framework CSS

## 📦 Instalação e Configuração

### Pré-requisitos
- Python 3.8+
- Node.js 14+
- pip (gerenciador de pacotes Python)
- npm ou yarn (gerenciador de pacotes Node)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/rack-table-filter.git
cd rack-table-filter
2. Configure o Backend (Flask)
Crie e ative o ambiente virtual:
bash
# Linux/Mac
python -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
Instale as dependências Python:
bash
pip install -r requirements.txt
Execute a API:
bash
python app.py
A API estará disponível em: http://localhost:5000

3. Configure o Frontend (React)
Navegue para a pasta do frontend:
bash
cd frontend
Instale as dependências:
bash
npm install
# ou
yarn install
Execute a aplicação React:
bash
npm start
# ou
yarn start
O frontend estará disponível em: http://localhost:3000

🎯 Como Usar
Acesse a aplicação no navegador

Visualize os racks cadastrados

Clique em um rack para ver seus equipamentos

Use os botões de exportação para gerar relatórios:

📄 PDF para documentação impressa

📊 XLSX para análise de dados

🔌 API Endpoints
Método	Endpoint	Descrição
GET	/api/racks	Lista todos os racks
GET	/api/racks/<id>	Detalhes de um rack específico
GET	/api/racks/<id>/equipments	Equipamentos de um rack
GET	/api/export/pdf	Exporta dados em PDF
GET	/api/export/xlsx	Exporta dados em XLSX
🛠️ Desenvolvimento
Para adicionar novas dependências Python:
bash
pip install <pacote>
pip freeze > requirements.txt
Para adicionar novas dependências React:
bash
cd frontend
npm install <pacote>
📝 Licença
Este projeto está sob licença MIT. Veja o arquivo LICENSE para mais detalhes.

👥 Autores
Seu Nome

🤝 Contribuição
Contribuições são sempre bem-vindas! Por favor, leia as diretrizes de contribuição antes de enviar um pull request.

⚠️ Nota: Certifique-se de configurar corretamente as variáveis de ambiente e banco de dados antes de executar a aplicação em produção.
