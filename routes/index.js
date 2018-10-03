var express = require('express');
var router = express.Router();
var stripe = require("stripe")("sk_test_NMLoQQsb04c88UkrbPQWVo7h");
const CryptoJS = require('crypto-js');
var mongoose= require('mongoose');
var isLoggedIn = false;
var email;
var password;
var error;
var seeMore=[];


// MONGOOSE CONNECT //
var options = { server: { socketOptions: {connectTimeoutMS: 5000 } }};
mongoose.connect('mongodb://alhnr:alexis95@ds115613.mlab.com:15613/bike-shop',
    options,
    function(err) {
     console.log(err);
    }
);
///////////////

// MONGOOSE SCHEMAS //
var sneakersSchema = mongoose.Schema({
    name: String,
    url: String,
    price: Number
});

var userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
});
/////////////

// MONGOOSE MODELS //
var sneakersModel = mongoose.model('sneakers', sneakersSchema);
var UserModel = mongoose.model('users', userSchema);
/////////////

// LISTE PRODUITS DU SHOP //
var dataSneakers = [
                  {name: "Air Force 1 Low", url:"/images/AF1.jpg", price: 100, resume:"And a legend is the Nike Air Force 1 as well - a sneaker you've never seen before! The sporty design alone makes the Air Force essential for you. Durable leather upper, perforated toe box and an optimal cushioned air sole give you comfortable running comfort and a distinctive style! Wear it during your training or in your free time, with sweatpants or jeans; the Air Force will always fit - guaranteed!"},
                  {name: "Vapormax", url:"/images/vapormax.jpg", price: 210, resume: "The evolution of Nike's Air Max system takes off with a giant leap to the new masterpiece in Nike's running shoe offering: the Nike Air Vapormax. Its innovative design does not require rigid structures and is supportive as well as elastic and flexible. You can not claim that from any other sneaker! Of course, you immediately notice the nubby outsole, which not only looks stylish, but is also so comfortable that you do not want to take off the Vapormax anymore!"},
                  {name: "Yeezy Boost 700", url:"/images/yeezy750.jpg", price: 300, resume: 'After teasing a handful of fall releases, Yeezy Mafia is back with an expected date for the return of the "Wave Runner" Yeezy Boost 700. First releasing as a preorder last year and restocking in March, this will be the third opportunity to pick up the "Wave Runner" colorway at retail.'},
                  {name: "Jordan Retro 4", url:"/images/jordan.jpg", price: 190, resume:'The Air Jordan IV was the first global market release of the franchise. Another first, the shoe appeared in Spike Lee’s film Do the Right Thing, transcending the game of basketball to make a significant impact on pop culture. All eyes were on Jordan as he continued to rise.'},
                  {name: "Converse All-Star", url:"/images/converse.jpg", price: 65, resume:'Iconic canvas high-top from the experts at Converse. Fitted with a cushioned footbed, sturdy rubber sole and toe-cap. Finished with cotton laces + metal eyelets.'},
                  {name: "Fila Disruptor", url:"/images/fila.jpg", price: 100, resume:"Throwback vibe sneaker from FILA featuring an aggressively lugged rubber outsole. Chunky but lightweight design in nubuck leather offers a padded tongue + ankle collar along with a removeable insole for support + cushioning. FILA is one of the world's largest sportswear brands, achieving cult status after a stint of popularity with tennis heroes and hip-hop stars."}
]

/* GET home page. */
router.get('/', function(req, res, next) {
console.log(isLoggedIn);

// DEFINITION D'UNE SESSION POUR LE PANIER //
if (req.session.dataCardSneakers == undefined) {
  req.session.dataCardSneakers = [];
}

  res.render('index', {dataSneakers: dataSneakers, isLoggedIn: req.session.isLoggedIn, error});
});

// ACCES PAGE LOGIN/SIGNUP //
router.get('/login', function(req, res, next) {
  res.render('login', {dataSneakers: dataSneakers, isLoggedIn: req.session.isLoggedIn, error});
});

// AJOUT PRODUIT AU PANIER //
router.post('/add-card', function(req, res, next) {
  console.log(req.body);
  req.session.dataCardSneakers.push(req.body);
  res.render('card', { dataCardSneakers: req.session.dataCardSneakers, isLoggedIn: req.session.isLoggedIn });
})

// MISE A JOUR DU PANIER //
router.post('/update-card', function(req, res, next) {
  console.log(req.body);
  req.session.dataCardSneakers[req.body.position].quantity = req.body.quantity;

  if (req.body.quantity) {
    req.session.dataCardSneakers.splice(req.query.position, 1);
  }
  res.render('card', { dataCardSneakers: req.session.dataCardSneakers, isLoggedIn: req.session.isLoggedIn });
})

