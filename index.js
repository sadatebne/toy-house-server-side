const express= require('express')
const cors=require('cors')
const app=express()
const port=process.env.PORT || 3000

require('dotenv').config()

const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('hello world')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rsw32ip.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const database = client.db("toyHouseDB");
    const toysCollection=database.collection("allToys");
    const userToysCollection=database.collection("userToys");

    app.get('/allToys', async(req,res)=>{
        const cursor = toysCollection.find({});
        const result = await cursor.toArray();
        res.send(result)

    })

    app.get('/allToys/:id', async(req,res)=>{
        const id=req.params.id
        const query ={_id: new ObjectId(id)}
        const result = await toysCollection.findOne(query);
        res.send(result)

    })

    app.get('/userToys', async(req,res)=>{
        const result=await userToysCollection.find({}).toArray()
        res.send(result)
    })

    app.get('/userToys/:id', async(req,res)=>{
        const id=req.params.id
        const query ={_id: new ObjectId(id)}
        const result = await userToysCollection.findOne(query);
        res.send(result)
    })

    app.post('/userToys', async(req,res)=>{
        const userToy=req.body
        const result=await userToysCollection.insertOne(userToy)
        res.send(result)
    })

    //myToys
    
    app.get('/myToys/:text', async (req, res) => {
        const user = req.params.text;
        const query = { sellerName: user };
        
        try {
          const result = await userToysCollection.find(query).toArray();
          res.send(result);
        } catch (error) {
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
      });

      //delete myToys

      app.delete('/myToys/:id', async(req,res)=>{
        const id=req.params.id
        const query ={_id: new ObjectId(id)}
        const result = await userToysCollection.deleteOne(query);
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.listen(port,()=>{
    console.log(`server is running on ${port}`)
})


