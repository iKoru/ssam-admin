import Vue from 'vue';
import moment from 'moment';

//Vue.prototype.$moment = moment;
if (!Vue.prototype.$moment) Object.defineProperty(Vue.prototype, '$moment', { value: moment });