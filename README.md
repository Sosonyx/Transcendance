# *This project has been created as part of the 42 curriculum by ihadj, jferrand, tchevall, tfiette, tlecuyer.*


# Transcendence — Qui est l'IA ?


## Description

**Qui est l'IA** is a real-time, multiplayer **social-deduction web game** built around a simple twist: one (or more) of the players in the room is an AI powered by Anthropic's **Claude**. Players chat anonymously, answer questions, and must figure out **who is the AI** before time runs out.

Each round, every player is given a **random pseudonym and color** so nobody knows who is who. The game then flows through several phases:

1. **Lobby** — players gather; in custom rooms the host configures the game.
2. **Action 1 / Action 2** — players (and the AI) propose and answer a shared question.
3. **Chat** — everyone discusses anonymously in real time.
4. **Vote** — players vote for who they think is the AI (or who to eliminate).
5. **Round result & Score** — identities are revealed and scores updated.

The game supports two modes:

- **Score mode** — you earn points for either correctly identifying the AI or being taken for the AI; first to the score objective wins.
- **Elimination mode** — players are voted out each round until only a few humans remain (or the AI is found).

### Key features

- Anonymous, real-time multiplayer rooms (matchmaking **and** custom rooms).
- A **Claude-powered AI opponent** that chats, asks/answers questions and tries to blend in.
- **Score** and **Elimination** game modes with configurable parameters.
- Full **user management**: email/password sign-up & login, profile editing, avatar upload.
- **Remote authentication** via **42 Intra** and **Google** OAuth.
- **Friends system** and **private real-time chat** between friends.
- Global **leaderboard** based on games played and win rate.
- Fully **containerized** deployment behind an **HTTPS** Nginx reverse proxy.
- Fully **responsive** website.


## Instructions

### Prerequisites

| Tool 				| Recommended version 	|
|-------------------|-----------------------|
| Docker 			| ≥ 24 					|
| Docker Compose 	| v2 (`docker compose`) |
| GNU Make 			| any recent version 	|

You also need a few **credentials/secrets** (see `.env` setup below):

- A **PostgreSQL** user/password/database name.
- A long random **JWT secret**.
- An **Anthropic API key** (for the Claude AI opponent).
- **42 Intra** and **Google** OAuth client IDs/secrets (for remote authentication).

### 1. Clone the repository

### 2. Configure the environment

Copy the provided example file and fill in your own values:
```bash

cp .env.example .env
```

Then edit `.env`:
```
PORT="8080"

JWT_SECRET="change_me_a_real_long_random_string"

POSTGRES_USER="transcendence"
POSTGRES_PASSWORD="a_strong_password"
POSTGRES_DB="transcendence"
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/transcendence"

ANTHROPIC_API_KEY="sk-ant-api..."

INTRA_CLIENT_ID="..."
INTRA_CLIENT_SECRET="..."

GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

IP_ADD="..." // This variable will be automatically set during the make process !

```

### 3. Build and run
```bash

make
```

This builds and starts every service via Docker Compose:
- **postgres** — the database.
- **backend** — Fastify + Socket.IO API (auto-runs Prisma generate & migrations).
- **frontend** — the React build served by Nginx (HTTPS reverse proxy).

### 4. Open the app

Open **https://${IP_ADD}:8080** in the browser of your choice. (We recommend Google Chrome, Firefox, or Edge).

### 5. Optional: set the API keys to enable OAuth

42 : 
Connect to your intra > profile settings > API panel > register a new APP > fill the informations > add the redirect URI 'https://${IP_ADD}:8080/api/auth/42/callback'

Google : (Supported in localhost only)
Go on https://console.cloud.google.com/apis/library> open the left panel > API and services > credentials > create a new project > create credentials > OAuth client > follow the instructions

### Useful Makefile targets
```bash

make		# build + run (detached)
make stop	# stop the containers
make clean	# stop + remove containers
make fclean # clean + remove volumes (wipes the database)
make re		# full rebuild
```

