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
```

## ✨ Funcionalidades

* 📊 **Listagem de racks cadastrados:** Visão geral rápida do Data Center.
* 🔍 **Visualização detalhada:** Mapeamento visual e listagem de equipamentos por rack (com tamanho em U).
* 📄 **Exportação em PDF:** Geração de Ficha Técnica completa pronta para impressão.
* 📊 **Exportação em XLSX:** Extração de dados tabulares para o Excel.
* 🖥️ **Interface Responsiva:** Navegação fluida e limpa.

## 🚀 Tecnologias Utilizadas

O projeto foi construído com as seguintes tecnologias:

**Backend (API)**
* **Python** com **Flask**
* Extração de dados avançada com consultas SQL
* Geração de relatórios com exportação nativa para **PDF** e **XLSX**

**Frontend (Interface)**
* **React.js**
* **Axios** para consumo da API REST
* Renderização dinâmica e responsiva com CSS personalizado

**Infraestrutura & DevOps**
* **Docker & Docker Compose** para padronização do ambiente e isolamento de dependências
* **Nginx** configurado para servir a aplicação React em produção

## 📦 Como rodar o projeto localmente

A aplicação foi 100% conteinerizada para garantir que o ambiente de desenvolvimento seja idêntico ao de produção, eliminando problemas de configuração de máquina.

**Pré-requisitos:**
* Ter o [Docker](https://www.docker.com/) e o Docker Compose instalados.

**Passo a passo:**

1. Clone o repositório:
```bash
git clone [https://github.com/BRdeSC/rack-table-export.git](https://github.com/BRdeSC/rack-table-export.git)
cd rack-table-export
```

2. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example` e preencha com as credenciais do seu banco de dados.

3. Suba os containers com o Docker:
```bash
docker compose up --build -d
```

A aplicação estará disponível instantaneamente nos seguintes endereços:
* **Frontend (Interface):** http://localhost:3000
* **Backend (API):** http://localhost:5000

## 🔌 API Endpoints

Abaixo estão as principais rotas consumidas pelo frontend:

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/racks` | Lista todos os racks |
| `GET` | `/api/racks/<id>` | Detalhes de um rack específico |
| `GET` | `/api/racks/<id>/equipments` | Retorna os equipamentos atrelados ao rack |
| `GET` | `/api/export/pdf` | Rota para exportação do relatório em PDF |
| `GET` | `/api/export/xlsx` | Rota para exportação da planilha em XLSX |

## 📝 Licença

Este projeto está sob licença MIT. 

## 👥 Autor

**Bruno de Souza Castro** Desenvolvedor Full Stack jr
