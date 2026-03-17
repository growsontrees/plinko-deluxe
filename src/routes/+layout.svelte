<script lang="ts">
  import ogImage from '$lib/assets/og_image.jpg';
  import type { Snippet } from 'svelte';
  import '../app.css';

  let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
  <title>Plinko</title>

  <!-- Google Search Console Verification -->
  <meta name="google-site-verification" content="PXRNeMbi-a0P7FSZsTTdb-7EPSg3iLkRZU8z_iXA13s" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
    rel="stylesheet"
  />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Plinko Deluxe - Free Plinko Game" />
  <meta property="og:url" content="https://free-plinko-web-game.netlify.app/" />
  <meta property="og:image" content={ogImage} />
  <meta property="og:description" content="Free-to-play Plinko game inspired by The Price Is Right. Drop balls, win big! No sign-up required." />
</svelte:head>

{@render children?.()}
