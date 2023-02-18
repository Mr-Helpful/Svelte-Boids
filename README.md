# Svelte Boids

## Outline

A rewrite of my ancient [Boids Project](https://github.com/Mr-Helpful/Flocking-Boids) in svelte-kit.
Makes use of a custom config menu component with somewhat nice playback API.

Has the same features as the previous project:

- cursor following
- edge avoidance
- word formation (makes use of a basic stippling algorithm)

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
