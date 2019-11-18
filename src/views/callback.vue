<template lang="pug">
  div.callback
</template>

<script>

export default {
  mounted() {
    const code = this.$route.query.code
    const state = this.$route.query.state
    if (!code || !state) return
    this.$router.replace({
      name: 'home', 
      params: {
        code: code,
        state: state
      }
    })
  }
}
</script>

<style lang="scss" scoped>

</style>
