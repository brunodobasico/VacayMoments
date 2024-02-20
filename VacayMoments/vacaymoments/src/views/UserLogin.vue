<template>
  <div class="login-container">
  <div class="login-box">
    <h1>VacayMoments</h1>
    <form @submit.prevent="onLogin">
      <input type="text" placeholder="Nome de utilizador ou Email" required v-model="emailOrUsername">
      <input type="password" placeholder="Password" required v-model="password">
      <p v-if="loginError" class="error-message">{{ loginError }}</p>
      <button type="submit">Log in</button>
      <a href="#">Esqueceu-se da password?</a>
      <div class="divider">OU</div>
      <button type="button" class="google-sign-in">
        <img src="@/assets/google.png" alt="Google sign-in" style="height:20px">
        Log in com o Google
      </button>
    </form>
    <p>Não tens conta? <a @click.prevent="navigateTo('/registo')">Regista!</a></p>
  </div>
</div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      emailOrUsername: '',
      password: '',
      loginError: ''
    };
  },
  methods: {
    navigateTo(path) {
    this.$router.push(path);
  },
  navigateToRegistro() {
    this.navigateTo('/registo');
  },
    onLogin() {
      const userData = {
          emailOrUsername: this.emailOrUsername,
          password: this.password
        };
      const apiEndpoint = 'http://localhost:3000/api/login'; // Adicione a rota de login correta aqui
      axios.post(apiEndpoint, userData)
        .then(response => {
          console.log(response.data.message);
          localStorage.setItem('userToken', response.data.token);
          this.loginError = '';
          // Redireciona para a dashboard ou outra página após o login bem sucedido
          this.$router.push('/paginainicial');
        })
        .catch(error => {
            // Falha no login
            if (error.response && error.response.status === 401) {
              // Mensagem de erro de autenticação
              this.loginError = error.response.data.message;
            } else {
              // Outros erros de servidor
              this.loginError = 'Username/email ou palavra-passe incorretas';
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
  margin: 2rem 0;
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
