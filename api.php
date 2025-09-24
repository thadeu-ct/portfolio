<?php
header("Access-Control-Allow-Origin: *"); // Permite que qualquer origem acesse este recurso (CORS).
header("Content-Type: application/json; charset=UTF-8"); // Define o tipo de conteúdo como JSON.


if (isset($_GET['id'])) { 
    // 1. RECEBER O DADO DO JAVASCRIPT
    $projetoId = $_GET['id'];

    // 2. CONECTAR E ATUALIZAR O BANCO DE DADOS (PASSO FUTURO)
    // Por enquanto, esta parte ficará comentada.
    // Exemplo: $sql = "UPDATE projetos SET cliques = cliques + 1 WHERE id = ?";
    // ... código do banco de dados ...

    // 3. ENVIAR UMA RESPOSTA DE SUCESSO DE VOLTA
    $resposta = [
        'status' => 'sucesso',
        'mensagem' => 'Clique no projeto ' . $projetoId . ' foi recebido pelo servidor!',
        'id_recebido' => $projetoId
    ];

    echo json_encode($resposta); // Converte o array (resposta) em JSON e envia de volta para o JavaScript.

} else {
    // 0. SE NENHUM ID FOR FORNECIDO, ENVIA UMA MENSAGEM DE ERRO
    $resposta = [
        'status' => 'erro',
        'mensagem' => 'Nenhum ID de projeto foi fornecido.'
    ];
    echo json_encode($resposta); // Converte o array (erro) em JSON e envia de volta para o JavaScript.
}
?>