import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const { rows } = await sql`SELECT projeto_id, cliques FROM projetos;`;

    const cliquesMap = rows.reduce((acc, row) => {
      acc[row.projeto_id] = row.cliques;
      return acc;
    }, {});

    response.status(200).json(cliquesMap);

  } catch (error) {
    console.error('Erro ao buscar cliques do banco de dados:', error);
    response.status(500).json({ status: 'erro', mensagem: 'Erro interno do servidor.' });
  }
}