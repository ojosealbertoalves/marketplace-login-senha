// frontend/src/pages/Privacidade.jsx
import React from 'react';
import './PaginasLegais.css';

const Privacidade = () => {
  return (
    <div className="pagina-legal">
      <div className="container">
        <h1 className="page-title">Política de Privacidade</h1>
        <p className="ultima-atualizacao">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="conteudo-legal">
          <section>
            <h2>1. Introdução</h2>
            <p>
              A sua privacidade é importante para nós. Esta Política de Privacidade explica como 
              o ConstruGO coleta, usa, compartilha e protege suas informações pessoais quando você 
              utiliza nossa plataforma.
            </p>
            <p>
              Ao usar o ConstruGO, você concorda com a coleta e uso de informações de acordo 
              com esta política.
            </p>
          </section>

          <section>
            <h2>2. Informações que Coletamos</h2>
            
            <h3>2.1 Informações Fornecidas por Você</h3>
            <p>Coletamos informações que você nos fornece diretamente, incluindo:</p>
            <ul>
              <li><strong>Dados de Cadastro:</strong> nome, e-mail, telefone, endereço</li>
              <li><strong>Dados Profissionais:</strong> especialidade, experiência, descrição de serviços</li>
              <li><strong>Documentos:</strong> fotos de perfil, portfólio, certificados (quando aplicável)</li>
              <li><strong>Informações de Contato:</strong> números de telefone, WhatsApp, redes sociais</li>
              <li><strong>Conteúdo:</strong> avaliações, comentários, mensagens</li>
            </ul>

            <h3>2.2 Informações Coletadas Automaticamente</h3>
            <p>Quando você usa nossa plataforma, coletamos automaticamente:</p>
            <ul>
              <li><strong>Dados de Uso:</strong> páginas visitadas, tempo de permanência, cliques</li>
              <li><strong>Dados do Dispositivo:</strong> tipo de dispositivo, sistema operacional, navegador</li>
              <li><strong>Dados de Localização:</strong> endereço IP, localização geográfica aproximada</li>
              <li><strong>Cookies:</strong> identificadores únicos, preferências do usuário</li>
            </ul>
          </section>

          <section>
            <h2>3. Como Usamos suas Informações</h2>
            <p>Utilizamos suas informações para:</p>
            <ul>
              <li>Fornecer, operar e manter nossa plataforma</li>
              <li>Criar e gerenciar sua conta de usuário</li>
              <li>Processar suas solicitações e transações</li>
              <li>Conectar profissionais e clientes</li>
              <li>Enviar notificações importantes sobre a plataforma</li>
              <li>Responder a suas perguntas e fornecer suporte</li>
              <li>Melhorar e personalizar sua experiência</li>
              <li>Realizar análises e pesquisas sobre o uso da plataforma</li>
              <li>Detectar, prevenir e resolver problemas técnicos ou de segurança</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>
          </section>

          <section>
            <h2>4. Compartilhamento de Informações</h2>
            
            <h3>4.1 Informações Públicas</h3>
            <p>
              Algumas informações são exibidas publicamente na plataforma, incluindo:
            </p>
            <ul>
              <li>Nome e foto de perfil dos profissionais</li>
              <li>Especialidades e descrição de serviços</li>
              <li>Informações de contato (conforme autorizado pelo profissional)</li>
              <li>Avaliações e comentários</li>
              <li>Localização (cidade/região)</li>
            </ul>

            <h3>4.2 Compartilhamento com Terceiros</h3>
            <p>Podemos compartilhar suas informações com:</p>
            <ul>
              <li><strong>Prestadores de Serviços:</strong> empresas que nos auxiliam na operação da plataforma 
              (hospedagem, analytics, suporte técnico)</li>
              <li><strong>Parceiros de Negócios:</strong> quando necessário para fornecer serviços solicitados</li>
              <li><strong>Autoridades Legais:</strong> quando exigido por lei ou para proteger direitos</li>
            </ul>

            <h3>4.3 Não Vendemos suas Informações</h3>
            <p>
              O ConstruGO não vende, aluga ou comercializa suas informações pessoais para terceiros.
            </p>
          </section>

          <section>
            <h2>5. Cookies e Tecnologias Semelhantes</h2>
            <p>
              Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência, 
              analisar o uso da plataforma e personalizar conteúdo.
            </p>
            <p>
              Você pode controlar o uso de cookies através das configurações do seu navegador, 
              mas isso pode afetar algumas funcionalidades da plataforma.
            </p>
          </section>

          <section>
            <h2>6. Segurança das Informações</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas 
              informações contra acesso não autorizado, alteração, divulgação ou destruição.
            </p>
            <p>
              Apesar de nossos esforços, nenhum método de transmissão pela internet ou 
              armazenamento eletrônico é 100% seguro. Não podemos garantir segurança absoluta.
            </p>
          </section>

          <section>
            <h2>7. Retenção de Dados</h2>
            <p>
              Manteremos suas informações pessoais pelo tempo necessário para cumprir os 
              propósitos descritos nesta política, a menos que um período de retenção mais 
              longo seja exigido ou permitido por lei.
            </p>
            <p>
              Quando suas informações não forem mais necessárias, iremos deletá-las ou 
              anonimizá-las de forma segura.
            </p>
          </section>

          <section>
            <h2>8. Seus Direitos (LGPD)</h2>
            <p>
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
            </p>
            <ul>
              <li><strong>Acesso:</strong> confirmar se tratamos seus dados e acessá-los</li>
              <li><strong>Correção:</strong> corrigir dados incompletos, inexatos ou desatualizados</li>
              <li><strong>Anonimização, bloqueio ou eliminação:</strong> de dados desnecessários</li>
              <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado</li>
              <li><strong>Informação:</strong> sobre entidades com as quais compartilhamos dados</li>
              <li><strong>Revogação do consentimento:</strong> quando aplicável</li>
              <li><strong>Oposição:</strong> ao tratamento de dados em certas situações</li>
            </ul>
            <p>
              Para exercer seus direitos, entre em contato através do e-mail: 
              <a href="mailto:orcamentochat@gmail.com">orcamentochat@gmail.com</a>
            </p>
          </section>

          <section>
            <h2>9. Transferência Internacional de Dados</h2>
            <p>
              Suas informações podem ser transferidas e mantidas em servidores localizados 
              fora do seu estado, província, país ou outra jurisdição governamental onde 
              as leis de proteção de dados podem diferir.
            </p>
            <p>
              Ao usar nossa plataforma, você consente com essa transferência.
            </p>
          </section>

          <section>
            <h2>10. Privacidade de Menores</h2>
            <p>
              Nossa plataforma não é direcionada a menores de 18 anos. Não coletamos 
              intencionalmente informações pessoais de menores.
            </p>
            <p>
              Se tomarmos conhecimento de que coletamos dados de um menor sem verificação 
              do consentimento parental, tomaremos medidas para remover essas informações.
            </p>
          </section>

          <section>
            <h2>11. Links para Outros Sites</h2>
            <p>
              Nossa plataforma pode conter links para sites de terceiros. Não somos responsáveis 
              pelas práticas de privacidade desses sites. Recomendamos ler as políticas de 
              privacidade de cada site que você visita.
            </p>
          </section>

          <section>
            <h2>12. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você 
              sobre alterações significativas publicando a nova política na plataforma e 
              atualizando a data de "Última atualização".
            </p>
            <p>
              Recomendamos revisar esta política regularmente para se manter informado.
            </p>
          </section>

          <section>
            <h2>13. Contato</h2>
            <p>
              Se você tiver dúvidas sobre esta Política de Privacidade ou sobre o tratamento 
              de seus dados pessoais, entre em contato conosco:
            </p>
            <p>
              <strong>E-mail:</strong> <a href="mailto:orcamentochat@gmail.com">orcamentochat@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacidade;