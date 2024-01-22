const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: "your-secret-key_YD",
    resave: false,
    saveUninitialized: true,
  })
);

const users = [];

// Routes
app.get("/", (req, res) => {
  // Vérifier si l'utilisateur est connecté en vérifiant la session
  if (req.session.user) {
    res.send(`
            <h1>Bienvenue, ${req.session.user}!</h1>
            <a href="/logout">Se déconnecter</a>
        `);
  } else {
    // Afficher le formulaire de connexion
    // res.sendFile(__dirname + "/login.html");
    res.sendFile(path.join(__dirname, "views/login.html"));
  }
});

app.post("/login", (req, res) => {
  console.log("Requête POST reçue sur /login");
  // const { login, password } = req.body;
  const { login, password } = req.body;

  // Ici, vous devriez vérifier les informations d'identification de l'utilisateur.
  // Pour simplifier, nous vérifions simplement si le login est non vide.
  if (login) {
    // Authentification réussie, enregistrer l'utilisateur dans la session
    req.session.user = login;
    // res.redirect("/");
    res.redirect("/users");
  } else {
    res.send("Échec de l'authentification");
  }
});
//
// Fonction pour générer le HTML de la liste des utilisateurs
function generateUserList(users) {
  return users
    .map(
      (user) => `
    <div class="bg-white rounded-lg shadow-md p-4 mb-4 flex items-center justify-between">
      <div class="flex items-center">
        <img src="${user.photo}" alt="Photo Utilisateur" class="w-10 h-10 rounded-full mr-4">
        <div>
          <p class="text-lg font-bold">${user.prenom} ${user.nom}</p>
          <p class="text-gray-500">Date d'Inscription: ${user.dateInscription}</p>
        </div>
      </div>
      <div class="flex items-center">
        <a href="/edit-user/${user.id}" class="mr-2 text-blue-500 hover:underline">Modifier</a>
        <a href="/delete-user/${user.id}" class="text-red-500 hover:underline">Supprimer</a>
      </div>
    </div>
  `
    )
    .join("");
}

//
app.get("/users", (req, res) => {
  // Vérifiez si l'utilisateur est connecté
  if (!req.session.user) {
    return res.redirect("/");
  }

  // Récupérez la liste des utilisateurs mise à jour
  const userListHTML = generateUserList(users);

  // Rendre la vue avec la liste des utilisateurs
  res.render("listeUsers", {
    titlePage: "Liste d'Utilisateurs",
    userListHTML: userListHTML,
  });
});

//
// Page d'ajout d'utilisateur
app.get("/add-user", (req, res) => {
  // Vérifiez si l'utilisateur est connecté
  if (!req.session.user) {
    return res.redirect("/");
  }
  res.render("addUsers");
});

// Ajouter un utilisateur
app.post("/add-user", (req, res) => {
  const { nom, prenom, photo, dateInscription } = req.body;

  // Validez que les champs requis sont présents
  if (!nom || !prenom || !photo || !dateInscription) {
    return res.send("Veuillez remplir tous les champs.");
  }

  // Ajoutez l'utilisateur à la liste (remplacez cela par votre logique de stockage des utilisateurs)
  const newUser = { id: uuidv4(), nom, prenom, photo, dateInscription };
  users.push(newUser);

  // Redirigez l'utilisateur vers la page d'affichage des utilisateurs après l'ajout
  res.redirect("/users");
});
//
function getUserById(userId) {
  const user = users.find((user) => user.id === userId);
  return user;
}
// MODIFICATION D'USERS
app.get("/edit-user/:userId", (req, res) => {
  // Vérifiez si l'utilisateur est connecté
  if (!req.session.user) {
    return res.redirect("/");
  }

  // Récupérez l'ID de l'utilisateur depuis les paramètres d'URL
  const userId = req.params.userId;

  // Récupérez les informations de l'utilisateur à éditer (remplacez cela par votre logique)
  const user = getUserById(userId);

  // Rendre la vue avec les informations de l'utilisateur
  res.render("editUser", { titlePage: "Modifier l'Utilisateur", user, userId });
});

//
app.post("/edit-user/:id", (req, res) => {
  const userId = req.params.id;
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    return res.status(404).send("Utilisateur non trouvé");
  }

  // Mettre à jour les propriétés de l'utilisateur avec les nouvelles données du formulaire
  users[userIndex] = {
    ...users[userIndex],
    nom: req.body.nom,
    prenom: req.body.prenom,
    photo: req.body.photo,
    dateInscription: req.body.dateInscription,
  };

  res.redirect("/users");
});

// SUPPRESSION D'USERS
// Ajoutez cette route pour supprimer un utilisateur
app.get("/delete-user/:userId", (req, res) => {
  // Vérifiez si l'utilisateur est connecté
  if (!req.session.user) {
    return res.redirect("/");
  }

  const userId = req.params.userId;

  // Trouvez l'index de l'utilisateur dans le tableau
  const userIndex = users.findIndex((user) => user.id === userId);

  // Supprimez l'utilisateur du tableau
  if (userIndex !== -1) {
    users.splice(userIndex, 1);
  }

  // Redirigez l'utilisateur vers la page d'affichage des utilisateurs après la suppression
  res.redirect("/users");
});

app.post("/delete-user/:userId", (req, res) => {
  // Vérifiez si l'utilisateur est connecté
  if (!req.session.user) {
    return res.redirect("/");
  }

  // Récupérez l'ID de l'utilisateur à supprimer depuis les paramètres d'URL
  const userId = req.params.userId;

  // Trouvez l'index de l'utilisateur dans le tableau
  let userIndex = users.findIndex((user) => user.id === userId);

  // Vérifiez si l'utilisateur a été trouvé
  if (userIndex !== -1) {
    // Supprimez l'utilisateur du tableau
    users.splice(userIndex, 1);

    // Redirigez l'utilisateur vers la page d'affichage des utilisateurs après la suppression
    res.redirect("/users");
  } else {
    // Si l'utilisateur n'est pas trouvé, vous pouvez renvoyer un message d'erreur ou rediriger
    // vers une page d'erreur, selon vos besoins.
    res.send("Utilisateur non trouvé");
  }
});

//

app.get("/logout", (req, res) => {
  // Déconnecter l'utilisateur en détruisant la session
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
