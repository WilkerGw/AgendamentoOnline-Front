
"use client";

import React, { useState } from 'react';
import styles from './AppointmentForm.module.css';

// Função para formatar o número de telefone
const formatPhoneNumber = (value) => {
  if (!value) return "";
  value = value.replace(/\D/g, ''); // Remove tudo que não é dígito
  value = value.slice(0, 11); // Limita a 11 dígitos (DDD + 9 + número)

  if (value.length <= 2) {
    return `(${value}`;
  } else if (value.length <= 6) {
    return `(${value.slice(0, 2)}) ${value.slice(2)}`;
  } else if (value.length <= 10) {
    return `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
  } else {
    return `(${value.slice(0, 2)}) ${value.slice(2, 3)} ${value.slice(3, 7)}-${value.slice(7, 11)}`;
  }
};

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    telefone: '',
    dataExame: '',
    horarioExame: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const availableDates = ['07/06/2025', '14/06/2025', '21/06/2025', '28/06/2025'];

  const generateTimes = () => {
    const times = [];
    for (let hour = 11; hour <= 16; hour++) {
      times.push(`${String(hour).padStart(2, '0')}:00`);
      if (hour < 16) {
        times.push(`${String(hour).padStart(2, '0')}:30`);
      }
    }
    return times;
  };
  const availableTimes = generateTimes();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telefone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData((prevData) => ({
        ...prevData,
        [name]: formattedPhone,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsLoading(true);

    // Validação (incluindo formato do telefone se necessário, mas o backend já recebe formatado)
    const phoneDigits = formData.telefone.replace(/\D/g, '');
    if (!formData.nomeCompleto || !formData.telefone || !formData.dataExame || !formData.horarioExame || phoneDigits.length < 10) { // Verifica se tem pelo menos 10 dígitos
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos corretamente, incluindo um telefone válido.' });
      setIsLoading(false);
      return;
    }

    try {
      // Usar variável de ambiente para a URL da API no futuro
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://agendamento-online-back.vercel.app/';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Envia o telefone já formatado
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: result.message || 'Agendamento realizado com sucesso!' });
        setFormData({ nomeCompleto: '', telefone: '', dataExame: '', horarioExame: '' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Erro ao realizar agendamento.' });
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setMessage({ type: 'error', text: 'Erro de conexão. Tente novamente mais tarde.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2>Agende seu Exame</h2>

      {message.text && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
          {message.text}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="nomeCompleto">Nome Completo:</label>
        <input
          type="text"
          id="nomeCompleto"
          name="nomeCompleto"
          value={formData.nomeCompleto}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="telefone">Telefone/WhatsApp:</label>
        <input
          type="tel"
          id="telefone"
          name="telefone"
          value={formData.telefone}
          onChange={handleChange}
          placeholder="(XX) X XXXX-XXXX"
          maxLength="17" // Ajustado para o formato (XX) X XXXX-XXXX
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="dataExame">Data do Exame:</label>
        <select
          id="dataExame"
          name="dataExame"
          value={formData.dataExame}
          onChange={handleChange}
          required
        >
          <option value="">Selecione uma data</option>
          {availableDates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="horarioExame">Horário do Exame:</label>
        <select
          id="horarioExame"
          name="horarioExame"
          value={formData.horarioExame}
          onChange={handleChange}
          required
        >
          <option value="">Selecione um horário</option>
          {availableTimes.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>

      {/* Adiciona a classe 'loading' condicionalmente e envolve o texto em span */}
      <button
        type="submit"
        className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
        disabled={isLoading}
      >
        <span>{isLoading ? '' : 'Agendar'}</span>
      </button>
    </form>
  );
};

export default AppointmentForm;

