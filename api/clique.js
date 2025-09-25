// Arquivo: /api/clique.js

export default function handler(request, response) {
  // Adiciona os cabeçalhos CORS para permitir o acesso
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responde com sucesso a requisições de verificação (OPTIONS)
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const { id } = request.query;

  if (id) {
    // --- LÓGICA DO BANCO DE DADOS VIRÁ AQUI ---
    response.status(200).json({
      status: 'sucesso',
      mensagem: `Clique no projeto ${id} foi recebido pela API da Vercel!`,
    });
  } else {
    response.status(400).json({
      status: 'erro',
      mensagem: 'Nenhum ID de projeto foi fornecido.',
    });
  }
}