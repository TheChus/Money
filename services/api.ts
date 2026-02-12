
import { Transaction } from '../types';

// IMPORTANT: Replace this with your deployed Google Apps Script URL
const API_URL = ""; 

/**
 * Expected columns in Google Sheet:
 * 1. Timestamp (A)
 * 2. ID (B)
 * 3. Date (C)
 * 4. Time (D)
 * 5. Main Category (E)
 * 6. Sub Category (F)
 * 7. Amount (G)
 * 8. Description (H)
 * 9. Tags (I) - Comma separated
 */

export const apiService = {
  async fetchTransactions(): Promise<Transaction[]> {
    if (!API_URL) {
      console.warn("API_URL is not defined. Using mock data.");
      return JSON.parse(localStorage.getItem('transactions') || '[]');
    }
    
    try {
      const response = await fetch(`${API_URL}?action=read`);
      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return JSON.parse(localStorage.getItem('transactions') || '[]');
    }
  },

  async addTransaction(tx: Omit<Transaction, 'id' | 'timestamp'>): Promise<boolean> {
    const newTx: Transaction = {
      ...tx,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    if (!API_URL) {
      const local = JSON.parse(localStorage.getItem('transactions') || '[]');
      localStorage.setItem('transactions', JSON.stringify([...local, newTx]));
      return true;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'create', ...newTx }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      });
      return response.ok;
    } catch (error) {
      console.error('Error adding transaction:', error);
      return false;
    }
  },

  async updateTransaction(id: string, tx: Partial<Transaction>): Promise<boolean> {
    if (!API_URL) {
      const local: Transaction[] = JSON.parse(localStorage.getItem('transactions') || '[]');
      const updated = local.map(item => item.id === id ? { ...item, ...tx } : item);
      localStorage.setItem('transactions', JSON.stringify(updated));
      return true;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'update', id, ...tx }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating transaction:', error);
      return false;
    }
  },

  async deleteTransaction(id: string): Promise<boolean> {
    if (!API_URL) {
      const local: Transaction[] = JSON.parse(localStorage.getItem('transactions') || '[]');
      const filtered = local.filter(item => item.id !== id);
      localStorage.setItem('transactions', JSON.stringify(filtered));
      return true;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'delete', id }),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  }
};
