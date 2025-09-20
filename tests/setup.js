// Setup global para testes
jest.setTimeout(60000); // 60 segundos

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';

// Capturar erros não tratados para debug
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Aguardar entre testes para evitar conflitos
beforeEach(async () => {
  await new Promise(resolve => setTimeout(resolve, 50));
});

afterEach(async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
});