## Resources

### Documentation & references

- [Fastify documentation](https://fastify.dev/docs/latest/)
- [Socket.IO documentation](https://socket.io/docs/v4/)
- [Prisma ORM documentation](https://www.prisma.io/docs)
- [React documentation](https://react.dev/)
- [PostgreSQL documentation](https://www.postgresql.org/docs/)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [JWT introduction](https://jwt.io/introduction)
- [@fastify/oauth2](https://github.com/fastify/fastify-oauth2)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

### Use of AI

- **As a product feature:** Anthropic's **Claude** is integrated as the in-game AI
  opponent. It receives the anonymized conversation context and the current game phase,
  and decides (via tool-calling) whether to ask a question, answer, send a chat message,
  stay silent, or vote. See `src/backend/llm/`.

- **As a development aid:** 
	This project, before all, is a school Project made for learning. We tried to use AI as a learning tool, and to not rely to much on it. Furthermore, even between us, we have different views on AI and therefore had different usages of it.

	AI assistants were used for :
		- exploring new concepts
		- debugging
		- reviewing code
		- generating long lists of values
		- iterating on the CSS
		- writing the README, the ToS, and the Privacy Policy
	All AI-generated code was reviewed and adapted by mutiple team members.

---


## Team Information

| Member (login) 	| Role(s) 						| Responsibilities 							|
|-------------------|-------------------------------|-------------------------------------------|
| `<ihadj>`			| Product Owner / FullStack 	| Agentic deployment, site UI 				|
| `<jferrand>` 		| Tech Lead / Frontend			| Socket.IO architecture, game UI/UX		|
| `<tchevall>`		| Project Manager / Backend		| Auth & security, Database architecture 	|
| `<tfiette>`		| Tech Lead / Backend			| Game logic								|
| `<tlecuyer>`		| Project Manager / DevOps		| Project infrastructure, Llm API			|


## Project Management

- **Work organization:** weekly sprints, feature branches, code reviews via PRs
- **Project management tools:** GitHub, Trello, Notion, Miro
- **Communication channels:** Discord, in-person at 42
- **Branching strategy:** feature branches (`feat/...`, `fix/...`, `refacto/...`) merged into the
  development branches (`dev_v0`, `dev_v1`).


## Technical Stack

### Frontend

- **React** + **TypeScript** — component-based UI, typing safety and same langage front/back.
- **Vite** — dev server and fast iteration.
- **Socket.IO client** — real-time game and chat events.
- **CSS/StyledComponents** — custom styling with StyledComponents.
- **Nginx** — serves the static build and acts as an HTTPS reverse proxy.

### Backend

- **Node.js** + **TypeScript**. - typing safety and same langage front/back
- **Fastify** — HTTP API framework.
- **Socket.IO** — WebSocket server for the game loop and live chat.
- **Anthropic SDK (`@anthropic-ai/sdk`)** — Claude integration for the AI opponent.

### Database

- **PostgreSQL** — relational database.
- **Prisma ORM** — schema, migrations and type-safe queries.
> **Why PostgreSQL + Prisma?** The data model is highly relational (users, games,
> players, friendships, messages, OAuth accounts), which fits a SQL database naturally.
> Prisma provides type-safe queries, automatic migrations and protection against SQL
> injection.

### Other
- **Docker / Docker Compose** — containerization and one-command deployment.
- **Make** — orchestration entry point.


## Database Schema

The schema is defined in `src/backend/prisma/schema.prisma`.

### Tables and relationships
- **User** — core account. Has many `Player` records (game history), `Friendship`,
  `Message` (sent/received) and `OAuthAccount`.
- **OAuthAccount** — links a `User` to an external provider (42 / Google).
  Unique on `(provider, providerId)`.
- **BlacklistedToken** — JWTs invalidated at logout (token blacklist).
- **Room** — a game room; has many `Game`.
- **Game** — a single game inside a room; has many `Player`.
- **Player** — a participant in a game (human **or** AI), with score/won flags.
  Optionally linked to a `User`.
- **Friendship** — directed relation between two `User`s.
- **Message** — a private chat message between two `User`s.


## Features List

| Feature 				| Description 														| Author(s)		|
|-----------------------|-------------------------------------------------------------------|---------------|
| Email/password auth	| Sign-up & login, bcrypt-hashed passwords, JWT in HTTP-only cookie	| `tchevall` 	|
| OAuth login			| Remote auth via 42 Intra and Google								| `tchevall` 	|
| Profile management	| Edit username, upload avatar										| `tchevall` 	|
| Friends system		| Add/remove/list friends											| `tlecuyer` 	|
| Private chat			| Real-time 1-to-1 chat between friends 							| `tlecuyer` 	|
| Leaderboard 			| Ranking by win rate and games won 								| `ihadj`	 	|
| Game engine			| Room/round state machine, matchmaking & custom rooms 				| `tfiette` 	|
| Game modes 			| Score and Elimination modes with configurable settings 			| `tfiette` 	|
| AI opponent 			| Claude-driven player (question/answer/chat/vote) 					| `ihadj` 		|
| Real-time UI 			| React panels driven by Socket.IO events 							| `jferrand` 	|
| Deployment 			| Docker Compose, Nginx HTTPS reverse proxy 						| `tlecuyer` 	|


## Modules

| Category							| Module						| Type	| Implementation		|
|-----------------------------------|-------------------------------|-------|-----------------------|
| Web								| Frontend framework			| minor	| React					|
| Web								| Backend framework				| minor	| Fastify				|
| Web								| Websockets					| major	| Socket.io				|
| Web								| User interaction				| major	| User profile panel	|
| Web								| Custom design system			| minor	| Component based CSS	|

| Accessibility and internalization	| Additional browsers support	| minor | Chrome, Firefox, Edge |

| User management					| User management and auth...	| major | login, hash pass...	|
| User management					| OAuth 2.0						| minor | Google, 42 APIs		|

| Artificial intelligence			| AI Opponent					| major | AI decision making	|
| Artificial intelligence			| LLM systeme interface			| major | Llm outputs			|
| Artificial intelligence			| Sentiment analysis			| minor | Contextual adaptation	|

| Gaming and user experience		| Web based game				| major | Hosted game panel		|
| Gaming and user experience		| Remote players				| major | Nginx + ip porting	|
| Gaming and user experience		| Multiplayer					| major | Authoritarian server	|

| Modules of choice					| Multiple game mode and		| major | See below...			|
|									| game customization			|		|						|

### MODULES OF CHOICE

`**Why:** The game was thought to be played either by strangers, or by friends. Therefore, we wanted to explore the possibilities to :
1) Shape the game to play in a chat of up to 200 players ( 100 humans / 100 IAs )
2) To propose different interaction's dynamics with the IA

**Technical Difficulties:**  To achieve this module we had to rework: 
1) The matchmaking/reconnection logic
2) The game core logic to accept and work around different configurations
3) The server / game communication to correctly display modifications
4) The server / game communication to allow a spectator mode

For these reasons, and for how it impacted so many different parts of our project, we believe it's worth the major qualification.

**Added Value:** This project is a proof of concept, exploring different directions is necessary and the customization allows to explore widely different setups. 
Furthermore, since it's a game, it's just pleasant to be able to customize the rules based on your decisions. We had a lot of fun with it, just try it for yourself !

### TOTAL OF POINTS : 24

## Individual Contributions


### `ihadj`
- **Worked on:** 
	I focused mainly on the AI agent, the most challenging part for me. Even with the right tools and a solid prompt, a poorly designed agent (on the logic side) led to weak gameplay: the AI kept falling into the same patterns and the same way of speaking. Getting it to feel varied and believable took real iteration.

	I then moved on to the frontend, fine-tuning the website to match the exact vibe the team wanted to convey.

	Finally, taking on the Product Owner role was a challenge in itself. Aligning everyone's vision taught me a lot about product direction, organization, and progress tracking.

### `jferrand>`
- **Worked on:**
	Socket.IO architecture: Designed and implemented the real-time communication layer between the game server and the frontend. This includes the connection handshake (passing user identity and game mode at connect time), event routing between the game logic and the client, and the room assignment flow.
	Game UI: Built the complete game interface in React + TypeScript + Vite, following a component-based architecture. Each game phase maps to a dedicated panel component with its own logic and styling. The UI provides continuous visual feedback: a live countdown timer with urgency animation, phase transition overlays, a persistent scoreboard, and animated result screens.
	Responsive design: Implemented a fully responsive layout adapting the interface between desktop (side-by-side game container and side panel) and mobile (tab-based navigation between Chat, Vote, and Score views) without remounting components to preserve local state across tab switches.
- **Challenge & solution:**
	Learning TypeScript and React from scratch was the initial hurdle, resolved through multiple tutorials. The most significant technical challenge was integrating the Vote panel alongside the Chat during the vote phase while keeping the interface readable and responsive. After several layout attempts, the solution was a tab system on mobile that conditionally shows the Vote panel in the side panel slot on desktop, using CSS visibility instead of conditional rendering to preserve vote state across tab switches.

### `tchevall`
- **Worked on:** 
	Database setup (PostgreSQL)
    ORM implementation (Prisma)
    -Backend site (/api) → OAuth / Routes / Auth (login / register)
    -Frontend site (React)
- **Challenge & solution:**
    Learning a fully new stack from scratch (TypeScript, Prisma, PostgreSQL, React) within a tight project deadline
    Designing a relational schema and managing it through Prisma migrations
    Implementing JWT-based authentication with token blacklisting
    Setting up OAuth2 flows for both Google and 42 intranet providers
    Structuring a Fastify backend with clean plugin/hook separation and public/private route distinction
    Tackled each challenge incrementally, prioritizing deep understanding over quick fixes, resulting in a more robust and maintainable architecture

### `tfiette`
- **Worked on:**
	Designing and implementing the game, making it communicate with the server
- **Challenge & solution:**
	It was my first time working on a multiplayer game, and one of the challenges was to host multiple games, with multiple players, without breaking everything. 

	I directly decided on some architecture principles after looking for documentation (https://straypixels.net/sts2-multiplayer-timeline/) :
	The pattern of communication with rooms as EventEmitters (call down, signal up) / the roomManager as an accessor / the room as an autoritharian source of informations with a strict state machine logic

	It was as well my first time working on a team of this size, and prioritized planning and communication with colleagues whose work would be linked to me, and finding solution for working autonoumously (CLI to simulate web events)

	It was also my first time working with typescript, but I already add experiences with typed langages so I was able to produce code after two days of tutorial, and kept refining my understanding of the langage through time.
	For me, the biggest challenge was actualy to work on the tight deadline (5 weeks) that we put on ourselves for personal reasons, and I think that I would refactor the game logic differently if I had the opportunity, and I would better exploit typescript possibilities. I would also like to add better event acknowledgment as well, and refine the room assignement logic.

### `tlecuyer`
- **Worked on:**
	AI-API connection: explored different LLM possibilities, implemented the first prompt structure and the LLM player.
	Docker-supported services and HTTPS connection.
	Friends list and chat on the profile page.
- **Challenge & solution:**
	Designing an effective and secure server architecture solved by using a fully containerized solution separating the different services.
	Implementing a new feature inside a Fastify server, reusing already-configured parameters such as HTTPS routes and Socket.io services.
	Connecting an LLM as a game client led to mastering the Claude API inside a TypeScript program.

## Credits
- Built as part of the **42 curriculum** (`ft_transcendence`).
- AI opponent powered by **Anthropic Claude**.
