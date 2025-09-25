export default function handler(request, response) {
  // Pega o parâmetro 'id' da URL (ex: /api/clique?id=pacman)
  const { id } = request.query;

  if (id) {
    // --- PASSO FUTURO: A LÓGICA DO BANCO DE DADOS ENTRARÁ AQUI ---
    // Por enquanto, apenas confirmamos o recebimento.
    
    // Envia uma resposta de sucesso em formato JSON
    response.status(200).json({
      status: 'sucesso',
      mensagem: `Clique no projeto ${id} foi recebido pela API da Vercel!`,
    });
  } else {
    // Se nenhum 'id' foi enviado, retorna um erro.
    response.status(400).json({
      status: 'erro',
      mensagem: 'Nenhum ID de projeto foi fornecido.',
    });
  }
}