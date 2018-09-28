var express = require('express');
var router = express.Router();
var stripe = require("stripe")("sk_test_NMLoQQsb04c88UkrbPQWVo7h");

var isLoggedIn = false;


var email;
var password;
var error;

var validEmail = 'test@test.fr';
var validPassword = 'test';


var dataBike = [
                  {name: "Model BIKO45", url:"/images/bike-1.jpg", price: 679},
                  {name: "Model ZOOK7", url:"/images/bike-2.jpg", price: 799},
                  {name: "Model LIKO89", url:"/images/bike-3.jpg", price: 839},
                  {name: "Model GEWO", url:"/images/bike-4.jpg", price: 1206},
                  {name: "Model TITAN5", url:"/images/bike-5.jpg", price: 989},
                  {name: "Model AMIG39", url:"/images/bike-6.jpg", price: 599}
]

/* GET home page. */
router.get('/', function(req, res, next) {

console.log(isLoggedIn);
if (req.session.dataCardBike == undefined) {
  req.session.dataCardBike = [];
}

  res.render('index', {dataBike: dataBike, isLoggedIn, error});
});

router.post('/add-card', function(req, res, next) {
  req.session.dataCardBike.push(req.body);
  res.render('card', { dataCardBike: req.session.dataCardBike, isLoggedIn });
})

router.post('/update-card', function(req, res, next) {
  console.log(req.body);
  req.session.dataCardBike[req.body.position].quantity = req.body.quantity;
  res.render('card', { dataCardBike: req.session.dataCardBike, isLoggedIn });
})

router.get('/delete-card', function(req, res, next) {
  console.log(req.body);
  req.session.dataCardBike.splice(req.query.position, 1);
  res.render('card', { dataCardBike: req.session.dataCardBike, isLoggedIn });
})

router.get('/card', function(req, res, next) {
  res.render('card', { dataCardBike, email: req.session.email, password: req.session.password, isLoggedIn });
});

router.post('/login', function(req, res, next) {

  req.session.email = req.body.email;
  req.session.password = req.body.password;

  if (req.body.email == validEmail && req.body.password == validPassword){
    isLoggedIn = true;
    console.log(isLoggedIn);
    res.render('index', {dataBike, isLoggedIn, error});

  }else {
    console.log(isLoggedIn);
    var error = 'Votre identifiant et/ou votre mot de passe est érroné, veuillez réessayer.'
    res.render('index', {dataBike, isLoggedIn, error});
  }

});

router.get('/logout', function(req, res, next) {
  isLoggedIn = false;
  res.render('index', { dataCardBike: req.session.dataCardBike, isLoggedIn, dataBike, error });
});

router.post('/checkout', function(req, res, next) {
  const token = req.body.stripeToken; // Using Express

  var totalCmd=0;
  var productList={};

  for (var i = 0; i < req.session.dataCardBike.length; i++) {
    totalCmd= totalCmd+ (req.session.dataCardBike[i].price*req.session.dataCardBike[i].quantity)
    productList[req.session.dataCardBike[i].name]= req.session.dataCardBike[i].quantity;
    productList[req.session.dataCardBike[i].name] = req.session.dataCardBike[i].quantity;
  }


  console.log('totalCmd');
  console.log(totalCmd);


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
  .then(charge => res.render("cmd-confirm",{isLoggedIn, error}));
});


module.exports = router;
