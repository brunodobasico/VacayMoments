<template>
    <header class="app-header">
      <div class="logo-container">
    <!-- Substitua pelo seu logo -->
    <a @click.prevent="navigateTo('/paginainicial')" class="icon-link">
    <img src="@/assets/logo.png" alt="Logo" class="logo">
    </a>
  </div>
  <nav class="navbar navbar-light">
  <form class="form-inline" @submit.prevent="performSearch">
    <input class="form-control mr-sm-2" type="search" placeholder="Procurar" aria-label="Search" v-model="searchQuery">
    <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Procurar</button>
  </form>
  <div class="search-results" v-if="searchResults.length > 0" ref="searchBar">
<div class="user-result" v-for="user in searchResults" :key="user._id" @click="openUserProfile(user)">
      <img :src="user.fotoPerfil ? getAbsolutePath(user.fotoPerfil) : defaultAvatar" alt="Foto do usuário" class="user-photo">
      <p class="user-name">{{ user.nome }}</p>
    </div>
  </div>
</nav>
  <nav class="nav-icons">
    <!-- Botão do ícone de amizade -->
<a @click.prevent="toggleFriendRequests" class="icon-link">
  <img src="@/assets/pedidoamizade.png" alt="Ícone de pedido de amizade">
</a>

<template v-if="showFriendRequests">
  <div class="friend-requests-container" ref="friendRequests">
    <!-- Quando há pedidos de amizade pendentes -->
    <div v-if="pendingFriendRequests.length > 0">
      <div class="friend-request-card" v-for="request in pendingFriendRequests" :key="request._id">
        <div class="friend-request-header">
          <img :src="request.idUtilizador1.fotoPerfil || defaultAvatar" alt="Foto do usuário" class="user-photo">
          <p class="user-name">{{ request.idUtilizador1.nome }}</p>
        </div>
        <div class="friend-request-actions">
          <button class="btn-aceitar" @click="acceptFriendRequest(request._id)">Aceitar</button>
          <button class="btn-rejeitar" @click="rejectFriendRequest(request._id)">Rejeitar</button>
        </div>
      </div>
    </div>
    
    <!-- Mensagem quando não há pedidos de amizade pendentes -->
    <div v-else class="no-friend-requests">
      <p>Não tem pedidos de amizade pendentes.</p>
    </div>
  </div>
</template>
    <a @click.prevent="navigateTo('/adicionarfoto')" class="icon-link">
      <img src="@/assets/addIcon.png" alt="Ícone 1">
    </a>
    <a @click.prevent="navigateTo('/perfil')" class="icon-link">
      <img src="@/assets/user.png" alt="Ícone 1">
    </a>
    <a @click.prevent="logout" class="icon-link">
      <img src="@/assets/logout.png" alt="Logout">
    </a>  
  </nav>
    </header>
</template>

<script>
import axios from 'axios';
import defaultAvatar from '@/assets/avatar.png'; // Ajuste o caminho se necessário

