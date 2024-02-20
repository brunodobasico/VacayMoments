<template>
<div>
    <app-header></app-header>
</div>
    <div class="add-photo-container">
    <h2 style="text-align: center;">Adicionar nova Foto</h2>
    <form @submit.prevent="addPhoto" class="add-photo-form">
      <div class="image-upload-container">
    <label for="image-upload" class="image-upload-label">
      <i class="fas fa-plus"></i>
      <img v-if="imagePreview" :src="imagePreview" class="image-preview" alt="Pré-visualização da imagem" />
    </label>
    <input type="file" id="image-upload" name="image" class="image-upload-input" ref="image" @change="previewImage">
  </div>
      <div class="form-group">
        <label for="tags">Tags</label>
        <input type="text" id="tags" v-model="newPhoto.tags" placeholder="Insira tags">
      </div>

      <div class="form-group">
        <label for="privacy">Privacidade</label>
        <select id="privacy" v-model="newPhoto.privacy">
          <option value="public">Pública</option>
          <option value="private">Privada</option>
          <option value="friends">Amigos</option>
        </select>
      </div>

      <div class="form-group">
        <label for="location">Localização</label>
        <input type="text" id="location" v-model="newPhoto.location" placeholder="Adicione a localização">
      </div>

      <div class="form-group">
        <label for="description">Descrição</label>
        <textarea id="description" v-model="newPhoto.description" placeholder="Escreva uma descrição"></textarea>
      </div>

      <button type="submit" class="submit-button">Adicionar Foto</button>
    </form>
  </div>
</template>
  <script>
  import axios from 'axios';
  import AppHeader from '@/components/AppHeader.vue';


export default {

  components: {
    AppHeader
  },
  data() {
    return {
      newPhoto: {
        tags: '',
        privacy: 'public',
        location: '',
        description: ''
      },
        imagePreview: null, // adiciona esta linha
    };
  },
  methods: {
    previewImage(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    addPhoto() {
  const formData = new FormData();
  formData.append('image', this.$refs.image.files[0]);
  formData.append('descricao', this.newPhoto.description);
  formData.append('tags', this.newPhoto.tags);
  formData.append('privacidade', this.newPhoto.privacy);
  formData.append('localizacao', this.newPhoto.location);
  // Supondo que você tem o ID do usuário disponível
  formData.append('idUtilizador', this.userId);

  axios.post('/api/foto', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${localStorage.getItem('userToken')}`
    }
  })
  .then(response => {
    console.log('Foto adicionada com sucesso', response.data);
    // Tratamento após adição bem-sucedida
    alert('Foto adicionada com sucesso');
    // Redirecionar para /paginautilizador
      this.$router.push('/perfil');

  })
  .catch(error => {
    if (error.response) {
      // O servidor respondeu com um status diferente de 2xx
      console.error('Erro ao adicionar a foto:', error.response.data);
    } else if (error.request) {
      // O pedido foi feito, mas nenhuma resposta foi recebida
      console.error('Erro ao adicionar a foto:', error.request);
    } else {
      // Algo aconteceu na configuração do pedido que desencadeou um erro
      console.error('Erro:', error.message);
    }
  });
}


  }
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
.add-photo-container {
  max-width: 500px;
  margin: 50px auto;
  
  padding: 20px;
  padding-top: 80px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

.add-photo-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input[type="text"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.image-upload-container {
  text-align: center;
  margin-bottom: 15px;
}

.image-upload-label {
  display: inline-block;
  width: 300px;
  height: 200px;
  border: 1px dashed #ccc;
  line-height: 100px;
  text-align: center;
  cursor: pointer;
}

.image-upload-label i {
  font-size: 24px;
  vertical-align: middle;
}

.image-upload-input {
  display: none;
}

.submit-button {
  padding: 10px 20px;
  background-color: #5cb85c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #4cae4c;
}

.image-preview {
    max-width: 100%; /* Limita a largura da pré-visualização */
    max-height: 200px; /* Limita a altura da pré-visualização */
    object-fit: contain; /* Mantém a proporção sem cortar a imagem */
    border: 1px solid #ccc; /* Adiciona uma borda se desejar */
    border-radius: 4px; /* Arredonda os cantos da imagem */
    margin-top: 10px; /* Espaço acima da imagem */
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