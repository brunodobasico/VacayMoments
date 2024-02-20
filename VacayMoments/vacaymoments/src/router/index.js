import { createRouter, createWebHistory } from 'vue-router';
import UserLogin from '@/views/UserLogin.vue';
import UserRegisto from '@/views/UserRegisto.vue';
import PaginaInicial from '@/views/PaginaInicial.vue';
import PaginaUtilizador from '@/views/PaginaUtilizador.vue';
import AdicionarFoto from '@/views/AdicionarFoto.vue';
import PerfilUtilizadorLogado from '@/views/PerfilUtilizadorLogado.vue';
import AlterarPassword from '@/views/AlterarPassword.vue';
import AlterarNome from '@/views/AlterarNome.vue';
import AlterarFotoPerfil from '@/views/AlterarFotoPerfil.vue';



const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'UserLogin',
      component: UserLogin
    },
    {
      path: '/registo',
      name: 'UserRegisto',
      component: UserRegisto
    },
    {
      path: '/paginainicial',
      name: 'PaginaInicial',
      component: PaginaInicial
    },
    {
      path: '/adicionarfoto',
      name: 'AdicionarFoto',
      component: AdicionarFoto
    },
    {
      path: '/perfil',
      name: 'PerfilUtilizadorLogado',
      component: PerfilUtilizadorLogado
    },
    {
      path: '/alterarpassword',
      name: 'AlterarPassword',
      component: AlterarPassword
    },
    {
      path: '/alterarnome',
      name: 'AlterarNome',
      component: AlterarNome
    },
    {
      path: '/paginautilizador/:id',
      name: 'PaginaUtilizador',
      component: PaginaUtilizador,
    },
    {
      path: '/alterarfoto',
      name: 'AlterarFotoPerfil',
      component: AlterarFotoPerfil,
    },
    // ... outras rotas
  ],
});

export default router;
