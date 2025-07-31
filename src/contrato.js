import { generateFullContract } from './contractTemplate.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ Aplicação Pronta.");

  // --- Seleção de Elementos ---
  const form = document.getElementById('fichaCliente');
  const gerarBtn = document.getElementById('gerarContrato');
  const preencherTesteBtn = document.getElementById('preencherTeste');
  const exportarBtn = document.getElementById('exportarPDF');
  const voltarBtn = document.getElementById('voltarForm');
  const tipoPessoaRadios = document.querySelectorAll('input[name="tipoPessoa"]');
  
  const formularioSection = document.getElementById('formularioSection');
  const previewSection = document.getElementById('previewSection');
  const previewContent = document.getElementById('preview'); // O ID correto é 'preview'

  // --- Funções ---

  function toggleView(showPreview) {
    formularioSection.style.display = showPreview ? 'none' : 'block';
    previewSection.style.display = showPreview ? 'block' : 'none';
  }

  function togglePessoaFields() {
    const selected = document.querySelector('input[name="tipoPessoa"]:checked').value;
    document.getElementById('camposPessoaSingular').style.display = (selected === 'singular') ? 'block' : 'none';
    document.getElementById('camposPessoaColetiva').style.display = (selected === 'coletiva') ? 'block' : 'none';
  }

  function preencherComDadosDeTeste() {
    // Dados para Pessoa Singular
    form.nomeCompleto.value = 'João Maria da Silva';
    form.numeroCC.value = '12345678 9 ZZ1';
    form.dataValidadeCC.value = '2030-12-31';
    form.nif.value = '250123456';
    form.morada.value = 'Rua das Flores, 123, 1000-100 Lisboa';
    form.emailCliente.value = 'joao.silva@email.com';
    form.telefoneCliente.value = '912345678';
    
    // Dados do Contrato
    form.numeroLugar.value = '42';
    form.dataInicio.value = new Date().toISOString().split('T')[0];
    form.dataFim.value = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];
    form.valorMensal.value = '175';

    // Dados da Embarcação
    form.nomeEmbarcacao.value = 'Belo Mar';
    form.bandeira.value = 'Portuguesa';
    form.portoRegisto.value = 'Lisboa';
    form.numeroRegisto.value = 'LX-1234-AB';
    form.comprimento.value = '12';
    form.boca.value = '4';
    form.pontal.value = '2';
    form.materialCasco.value = 'Fibra de Vidro';
    form.cor.value = 'Branco';
    form.arqueacao.value = '15';
    form.potenciaMotor.value = '50';
    form.anoConstrucao.value = '2015';
    form.seguroApolice.value = 'S-987654';
    form.seguroCompanhia.value = 'Companhia de Seguros Segura';
    
    console.log('📝 Formulário preenchido com dados de teste.');
  }

  async function gerarContrato() {
    // Validar formulário antes de prosseguir
    if (!form.checkValidity()) {
        form.reportValidity();
        console.error("❌ Formulário inválido. Preencha todos os campos obrigatórios.");
        return;
    }
      
    const formData = Object.fromEntries(new FormData(form).entries());
    console.log("📄 Formulário submetido. A gerar contrato...", formData);
    
    // Set document title based on client name
    const clientName = formData.tipoPessoa === 'coletiva' ? formData.nomeEmpresa : formData.nomeCompleto;
    const documentTitle = `CONTRATO DE LOCAÇÃO DE LUGAR DE ACOSTAGEM ANCORADOURO DE RIO MAU - ${clientName}`;
    document.title = documentTitle;
    
    previewContent.innerHTML = '<p style="text-align: center; padding: 50px;">A gerar o contrato, por favor aguarde...</p>';
    toggleView(true);

    try {
        const contractHtml = await generateFullContract(formData);
        previewContent.innerHTML = contractHtml;
        console.log("✅ Contrato gerado e pronto para visualização.");
    } catch(error) {
        previewContent.innerHTML = `<p style="color: red; text-align: center;">Ocorreu um erro ao gerar o contrato. Verifique o console.</p>`;
        console.error("❌ Erro ao chamar generateFullContract:", error);
    }
  }

  function exportarParaPdf() {
    console.log("🚀 A iniciar exportação via impressão...");
    
    // Get client name for document title
    const formData = Object.fromEntries(new FormData(form).entries());
    const clientName = formData.tipoPessoa === 'coletiva' ? formData.nomeEmpresa : formData.nomeCompleto;
    const documentTitle = `CONTRATO DE LOCAÇÃO DE LUGAR DE ACOSTAGEM ANCORADOURO DE RIO MAU - ${clientName}`;
    
    // Set document title for PDF
    document.title = documentTitle;
    
    // Hide buttons before printing
    const buttons = document.querySelectorAll('.botoes');
    buttons.forEach(btn => btn.style.display = 'none');
    
    // Print
    window.print();
    
    // Show buttons after printing
    setTimeout(() => {
      buttons.forEach(btn => btn.style.display = 'flex');
    }, 1000);
    
    console.log("✅ Diálogo de impressão acionado.");
  }

  // --- Ligar Eventos ---
  
  // Botões principais
  preencherTesteBtn.addEventListener('click', preencherComDadosDeTeste);
  gerarBtn.addEventListener('click', (e) => {
      e.preventDefault(); // Impedir a submissão padrão do formulário
      gerarContrato();
  });
  voltarBtn.addEventListener('click', () => toggleView(false));
  exportarBtn.addEventListener('click', exportarParaPdf);

  // Toggle entre pessoa singular e coletiva
  tipoPessoaRadios.forEach(radio => radio.addEventListener('change', togglePessoaFields));

  // --- Estado Inicial ---
  togglePessoaFields(); // Garante que os campos certos são mostrados no arranque
  console.log("✅ Botões e eventos ativos.");
});
