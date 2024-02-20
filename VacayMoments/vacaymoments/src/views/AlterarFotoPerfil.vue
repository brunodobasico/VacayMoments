    <template>
        <div>
            <app-header></app-header>
        </div>
        <div class="add-photo-container">
            <h2 style="text-align: center;">Adicionar/Alterar Foto de Perfil</h2>
            <form @submit.prevent="addPhoto" class="add-photo-form">
                <div class="image-upload-container">
                    <label for="image-upload" class="image-upload-label">
                        <i class="fas fa-plus"></i>
                        <img v-if="imagePreview" :src="imagePreview" class="image-preview" alt="Pré-visualização da imagem" />
                    </label>
                    <input type="file" id="image-upload" name="image" class="image-upload-input" ref="image" @change="previewImage">
                </div>
                <button type="submit" class="submit-button">Adicionar/Alterar Foto</button>
            </form>
        </div>
    </template>

    <script>
    import axios from 'axios';
    import AppHeader from '@/components/AppHeader.vue';

    export default{
        components: {
            AppHeader
        },
        data() {
            return {
                imagePreview: null, // adiciona esta linha 
            };
    },
    methods:{
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
        addPhoto(){
            const formData = new FormData();
            formData.append('image', this.$refs.image.files[0]);
            formData.append('idUtilizador', this.userId);

            axios.put('/api/alterar-foto', formData,{
                headers:{
                    'Content-Type': 'multipart/form-data',
                    'Authorization': 'Bearer ' + localStorage.getItem('userToken') 
                }
            })
            .then(response => {
                console.log('Foto adicionada com sucesso', response.data);
                this.$router.push('/perfil');
            })
            .catch(error => {
                if (error.response) {
                console.error('Erro ao adicionar a foto:', error.response.data);
                } else if (error.request) {
                console.error('Erro ao adicionar a foto:', error.request);
                } else {
                console.error('Erro:', error.message);
                }
            });
        }
    }
    }
    </script>

    <style scoped>
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