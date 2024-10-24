# 🚀 DocMaker - Dynamic Document Generation API

![Status](https://img.shields.io/badge/Status-WIP-yellow?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-v16+-green?style=for-the-badge&logo=node.js)
![NestJS](https://img.shields.io/badge/NestJS-Framework-red?style=for-the-badge&logo=nestjs)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?style=for-the-badge&logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Supported-blue?style=for-the-badge&logo=docker)

**DocMaker** est une API puissante permettant de générer automatiquement des documents à partir de templates Word et d'y injecter dynamiquement des données. Le tout est converti en PDF et rendu accessible via une URL sécurisée, avec des fonctionnalités avancées de gestion des métriques et des restrictions d'accès.

---

## 🎯 Fonctionnalités clés

- **📄 Génération de documents Word et PDF** : Utilisation de templates `.docx` pour générer des fichiers Word, convertis automatiquement en PDF.
- **🔧 Injection dynamique de variables** : Remplissage automatique des variables dans le document.
- **🗄 Archivage sécurisé** : Sauvegarde des fichiers générés dans un répertoire sécurisé.
- **📊 Suivi des consultations** : Enregistrement des métriques telles que le nombre de fois qu'un PDF a été consulté.
- **⏳ Restrictions d'accès** : Limitation du nombre de consultations ou définition d'une date d'expiration pour chaque document.
- **📦 Docker & Docker Compose** : Conteneurisation complète avec MongoDB et l'application NestJS.

---

## 🚀 Installation & Utilisation

### Prérequis

- **Node.js** LTS
- **Docker** et **Docker Compose**

### Instructions

1. Clonez le projet :

   ```bash
   git clone https://github.com/yourusername/docmaker.git
   cd docmaker
   ```

2. Créez un fichier `.env` basé sur l'exemple ci-dessous :

   ```bash
   cp .env.example .env
   ```

3. Modifiez les valeurs dans `.env` selon vos besoins (MongoDB URI, configurations spécifiques, etc.).

4. Lancez le projet avec **Docker Compose** :

   ```bash
   docker-compose up --build
   ```

5. L'API sera accessible à l'adresse suivante : `http://localhost:3000`.

---

## 📝 Exemple d'utilisation de l'API

### 1. Générer un document

**POST** `/documents/generate`

```json
{
  "templatePath": "/path/to/template.docx",
  "variables": {
    "name": "John Doe",
    "date": "2024-10-24"
  }
}
```

Réponse :

```json
{
  "downloadUrl": "http://localhost:3000/documents/ID/download"
}
```

### 2. Télécharger le document

**GET** `/documents/:id/download`

Télécharge le fichier PDF généré, avec suivi des consultations et restrictions d'accès si définies.

---

## 🛠 Technologies utilisées

- **[NestJS](https://nestjs.com/)** - Framework backend pour Node.js.
- **[MongoDB](https://www.mongodb.com/)** - Base de données NoSQL utilisée pour stocker les métadonnées des fichiers.
- **[Docker](https://www.docker.com/)** - Conteneurisation de l'application et de la base de données MongoDB.
- **[LibreOffice](https://www.libreoffice.org/)** - Utilisé pour la conversion de fichiers Word en PDF.

---

## 🔧 Configuration du fichier `.env`

Voici un exemple de fichier `.env` :

```env
MONGODB_URI=mongodb://root:example@mongodb:27017/docmaker?authSource=admin
ARCHIVE_PATH=./archives
PDF_MAX_CONSULTATIONS=5
PDF_EXPIRATION_HOURS=24
APP_URL=http://localhost:3000
```

---

## 🚧 Fonctionnalités à implémenter (WIP)

Voici la liste des fonctionnalités qui restent à implémenter dans le projet :

- [ ] **Support multi-tenants** : Chaque client doit pouvoir avoir son propre sous-domaine et ses propres configurations.
- [ ] **Gestion des utilisateurs** : Ajout de l'authentification et de l'autorisation pour restreindre l'accès aux fichiers.
- [ ] **Compression des fichiers PDF** : Compression automatique des fichiers PDF générés pour réduire leur taille.
- [ ] **Support des formats multiples** : Ajout du support pour d'autres formats de documents en entrée (ex. `.xls`, `.ppt`).
- [ ] **UI pour gestion des documents** : Interface utilisateur pour visualiser et gérer les documents générés.
- [ ] **Bulk Generation** : Génération de plusieurs documents à la fois.
- [ ] **Tests unitaires et d'intégration** : Ajout d'une suite de tests complète pour garantir la fiabilité du projet.

---

## 🛠 Contribuer

Les contributions sont les bienvenues ! Veuillez suivre les étapes ci-dessous pour contribuer à ce projet :

1. Forkez le dépôt.
2. Créez une branche pour votre fonctionnalité (`git checkout -b feat/new-feature`).
3. Commitez vos modifications (`git commit -m 'feat: add new feature 🚀'`).
4. Poussez vers la branche (`git push origin feat/new-feature`).
5. Ouvrez une pull request.

---

## 📄 License

Ce projet est sous licence MIT. Veuillez consulter le fichier [LICENSE](./LICENSE) pour plus d'informations.

---

### 🎉 Merci d'avoir jeté un coup d'œil à **DocMaker** ! 🎉

Nous espérons que ce projet vous sera utile. N'hésitez pas à l'améliorer avec vos suggestions et contributions !
