// create an express app
const express = require("express");
const bodyParser = require('body-parser');
const app = express();

const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

// use the express-static middleware
app.use(express.static("public"));

// middlewear to parse body
app.use(bodyParser.json());

// middlewear for errors
app.use(function(err,req,res,next){
  res.status(422).send({error: err.message});
});

// fetch account info
app.get("/api/getAccount", async function (req, res) {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();

    const database = client.db('oinkdb');
    const collection = database.collection('accounts');

    const query = req.query;
    const cursor = collection.find(query);
    const result = await cursor.toArray();
    console.log(result);
    return res.json(result);
    
  } catch(err) {
    console.log(err);
  }
  finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

// add to accounts db (add existance check - error)
app.post("/api/signup", async function (req, res) {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  
  try {
    await client.connect();

    const database = client.db('oinkdb');
    const collection = database.collection('accounts');

    console.log('BODY: ' + JSON.stringify(req.body));

    await collection.insertOne(req.body).then((info) => {
      //redirect on success
      return res.redirect(301, "../index.html");
    });
  } catch(err) {
    console.log(err);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

// send posts to db
app.post('/api/posts', async function(req, res){
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();

    const database = client.db('oinkdb');
    const collection = database.collection('posts');

    const query = req.query;
    const cursor = collection.insertOne(query);
    const result = await cursor;

    return res.json(query);
    
  } catch(err) {
    console.log(err);
  }
  finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

// get post from db
app.get("/api/post", async function (req, res) {
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    await client.connect();

    const database = client.db('oinkdb');
    const collection = database.collection('posts');

    const query = req.query;
    const cursor = collection.find(query);
    const result = await cursor.toArray();

    return res.json(result);
    
  } catch(err) {
    console.log(err);
    // way to make already have account popup?
  }
  finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

app.post("/api/updateInterests", async function (req, res) {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  
  try {
    await client.connect();

    const database = client.db('oinkdb');
    const collection = database.collection('accounts');
    const jsonBody = JSON.stringify(req.body);
    var email, favs;
    console.log('updateAccount recieved:\n' + jsonBody);

    const jsonObj = JSON.parse(jsonBody);

    //loop through response and get the email
    for (var i = 0; i < jsonBody.length; i++) {
      email = jsonObj.email;
      favs = jsonObj.favs;
    }
    const result = await collection.updateOne(
      {"email" : email},
      {$set: { "favs": favs } }
    )
    
    return res.json(result.modifiedCount);

  } catch(err) {
    console.log(err);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

app.post("/api/updateSettings", async function (req, res) {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  
  try {
    await client.connect();

    const database = client.db('oinkdb');
    const collection = database.collection('accounts');
    const jsonBody = JSON.stringify(req.body);
    var uname, email, fname, lname, pass, phone;
    console.log('updateAccount recieved:\n' + jsonBody);

    const jsonObj = JSON.parse(jsonBody);

    //loop through response and get the email
    for (var i = 0; i < jsonBody.length; i++) {
      uname = jsonObj.uname;
      email = jsonObj.email;
      fname = jsonObj.fname;
      lname = jsonObj.lname;
      pass = jsonObj.pass;
      phone = jsonObj.phone;
    }
    const result = await collection.updateOne(
      {"email" : email},
      {$set: { "uname": uname, "fname": fname, "lname": lname, "pass": pass, "phone": phone } }
    )
    
    return res.json(result.modifiedCount);

  } catch(err) {
    console.log(err);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

    // send posts to db
    app.post('/api/posts', async function(req, res){
      const client = new MongoClient(uri, { useUnifiedTopology: true });
      try {
        await client.connect();
    
        const database = client.db('oinkdb');
        const collection = database.collection('posts');
    
        const query = req.query;
        const cursor = collection.insertOne(query);
        const result = await cursor;
    
        return res.json(query);
        
      } catch(err) {
        console.log(err);
      }
      finally {
        // Ensures that the client will close when you finish/error
        await client.close();
      }
    });
    
    // get post from db
    app.get("/api/post", async function (req, res) {
      const client = new MongoClient(uri, { useUnifiedTopology: true });
      try {
        await client.connect();
    
        const database = client.db('oinkdb');
        const collection = database.collection('posts');
    
        const query = req.query;
        const cursor = collection.find(query);
        const result = await cursor.toArray();
    
        return res.json(result);
        
      } catch(err) {
        console.log(err);
      }
      finally {
        // Ensures that the client will close when you finish/error
        await client.close();
      }
    });


// start the server listening for requests
app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));