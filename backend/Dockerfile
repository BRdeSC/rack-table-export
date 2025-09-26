# # Use uma imagem base do Python
# FROM python:3.10-slim

# # Instale as dependências de compilação necessárias para o mysqlclient
# RUN apt-get update && apt-get install -y default-libmysqlclient-dev pkg-config build-essential && rm -rf /var/lib/apt/lists/*

# # Defina o diretório de trabalho dentro do container
# WORKDIR /app

# # Copie o arquivo de dependências e instale-as
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# # Copie o restante do código da aplicação
# COPY . .

# # Expõe a porta que sua aplicação Flask usa
# EXPOSE 5000

# # Comando para iniciar o servidor Flask
# CMD ["python", "app.py"]


# Use uma imagem base do Python
FROM python:3.10-slim

# Instale as dependências de compilação necessárias para o mysqlclient
RUN apt-get update && apt-get install -y default-libmysqlclient-dev pkg-config build-essential && rm -rf /var/lib/apt/lists/*

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie o arquivo de dependências e instale-as
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie o restante do código da aplicação
COPY . .

# Expõe a porta que sua aplicação Flask usa
EXPOSE 5000

# Comando para iniciar o servidor Flask
CMD ["python", "app.py"]