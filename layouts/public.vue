<template>
  <div id="appRoot">
    <v-app id="inspire" class="app">
      <v-content>
        <div class="page-wrapper">
          <nuxt></nuxt>
        </div>
        <!-- App Footer -->
      </v-content>
      <v-footer height="auto" class="white pa-3 app--footer" fixed>
        <span class="caption">pedagy &copy; {{ new Date().getFullYear() }}</span>
        <v-spacer></v-spacer>
        <span class="caption mr-1">Make With Love</span>
        <v-icon color="pink" small>favorite</v-icon>
      </v-footer>
    </v-app>
  </div>
</template>
<script>
export default {
};
</script>
