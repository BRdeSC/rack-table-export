# Data Center Rack Management

[Gravação de tela de 2026-04-06 11-12-35.webm](https://github.com/user-attachments/assets/09924af3-64dd-433d-80c4-1a1255be18da)

Sistema para gerenciamento e visualização de racks e equipamentos em data centers, com funcionalidades de exportação de relatórios.

## 🏗️ Estrutura do Projeto

A arquitetura foi desenhada separando claramente as responsabilidades de backend, frontend e infraestrutura:

```text
rack-table-export/
├── backend/                 # API desenvolvida em Flask
│   ├── src/                 # Código fonte da aplicação
│   │   ├── routes/          # Endpoints da API (racks.py, exports.py, etc.)
│   │   ├── utils/           # Lógicas de negócio (pdf_utils.py, database.py)
│   │   └── app.py           # Ponto de entrada da API
│   ├── Dockerfile           # Configuração do container Python
│   └── requirements.txt     # Dependências do backend
│
├── frontend/                # Interface desenvolvida em React
│   ├── public/              # Arquivos estáticos
│   ├── src/                 # Componentes e páginas React
│   ├── Dockerfile           # Configuração do container Node/React
│   ├── nginx.conf           # Servidor web para produção
│   └── package.json         # Dependências do frontend
│
├── docker-compose.yml       # Orquestração global dos containers
├── .env.example             # Template de variáveis de ambiente
└── README.md                # Documentação
✨ Funcionalidades📊 Listagem de racks cadastrados: Visão geral rápida do Data Center.🔍 Visualização detalhada: Mapeamento visual e listagem de equipamentos por rack (com tamanho em U).📄 Exportação em PDF: Geração de Ficha Técnica completa pronta para impressão.📊 Exportação em XLSX: Extração de dados tabulares para o Excel.🖥️ Interface Responsiva: Navegação fluida e limpa.🚀 Tecnologias UtilizadasO projeto foi construído com as seguintes tecnologias:Backend (API)Python com FlaskExtração de dados avançada com consultas SQLGeração de relatórios com exportação nativa para PDF e XLSXFrontend (Interface)React.jsAxios para consumo da API RESTRenderização dinâmica e responsiva com CSS personalizadoInfraestrutura & DevOpsDocker & Docker Compose para padronização do ambiente e isolamento de dependênciasNginx configurado para servir a aplicação React em produção📦 Como rodar o projeto localmenteA aplicação foi 100% conteinerizada para garantir que o ambiente de desenvolvimento seja idêntico ao de produção, eliminando problemas de configuração de máquina.Pré-requisitos:Ter o Docker e o Docker Compose instalados.Passo a passo:Clone o repositório:Bashgit clone [https://github.com/BRdeSC/rack-table-export.git](https://github.com/BRdeSC/rack-table-export.git)
cd rack-table-export
Configure as variáveis de ambiente:Crie um arquivo .env na raiz do projeto baseado no .env.example e preencha com as credenciais do seu banco de dados.Suba os containers com o Docker:Bashdocker compose up --build -d
A aplicação estará disponível instantaneamente nos seguintes endereços:Frontend (Interface): http://localhost:3000Backend (API): http://localhost:5000🔌 API EndpointsAbaixo estão as principais rotas consumidas pelo frontend:MétodoEndpointDescriçãoGET/api/racksLista todos os racksGET/api/racks/<id>Detalhes de um rack específicoGET/api/racks/<id>/equipmentsRetorna os equipamentos atrelados ao rackGET/api/export/pdfRota para exportação do relatório em PDFGET/api/export/xlsxRota para exportação da planilha em XLSX📝 LicençaEste projeto está sob licença MIT.👥 AutorBruno de Souza Castro Desenvolvedor Full Stack

🤝 Contribuição
Contribuições são sempre bem-vindas! Por favor, leia as diretrizes de contribuição antes de enviar um pull request.

⚠️ Nota: Certifique-se de configurar corretamente as variáveis de ambiente e banco de dados antes de executar a aplicação em produção.
