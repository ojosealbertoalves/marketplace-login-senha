// frontend/src/pages/LGPD.jsx
import React from 'react';
import './PaginasLegais.css';

const LGPD = () => {
  return (
    <div className="pagina-legal">
      <div className="container">
        <h1 className="page-title">Lei Geral de Proteção de Dados (LGPD)</h1>
        <p className="ultima-atualizacao">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="conteudo-legal">
          <section>
            <h2>Nosso Compromisso com a LGPD</h2>
            <p>
              O ConstruGO está comprometido em proteger a privacidade e os dados pessoais de 
              todos os usuários, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
            </p>
            <p>
              Esta página explica como cumprimos nossas obrigações legais e como você pode 
              exercer seus direitos como titular de dados pessoais.
            </p>
          </section>

          <section>
            <h2>1. Definições Importantes</h2>
            <div className="definicoes">
              <div className="definicao-item">
                <strong>Dado Pessoal:</strong>
                <p>Informação relacionada a pessoa natural identificada ou identificável.</p>
              </div>
              <div className="definicao-item">
                <strong>Titular:</strong>
                <p>Pessoa natural a quem se referem os dados pessoais que são objeto de tratamento.</p>
              </div>
              <div className="definicao-item">
                <strong>Tratamento:</strong>
                <p>Toda operação realizada com dados pessoais (coleta, produção, recepção, classificação, 
                utilização, acesso, reprodução, transmissão, distribuição, processamento, arquivamento, 
                armazenamento, eliminação, etc.).</p>
              </div>
              <div className="definicao-item">
                <strong>Controlador:</strong>
                <p>ConstruGO - responsável pelas decisões sobre o tratamento de dados pessoais.</p>
              </div>
            </div>
          </section>

          <section>
            <h2>2. Seus Direitos como Titular de Dados</h2>
            <p>
              A LGPD garante aos titulares de dados pessoais diversos direitos. No ConstruGO, 
              você pode exercer os seguintes direitos:
            </p>

            <div className="direitos-lista">
              <div className="direito-item">
                <h3>📋 Confirmação e Acesso</h3>
                <p>Confirmar a existência de tratamento e acessar seus dados pessoais.</p>
              </div>

              <div className="direito-item">
                <h3>✏️ Correção</h3>
                <p>Solicitar a correção de dados incompletos, inexatos ou desatualizados.</p>
              </div>

              <div className="direito-item">
                <h3>🔒 Anonimização, Bloqueio ou Eliminação</h3>
                <p>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários, 
                excessivos ou tratados em desconformidade com a lei.</p>
              </div>

              <div className="direito-item">
                <h3>📤 Portabilidade</h3>
                <p>Solicitar a portabilidade de seus dados a outro fornecedor de serviço, 
                mediante requisição expressa.</p>
              </div>

              <div className="direito-item">
                <h3>🗑️ Eliminação</h3>
                <p>Solicitar a eliminação dos dados pessoais tratados com seu consentimento.</p>
              </div>

              <div className="direito-item">
                <h3>ℹ️ Informação sobre Compartilhamento</h3>
                <p>Obter informação sobre as entidades públicas e privadas com as quais 
                compartilhamos seus dados.</p>
              </div>

              <div className="direito-item">
                <h3>🚫 Revogação do Consentimento</h3>
                <p>Revogar o consentimento para tratamento de dados, quando aplicável.</p>
              </div>

              <div className="direito-item">
                <h3>⚖️ Oposição</h3>
                <p>Opor-se ao tratamento realizado com base em uma das hipóteses de dispensa 
                de consentimento, em caso de descumprimento à lei.</p>
              </div>
            </div>
          </section>

          <section>
            <h2>3. Bases Legais para Tratamento de Dados</h2>
            <p>Tratamos seus dados pessoais com base nas seguintes bases legais previstas na LGPD:</p>
            <ul>
              <li><strong>Consentimento:</strong> quando você nos autoriza expressamente</li>
              <li><strong>Execução de contrato:</strong> necessário para prestação de nossos serviços</li>
              <li><strong>Legítimo interesse:</strong> para melhorar nossos serviços e segurança</li>
              <li><strong>Proteção ao crédito:</strong> quando aplicável</li>
              <li><strong>Cumprimento de obrigação legal:</strong> exigido por lei</li>
            </ul>
          </section>

          <section>
            <h2>4. Como Exercer seus Direitos</h2>
            <p>
              Para exercer qualquer um dos direitos listados acima, você pode entrar em 
              contato conosco através dos seguintes canais:
            </p>
            <div className="contato-lgpd">
              <p><strong>E-mail:</strong> <a href="mailto:orcamentochat@gmail.com">orcamentochat@gmail.com</a></p>
              <p><strong>Assunto:</strong> "Exercício de Direitos LGPD"</p>
            </div>
            <p>
              Ao entrar em contato, por favor forneça:
            </p>
            <ul>
              <li>Seu nome completo e e-mail cadastrado</li>
              <li>Descrição clara do direito que deseja exercer</li>
              <li>Informações adicionais que possam ajudar na identificação</li>
            </ul>
            <p>
              <strong>Prazo de resposta:</strong> Responderemos sua solicitação em até 15 dias 
              corridos, podendo ser prorrogado por mais 15 dias mediante justificativa.
            </p>
          </section>

          <section>
            <h2>5. Segurança dos Dados</h2>
            <p>
              Implementamos medidas técnicas e organizacionais apropriadas para proteger seus 
              dados pessoais contra:
            </p>
            <ul>
              <li>Acesso não autorizado</li>
              <li>Situações acidentais ou ilícitas de destruição</li>
              <li>Perda, alteração, comunicação ou difusão</li>
            </ul>
            <p>
              Nossas medidas incluem, mas não se limitam a:
            </p>
            <ul>
              <li>Criptografia de dados sensíveis</li>
              <li>Controle de acesso restrito</li>
              <li>Monitoramento de segurança</li>
              <li>Backup regular de dados</li>
              <li>Treinamento de equipe sobre proteção de dados</li>
            </ul>
          </section>

          <section>
            <h2>6. Incidentes de Segurança</h2>
            <p>
              Em caso de incidente de segurança que possa acarretar risco ou dano relevante 
              aos titulares, nos comprometemos a:
            </p>
            <ul>
              <li>Comunicar o ocorrido à Autoridade Nacional de Proteção de Dados (ANPD)</li>
              <li>Notificar os titulares afetados em prazo adequado</li>
              <li>Informar as medidas técnicas e de segurança utilizadas para proteção</li>
              <li>Descrever os riscos relacionados ao incidente</li>
              <li>Apresentar as medidas que serão adotadas para reverter ou mitigar os efeitos</li>
            </ul>
          </section>

          <section>
            <h2>7. Retenção de Dados</h2>
            <p>
              Mantemos seus dados pessoais somente pelo tempo necessário para:
            </p>
            <ul>
              <li>Cumprir as finalidades para as quais foram coletados</li>
              <li>Atender requisitos legais, contratuais ou regulatórios</li>
              <li>Resolver disputas e fazer cumprir nossos acordos</li>
            </ul>
            <p>
              Após esse período, seus dados serão:
            </p>
            <ul>
              <li>Eliminados de forma segura, ou</li>
              <li>Anonimizados, de modo que não possam mais ser associados a você</li>
            </ul>
          </section>

          <section>
            <h2>8. Transferência Internacional de Dados</h2>
            <p>
              Caso seja necessário transferir seus dados para outros países, garantimos que:
            </p>
            <ul>
              <li>A transferência será realizada apenas para países com nível adequado de proteção</li>
              <li>Serão adotadas garantias específicas de proteção, como cláusulas contratuais padrão</li>
              <li>Você será informado sobre a transferência quando necessário</li>
            </ul>
          </section>

          <section>
            <h2>9. Encarregado de Proteção de Dados (DPO)</h2>
            <p>
              Designamos um encarregado de proteção de dados (Data Protection Officer - DPO) 
              para atuar como canal de comunicação entre o ConstruGO, os titulares de dados 
              e a ANPD.
            </p>
            <p>
              <strong>Contato do DPO:</strong><br />
              E-mail: <a href="mailto:orcamentochat@gmail.com">orcamentochat@gmail.com</a><br />
              Assunto: "DPO - Proteção de Dados"
            </p>
          </section>

          <section>
            <h2>10. Reclamações à ANPD</h2>
            <p>
              Sem prejuízo de qualquer outra via de recurso administrativo ou judicial, 
              você tem o direito de apresentar reclamação à Autoridade Nacional de Proteção 
              de Dados (ANPD) caso considere que o tratamento de seus dados viola a LGPD.
            </p>
            <p>
              <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong><br />
              Website: <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">www.gov.br/anpd</a>
            </p>
          </section>

          <section>
            <h2>11. Atualizações desta Página</h2>
            <p>
              Esta página pode ser atualizada periodicamente para refletir mudanças em nossas 
              práticas de proteção de dados ou alterações na legislação.
            </p>
            <p>
              Recomendamos que você revise esta página regularmente para se manter informado.
            </p>
          </section>

          <section>
            <h2>12. Mais Informações</h2>
            <p>
              Para mais detalhes sobre como tratamos seus dados pessoais, consulte também:
            </p>
            <ul>
              <li><a href="/privacidade">Política de Privacidade</a></li>
              <li><a href="/termos">Termos de Uso</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LGPD;