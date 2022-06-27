import './style.css'
import Alpine from 'alpinejs'
import { MovieApi } from './app';


window.Alpine = Alpine

Alpine.data('movieApi', MovieApi);
Alpine.start()