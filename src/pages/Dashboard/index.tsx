import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale'; // eslint-disable-line

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: string;
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      const response = await api.get('/transactions');

      const formattedTransaction = response.data.transactions.map(
        (transaction: Transaction) => ({
          ...transaction,
          formattedValue:
            transaction.type === 'income'
              ? formatValue(transaction.value)
              : `-  ${formatValue(transaction.value)}`,
          formattedDate: format(
            parseISO(transaction.created_at),
            'dd/MM/yyyy',
            {
              locale: pt,
            },
          ),
        }),
      );

      setTransactions(formattedTransaction);
      setBalance(response.data.balance);
    }

    loadTransactions();
  }, []);

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{formatValue(balance.income)}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">
              {formatValue(balance.outcome)}
            </h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{formatValue(balance.total)}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(transaction =>
                transaction.type === 'income' ? (
                  <tr key={transaction.id}>
                    <td className="title">{transaction.title}</td>
                    <td className="income">{transaction.formattedValue}</td>
                    <td>{transaction.category.title}</td>
                    <td>{transaction.formattedDate}</td>
                  </tr>
                ) : (
                  <tr key={transaction.id}>
                    <td className="title">{transaction.title}</td>
                    <td className="outcome">{transaction.formattedValue}</td>
                    <td>{transaction.category.title}</td>
                    <td>{transaction.formattedDate}</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
