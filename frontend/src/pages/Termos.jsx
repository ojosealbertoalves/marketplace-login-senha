// frontend/src/pages/Termos.jsx
import React from 'react';
import './PaginasLegais.css';

const Termos = () => {
  return (
    <div className="pagina-legal">
      <div className="container">
        <h1 className="page-title">Termos de Uso</h1>
        <p className="ultima-atualizacao">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="conteudo-legal">
          <section>
            <h2>1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o ConstruGO, você concorda em cumprir e estar vinculado aos seguintes 
              termos e condições de uso. Se você não concordar com qualquer parte destes termos, 
              não deverá usar nossa plataforma.
            </p>
          </section>

          <section>
            <h2>2. Descrição do Serviço</h2>
            <p>
              O ConstruGO é uma plataforma online que conecta profissionais da construção civil 
              com clientes em potencial no estado de Goiás. Funcionamos como um catálogo de 
              profissionais, facilitando o contato entre as partes.
            </p>
            <p>
              <strong>Importante:</strong> O ConstruGO não se responsabiliza pela qualidade dos 
              serviços prestados, negociações ou contratos firmados entre profissionais e clientes.
            </p>
          </section>

          <section>
            <h2>3. Cadastro e Conta de Usuário</h2>
            <h3>3.1 Responsabilidades do Usuário</h3>
            <ul>
              <li>Fornecer informações verdadeiras, precisas e atualizadas</li>
              <li>Manter a confidencialidade de suas credenciais de acesso</li>
              <li>Notificar imediatamente sobre qualquer uso não autorizado de sua conta</li>
              <li>Ser responsável por todas as atividades realizadas em sua conta</li>
            </ul>

            <h3>3.2 Cadastro de Profissionais</h3>
            <p>
              Profissionais que se cadastram na plataforma declaram ser capazes civilmente, 
              possuir qualificação técnica para os serviços oferecidos e estar em conformidade 
              com todas as leis aplicáveis.
            </p>
          </section>

          <section>
            <h2>4. Uso Aceitável da Plataforma</h2>
            <p>Ao usar o ConstruGO, você concorda em NÃO:</p>
            <ul>
              <li>Publicar informações falsas, enganosas ou fraudulentas</li>
              <li>Violar direitos de propriedade intelectual de terceiros</li>
              <li>Usar a plataforma para fins ilegais ou não autorizados</li>
              <li>Tentar obter acesso não autorizado a sistemas ou dados</li>
              <li>Enviar spam, malware ou qualquer conteúdo prejudicial</li>
              <li>Assediar, ameaçar ou prejudicar outros usuários</li>
              <li>Coletar dados de outros usuários sem autorização</li>
            </ul>
          </section>

          <section>
            <h2>5. Conteúdo do Usuário</h2>
            <p>
              Você mantém todos os direitos sobre o conteúdo que publica na plataforma, mas 
              concede ao ConstruGO uma licença não exclusiva, mundial e gratuita para usar, 
              reproduzir e exibir esse conteúdo no contexto da prestação dos serviços.
            </p>
            <p>
              O ConstruGO se reserva o direito de remover qualquer conteúdo que viole estes 
              termos ou seja considerado inadequado.
            </p>
          </section>

          <section>
            <h2>6. Relacionamento entre Profissionais e Clientes</h2>
            <p>
              O ConstruGO atua apenas como intermediário, facilitando o contato entre 
              profissionais e clientes. Não somos parte em qualquer acordo, contrato ou 
              transação realizada entre os usuários.
            </p>
            <h3>6.1 Isenção de Responsabilidade</h3>
            <p>O ConstruGO não se responsabiliza por:</p>
            <ul>
              <li>Qualidade dos serviços prestados pelos profissionais</li>
              <li>Cumprimento de prazos ou acordos entre as partes</li>
              <li>Pagamentos, cobranças ou questões financeiras</li>
              <li>Danos materiais ou pessoais resultantes dos serviços</li>
              <li>Disputas entre profissionais e clientes</li>
            </ul>
          </section>

          <section>
            <h2>7. Avaliações e Comentários</h2>
            <p>
              Usuários podem avaliar e comentar sobre profissionais. As avaliações devem ser 
              honestas, baseadas em experiências reais e respeitar as diretrizes da plataforma.
            </p>
            <p>
              Avaliações falsas, difamatórias ou que violem estes termos podem ser removidas, 
              e o usuário pode ter sua conta suspensa.
            </p>
          </section>

          <section>
            <h2>8. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo da plataforma ConstruGO, incluindo design, logotipos, textos, 
              gráficos e código, é propriedade do ConstruGO ou de seus licenciadores e está 
              protegido por leis de propriedade intelectual.
            </p>
          </section>

          <section>
            <h2>9. Limitação de Responsabilidade</h2>
            <p>
              O ConstruGO é fornecido "como está" e "conforme disponível". Não garantimos que 
              a plataforma será ininterrupta, segura ou livre de erros.
            </p>
            <p>
              Em nenhuma circunstância o ConstruGO será responsável por danos diretos, indiretos, 
              incidentais, especiais ou consequenciais resultantes do uso ou incapacidade de usar 
              a plataforma.
            </p>
          </section>

          <section>
            <h2>10. Modificações dos Termos</h2>
            <p>
              Reservamos o direito de modificar estes termos a qualquer momento. Alterações 
              significativas serão notificadas aos usuários através da plataforma ou por e-mail.
            </p>
            <p>
              O uso continuado da plataforma após as modificações constitui aceitação dos 
              novos termos.
            </p>
          </section>

          <section>
            <h2>11. Suspensão e Encerramento</h2>
            <p>
              Podemos suspender ou encerrar sua conta a qualquer momento, sem aviso prévio, 
              se acreditarmos que você violou estes termos ou por qualquer outro motivo, 
              a nosso exclusivo critério.
            </p>
          </section>

          <section>
            <h2>12. Lei Aplicável e Jurisdição</h2>
            <p>
              Estes termos são regidos pelas leis brasileiras. Quaisquer disputas serão 
              resolvidas no foro da comarca de Goiânia, estado de Goiás.
            </p>
          </section>

          <section>
            <h2>13. Contato</h2>
            <p>
              Para questões sobre estes Termos de Uso, entre em contato conosco através do 
              e-mail: <a href="mailto:orcamentochat@gmail.com">orcamentochat@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Termos;