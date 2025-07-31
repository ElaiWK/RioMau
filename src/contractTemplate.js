import mammoth from 'mammoth';

/**
 * Converte um valor numérico para o seu equivalente por extenso em euros.
 * @param {number|string} valor - O valor a ser convertido.
 * @returns {string} O valor por extenso.
 */
function valorPorExtenso(valor) {
  const num = parseInt(valor, 10);
  if (isNaN(num)) return '';

  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const especiais = ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezasseis', 'dezassete', 'dezoito', 'dezanove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  if (num === 0) return 'zero euros';
  if (num === 100) return 'cem euros';

  let str = '';
  let n = num;

  if (n >= 100) {
    str += centenas[Math.floor(n / 100)];
    n %= 100;
    if (n > 0) str += ' e ';
  }

  if (n >= 10 && n <= 19) {
    str += especiais[n - 10];
  } else {
    if (n >= 20) {
      str += dezenas[Math.floor(n / 10)];
      n %= 10;
      if (n > 0) str += ' e ';
    }
    if (n > 0) {
      str += unidades[n];
    }
  }

  return `${str.trim()} euros`;
}


/**
 * Funções auxiliares para formatar dados.
 */
function processContractData(formData) {
  const data = { ...formData };
  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('pt-PT') : '___/__/____';
  data.dataInicioFormatada = formatDate(data.dataInicio);
  data.dataFimFormatada = formatDate(data.dataFim);
  data.dataValidadeCCFormatada = formatDate(data.dataValidadeCC);
  data.dataAtual = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
  data.valorMensalExtenso = data.valorMensal ? valorPorExtenso(data.valorMensal) : '_________';
  return data;
}

function replacePlaceholders(html, data) {
  let processedHtml = html;
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      processedHtml = processedHtml.replace(placeholder, data[key] || '__________');
    }
  }
  return processedHtml;
}

/**
 * Gera o Anexo I.
 */
function generateAnexoAreaLicenciada() {
  return `
    <div class="anexo page-break-before">
      <h2 style="text-align: center; font-size: 14px; font-weight: bold;">ANEXO I – ÁREA LICENCIADA</h2>
      <img src="public/assets/Area_Licenciada_ANEXO-1.png" alt="Área Licenciada" style="width: 100%; max-height: 75vh; object-fit: contain;" />
    </div>
  `;
}

/**
 * Função principal que gera o contrato completo.
 */
async function generateFullContract(formData) {
  const data = processContractData(formData);
  
  // Determine client name for document title
  const clientName = data.tipoPessoa === 'coletiva' ? data.nomeEmpresa : data.nomeCompleto;
  const documentTitle = `CONTRATO DE LOCAÇÃO DE LUGAR DE ACOSTAGEM ANCORADOURO DE RIO MAU - ${clientName}`;
  
  try {
    const [corpoTemplate, regulamentoTemplate, anexoDocx] = await Promise.all([
      fetch('./src/data/corpo_do_contrato.html').then(res => res.text()),
      fetch('./src/data/Regulamento_de_Utilizacao.html').then(res => res.text()),
      fetch('./public/data/ANEXO_II_Regulamento_de_Tarifas.docx').then(res => res.arrayBuffer())
    ]);

    const anexoHtml = (await mammoth.convertToHtml({ arrayBuffer: anexoDocx })).value;
    const corpoFinalHtml = replacePlaceholders(corpoTemplate, data);
    const regulamentoFinalHtml = replacePlaceholders(regulamentoTemplate, data);

    const finalHtml = `
      <div class="contrato-header" style="margin-top: 0;">
        <img src="./public/assets/logo.png" alt="Logo" class="logo-contrato" />
        <h1>${documentTitle}</h1>
      </div>
      ${corpoFinalHtml}
      
      <div class="page-break-before">
        <h2>REGULAMENTO DE UTILIZAÇÃO</h2>
        ${regulamentoFinalHtml}
      </div>
      
      <div class="anexo page-break-before">
        <h4 class="anexo-titulo">ANEXO I – ÁREA LICENCIADA</h4>
        <div class="imagem-container">
            <img src="./public/assets/Area_Licenciada_ANEXO-1.png" alt="Área Licenciada" class="anexo-imagem" />
        </div>
      </div>
      
      <div class="anexo page-break-before">
        <h4 class="anexo-titulo">ANEXO II – REGULAMENTO DE TARIFAS</h4>
        <p class="anexo-subtitulo">(Notas e Condições)</p>
        <div class="anexo-tabela-container">
          ${anexoHtml}
        </div>
      </div>
      
      <div class="print-footer">
        <p>My Dynamic, Soc. Unip. Lda.</p>
        <p>Urb. Cerro das Mós, Rua António da Silva Freitas, Lt.333, E 8600-714 Lagos - NIPC: 508 882 893</p>
        <p>www.mydynamic.pt – geral@mydynamic.pt</p>
      </div>
    `;

    return finalHtml;

  } catch (error) {
    console.error("❌ Erro catastrófico ao gerar o contrato:", error);
    return `<p style="color: red; font-weight: bold;">ERRO: Não foi possível gerar o contrato. Verifique o console.</p>`;
  }
}

export { generateFullContract }; 