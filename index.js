const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middlewire
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lcauzmf.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const contactCollection = client.db("contactDb").collection("contacts")

    app.get('/contacts', async (req, res) => {
      let query = {}
      console.log(req.query?.email)
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const cursor = contactCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })
    app.post('/contacts', async (req, res) => {
      const contact = req.body;
      const result = await contactCollection.insertOne(contact);
      res.send(result);
    })
    app.delete('/contacts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await contactCollection.deleteOne(query)
      res.send(result);
    })
    app.get('/contacts/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const contact = await contactCollection.findOne(query);
      res.send(contact);
    })
    app.put('/contacts/:id', async (req, res) => {
      const id = req.params.id;
      const contact = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true }
      const updateContact= {
        $set:{
          name:contact.name,
          phone:contact.phone,
          email: contact.email,
          
        }
      }
      const result = await contactCollection.updateOne(filter, updateContact, options)
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get('/', (req, res) => {
  res.send("Contact Server is running")
})

app.listen(port, () => {
  console.log(`Server is running on ${port}`)
})
