
<template>
    <div>
    <app-header></app-header>
</div>
  <div class="app-container">
    <aside class="sidebar">
  <!-- Foto do perfil e nome -->
  <div class="profile-section">
  <img :src="usuario?.fotoPerfil ? getAbsolutePath(usuario.fotoPerfil) : defaultAvatar" alt="" class="profile-picture">
  <h2>{{ usuario?.nome || 'Usuário Não Encontrado' }}</h2>
</div>

  <!-- Seção de Adicionar Amigo -->
  <div class="add-friend-section">
  <button v-if="estadoAmizade === 'nenhum'" 
          type="button" 
          class="btn btn-success btn-lg"
          @click="enviarPedidoAmizade">
    Adicionar Amigo
  </button>
  <p v-else-if="estadoAmizade === 'pendente'">
    Pedido pendente
  </p>
  <button v-if="estadoAmizade === 'pendente'"
          type="button"
          class="btn btn-warning btn-lg"
          @click="cancelarPedidoAmizade">
    Cancelar Pedido
  </button>
  <p v-else-if="estadoAmizade === 'amigos'">
    Amigos 🤝
  </p>
  <button v-if="estadoAmizade === 'amigos'"
          type="button"
          class="btn btn-danger btn-lg"
          @click="eliminarAmizade">
    Remover Amigo
  </button>
</div>
<div class="friends-list-section">
  <h3>Amigos</h3>
  <ul>  
    <li v-for="amigo in amigos" :key="amigo._id" @click="openUserProfile(amigo)">
      <img :src="amigo.fotoPerfil ? getAbsolutePath(amigo.fotoPerfil) : defaultAvatar" class="friend-picture">
      <span>{{ amigo.nome }}</span>
    </li>
  </ul>
</div>

