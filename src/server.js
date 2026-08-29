import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import session from 'express-session';

import flashMiddleware from './middleware/flash.js';
import authRoutes from './routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(import.meta.dirname, '..', 'views', 'layouts'),
    partialsDir: path.join(import.meta.dirname, '..', 'views', 'partials'),
    helpers: {
      eq: (a, b) => a === b,
    },
  })
);

app.set('view engine', 'hbs');
app.set('views', path.join(import.meta.dirname, '..', 'views'));

app.use(express.static(path.join(import.meta.dirname, '..', 'public')));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    name: 'connect.sid',
    secret: process.env.SESSION_SECRET || 'didattico-non-usare-in-produzione',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
    },
  })
);

app.use((req, res, next) => {
  if (req.session.userId) {
    res.locals.currentUser = usersRepo.findById(req.session.userId);
  } else {
    res.locals.currentUser = null;
  }
  next();
});

app.use(flashMiddleware);
app.use(authRoutes);

app.use('/', (req, res) => {
  res.render('home', { title: 'Home' });
})

app.listen(PORT, () => {
  console.log(`listening http://localhost:${PORT}`)
})
