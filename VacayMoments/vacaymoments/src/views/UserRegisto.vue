<template>
  <div class="login-container">
    <div class="login-box">
      <h1>VacayMoments</h1>
      <form>  
        <button type="button" class="google-sign-in">
          <img src="@/assets/google.png" alt="Google sign-in" style="height:20px">
          Log In com o Google
        </button>
      </form>
      <div class="divider">OU</div>
      <form @submit.prevent="onRegister">
        <input type="text" placeholder="Nome" required v-model="nome">
        <input type="text" placeholder="Nome de utilizador" required v-model="username">
        <input type="email" placeholder="Email" required v-model="email">
        <input type="password" placeholder="Password" required v-model="password">
        <input type="password" placeholder="Confirmar Password" required v-model="confirmPassword">
        <p v-if="passwordMismatchError" class="error-message">As senhas não coincidem.</p>
        <p v-if="registrationError" class="error-message">{{ registrationError }}</p>
        <button type="submit">Registar</button>
      </form>
      <p>Já tem uma conta? <a @click.prevent="navigateTo('/login')">Inicie Sessão.</a></p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      // Seus dados existentes aqui~
      nome: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      passwordMismatchError: false,
      registrationError: null, // Armazena a mensagem de erro de registro
    };
  },
  methods: {
    navigateTo(path) {
    this.$router.push(path);
  },
    onRegister() {
  if (this.password !== this.confirmPassword) {
    this.passwordMismatchError = true;
    return; // Pare a execução se as senhas não coincidirem
  }
  this.passwordMismatchError = false;
  // Dados para enviar para a API
  const userData = {
    nome: this.nome,
    email: this.email,
    username: this.username,
    password: this.password,
    fotoPerfil: '' 
  };
  // Endpoint da API para registrar um usuário
  const apiEndpoint = 'http://localhost:3000/api/utilizador'; // Substitua pela sua URL de API
  axios.post(apiEndpoint, userData)
  .then(response => { // Agora 'response' está sendo usado
    console.log('Usuário registrado:', response.data);
    this.$router.push('/login'); // Redireciona o usuário para a página de login
  })
    .catch(error => {
      // Verifique se o erro é por causa de um email ou username duplicado
      if (error.response && error.response.status === 400) {
        // Aqui você define uma mensagem de erro que será mostrada no template
        this.registrationError = error.response.data.message;
      } else {
        // Trate outros erros aqui (por exemplo, mostrando uma mensagem de erro genérica)
        console.error(error.response);
      }
    });
}
  }
};
</script>

<style scoped>
    .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 98vh;
    background-color: #E8F0FE; /* Azul claro para o fundo da página */  
  }
  
  .login-box {
    background: #FAFAFA;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    text-align: center;
    border: 1px solid #D0E2FF; /* Azul mais claro para a borda */
  }
  
  .login-box h1 {
    margin-bottom: 1.5rem;
  }
  
  .login-box form {
    display: flex;
    flex-direction: column;
  }
  
  .login-box input {
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  
  .login-box button {
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: none;
    border-radius: 5px;
    background-color: #4285F4;
    color: white;
    cursor: pointer;
  }
  
  .login-box button.google-sign-in {
    background: #DB4437;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .login-box button.google-sign-in img {
    margin-right: 0.5rem;
  }
  
  .login-box .divider {
    margin: 1rem 0;
    position: relative;
    text-align: center;
  }
  
  .login-box .divider:before,
  .login-box .divider:after {
    content: "";
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background: #ddd;
  }
  
  .login-box .divider:before {
    left: 0;
  }
  
  .login-box .divider:after {
    right: 0;
  }
  
  .login-box a {
    color: #4285F4;
    text-decoration: none;
  }
  
  .login-box a:hover {
    text-decoration: underline;
  }
  
  .login-box p {
    margin-top: 1rem;
  }
  
  .google-button-container {
  display: flex;
  justify-content: center; /* Isso centraliza horizontalmente os itens flexíveis */
  margin-bottom: 1rem; /* Opcional: espaço abaixo do botão */
}

.error-message {
  color: red;
  margin-top: -1rem;
  margin-bottom: 1rem;
}

  @media (max-width: 480px) {
    .login-box {
      width: 90%;
    }
  }
  
  </style>
  
