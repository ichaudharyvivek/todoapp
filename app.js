//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const listSchema = new mongoose.Schema({
  listName: {
    type: String,
    required: true
  },
  listItems: [itemSchema]
});

const TodoItem = new mongoose.model("TodoItem", itemSchema);
const List = new mongoose.model("List", listSchema);

const item_1 = new TodoItem({
  name: 'Welcom to your TodoList'
});


const item_2 = new TodoItem({
  name: 'Hit + button to add your Todo'
});

const item_3 = new TodoItem({
  name: '<-- Press this to delete your Item'
});


app.get("/", function (req, res) {
  const day = date.getDate();
  TodoItem.find({}, function (err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      res.render("list", { listTitle: day, newListItems: foundItems });
    }
  })
});

app.get('/:category', function (req, res) {
  const category = _.toLower(req.params.category);
  List.findOne({ listName: category }, function (err, foundItems) {
    if (!err) {
      if (!foundItems) {
        // create a list
        const list = new List({
          listName: category,
          listItems: [item_1, item_2, item_3]
        })
        list.save();
        res.redirect('/' + category);
        // res.render('list', {listTitle: _.capitalize(foundItems.listName), newListItems: foundItems.listItems });
      } else {
        //show exsisting list
        res.render('list', { listTitle: _.capitalize(foundItems.listName), newListItems: foundItems.listItems });
      }
    }
  });

});

app.get("/about", function (req, res) {
  res.render("about");
});


app.post('/', function (req, res) {
  const category = _.toLower(req.body.list);
  const item = req.body.newItem;
  var coutomListItem = new TodoItem({
    name: item
  })

  List.findOne({ listName: category }, function (err, foundItems) {
    if (!err) {
      if (!foundItems) {
        coutomListItem.save();
        res.redirect('/');
      } else {
        foundItems.listItems.push(coutomListItem);
        foundItems.save();
        res.redirect('/' + category);
      }
    }
  });
});



app.post('/delete/:listTitle', function (req, res) {
  const checkedItemId = req.body.checkbox;
  var listPage = _.toLower(req.params.listTitle);
  List.findOne({ listName: listPage }, function (err, foundItems) {
    if (!foundItems) {
      TodoItem.deleteOne({ _id: checkedItemId }, function (err) {
        if (!err)
          console.log('sucess');
      });
      res.redirect('/');
    } else {
      List.findOneAndUpdate({ listName: listPage }, { $pull: { listItems: { _id: checkedItemId } } }, function (err, foundItems) {
        if (!err) {
          console.log(foundItems);
          res.redirect('/' + listPage);
        }
      });
    }
  });
});


app.listen(3000, function () {
  console.log("Server started on port 3000");
});
