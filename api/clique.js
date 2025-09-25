import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  // Adiciona os cabeçalhos CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const { id } = request.query;

  if (id) {
    try {
      await sql`
        INSERT INTO projetos (projeto_id, cliques) 
        VALUES (${id}, 1)
        ON CONFLICT (projeto_id) DO UPDATE 
        SET cliques = projetos.cliques + 1;
      `;

      response.status(200).json({
        status: 'sucesso',
        mensagem: `Clique no projeto ${id} foi recebido e registrado no banco de dados!`,
      });
    } catch (error) {
      console.error('Erro ao conectar ou atualizar o banco de dados:', error);
      response.status(500).json({
        status: 'erro',
        mensagem: 'Erro interno do servidor ao processar o clique.'
      });
    }
  } else {
    response.status(400).json({
      status: 'erro',
      mensagem: 'Nenhum ID de projeto foi fornecido.',
    });
  }
}