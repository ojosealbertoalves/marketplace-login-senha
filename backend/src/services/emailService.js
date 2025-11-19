import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Função para enviar email de recuperação de senha
export const sendPasswordResetEmail = async (email, resetCode, userName) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: 'Código de Recuperação de Senha',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .code-box {
              background-color: #f0f0f0;
              padding: 20px;
              text-align: center;
              border-radius: 5px;
              margin: 20px 0;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #007bff;
              letter-spacing: 5px;
            }
            .warning {
              color: #666;
              font-size: 14px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h2>Recuperação de Senha</h2>
              <p>Olá${userName ? `, ${userName}` : ''}!</p>
              <p>Você solicitou a recuperação de senha da sua conta.</p>
              <p>Use o código abaixo para redefinir sua senha:</p>
              
              <div class="code-box">
                <div class="code">${resetCode}</div>
              </div>
              
              <p class="warning">
                ⚠️ Este código expira em <strong>30 minutos</strong>.<br>
                Se você não solicitou esta recuperação, ignore este email.
              </p>
            </div>
            
            <div class="footer">
              <p>Este é um email automático, não responda.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Erro ao enviar email:', error);
      throw error;
    }

    console.log('✅ Email enviado:', data.id);
    return { success: true, messageId: data.id };

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    throw error;
  }
};

export default {
  sendPasswordResetEmail
};