import config from "~/assets/js/config";
export default function ({ $axios, redirect }) {
  $axios.defaults.baseUrl = config.apiServerHost;
  $axios.defaults.withCredentials = true;
}