</aside>
    
  <main class="content">
    <div class="carousel-container">
      <button v-if="allPhotos.length > 1" class="carousel-control left" @click="prevPhoto">&lt;</button>
      <div class="photo-container">
        <img v-if="allPhotos[currentPhotoIndex]" :src="getAbsolutePath(allPhotos[currentPhotoIndex].imagePath)" alt="User Photo" class="photo">
        <div v-if="allPhotos[currentPhotoIndex]" class="photo-description">{{ allPhotos[currentPhotoIndex].descricao }}</div>
        <div v-if="allPhotos[currentPhotoIndex]?.reactionCounts" class="reaction-counts">
          <span v-for="reaction in allPhotos[currentPhotoIndex].reactionCounts" :key="reaction._id">
            {{ convertEmoji(reaction._id) }}: {{ reaction.count }}
          </span>
        </div>
        <div class="photo-actions">
          <button class="reaction-button" @click="toggleReactions">Reagir</button>
          <div v-if="showReactions " class="reactions-list">
            <span @click="handleReaction('like')">👍</span>
            <span @click="handleReaction('heart')">❤️</span>
            <span @click="handleReaction('laugh')">😂</span>
            <span @click="handleReaction('happy')">😊</span>
            <!-- Adicione mais emojis conforme necessário -->
          </div>
          <span
            v-for="emoji in emojis"
            :key="emoji.type"
            :class="{ active: userReaction === emoji.type }"
            @click="handleReaction(emoji.type)"
          >{{ emoji.char }}
          </span>
          <div v-if="userReaction && !showReactions" class="user-reaction">
            {{ convertEmoji(userReaction) }}
          </div>
          <button class="comment-button" @click="toggleCommentBox">Comentar</button>
          <div v-if="showCommentBox" class="add-comment">
            <input type="text" v-model="newComment" placeholder="Adicione um comentário...">
            <button @click="postComment">Enviar</button>
          </div>
        </div>
      </div>
      <button v-if="allPhotos.length > 1" class="carousel-control right" @click="nextPhoto">&gt;</button>
    </div>
    <div class="comments-section">
    <template v-if="currentPhotoComments.length > 0">
      <div class="comment" v-for="comment in currentPhotoComments" :key="comment._id">
        <div class="comment-user-info">
          <img :src="comment.userPhoto || defaultAvatar" alt="" class="comment-user-picture">
          <span>{{ comment.userName }}</span>
          <button style="border: none;" v-if="comment.userId === utilizador._id" @click="deleteComment(comment._id)">🗑️</button>
        </div>
        <p>{{ comment.descricao }}</p>
      </div>
    </template>
    <!-- Mensagem para quando não há comentários -->
    <p v-else class="no-comments">Nenhum comentário apresentado</p>
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
      emojis: [], // adicione esta linha se "emojis" for uma lista que você irá iterar
      estadoAmizade: null, 
      utilizador: null, // Deve ser atualizado com os dados do usuário logado
      amigos:[],
      allPhotos: [], // Armazena todas as fotos, excluindo as do usuário logado
      currentPhotoIndex: 0, // Índice da foto atual no carrossel
      showReactions: false, // Estado para controlar a visibilidade das reações
      userReaction: null, // Estado para armazenar a reação do usuário para a foto atual
      newComment: '', // Para armazenar o novo comentário digitado pelo usuário
      showCommentBox: false, // novo estado para controlar a exibição da caixa de comentário
      currentPhotoComments: [], // Armazena os comentários da foto atual  
      reactionCounts: {}, // Inicialize como um objeto vazio ou como necessário
    };
  },
  watch: {
  '$route.params.id': {
    immediate: true,
    async handler(newId, oldId) {
      if (newId !== oldId) {
        await this.fetchUserData();
        await this.fetchAllPhotos();
        await this.fetchAmigos();
      }
    }
  },
  currentPhotoIndex(newIndex, oldIndex) {
    if (newIndex !== oldIndex) {
      const currentPhoto = this.allPhotos[newIndex];
      if (currentPhoto) {
        this.checkUserReaction(currentPhoto._id);
        this.fetchComments(currentPhoto._id); // Adicionar esta linha
        this.fetchReactionCounts(currentPhoto._id);
      }
    }
  }
},
  methods: {  
    eliminarAmizade() {
      // Aqui você pode usar 'amizadeId', que deve ser armazenado quando você verificar o estado da amizade
      if (this.amizadeId && window.confirm("Tem certeza que deseja eliminar esta amizade?")) {
        axios.delete(`/api/amizades/${this.amizadeId}`, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('userToken')
          }
        })
        .then(() => {
          alert("Amizade eliminada com sucesso!");
          this.estadoAmizade = 'nenhum';
          this.amizadeId = null; // Resetar o ID da amizade
          // Atualize a lista de amigos aqui se necessário
        })
        .catch(error => {
          console.error('Erro ao eliminar a amizade', error);
          alert("Ocorreu um erro ao tentar eliminar a amizade.");
        });
      }
    },
    async fetchAmigos() {
      console.log("chegeqweqe");
      try {
        const response = await axios.get(`/api/amizades/amigos/${this.usuario._id}`, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('userToken')
          }
        });
        this.amigos = response.data; // Supondo que a API retorne uma lista de objetos de amigos
      } catch (error) {
        console.error('Erro ao buscar amigos', error);
      }
    },

    deleteComment(commentId) {
    // Solicita confirmação do usuário
    if (window.confirm("Tem certeza que deseja eliminar o comentário?")) {
      axios.delete(`/api/comentario/${commentId}`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('userToken')
        }
      })
      .then(() => {
        // Se a promessa for resolvida, informar o usuário do sucesso
        alert("Comentário eliminado com sucesso!");
        // Atualizar os comentários exibidos
        this.fetchComments(this.allPhotos[this.currentPhotoIndex]._id);
      })
      .catch(error => {
        console.error('Erro ao excluir comentário', error);
        // Se ocorrer um erro, informar o usuário
        alert("Ocorreu um erro ao tentar eliminar o comentário.");
      });
    }
  },
  fetchComments(fotoId) {
    axios.get(`/api/comentarios/${fotoId}`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('userToken')
      }
    })
    .then(response => {
      this.currentPhotoComments = response.data || [];
    })
    .catch(error => {
      console.error('Erro ao buscar comentários', error);
    });
  },
  postComment() {
    const photoId = this.allPhotos[this.currentPhotoIndex]._id;
    axios.post('/api/comentarios', {
      descricao: this.newComment,
      fotoID: photoId,
      dataCriacao: new Date()
    }, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('userToken')
      }
    })
    .then(() => {
      alert('Comentário adicionado com sucesso!'); // Exibe um alerta de sucesso
      this.newComment = ''; // Limpa o campo de comentário
      this.fetchComments(photoId); // Atualiza a lista de comentários
      this.toggleCommentBox(); // Fecha a caixa de comentário após adicionar um novo
    })
    .catch(error => {
      console.error('Erro ao postar comentário', error);
      // Trate aqui o erro, como mostrar uma mensagem para o usuário
    });
  },
  fetchReactionCounts(fotoId) {
  axios.get(`/api/reacoes/contagem/${fotoId}`)
  .then(response => {
    const photoIndex = this.allPhotos.findIndex(photo => photo._id === fotoId);
    if (photoIndex !== -1) {
      // No Vue 3, você pode simplesmente atribuir o valor
      this.allPhotos[photoIndex].reactionCounts = response.data;
      // Certifique-se de que reactionCounts é reativo, definindo-o no estado do componente
    }
  })
  .catch(error => {
    console.error('Erro ao buscar contagens de reações', error);
  });
},
  convertEmoji(tipoEmoji) {
    const emojiMap = {
      like: '👍',
      heart: '❤️',
      laugh: '😂',
      happy: '😊',
      // ...outros mapeamentos
    };
    return emojiMap[tipoEmoji] || tipoEmoji;
  },
  checkUserReaction(fotoId) {
    axios.get(`/api/reacoes/${fotoId}`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('userToken')
      }
    })
    .then(response => {
      if (response.data && response.data.reacao) {
        this.userReaction = response.data.reacao;
      } else {
        this.userReaction = null;
      }
    })
    .catch(error => {
      console.error('Erro ao verificar a reação do usuário', error);
    });
  },
  reagirAFoto(tipoEmoji, fotoID) {
    axios.post('/api/reacoes', {
      tipoEmoji,
      fotoID
    }, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('userToken')
      }
    })
    .then(() => {
      // Supondo que você queira armazenar a reação do usuário
      this.userReaction = tipoEmoji;
      // Se você mantiver um registro de todas as reações por foto, você pode atualizar isso também
      let photo = this.allPhotos.find(p => p._id === fotoID);
      if (photo) {
        this.fetchReactionCounts(fotoID);
        if (!photo.reactions) {
          photo.reactions = {};
        }
        // Incrementar o contador de reações para o tipoEmoji
        if (photo.reactions[tipoEmoji]) {
          photo.reactions[tipoEmoji]++;
        } else {
          photo.reactions[tipoEmoji] = 1;
        }
      }
      
      // Atualizar qualquer outro estado ou componentes da interface do usuário conforme necessário
      // Por exemplo, se você tiver um componente de notificação, pode querer mostrar uma mensagem de sucesso
      // this.showNotification('Reação enviada com sucesso!');

    })
    .catch(error => {
      console.error('Erro ao reagir à foto', error);
      // Tratar erros de interface do usuário, como mostrar uma mensagem de erro
      // this.showNotification('Erro ao enviar reação.');
    });
  },
  toggleReactions() {
    this.showReactions = !this.showReactions;
  },
  toggleCommentBox() {
    this.showCommentBox = !this.showCommentBox;
  },
  handleReaction(reactionType) {
    const photoId = this.allPhotos[this.currentPhotoIndex]._id;
    this.userReaction = reactionType; // Armazena a reação do usuário
    this.reagirAFoto(reactionType, photoId); // Envia a reação para o servidor
    this.showReactions = false; // Esconde a lista de reações
  },

    getAbsolutePath(relativePath) {
    // Isso garante que o caminho da imagem sempre comece a partir da raiz
    return `${window.location.origin}/${relativePath}`;
  },
    prevPhoto() {
    if (this.currentPhotoIndex === 0) {
      this.currentPhotoIndex = this.allPhotos.length - 1;
    } else {
      this.currentPhotoIndex--;
    }
  },
  nextPhoto() {
    if (this.currentPhotoIndex === this.allPhotos.length - 1) {
      this.currentPhotoIndex = 0;
    } else {
      this.currentPhotoIndex++;
    }
  },
  fetchAllPhotos() {
    const userId = this.$route.params.id;
    axios.get(`/api/fotos/${userId}`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('userToken')
      }
    })
    .then(response => {
    this.allPhotos = response.data;
  })
    .catch(error => {
      console.error('Erro ao recuperar fotos', error);
    });
  },
    fetchUserData() {
    const userId = this.$route.params.id;

    if (userId) {
      axios.get(`/api/utilizador/${userId}`)
        .then(response => {
          this.usuario = response.data;
          this.verificarEstadoAmizade(response.data._id);
        })
        .catch(error => {
          console.error('Erro ao recuperar os dados do utilizador', error);
        });
    }
  },
  async fetchUserLogado() {
      try {
        const response = await axios.get('/api/me', {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('userToken')
          }
        });
        this.utilizador = response.data;
        return true; // Indica sucesso
      } catch (error) {
        console.error('Erro ao recuperar os dados do usuário', error);
        return false; // Indica falha
      }
    },
    cancelarPedidoAmizade() {
    // Substitua 'amizadeId' pelo ID do documento de amizade que você deseja cancelar.
    // Você pode precisar ajustar a lógica para obter esse ID.
    const amizadeId = this.amizadeId; 

    axios.delete(`/api/amizades/${amizadeId}`)
      .then(() => {
        this.estadoAmizade = 'nenhum';
        this.amizadeId = null; // Adiciona esta linha para resetar o ID

        // Faça qualquer outra coisa necessária após o cancelamento bem-sucedido.
      })
      .catch(error => {
        console.error('Erro ao cancelar pedido de amizade', error);
        // Trate o erro adequadamente.
      });
  },
  verificarEstadoAmizade(usuarioId) {
    this.$nextTick(() => {
    if (this.utilizador && this.utilizador._id) {
      const userIdLogado = this.utilizador._id;
      axios.get(`/api/amizades/verificar/${userIdLogado}/${usuarioId}`)
        .then(response => {
          this.estadoAmizade = response.data.estado;
          this.amizadeId = response.data.amizadeId;
        })
        .catch(error => {
          console.error('Erro ao verificar estado da amizade', error);
          this.estadoAmizade = 'nenhum';
        });
    }
  });
  },

   enviarPedidoAmizade() {
    const userIdLogado = this.utilizador._id // Obtenha o ID do usuário logado
    const usuarioId = this.usuario._id; // ID do usuário visualizado

  axios.post('/api/amizades', {
    idutilizador1: userIdLogado,
    idutilizador2: usuarioId,
    dataAmizade: new Date(),
    estado: 'pendente'
  })
  .then(response => {
    this.estadoAmizade = 'pendente';
    this.amizadeId = response.data._id; // Armazena o novo ID da amizade

  })
  .catch(error => {
    console.error('Erro ao enviar pedido de amizade', error);
  });
},
    navigateTo(path) {
    this.$router.push(path);
  },
  openUserProfile(user) {
    this.$router.push({ name: 'PaginaUtilizador', params: { id: user._id } });
  },

},
async created() {
  if (await this.fetchUserLogado()) { // Espera e verifica se foi bem-sucedido
    this.fetchUserData();
    this.fetchAllPhotos(); // Adicione esta linha para buscar todas as fotos
    this.fetchAmigos();
  if (this.allPhotos.length > 0) {
    this.checkUserReaction(this.allPhotos[this.currentPhotoIndex]._id);
    this.fetchComments(this.allPhotos[this.currentPhotoIndex]._id);
    this.fetchReactionCounts(this.allPhotos[this.currentPhotoIndex]._id);
  }
  } else {
    console.error('Erro: Utilizador logado ainda não definido após fetchUserLogado.');
  }
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

.carousel-control {
  background: none;
  border: none;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 24px;
  color: #333;
}

.carousel-control.left {
  left: -50px;
}

.carousel-control.right {
  right: -50px;
}

.photo {
  display: block;
  max-width: 100%;
  height: auto;
}

.photo-container {
  display: flex;
  flex-direction: column; /* Empilha os elementos verticalmente */
  align-items: center; /* Centraliza os elementos horizontalmente */
  max-width: 400px; /* ou a largura que desejar */
}

.photo-description {
  text-align: center;
  margin-top: 10px; /* Ajuste o espaçamento conforme necessário */
  font-style: italic;
  color: #666; /* Cor cinza para a descrição */
  width: 100%; /* Isso fará com que a descrição se estenda por toda a largura do contêiner */
}

.carousel-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-profile-picture {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.photo-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.reaction-button, .comment-button {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  /* Adicione cores e estilos adicionais conforme necessário */
}

.reaction-button:hover, .comment-button:hover {
  /* Estilos para o estado de hover */
}

.reactions-list {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.reactions-list span {
  font-size: 24px;
  margin: 0 5px;
  cursor: pointer;
}

.reactions-list span.active {
  border: 2px solid blue; /* Estilo para destacar a reação ativa */
}
input[type="text"],
input[type="checkbox"] {
  /* Estilos dos inputs */
}
.user-reaction{
    font-size: x-large;
}


.add-comment {
  display: flex;
  margin-top: 10px;
}

.add-comment input[type="text"] {
  padding: 8px;
  margin: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.add-comment button {
  padding: 6px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.comments-section {
  margin-top: 20px;
}

.comment {
  border-top: 1px solid #ccc;
  padding: 10px;
}

.comment-user-info {
  display: flex;
  align-items: center;
}

.comment-user-picture {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
} 
.reaction-counts span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 5px 10px;
  margin: 5px;
  font-size: 14px;
  font-weight: 500;
}

.reaction-counts span:before {
  content: '';
  display: inline-block;
  margin-right: 5px;
}

.no-comments {
  text-align: center;
  color: #666;
  margin-top: 20px;
}

/* Estilos para os botões e inputs */
button {
  /* Estilos do botão */
}

input[type="text"],
input[type="checkbox"] {
  /* Estilos dos inputs */
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
</style>