export default {
  
  data() {
  return {
    defaultAvatar,
    searchQuery: '',
    searchResults: [],
    pendingFriendRequests: [],
    showFriendRequests: false, // Adiciona um controle para mostrar os pedidos de amizade
    user: null, // Adiciona um lugar para armazenar os dados do usuário logado

    };
},
watch: {
    // Isto assumirá que você tem um $route configurado corretamente com um parâmetro 'id'
    '$route.params.id': {
      immediate: true, // isso garante que o watcher seja chamado imediatamente com o valor atual na montagem
      handler(newId) {
        if (newId) {
          this.fetchUserData4();
        }
      }
    }
  },
mounted() {
    // Adicionar um ouvinte de evento quando o componente é montado
    document.addEventListener('mousedown', this.handleClickOutside);
  },
  beforeUnmount() {
    // Remover o ouvinte de evento quando o componente está prestes a ser desmontado
    document.removeEventListener('mousedown', this.handleClickOutside);
  },
methods: {
  getAbsolutePath(relativePath) {
    // Isso garante que o caminho da imagem sempre comece a partir da raiz
    return `${window.location.origin}/${relativePath}`;
  },
  // Este método verifica se o clique foi fora dos elementos de pedido de amizade e pesquisa
    handleClickOutside(event) {
      // Verifique se o clique foi fora do contêiner de pedidos de amizade
      if (this.showFriendRequests && (!this.$refs.friendRequests || !this.$refs.friendRequests.contains(event.target))) {
        this.showFriendRequests = false;
      }
      
      // Verifique se o clique foi fora da barra de pesquisa
      if (this.searchResults.length > 0 && (!this.$refs.searchBar || !this.$refs.searchBar.contains(event.target))) {
        this.searchResults = []; // Assumindo que você quer limpar os resultados da pesquisa
      }
    },
  fetchLoggedUserData() {
    axios.get('/api/me', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('userToken')
      }
    })
    .then(response => {
      this.user = response.data;
      this.fetchPendingFriendRequests(); // Somente agora chamamos fetchPendingFriendRequests
    })
    .catch(error => {
      console.error('Erro ao recuperar os dados do usuário logado', error);
    });
  },
  openUserProfile(user) {
    this.$router.push({ name: 'PaginaUtilizador', params: { id: user._id } });
  },
  navigateTo(path) {
    this.$router.push(path);
  },
  fetchUserData4() {
      // agora, esta função espera até que o ID esteja realmente disponível
      const userId = this.$route.params.id;
      if (userId) {
        axios.get(`/api/utilizador/${userId}`)
          .then(response => {
            this.usuario = response.data;
          })
          .catch(error => {
            console.error('Erro ao recuperar os dados do usuário', error);
          });
      }
    },
    toggleFriendRequests() {
      if (!this.showFriendRequests) {
        this.fetchPendingFriendRequests();
      }
      this.showFriendRequests = !this.showFriendRequests;
    },
    fetchPendingFriendRequests() {
  // Obter o userId do estado do componente (este deve ser definido em algum lugar após o login)
  if (this.user && this.user._id) {
    const userId = this.user._id;
    axios.get(`/api/amizades/pendentes/${userId}`)
      .then(response => {
        this.pendingFriendRequests = response.data;
      })
      .catch(error => {
        console.error('Erro ao buscar pedidos de amizade pendentes', error);
      });
  } else {
    console.error('User ID não está disponível');
  }
},
acceptFriendRequest(amizadeId) {
    axios.put(`/api/amizades/aceitar/${amizadeId}`, {}, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('userToken')
      }
    })
    .then(() => {
      // Atualizar a lista de pedidos pendentes
      this.pendingFriendRequests = this.pendingFriendRequests.filter(request => request._id !== amizadeId);
      // Você pode querer fazer algo a mais aqui, como atualizar a lista de amigos
    })
    .catch(error => {
      console.error('Erro ao aceitar pedido de amizade', error);
    });
  },
rejectFriendRequest(amizadeId) {
  axios.delete(`/api/amizades/rejeitar/${amizadeId}`, {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('userToken')
    }
  })
  .then(() => {
    // Atualizar a lista de pedidos pendentes
    this.pendingFriendRequests = this.pendingFriendRequests.filter(request => request._id !== amizadeId);
    // Você também pode querer atualizar qualquer outra parte do estado do componente se necessário
  })
  .catch(error => {
    console.error('Erro ao rejeitar pedido de amizade', error);
  });
},
  

  performSearch() {
      // Implemente a lógica de busca aqui
      axios.get('/api/search-users', {
        params: { query: this.searchQuery },
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('userToken'),
        },
      })
      .then(response => {
        
        this.searchResults = response.data;
        console.log(response.data);
      })
      .catch(error => {
        console.error('Erro na pesquisa', error);
      });
    },
  logout() {
    localStorage.removeItem('token'); // Remover o token do localStorage
    this.$router.push('/login'); // Redirecionar para a página de login
  },
},
created() {
    this.fetchUserData4(); // Buscar os dados do utilizador quando o componente é criado
          this.fetchLoggedUserData(); // Vamos buscar os dados do usuário logado quando o componente for criado


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

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  z-index: 10;
}

.user-result {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.user-photo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-name {
  margin: 0;
}

.friend-requests-container {
  position: absolute;
  top: 100%;
  right: 0;
  width: 300px; /* Ajuste a largura conforme necessário */
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  z-index: 10;
  padding: 10px;
}

.friend-request-card {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.friend-request-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.friend-request-actions {
  text-align: right;
}

.btn-aceitar, .btn-rejeitar {
  padding: 5px 10px;
  margin: 0 5px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-aceitar {
  background-color: #4CAF50; /* Cor verde */
  color: white;
}

.btn-rejeitar {
  background-color: #f44336; /* Cor vermelha */
  color: white;
}

</style>