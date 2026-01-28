import axios from "axios";

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
        const response = await axios.get("/Banners");
        this.banners = response.data.data;
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
      return `http://192.168.2.117:5000${relativeUrl}`;
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