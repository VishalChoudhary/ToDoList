const express=require("express");
const bodyParser=require("body-parser");

const mongoose=require("mongoose");
const _=require("lodash");

const app=express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));


app.set('view engine', 'ejs');
mongoose.connect("mongodb+srv://admin-shiver:ShivEr123@cluster0.bpjwy.mongodb.net/todolistDB");
 
const itemsSchema=new mongoose.Schema({
    name: String
});

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
    name:"Welcome to your todolist!"
});

const item2=new Item({
    name:"Hit the + button to add a new item."
});

const item3=new Item({
    name:"<-- Hit this to delete an item."
});

const defaultItem=[item1,item2,item3];

//schema declaration
const listSchema={
    name:String,
    items:[itemsSchema]
};

const List=mongoose.model('List',listSchema);

app.get('/', function(req, res){

    Item.find({},function(err, foundItems){
        
        if(foundItems.length === 0){
            Item.insertMany(defaultItem,function(err){
        if(err){console.log(err);}
        else{
            console.log("Successfully inserted");
            }
        });
        res.redirect("/");
        }
        else{
            res.render('view',{listTitle: "Today", newListItem: foundItems});
        }
    });
}); 

//dynamic routing 

app.get("/:customListName",(req, res)=>{
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName},function(err, foundList){
        if(!err){
            if(!foundList){
                //create a list
                const list=new List({
                    name: customListName,
                    items: defaultItem
                });
            
                list.save();

                res.redirect("/"+customListName);
            }else{
                //show an existing list
                res.render("view",{listTitle: foundList.name, newListItem: foundList.items});
            }
        }
    });
});

app.post('/', function(req, res){
    
    const itemName=req.body.newItem;
    const listName=req.body.list;  //params name
    
    const item=new Item({
        name: itemName
    });

    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName}, function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
    
});

app.post('/delete',(req, res)=>{
    const checkedItem=req.body.checkbox;
    const listName=req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItem,function(err){
            if(err) console.log(err);
            else{
                console.log("Successfully Removed");
                res.redirect("/"); 
            }
        });
    }
    else{
        List.findOneAndUpdate({name: listName},{$pull: {items:{_id:checkedItem}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
    
});

app.get('/about', function(req, res){
    res.render('about');
});



app.listen(process.env.PORT || 3000, function(){
    console.log("Server working on port 3000");
});