// SUPPRESSION PANIER //
router.get('/delete-card', function(req, res, next) {
  console.log(req.body);
  req.session.dataCardSneakers.splice(req.query.position, 1);
  res.render('card', { dataCardSneakers: req.session.dataCardSneakers, isLoggedIn:req.session.isLoggedIn });
})

// ACCES AU PANIER //
router.get('/card', function(req, res, next) {
  res.render('card', { dataCardSneakers, email: req.session.email, password: req.session.password, isLoggedIn: req.session.isLoggedIn });
});

// ACCES FORM LOGIN //
router.get('/signIn', function(req, res, next) {
  res.render('signIn', {dataSneakers: dataSneakers, isLoggedIn: req.session.isLoggedIn, error});
});

// POST DU FORM LOGIN + CRYPTAGE PASSWORD + CREATION SESSION UTILISATEUR//
router.post('/login', function(req, res, next) {
  req.session.email = req.body.email;
  req.session.password = req.body.password;

  UserModel.find(
    { email: req.body.email, password: CryptoJS.SHA512(req.body.password).toString() } ,
      function (err, users) {
          console.log(users);
          if (!users.length>0) {
            req.session.error= 'The password or the username entered are incorrect.'
            res.render('signIn', {dataSneakers, isLoggedIn: req.session.isLoggedIn, error:req.session.error});
          }else {
            req.session.user = users[0];
            req.session.isLoggedIn = true;
            console.log(users);
            res.render('index', {dataSneakers, isLoggedIn: req.session.isLoggedIn, error:req.session.error});
          }
      }
  )

});


// INSCRIPTION EN DATABASE //
router.post('/signup', function(req, res, next) {
  var UsernameTest = req.body.username;
  var emailTest = req.body.email;
  var passwordTest = req.body.password;

// GESTION DES ERREURS D'INSCRIPTION //
  if (UsernameTest == '' || UsernameTest.length >12) {
    req.session.error = "Your username can't be empty or be longer than 12 caracters.";
    console.log(error);
    res.render('login', { dataCardSneakers:req.session.dataCardSneakers, email: req.session.email, password: req.session.password, dataSneakers, error:req.session.error, isLoggedIn: req.session.isLoggedIn });
  }  else if (passwordTest == '' || UsernameTest.length >12) {
    req.session.error = "Your password can't be empty or be longer than 12 caracters.";
    console.log(error);
    res.render('login', { dataCardSneakers:req.session.dataCardSneakers, email: req.session.email, password: req.session.password, dataSneakers, error:req.session.error, isLoggedIn: req.session.isLoggedIn });
  }else{

    var newUser = new UserModel ({
     Username: req.body.username,
     email: req.body.email,
     password : CryptoJS.SHA512(req.body.password).toString()
    });

    newUser.save(
      function (error, user) {
         console.log(user);
      }
  );
  req.session.isLoggedIn = true;

  res.render('index', { dataCardSneakers:req.session.dataCardSneakers, email: req.session.email, password: req.session.password, dataSneakers, error:req.session.error, isLoggedIn: req.session.isLoggedIn });
  }
});

// DECONNECTION USER //
router.get('/logout', function(req, res, next) {
  req.session.isLoggedIn = false;
  res.render('index', { dataCardSneakers: req.session.dataCardSneakers, isLoggedIn: req.session.isLoggedIn, dataSneakers, error });
});

// PHASE PAIEMENT VIA STRIPE //
router.post('/checkout', function(req, res, next) {
  const token = req.body.stripeToken; // Using Express

  var totalCmd=0;
  var productList={};

  for (var i = 0; i < req.session.dataCardSneakers.length; i++) {
    totalCmd= totalCmd+ (req.session.dataCardSneakers[i].price*req.session.dataCardSneakers[i].quantity)
    productList[req.session.dataCardSneakers[i].name]= req.session.dataCardSneakers[i].quantity;
    productList[req.session.dataCardSneakers[i].name] = req.session.dataCardSneakers[i].quantity;
  }

  stripe.customers.create({
     email: req.body.stripeEmail,
    source: req.body.stripeToken
  })
  .then(customer =>
    stripe.charges.create({
      amount:totalCmd*100,
      description: "Sample Charge",
      currency: "eur",
      customer: customer.id,
      metadata: productList
    }))
  .then(charge => res.render("cmd-confirm",{isLoggedIn: req.session.isLoggedIn, error}));
});

// ACCES A LA PAGE VOIR PLUS //
router.post('/see-more', function(req, res, next) {
  req.session.seeMore= [];
  console.log(req.body);
  req.session.seeMore.push(req.body);
  res.render('see-more', {seeMore: req.session.seeMore, isLoggedIn: req.session.isLoggedIn, error, dataSneakers });
});

module.exports = router;
