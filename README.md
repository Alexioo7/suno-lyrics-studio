# 🎵 Suno Lyrics Studio

Application web pour écrire des paroles de chansons et générer des prompts optimisés pour **Suno AI**.

---

## 📋 Table des matières

1. [Installation](#installation)
2. [Lancer en développement](#développement)
3. [Tests](#tests)
4. [Architecture](#architecture)
5. [Exemple de prompt Suno](#exemple-prompt)
6. [Déploiement Vercel](#déploiement)
7. [Extensions et maintenabilité](#extensions)
8. [Améliorations futures](#améliorations-futures)

---

## Installation

```bash
# 1. Cloner le repo
git clone <repo-url>
cd suno-lyrics-studio

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (voir .env.example)

# 4. Créer et migrer la base de données
npx prisma migrate dev --name init

# 5. Générer le client Prisma (si besoin)
npx prisma generate

# 6. Peupler la base avec les données de démo
npm run seed
```

---

## Développement

```bash
# Lancer le serveur de développement
npm run dev
# → http://localhost:3000

# Lancer Prisma Studio (UI base de données)
npm run db:studio

# Linter
npm run lint

# Formatter
npm run format
```

---

## Tests

```bash
# Lancer tous les tests
npm run test

# Mode watch (développement)
npm run test:watch
```

Tests inclus :
- `syllable-counter.test.ts` — compteur de syllabes (edge cases)
- `suno-prompt.test.ts` — générateur de prompts (structure, contenu)
- `emotion-analyzer.test.ts` — analyse émotionnelle et N-grammes

---

## Architecture

```
suno-lyrics-studio/
├── prisma/
│   ├── schema.prisma          # Modèles DB : User, Song, Block, Tag, Version, PromptHistory
│   └── seed.ts                # 1 user + 3 chansons de démo
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # Routes API
│   │   │   ├── songs/         # CRUD chansons + blocs
│   │   │   ├── generate-suno-prompt/  # POST → prompt Suno
│   │   │   ├── analyze-lyrics/        # POST → analyse
│   │   │   └── rhymes/                # GET → rimes
│   │   ├── library/           # Page bibliothèque (/library)
│   │   ├── song/[id]/         # Page éditeur (/song/:id)
│   │   ├── layout.tsx         # Layout racine (fonts, metadata)
│   │   ├── page.tsx           # Redirect → /library
│   │   └── globals.css        # Styles globaux (TipTap, scrollbar, animations)
│   │
│   ├── components/
│   │   ├── editor/
│   │   │   ├── SongEditorLayout.tsx  # Layout 3 colonnes + init store
│   │   │   ├── TopBar.tsx            # Barre supérieure (save, flow, generate)
│   │   │   ├── CenterEditor.tsx      # Liste de blocs + drag & drop
│   │   │   ├── BlockEditor.tsx       # TipTap par bloc + syllabes
│   │   │   ├── SongTimeline.tsx      # Visualisation structure (barres colorées)
│   │   │   └── FlowMode.tsx          # Mode plein écran épuré
│   │   ├── tools/
│   │   │   ├── RightPanel.tsx        # Onglets outils IA
│   │   │   ├── RhymeFinder.tsx       # Chercheur de rimes
│   │   │   ├── GeneratorPanel.tsx    # Hooks, titres, 20 idées, réécriture
│   │   │   └── AnalysisPanel.tsx     # Score chantabilité, émotions, répétitions
│   │   └── library/
│   │       └── LibraryView.tsx       # Bibliothèque (liste, filtres, création)
│   │
│   ├── lib/
│   │   ├── utils/
│   │   │   ├── prisma.ts             # Singleton Prisma Client
│   │   │   ├── syllable-counter.ts   # Compteur syllabes français (heuristique)
│   │   │   ├── rhyme-engine.ts       # Moteur rimes + générateur d'idées
│   │   │   ├── emotion-analyzer.ts   # Analyse émotionnelle + N-grammes
│   │   │   └── suno-prompt-builder.ts # Constructeur prompt Suno structuré
│   │   └── hooks/
│   │       └── use-editor-store.ts   # Store Zustand (éditeur global)
│   │
│   ├── types/
│   │   └── index.ts                  # Types TypeScript partagés
│   │
│   └── __tests__/
│       ├── syllable-counter.test.ts
│       ├── suno-prompt.test.ts
│       └── emotion-analyzer.test.ts
│
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.seed.json
└── vitest.config.ts
```

### Rôle de chaque dossier

| Dossier | Rôle |
|---------|------|
| `prisma/` | Schéma DB, migrations, seed de démo |
| `src/app/api/` | API REST Next.js (Route Handlers) |
| `src/app/library/` | Page liste des projets |
| `src/app/song/[id]/` | Page éditeur (chargement SSR de la chanson) |
| `src/components/editor/` | Éditeur principal : blocs TipTap, timeline, flow |
| `src/components/tools/` | Outils IA : rimes, hooks, analyse |
| `src/components/library/` | Vue bibliothèque client |
| `src/lib/utils/` | Utilitaires purs (sans dépendances UI) |
| `src/lib/hooks/` | Store Zustand partagé entre composants |
| `src/types/` | Types TypeScript centralisés |
| `src/__tests__/` | Tests Vitest |

---

## Exemple de prompt Suno généré

Pour la chanson **"Novembre dans mes veines"** :

```
[Suno AI Prompt — "Novembre dans mes veines"]

== STYLE & PRODUCTION ==
Genre: chanson française
Arrangement: guitare acoustique, cordes légères, accordéon subtil, production épurée
Tempo: 62 BPM
Durée estimée: 3 min 30
Mood: mélancolique, nostalgique, introspectif

== VOIX ==
voix masculine, profonde, émotionnelle
Dynamique: chuchoter sur les verses, intensifier sur le chorus, lâcher tout sur le bridge
Pas de parlé-rap sauf indication contraire

== STRUCTURE ==
[VERSE] → [CHORUS] → [VERSE] → [BRIDGE]

== PAROLES ==
[VERSE]
Les feuilles tombent sans bruit sur le pavé mouillé
Novembre dans mes veines coule comme un adieu
J'ai cherché ton prénom dans chaque rue oubliée
Mais tu es partie avec l'été dans tes cheveux

[CHORUS]
Reste encore, reste encore, le vent m'emporte
Nos souvenirs s'effacent derrière ta porte
Novembre dans mes veines, novembre dans ma voix
Je chante l'hiver qui vient pour ne pas penser à toi

== INSTRUCTIONS SUNO ==
- Intro instrumentale de 4-8 mesures avant le premier verse
- Transition marquée entre verse et chorus (montée en puissance)
- Bridge: rupture harmonique, atmosphère différente
- Outro: fade out instrumental ou reprise du hook à voix nue
- Variations subtiles entre chorus 1 et chorus 2 (add harmonies, layer)
- Ne pas déformer les paroles, les respecter telles quelles

[/Suno AI Prompt]
```

---

## Déploiement Vercel

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Lier le projet
vercel link

# 3. Configurer les variables d'env sur Vercel
# Dans le dashboard Vercel → Settings → Environment Variables :
# DATABASE_URL = postgresql://... (utiliser Neon, PlanetScale ou Supabase)
# NEXTAUTH_SECRET = <secret fort>
# NEXTAUTH_URL = https://votre-domaine.vercel.app

# 4. Déployer
vercel --prod
```

> ⚠️ **Important** : En production sur Vercel, passer de SQLite à PostgreSQL.

---

## Extensions

### Passer de SQLite à PostgreSQL

1. Dans `.env` / variables Vercel :
```
DATABASE_URL="postgresql://user:pass@host/db?schema=public"
```

2. Dans `prisma/schema.prisma`, changer :
```prisma
datasource db {
  provider = "postgresql"  # ← remplacer "sqlite"
  url      = env("DATABASE_URL")
}
```

3. Ré-migrer :
```bash
npx prisma migrate dev --name switch-to-postgres
```

### Connecter un vrai moteur IA (OpenAI, Mistral...)

Dans `src/app/api/generate-suno-prompt/route.ts`, remplacer la logique `buildSunoPrompt()` par un appel API :

```typescript
// Exemple avec OpenAI
const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: "Tu es un expert en paroles de chansons..." },
    { role: "user", content: `Génère un prompt Suno pour : ${lyrics}` }
  ]
});
return completion.choices[0].message.content;
```

Ajouter `OPENAI_API_KEY` dans `.env`.

### Multi-tenant / Organisations

1. Ajouter un modèle `Organization` dans le schéma Prisma
2. Lier `User` → `Organization` (many-to-many)
3. Ajouter `organizationId` sur `Song`
4. Filtrer toutes les queries par `organizationId` dans les routes API
5. Utiliser NextAuth avec un provider OAuth pro (Google Workspace, etc.)

---

## Améliorations futures

1. **Export multi-format** : Export PDF stylisé des paroles, export Word, export JSON pour Suno API quand elle sera disponible.

2. **Collaboration temps réel** : Intégration Yjs + WebSockets pour co-écriture avec curseurs multiples (comme Figma).

3. **IA avancée** : Intégration Mistral/GPT-4 pour générer des paroles complètes à partir d'un thème, avec contrôle de style et de longueur via des sliders.
