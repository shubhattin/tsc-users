<script lang="ts">
  import { client } from '~/api/client';
  import { signOut } from '~/lib/auth-client';

  let { name }: { name: string } = $props();

  const get_data = async () => {
    const res = await client.user.user.$get();
    console.log(await res.json());
  };
</script>

<button onclick={get_data}>Fetch</button>
<!-- {name} -->
<button
  onclick={() => {
    signOut();
  }}>Log Out</button
>
