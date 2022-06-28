const toggleSwitch = document.querySelector("#toggle-switch");
const switchButtom = document.querySelector("#switch");

const Modal = {
    open() {
        // Abrir Modal
        // Adicionar a class active ao modal
        document.querySelector('.modal-overlay').classList.add('active');
    },

    close() {
        // fechar Modal
        // Remover a classe active do modal
        document.querySelector('.modal-overlay').classList.remove('active');
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        this.all.push(transaction);
        App.reload();
    },

    remove(index) {
        this.all.splice(index, 1);
        App.reload();
    },

    incomes() {
        let income = 0;
        this.all.forEach(transaction => {
            if(transaction.amount > 0) {
                income += transaction.amount;
            }
        });
        return income;
    },

    expenses() {
        let expense = 0;
        this.all.forEach(transaction => {
            if(transaction.amount < 0) {
                expense += transaction.amount;
            }
        });
        return expense;
    },

    total() {
        return this.incomes() + this.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = this.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        DOM.transactionsContainer.appendChild(tr);
    },

    // TODO refatorar o innerHtml 
    innerHTMLTransaction(transaction, index) {

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${transaction.amount > 0 ? "income" : "expense"}">${Utils.formatCurrency(transaction.amount)}</td>
            <td class="date">${transaction.date}</td>
            <td class="remove-icon"> <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação"> </td>
        `;
        return html;
    },

    updateBalace() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "";
    }
}

const Utils = {

    i : 0,

    formatAmount(value) {
        value = Number(value.replace(/\D/g, ""));
        value = (switchButtom.innerText === "saida") ? value*-1 : value;
        return value;
    },

    formatDate(value) {
        const splitedDate = value.split("-");
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`;
    },
    
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";
        
        value = String(value).replace(/\D/g, "");
        value = Number(value)/100;
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        return signal + value;
    },

    updateCurrencyField(field) {
        field.value = this.formatCurrency(field.value);
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value
        }
    },

    formatValues() {
        let {description, amount, date} = this.getValues();
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);
        return {description, amount, date};
    },

    validateFields() {
        const { description, amount, date } = this.getValues();
        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error('Por favor, prencha todos os campos!');
        }
    },

    clearFields() {
        this.description.value = "";
        this.amount.value = "";
        this.date.value = "";
    },

    submit(event) {
        event.preventDefault();

        try {    
            // verificar se as informações foram preechidas
            this.validateFields();
            // formatar os dados para salvar
            const transaction = this.formatValues();
            // salvar
            Transaction.add(transaction);
            // apagar os dados do formulário
            this.clearFields();
            // console.log(Transaction.all);
            // fechar modal
            Modal.close();
            // atualizar a aplicação
        } catch (error) {
            alert(error.message);
        } 
            
    }
}


const App = {
    init() {

        Transaction.all.forEach((transaction, index) => DOM.addTransaction(transaction, index));

        DOM.updateBalace();
        Storage.set(Transaction.all);
    },
    reload() {
        DOM.clearTransactions();
        App.init();
    }
}

App.init();

/*  [
        {
            description: 'Luz',
            amount: -40000,
            date: '20/08/2021'
        },
        {
            description: 'Pagamento',
            amount: 500000,
            date: '14/08/2021'
        },
        {
            description: 'Internet',
            amount: -20000,
            date: '12/08/2021'
        }
    ], */

toggleSwitch.addEventListener("click", () => {
    toggleSwitch.classList.toggle("out");
    switchButtom.innerText = (switchButtom.innerText === "saida") ? "entrada" : "saida";
    console.log(switchButtom.innerText);
});