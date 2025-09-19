# Sistema de Lançamento de Despesas

Sistema completo para gerenciamento de despesas com categorias, estabelecimentos e lançamentos. Desenvolvido com Node.js, Express e SQLite, oferece uma API REST completa e interface web responsiva.

## 🚀 Início Rápido

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Instalação e Execução

1. **Clone o repositório e instale as dependências:**
```bash
git clone <repository-url>
cd expense-tracker
npm install
```

2. **Configure o banco de dados:**
```bash
npm run setup
```

3. **Inicie o servidor:**
```bash
npm start
```

4. **Acesse a aplicação:**
- Interface Web: http://localhost:3000
- API: http://localhost:3000/api

## 📁 Estrutura do Projeto

```
expense-tracker/
├── src/
│   ├── models/           # Modelos de dados e validações
│   ├── repositories/     # Camada de acesso a dados (Repository Pattern)
│   ├── services/         # Lógica de negócio
│   ├── controllers/      # Controladores da API REST
│   ├── routes/           # Definição das rotas
│   ├── database/         # Configuração, migrations e seeds
│   └── app.js           # Configuração principal da aplicação
├── public/               # Interface web (HTML, CSS, JS)
├── tests/                # Testes automatizados (unitários, integração, e2e)
├── data/                 # Banco de dados SQLite
├── server.js            # Ponto de entrada principal
└── package.json
```

## 🛠 Scripts Disponíveis

### Desenvolvimento
- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento (com nodemon)

### Banco de Dados
- `npm run migrate` - Executa as migrations do banco de dados
- `npm run seed` - Popula o banco com dados de exemplo
- `npm run seed:force` - Força a inserção de dados (sobrescreve existentes)
- `npm run setup` - Executa migrations + seed (configuração inicial)
- `npm run reset` - Reseta o banco com dados frescos

### Testes
- `npm test` - Executa todos os testes
- `npm run test:watch` - Executa os testes em modo watch
- `npm run test:coverage` - Executa testes com relatório de cobertura

## 🏗 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite3** - Banco de dados
- **Helmet** - Segurança HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - Logging de requisições

### Frontend
- **HTML5** - Estrutura das páginas
- **CSS3** - Estilização responsiva
- **JavaScript (ES6+)** - Interatividade e comunicação com API

### Testes
- **Jest** - Framework de testes
- **Supertest** - Testes de API HTTP

### Desenvolvimento
- **Nodemon** - Auto-restart do servidor

## 📊 Modelo de Dados

### Categoria
- **Código** (string, PK) - Identificador único da categoria
- **Descrição** (string) - Nome descritivo da categoria
- **Timestamps** - Data de criação e atualização

### Estabelecimento
- **Código** (string, PK) - Identificador único do estabelecimento
- **Nome** (string) - Nome do estabelecimento
- **Endereço** (string) - Endereço completo
- **Telefone** (string) - Número de telefone
- **Timestamps** - Data de criação e atualização

### Lançamento de Despesa
- **ID** (integer, PK, auto-increment) - Identificador único
- **Data de Lançamento** (date) - Data em que a despesa foi registrada
- **Data de Pagamento** (date) - Data em que a despesa foi paga
- **Valor** (decimal) - Valor da despesa
- **Código da Categoria** (string, FK) - Referência à categoria
- **Código do Estabelecimento** (string, FK) - Referência ao estabelecimento
- **Timestamps** - Data de criação e atualização

### Relacionamentos
- **Categoria** 1:N **Lançamento** (Uma categoria pode ter muitos lançamentos)
- **Estabelecimento** 1:N **Lançamento** (Um estabelecimento pode ter muitos lançamentos)

## 🔌 API REST

### Informações Gerais
- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`
- **Códigos de Status**: 200 (OK), 201 (Created), 400 (Bad Request), 404 (Not Found), 409 (Conflict), 500 (Internal Server Error)

### Endpoints - Categorias
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/categorias` | Lista todas as categorias |
| `GET` | `/api/categorias/:codigo` | Obtém uma categoria específica |
| `POST` | `/api/categorias` | Cria uma nova categoria |
| `PUT` | `/api/categorias/:codigo` | Atualiza uma categoria |
| `DELETE` | `/api/categorias/:codigo` | Exclui uma categoria |

