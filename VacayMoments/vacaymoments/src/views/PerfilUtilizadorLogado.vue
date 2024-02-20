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

  <!-- Seção de Adicionar Amigo -->
  <div class="add-friend-section">
    <button type=" button" class="btn btn-success btn-lg botao-definicoes" style="padding" @click.prevent="navigateTo('/alterarfoto')">Alterar Foto de Perfil</button>
    <button type=" button" class="btn btn-success btn-lg botao-definicoes" >Alterar Nome</button>
    <button type=" button" class="btn btn-success btn-lg botao-definicoes">Alterar Password</button>
  </div>
  <div class="friends-list-section">
  <h3>Amigos</h3>
  <ul>
    <li v-for="amigo in amigos" :key="amigo._id" class="friend-item" @click="openUserProfile(amigo)">
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
        <button v-if="allPhotos[currentPhotoIndex]" @click="deletePhoto(allPhotos[currentPhotoIndex]._id)" class="delete-photo-btn" style="border: none;">🗑️ Eliminar Foto</button>
        <img v-if="allPhotos[currentPhotoIndex]" :src="allPhotos[currentPhotoIndex].imagePath" alt="User Photo" class="photo">
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
        <button v-if="allPhotos.length > 1" class="carousel-control right" @click="nextPhoto">&gt;</button>
      </div>
    </div>
    <div class="comments-section">
    <template v-if="currentPhotoComments.length > 0">
      <div class="comment" v-for="comment in currentPhotoComments" :key="comment._id">
        <div class="comment-user-info">
          <img :src="comment.userPhoto || defaultAvatar" alt="" class="comment-user-picture">
          <span>{{ comment.userName }}</span>
          <button style="border: none;" v-if="comment.userId === usuario._id" @click="deleteComment(comment._id)">🗑️</button>
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
    userPhotos: [], // Adiciona esta linha para armazenar as fotos do usuário
    defaultAvatar,
    currentPhotoIndex: 0,
    currentPhoto: {}, 
    amigos:[],
    emojis: [], // adicione esta linha se "emojis" for uma lista que você irá iterar
    showReactions: false, // Estado para controlar a visibilidade das reações
    userReaction: null, // Estado para armazenar a reação do usuário para a foto atual
    newComment: '', // Para armazenar o novo comentário digitado pelo usuário
    showCommentBox: false, // novo estado para controlar a exibição da caixa de comentário
    currentPhotoComments: [], // Armazena os comentários da foto atual  
    reactionCounts: {}, // Inicialize como um objeto vazio ou como necessário
    allPhotos: [], // Armazena todas as fotos, excluindo as do usuário logado
    
  };
},
watch: {
  currentPhotoIndex(newIndex) {
    const currentPhoto = this.allPhotos[newIndex];
    if (currentPhoto) {
      this.checkUserReaction(currentPhoto._id);
      this.fetchComments(currentPhoto._id); // Adicionar esta linha
      this.fetchReactionCounts(currentPhoto._id)
    }
  }
},
methods: {
  deletePhoto(fotoId) {
    if (confirm("Tem certeza que deseja eliminar esta foto?")) {
      axios.delete(`/api/foto/${fotoId}`, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('userToken') }
      })
      .then(() => {
        alert("Foto eliminada com sucesso!");
        this.fetchUserPhotos(); // Atualizar a lista de fotos após a exclusão
      })
      .catch(error => {
        console.error('Erro ao eliminar a foto', error);
        alert("Ocorreu um erro ao tentar eliminar a foto.");
      });
    }
  },
  fetchAmigos() {
    axios.get('/api/amizades/meusamigos', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('userToken')
      }
    })
    .then(response => {
      this.amigos = response.data; // Assuming the API returns a list of friend objects
      console.log("estou aqui");
      console.log(this.amigos);
    })
    .catch(error => {
      console.error('Erro ao buscar amigos', error);
    });
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
  openUserProfile(amigo) {
    this.$router.push({ name: 'PaginaUtilizador', params: { id: amigo._id } });
  },
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
  this.fetchUserPhotos(); // Chame o método para buscar as fotos após obter os dados do usuário

})
.catch(error => {
  console.error('Erro ao recuperar os dados do usuário', error);
});
  },
  fetchUserPhotos() {
      // Substitua '/api/user-photos' pelo seu endpoint correto
      axios.get('/api/minhas-fotos', {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('userToken')
        }
      })
      .then(response => {
        this.allPhotos = response.data;
        if (this.allPhotos.length > 0) {
            this.currentPhotoIndex = 0; // Assegure-se de que o índice da foto atual está definido
            this.fetchComments(this.allPhotos[this.currentPhotoIndex]._id); // Agora buscamos os comentários para a foto atual
            this.checkUserReaction(this.allPhotos[this.currentPhotoIndex]._id);
            this.fetchReactionCounts(this.allPhotos[this.currentPhotoIndex]._id);
          }
      })
      .catch(error => {
        console.error('Erro ao recuperar fotos do usuário', error);
      });
    },
  logout() {
    localStorage.removeItem('token'); // Remover o token do localStorage
    this.$router.push('/login'); // Redirecionar para a página de login
  },
},
created() {
    this.fetchUserData(); // Buscar os dados do utilizador quando o componente é criado   
    this.fetchUserPhotos();
    this.fetchAmigos();
    if (this.allPhotos.length > 0) {
      this.checkUserReaction(this.allPhotos[this.currentPhotoIndex]._id);
      this.fetchComments(this.allPhotos[this.currentPhotoIndex]._id);
      this.fetchReactionCounts(this.allPhotos[this.currentPhotoIndex]._id);
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
  /* Estilos existentes ... */
  display: flex;
  justify-content: center; /* Centraliza a imagem horizontalmente */
  align-items: center; /* Centraliza a imagem verticalmente */
  overflow: hidden; /* Previne que a imagem ultrapasse o photo-card */
}

.photo {
  max-width: 100%; /* Faz a imagem ocupar no máximo 100% da largura do photo-card */
  max-height: 300px; /* Limita a altura da imagem, ajuste conforme necessário */
  height: auto; /* Mantém a proporção da imagem */
  border-radius: 10px; /* Arredonda os cantos da imagem */
  /* Outros estilos... */
}

.photo-description {
  text-align: center;
  margin-top: 10px; /* Ajuste o espaçamento conforme necessário */
  font-style: italic;
  color: #666; /* Cor cinza para a descrição */
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

.carousel-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.photo-card {
  /* Sua estilização existente... */
  max-width: 600px; /* ou a largura que desejar */
  overflow: hidden;
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
  /*max-width: 600px; /* ou a largura que desejar */
  max-height: 600px;
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

/* .friend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
} */

.friend-picture {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.btn-danger {
  /* Estilos para o botão de eliminar */
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  margin-left: 10px;
}
.no-comments {
  text-align: center;
  color: #666;
  margin-top: 20px;
}
.btn-danger:hover {
  background-color: #c82333;
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

input[readonly] {
  background-color: #e9ecef; /* Cor de fundo para campos readonly */
  color: #495057; /* Cor do texto para campos readonly */
  cursor: not-allowed; /* Muda o cursor para indicar que o campo não é editável */
}
</style>