# Libreria Digitale (Digital Library App)

Progetto per il corso di **Tecnologie Informatiche per il Web**.
Traccia: *Gestione Biblioteca / Prestiti*, **Livello 1 - Catalogo e prestiti base**.

Applicazione web server-side che permette agli utenti registrati di consultare un catalogo di volumi, richiederne il prestito e registrarne la restituzione; al bibliotecario di gestire il catalogo e di consultare tutti i prestiti.

---

## Stack Tecnologico

| Componente | Tecnologia |
|---|---|
| Runtime | Node.js (>= 20) |
| Framework HTTP | Express.js |
| Motore di template | Handlebars (`.hbs`) |
| Base di dati | SQLite tramite `better-sqlite3` |
| Sessioni | `express-session` |
| Hashing password | `bcrypt` |
| Frontend | HTML e CSS scritti a mano |

**Vincoli e Scelte Progettuali:**
- **Nessun ORM**: tutte le interrogazioni sono SQL scritto a mano per massimo controllo.
- **Prepared Statements**: utilizzo esclusivo di parametri per prevenire SQL Injection.
- **Architettura MVC**: separazione netta tra rotte (`routes`), logica (`repos`) e viste (`views`).
- **Pattern Post-Redirect-Get (PRG)**: ogni operazione di scrittura termina con un redirect per evitare l'invio duplicato dei form.

---

## Installazione e Avvio

### Requisiti
Node.js 20 o superiore.

### Procedura
```bash
# 1. Installazione delle dipendenze
npm install

# 2. Inizializzazione del Database (crea lo schema)
node src/db/init.js

# 3. Popolamento dei dati di prova
node src/db/seed.js

# 4. Avvio del server
npm start
```
L'applicazione è disponibile su `http://localhost:3000`.

### Comandi Utili
| Comando | Descrizione |
|---|---|
| `npm start` | Avvia il server in modalità standard |
| `npm run dev` | Avvia il server con riavvio automatico (se configurato) |

---

## Credenziali di Prova

Se è stato eseguito lo script di seed, sono disponibili i seguenti account con password **`password123`**:

| Ruolo | Email |
|---|---|
| **Bibliotecario (Admin)** | `admin@library.it` |
| **Utente Standard n. 1** | `bob@test.it` |
| **Utente Standard n. 2** | `charlie@test.it` |

---

## Funzionalità

### Utente Registrato
- **Registrazione e Login**: accesso sicuro tramite email e password hashate.
- **Catalogo Pubblico**: consultazione dei libri con ricerca per titolo o ISBN.
- **Sistema di Prestiti**: richiesta di prestito per volumi disponibili e registrazione della restituzione.
- **Dashboard Personale**: sezione "I miei prestiti" per monitorare i libri in possesso.

### Bibliotecario (Admin)
- **Gestione Inventario**: inserimento, modifica e rimozione (soft-delete) dei libri.
- **Monitoraggio**: consultazione di tutti i prestiti effettuati nel sistema.

---

## Struttura del Progetto

```
.
├── src/
│   ├── server.js              # Punto di ingresso e configurazione Express
│   ├── db/                 # Connessione, inizializzazione e schema SQLite
│   │   ├── connection.js
│   │   ├── init.js
│   │   └── seed.js
│   ├── repos/              # Data Access Layer (SQL queries)
│   │   ├── book.repo.js
│   │   ├── user.repo.js
│   │   └── loan.repo.js
│   ├── routes/             # Definizione degli endpoint HTTP
│   │   ├── auth.routes.js
│   │   ├── book.routes.js
│   │   └── loan.routes.js
│   └── middleware/          # Filtri di autenticazione e gestione flash
│       ├── auth.js
│       └── flash.js
├── views/                  # Template Handlebars (.hbs)
└── public/                 # Asset statici (CSS, immagini)
```

---

## Modello dei Dati

Il database è composto da tabelle relazionali per gestire utenti, libri, autori e generi.
La definizione completa si trova in `src/db/schema.sql`.

- **Utenti**: Gestione anagrafica, password hashate e ruoli (`user`/`organizer`).
- **Libri**: Dati bibliografici (ISBN, titolo, anno, pagine, quantità) e stato di disponibilità.
- **Autori e Generi**: Tabelle separate con relazioni molti-a-molti verso i libri.
- **Prestiti**: Associazione tra utente e libro con date di prestito e restituzione.

---

## Note di Sicurezza

- **SQL Injection**: Prevenuta tramite l'uso di `better-sqlite3` con parametri bindati.
- **Password Security**: Utilizzo di `bcrypt` per il salting e l'hashing delle password.
- **Session Management**: Gestione delle sessioni via cookie `httpOnly` per prevenire XSS.
- **Authorization**: Middleware dedicati che verificano il ruolo dell'utente prima di concedere l'accesso a rotte amministrative.
