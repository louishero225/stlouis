# Configuration Backblaze B2

Ce projet utilise **Backblaze B2** pour le stockage des médias via l'API S3-compatible.

## 📋 Prérequis

1. Un compte Backblaze B2
2. Un bucket créé (ex: `stlouis-media`)
3. Une Application Key avec accès au bucket

## 🔧 Configuration

### 1. Créer une Application Key dans Backblaze

1. Allez dans **Application Keys**
2. Créez une nouvelle clé avec accès à votre bucket
3. Notez :
   - **keyID** (commence par `00X...`)
   - **applicationKey** (la clé secrète - ne sera affichée qu'une fois !)
   - **Endpoint** (ex: `s3.us-west-004.backblazeb2.com`)

### 2. Configurer les variables d'environnement

Ajoutez ces lignes à votre fichier `.env.local` :

```env
# Backblaze B2 Configuration
NEXT_PUBLIC_BACKBLAZE_ENDPOINT=s3.us-west-004.backblazeb2.com
NEXT_PUBLIC_BACKBLAZE_REGION=us-west-004
NEXT_PUBLIC_BACKBLAZE_KEY_ID=00X...votre-key-id
NEXT_PUBLIC_BACKBLAZE_APP_KEY=K00X...votre-app-key
NEXT_PUBLIC_BACKBLAZE_BUCKET=stlouis-media
```

### 3. Structure des dossiers dans le bucket

Le bucket `stlouis-media` doit contenir ces dossiers :

```
stlouis-media/
├── announcements/     # Images des annonces
├── avatars/          # Avatars des utilisateurs
├── books/            # Couvertures de livres
├── events/           # Images des événements
├── gallery/          # Photos de la galerie
├── groups/           # Logos des groupes
├── homelies/         # Images des homélies
├── notifications/    # Images des notifications
├── parishes/         # Logos des paroisses
├── team/             # Photos de l'équipe pastorale
└── thumbnails/       # Miniatures générées
```

## 📦 Dépendances

Le projet utilise le SDK AWS S3 pour communiquer avec Backblaze :

```bash
npm install @aws-sdk/client-s3
```

## 🚀 Utilisation

Le composant `ImageUpload` gère automatiquement l'upload :

```tsx
<ImageUpload
    value={imageUrl}
    onChange={setImageUrl}
    folder="events"  // Le dossier cible dans le bucket
/>
```

Les dossiers disponibles :
- `events` - Pour les événements
- `announcements` - Pour les annonces
- `notifications` - Pour les notifications
- `groups` - Pour les groupes
- `team` - Pour l'équipe pastorale
- `parishes` - Pour les logos de paroisses
- `avatars` - Pour les avatars
- `books` - Pour les livres
- `gallery` - Pour la galerie
- `homelies` - Pour les homélies

## 🔒 Sécurité

- Les clés d'API ne doivent **JAMAIS** être commitées dans Git
- Utilisez `.env.local` qui est dans `.gitignore`
- Les fichiers sont publiquement accessibles via URL
- Configurez les CORS dans Backblaze si nécessaire

## 🌐 URL des fichiers

Les fichiers uploadés sont accessibles à :
```
https://stlouis-media.s3.us-west-004.backblazeb2.com/folder/filename.jpg
```

## ⚡ Migration depuis Supabase

Si vous aviez des fichiers sur Supabase Storage :
1. Téléchargez tous les fichiers depuis Supabase
2. Uploadez-les dans les dossiers correspondants sur Backblaze
3. Mettez à jour les URLs dans la base de données
