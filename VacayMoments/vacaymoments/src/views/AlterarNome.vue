<template>
  <div>
    <app-header></app-header>
  </div>
    <div class="app-container">
    <aside class="sidebar">
  <!-- Foto do perfil e nome -->
  <div class="profile-section">
    <img :src="usuario?.fotoPerfil || defaultAvatar" alt="" class="profile-picture">
  <h2>{{ usuario?.nome || 'Utilizador' }}</h2>
  </div>
</aside>
    <main class="content">
    <h1 class="settings-title">Alterar Nome</h1>
    <div class="settings-forms">
      <form class="form-profile-update" @submit.prevent="updateNome">
        <div class="form-group">
          <label for="nome">Novo Nome</label>
          <input type="text" id="nome" placeholder="Escreve a novo Nome" v-model="nome">
        </div>
<button type="submit" class="btn-update" :disabled="!nome">Atualizar Nome</button>
      </form>
    </div>
  </main>
  </div>
</template>
<script>
import axios from 'axios';
import defaultAvatar from '@/assets/avatar.png'; // Ajuste o caminho se necessário
import AppHeader from '@/components/AppHeader.vue';

export default {

  components: {
    AppHeader
  },
  
  data() {
  return {
    usuario: null,
    defaultAvatar,
    nome: '',
  };
},
methods: {
  navigateTo(path) {
    this.$router.push(path);
  },
  fetchUserData() {
    // No método fetchUserData do seu componente Vue
axios.get('/api/me', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('userToken')
  }
})

.then(response => {
  this.usuario = response.data; // Atualizar o estado com os dados do utilizador
})
.catch(error => {
  console.error('Erro ao recuperar os dados do usuário', error);
});

  },
  logout() {
    localStorage.removeItem('token'); // Remover o token do localStorage
    this.$router.push('/login'); // Redirecionar para a página de login
  },
  updateNome() {
    // Substitua '/api/utilizador/' pelo seu endpoint correto
    axios.put('/api/utilizador/' + this.usuario._id, {
      nome: this.nome, // O valor que você deseja atualizar
    }, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('userToken')
      }
    })
    .then(() => {
      alert('Nome alterado com sucesso!');
      this.navigateTo('/perfil'); // Redireciona para /perfil
    })
    .catch(error => {
      console.error('Erro ao atualizar o nome do usuário', error);
    });
  }
},
created() {
    this.fetchUserData(); // Buscar os dados do utilizador quando o componente é criado
  },
};
</script>

<style scoped>
.app-header {
    position: fixed;
    top: 0;
    left:0;
    width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  background-color: #ffffff; /* ou qualquer outra cor de fundo que você preferir */
  padding-top: 20px;
  padding-bottom: 20px;
    z-index: 1030; /* Um z-index típico para cabeçalhos fixos, assegura que fica acima dos outros elementos */

}
.logo-container {
  /* Se precisar, adicione estilos específicos aqui */
}

.logo {
  height: 50px; /* Ajuste conforme o tamanho desejado para o seu logo */
}

.search-container {
  /* Estilos para a barra de busca */
}

.search-input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 20px;
}

.nav-icons {
  display: flex;
  gap: 7rem; /* Aumenta o espaço entre os ícones */
}

.icon-link img {
  height: 40px; /* Aumenta o tamanho dos ícones */
  width: auto; /* Mantém a proporção dos ícones */
}
.app-container {
    padding-top: 85px;
  display: flex;
  width: 100%; /* Ocupa 100% da largura da tela */
  margin-top: 10px; /* Deve ser igual à altura do seu cabeçalho */
  background-color: #f0f0f0; /* Cor de fundo cinza */
}
.container {
  width: 100%; /* Ocupa 100% da largura da tela */
  height: 100vh; /* Ocupa 100% da altura da viewport */
  background-color: #f0f0f0; /* Cor de fundo cinza */
  margin: 0; /* Remove margens padrão */
  padding: 0; /* Remove preenchimentos padrão */
  display: flex; /* Permite o uso de flexbox para alinhamento interno */
  justify-content: center; /* Centraliza o conteúdo horizontalmente */
  align-items: center; /* Centraliza o conteúdo verticalmente */
}

.sidebar {
  position: sticky;
    top: 60px;
  width: 20%;
  background-color: #d9d9d9; /* Cor de fundo para a barra lateral */
  padding: 20px;
  padding-top: 30px;
  height: calc(110vh - 60px);
  overflow-y: auto;
  box-sizing: border-box; /* Inclui padding na largura total */
}

.profile-section {
  text-align: center;
  /* ... outros estilos ... */
}

.profile-picture {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.add-friend-section {
  text-align: center;
  padding: 20px;
}

.add-friend-button {
  width: 100%;
  padding: 10px;
  background-color: #5cb85c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
}

.add-friend-button:hover {
  background-color: #4cae4c;
}

.friends-list {
  list-style-type: none;
  padding: 0;
}

.friends-list li {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.friend-picture {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.content {
  flex-grow: 1; /* Ocupa o espaço restante */
  display: flex;
  flex-direction: column; /* Empilha os cartões verticalmente */
  align-items: center; /* Centraliza os cartões horizontalmente */
  padding: 20px;
  overflow-y: auto; /* Adiciona barra de rolagem se necessário */
}

.photo-card {
  width: calc(80% - 40px); /* 80% da largura do content menos o padding */
  margin-bottom: 20px; /* Espaçamento entre os cartões de foto */
  /* ... outros estilos para o photo-card ... */
}

.photo {
  width: 100%; /* Faz a imagem ocupar todo o cartão */
  height: auto; /* Mantém a proporção da imagem */
  border-radius: 10px; /* Arredonda os cantos da imagem */
}

/* Estilos para os botões e inputs */
button {
  /* Estilos do botão */
}

input[type="text"],
input[type="checkbox"] {
  /* Estilos dos inputs */
}

.botao-definicoes{
    margin: 8px;
    height: 50px;
    width: 80%;
}

.settings-title {
  font-size: 2rem;
  margin-bottom: 20px;
  text-align: center;
}

.settings-forms {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.form-profile-update {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 80%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.input-group {
  display: flex;
  align-items: center;
}
.btn-update {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50; /* Verde */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-update:hover {
  background-color: #45a049;
}

.edit-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.edit-icon {
  width: 20px; /* ou o tamanho que desejar */
  height: 20px; /* ou o tamanho que desejar */
}

.input-icon-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon-group input {
  flex-grow: 1;
  padding-right: 30px; /* Espaço para o ícone */
}

.input-icon {
  position: absolute;
  right: 10px; /* Distância do ícone à direita do input */
  cursor: pointer;
  width: 20px; /* ou o tamanho que desejar */
  height: 20px; /* ou o tamanho que desejar */
}

.error-message {
  color: red;
}
/* Responsividade */
@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }
  
  .sidebar,
  .content {
    width: 100%;
    padding: 0;
    margin-top: 0;
  }
}

input[readonly] {
  background-color: #e9ecef; /* Cor de fundo para campos readonly */
  color: #495057; /* Cor do texto para campos readonly */
  cursor: not-allowed; /* Muda o cursor para indicar que o campo não é editável */
}
</style>

