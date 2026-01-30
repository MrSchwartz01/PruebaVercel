import apiClient from '@/services/api';
import { API_BASE_URL } from '@/config/api';

export default {
  name: "CarouselBanner",
  data() {
    return {
      banners: [],
      activeBanner: 0,
      intervalId: null,
    };
  },
  async created() {
    await this.fetchBanners();
    this.startCarousel();
  },
  beforeUnmount() {
    this.stopCarousel();
  },
  methods: {
    async fetchBanners() {
      try {
        const response = await apiClient.get("/tienda/banners");
        this.banners = response.data.data || response.data;
      } catch (error) {
        
        console.error("Error al obtener los banners:", error);
      }
    },
    startCarousel() {
      if (this.banners && this.banners.length > 0) {
        this.intervalId = setInterval(() => {
          this.nextBanner();
        }, 6000);
      }
    },
    stopCarousel() {
      if (this.intervalId) clearInterval(this.intervalId);
    },
    getFullImageUrl(relativeUrl) {
      return `${API_BASE_URL.replace('/api', '')}${relativeUrl}`;
    },
    prevBanner() {
      this.activeBanner =
        (this.activeBanner - 1 + this.banners.length) % this.banners.length;
    },
    nextBanner() {
      this.activeBanner = (this.activeBanner + 1) % this.banners.length;
    },
    setBanner(index) {
      this.activeBanner = index;
    },
    handleImageLoad(event) {
      event.target.classList.add("loaded"); // Añade la clase `loaded` al cargar la imagen
    },
  },
};