### Endpoints - Estabelecimentos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/estabelecimentos` | Lista todos os estabelecimentos |
| `GET` | `/api/estabelecimentos/:codigo` | Obtém um estabelecimento específico |
| `POST` | `/api/estabelecimentos` | Cria um novo estabelecimento |
| `PUT` | `/api/estabelecimentos/:codigo` | Atualiza um estabelecimento |
| `DELETE` | `/api/estabelecimentos/:codigo` | Exclui um estabelecimento |

### Endpoints - Lançamentos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/lancamentos` | Lista todos os lançamentos |
| `GET` | `/api/lancamentos/:id` | Obtém um lançamento específico |
| `POST` | `/api/lancamentos` | Cria um novo lançamento |
| `PUT` | `/api/lancamentos/:id` | Atualiza um lançamento |
| `DELETE` | `/api/lancamentos/:id` | Exclui um lançamento |

### Exemplos de Uso da API

#### Criar uma categoria
```bash
curl -X POST http://localhost:3000/api/categorias \
  -H "Content-Type: application/json" \
  -d '{"codigo": "ALIMENTACAO", "descricao": "Alimentação e Bebidas"}'
```

#### Criar um estabelecimento
```bash
curl -X POST http://localhost:3000/api/estabelecimentos \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "SUPERMERCADO_ABC",
    "nome": "Supermercado ABC",
    "endereco": "Rua das Flores, 123",
    "telefone": "(11) 1234-5678"
  }'
```

#### Criar um lançamento
```bash
curl -X POST http://localhost:3000/api/lancamentos \
  -H "Content-Type: application/json" \
  -d '{
    "dataLancamento": "2024-01-15",
    "dataPagamento": "2024-01-15",
    "valor": 85.50,
    "codigoCategoria": "ALIMENTACAO",
    "codigoEstabelecimento": "SUPERMERCADO_ABC"
  }'
```

## 🌐 Interface Web

A aplicação inclui uma interface web completa e responsiva:

- **Página Principal** (`/`) - Dashboard com navegação
- **Categorias** (`/categorias.html`) - Gerenciamento de categorias
- **Estabelecimentos** (`/estabelecimentos.html`) - Gerenciamento de estabelecimentos
- **Lançamentos** (`/lancamentos.html`) - Gerenciamento de lançamentos

### Funcionalidades da Interface
- ✅ Operações CRUD completas para todas as entidades
- ✅ Validação de formulários em tempo real
- ✅ Confirmação para operações de exclusão
- ✅ Tratamento de erros com mensagens amigáveis
- ✅ Design responsivo para dispositivos móveis
- ✅ Navegação intuitiva entre seções

## 🧪 Testes

O projeto inclui uma suíte completa de testes:

### Tipos de Teste
- **Unitários** - Modelos, serviços e repositórios
- **Integração** - Controladores e rotas da API
- **End-to-End** - Fluxos completos da aplicação

### Executar Testes
```bash
# Todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Testes com cobertura
npm run test:coverage
```

### Cobertura de Testes
O projeto mantém alta cobertura de testes em:
- Modelos de dados e validações
- Lógica de negócio nos serviços
- Endpoints da API
- Integridade referencial
- Tratamento de erros

## 🔒 Validações e Integridade

### Validações Implementadas
- **Campos obrigatórios** - Todos os campos necessários são validados
- **Tipos de dados** - Validação de tipos (string, number, date)
- **Valores únicos** - Códigos de categoria e estabelecimento são únicos
- **Valores positivos** - Valores monetários devem ser positivos
- **Datas válidas** - Validação de formato e valores de data

### Integridade Referencial
- **Exclusão protegida** - Categorias e estabelecimentos com lançamentos não podem ser excluídos
- **Referências válidas** - Lançamentos só podem referenciar categorias e estabelecimentos existentes
- **Transações** - Operações críticas são executadas em transações

## 🚀 Deploy e Produção

### Variáveis de Ambiente
```bash
NODE_ENV=production          # Ambiente de execução
PORT=3000                   # Porta do servidor
CORS_ORIGIN=*              # Origens permitidas para CORS
```

### Configuração para Produção
1. Configure as variáveis de ambiente
2. Execute `npm run setup` para inicializar o banco
3. Execute `npm start` para iniciar o servidor

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação da API em `/api`
- Verifique os logs do servidor para debugging
