// Estrutura principal para armazenar os gastos por mês

let financialData = JSON.parse(localStorage.getItem('financialData')) || {
  janeiro: [], fevereiro: [], marco: [], abril: [],
  maio: [], junho: [], julho: [], agosto: [],
  setembro: [], outubro: [], novembro: [], dezembro: []
};

// Mês selecionado no momento

let currentMonth = 'janeiro';

// Elementos do DOM

const monthSelect = document.getElementById('month-select');
const expenseForm = document.getElementById('expense-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const expensesTableBody = document.getElementById('expenses-tbody');

// Cards de Resumo

const totalExpensesEl = document.getElementById('total-expenses');
const priorityExpensesEl = document.getElementById('priority-expenses');
const nonsenseExpensesEl = document.getElementById('nonsense-expenses');

// Inicialização da Aplicação

document.addEventListener('DOMContentLoaded', () => {

  // Configurar o mês inicial com base no select

  if (monthSelect) {
    currentMonth = monthSelect.value;
    monthSelect.addEventListener('change', handleMonthChange);
  }

  // Listener para submissão do formulário

  if (expenseForm) {
    expenseForm.addEventListener('submit', handleAddExpense);
  }

  // Carregar dados iniciais da tela

  renderApp();
});

// Trocar o mês de visualização

function handleMonthChange(e) {
  currentMonth = e.target.value;
  renderApp();
}

// Adicionar novo gasto

function handleAddExpense(e) {
  e.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  if (!description || isNaN(amount) || amount <= 0) {
    alert('Por favor, preencha uma descrição válida e um valor maior que zero.');
    return;
  }

  const newExpense = {
    id: Date.now().toString(),
    description,
    amount,
    category,
    date: new Date().toLocaleDateString('pt-BR')
  };

  // Garante que o array do mês existe

  if (!financialData[currentMonth]) {
    financialData[currentMonth] = [];
  }

  financialData[currentMonth].push(newExpense);
  saveData();
  renderApp();

  // Limpar formulário

  expenseForm.reset();
  descriptionInput.focus();
}

// Remover um gasto pelo ID

function deleteExpense(id) {
  if (!financialData[currentMonth]) return;

  financialData[currentMonth] = financialData[currentMonth].filter(item => item.id !== id);
  saveData();
  renderApp();
}

// Salvar dados no LocalStorage

function saveData() {
  localStorage.setItem('financialData', JSON.stringify(financialData));
}

// Renderizar Tabela e Totais na tela

function renderApp() {
  const currentList = financialData[currentMonth] || [];

  // Calcular totais

  let total = 0;
  let priorityTotal = 0;
  let nonsenseTotal = 0;

  currentList.forEach(item => {
    total += item.amount;
    if (item.category === 'priority') {
      priorityTotal += item.amount;
    } else if (item.category === 'nonsense') {
      nonsenseTotal += item.amount;
    }
  });

  // Atualizar cards de resumo na tela

  if (totalExpensesEl) totalExpensesEl.textContent = formatCurrency(total);
  if (priorityExpensesEl) priorityExpensesEl.textContent = formatCurrency(priorityTotal);
  if (nonsenseExpensesEl) nonsenseExpensesEl.textContent = formatCurrency(nonsenseTotal);

  // Renderizar Tabela

  renderTable(currentList);
}

// Montar as linhas da tabela de gastos

function renderTable(expenses) {
  if (!expensesTableBody) return;

  expensesTableBody.innerHTML = '';

  if (expenses.length === 0) {
    expensesTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">
          Nenhum gasto registrado para este mês.
        </td>
      </tr>
    `;
    return;
  }

  expenses.forEach(item => {
    const tr = document.createElement('tr');

    const badgeClass = item.category === 'priority' ? 'badge-priority' : 'badge-nonsense';
    const categoryLabel = item.category === 'priority' ? 'Prioridade' : 'Besteira';

    tr.innerHTML = `
      <td>${escapeHtml(item.description)}</td>
      <td><span class="badge ${badgeClass}">${categoryLabel}</span></td>
      <td>${formatCurrency(item.amount)}</td>
      <td>
        <button class="btn-delete" title="Excluir gasto" onclick="deleteExpense('${item.id}')">
          ✕
        </button>
      </td>
    `;

    expensesTableBody.appendChild(tr);
  });
}

// Função auxiliar para formatar em Reais (R$)

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

// Função para evitar injeção de HTML nos campos de texto

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}