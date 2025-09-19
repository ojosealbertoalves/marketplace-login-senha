// src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro capturado:', err.stack);
  
  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'JSON inválido',
      message: 'Verifique a sintaxe do JSON enviado'
    });
  }
  
  // Erro de arquivo não encontrado
  if (err.code === 'ENOENT') {
    return res.status(404).json({
      success: false,
      error: 'Arquivo não encontrado',
      message: 'O recurso solicitado não foi encontrado'
    });
  }
  
  // Erro de validação personalizado
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Erro de validação',
      message: err.message,
      details: err.details || null
    });
  }
  
  // Erro genérico do servidor
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack 
    })
  });
};

export default errorHandler;